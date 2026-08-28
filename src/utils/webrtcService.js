/**
 * webrtcService.js
 * WebRTC peer-to-peer voice & video calls using PeerJS.
 * Only allowed between mutual friends (enforced before calling).
 */

import { Peer } from 'peerjs';

let peer = null;
let currentCall = null;
let localStream = null;

const PEER_CONFIG = {
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
  },
};

// Derive a stable PeerJS peer ID from the user's 6-digit code
const toPeerId = (code) => `sobagu-${code}`;

// ─── Callbacks registered by CallScreen ──────────────────────────────────────
let onIncomingCall = null;
let onCallEnded = null;
let onRemoteStream = null;
let onPeerError = null;

export const registerCallHandlers = ({ onIncoming, onEnded, onRemote, onError }) => {
  onIncomingCall = onIncoming;
  onCallEnded    = onEnded;
  onRemoteStream = onRemote;
  onPeerError    = onError;
};

// ─── Initialize Peer ─────────────────────────────────────────────────────────

export const initPeer = (myCode) => {
  return new Promise((resolve, reject) => {
    if (peer && peer.id === toPeerId(myCode) && !peer.destroyed) {
      resolve(peer);
      return;
    }

    try {
      peer = new Peer(toPeerId(myCode), PEER_CONFIG);
    } catch (e) {
      reject(e);
      return;
    }

    peer.on('open', () => resolve(peer));
    peer.on('error', (err) => {
      if (onPeerError) onPeerError(err);
      reject(err);
    });

    // Handle incoming calls
    peer.on('call', (incomingCall) => {
      const callerCode = incomingCall.peer.replace('sobagu-', '');
      if (onIncomingCall) onIncomingCall({ call: incomingCall, callerCode });
    });
  });
};

export const destroyPeer = () => {
  endCall();
  if (peer && !peer.destroyed) {
    peer.destroy();
    peer = null;
  }
};

// ─── Local Media ──────────────────────────────────────────────────────────────

export const getLocalStream = async (video = true) => {
  try {
    if (localStream) stopLocalStream();
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: video ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } : false,
    });
    return localStream;
  } catch (e) {
    throw new Error('Camera/mic access denied. Please allow permissions.');
  }
};

export const stopLocalStream = () => {
  if (localStream) {
    localStream.getTracks().forEach(t => t.stop());
    localStream = null;
  }
};

// ─── Outgoing Call ────────────────────────────────────────────────────────────

export const callFriend = async (friendCode, videoEnabled = true) => {
  if (!peer || peer.destroyed) throw new Error('Peer not initialized. Please try again.');

  const stream = await getLocalStream(videoEnabled);
  const call = peer.call(toPeerId(friendCode), stream);

  currentCall = call;

  call.on('stream', (remoteStream) => {
    if (onRemoteStream) onRemoteStream(remoteStream);
  });

  call.on('close', () => {
    endCall();
    if (onCallEnded) onCallEnded();
  });

  call.on('error', () => {
    endCall();
    if (onCallEnded) onCallEnded();
  });

  return { call, localStream: stream };
};

// ─── Answer Incoming Call ─────────────────────────────────────────────────────

export const answerCall = async (incomingCall, videoEnabled = true) => {
  const stream = await getLocalStream(videoEnabled);
  currentCall = incomingCall;

  incomingCall.answer(stream);

  incomingCall.on('stream', (remoteStream) => {
    if (onRemoteStream) onRemoteStream(remoteStream);
  });

  incomingCall.on('close', () => {
    endCall();
    if (onCallEnded) onCallEnded();
  });

  return { localStream: stream };
};

// ─── End Call ────────────────────────────────────────────────────────────────

export const endCall = () => {
  if (currentCall) {
    try { currentCall.close(); } catch { /* ignore */ }
    currentCall = null;
  }
  stopLocalStream();
};

// ─── Mute / Unmute ────────────────────────────────────────────────────────────

export const toggleMute = () => {
  if (!localStream) return false;
  const audioTrack = localStream.getAudioTracks()[0];
  if (!audioTrack) return false;
  audioTrack.enabled = !audioTrack.enabled;
  return audioTrack.enabled; // returns true = unmuted
};

export const toggleCamera = () => {
  if (!localStream) return false;
  const videoTrack = localStream.getVideoTracks()[0];
  if (!videoTrack) return false;
  videoTrack.enabled = !videoTrack.enabled;
  return videoTrack.enabled; // returns true = camera on
};

// ─── DataChannel for Multiplayer Game Sync ───────────────────────────────────

let dataConnections = {}; // { friendCode: DataConnection }
let onDataMessage = null;

export const registerDataHandler = (handler) => { onDataMessage = handler; };

export const connectData = (myCode, friendCode) => {
  return new Promise((resolve, reject) => {
    if (!peer || peer.destroyed) { reject(new Error('Peer not ready')); return; }
    const conn = peer.connect(toPeerId(friendCode), { reliable: true, label: 'game-data' });
    conn.on('open', () => {
      dataConnections[friendCode] = conn;
      conn.on('data', (data) => { if (onDataMessage) onDataMessage({ from: friendCode, data }); });
      conn.on('close', () => { delete dataConnections[friendCode]; });
      resolve(conn);
    });
    conn.on('error', reject);
  });
};

// Listen for incoming data connections
export const listenDataConnections = () => {
  if (!peer) return;
  peer.on('connection', (conn) => {
    conn.on('open', () => {
      const friendCode = conn.peer.replace('sobagu-', '');
      dataConnections[friendCode] = conn;
      conn.on('data', (data) => { if (onDataMessage) onDataMessage({ from: friendCode, data }); });
      conn.on('close', () => { delete dataConnections[friendCode]; });
    });
  });
};

export const sendDataTo = (friendCode, data) => {
  const conn = dataConnections[friendCode];
  if (conn && conn.open) { conn.send(data); return true; }
  return false;
};

export const broadcastData = (data) => {
  Object.values(dataConnections).forEach(conn => {
    if (conn && conn.open) conn.send(data);
  });
};

export const disconnectData = (friendCode) => {
  const conn = dataConnections[friendCode];
  if (conn) { try { conn.close(); } catch { /* ignore */ } delete dataConnections[friendCode]; }
};

export const getPeer = () => peer;
export const getCurrentCall = () => currentCall;
export const getLocalStreamRef = () => localStream;

/**
 * webrtcService.js
 * High-performance WebRTC peer-to-peer audio & video calling engine.
 * Supports cross-device PeerJS connections, multi-tab BroadcastChannel signaling,
 * camera flipping, and fallback audio streams.
 */

import { Peer } from 'peerjs';

let peer = null;
let currentCall = null;
let localStream = null;
let currentFacingMode = 'user'; // 'user' | 'environment'

const PEER_CONFIG = {
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
    ],
  },
};

const toPeerId = (code) => `sobagu-peer-${code}`;

// ── Callbacks ─────────────────────────────────────────────────────────────
let onIncomingCall = null;
let onCallEnded = null;
let onRemoteStream = null;
let onPeerError = null;

// Multi-Tab Signal Channel
let signalChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    signalChannel = new BroadcastChannel('sobagu_call_signal');
    signalChannel.onmessage = (event) => {
      const data = event.data;
      if (!data) return;
      if (data.type === 'CALL_INCOMING' && onIncomingCall) {
        onIncomingCall({
          callerCode: data.fromCode,
          callerName: data.fromName,
          callType: data.callType,
          isSignalOnly: true,
        });
      } else if (data.type === 'CALL_ENDED' && onCallEnded) {
        onCallEnded();
      }
    };
  }
} catch (_e) {}

export const registerCallHandlers = ({ onIncoming, onEnded, onRemote, onError }) => {
  onIncomingCall = onIncoming;
  onCallEnded    = onEnded;
  onRemoteStream = onRemote;
  onPeerError    = onError;
};

// ── Initialize Peer ────────────────────────────────────────────────────────
export const initPeer = (myCode) => {
  return new Promise((resolve) => {
    if (!myCode) { resolve(null); return; }
    if (peer && peer.id === toPeerId(myCode) && !peer.destroyed) {
      resolve(peer);
      return;
    }

    try {
      if (peer && !peer.destroyed) {
        peer.destroy();
      }
      peer = new Peer(toPeerId(myCode), PEER_CONFIG);

      peer.on('open', () => {
        resolve(peer);
      });

      peer.on('error', (err) => {
        // If ID is taken, peer is already initialized on another tab/connection
        if (err?.type === 'unavailable-id') {
          resolve(peer);
          return;
        }
        if (onPeerError) onPeerError(err);
        resolve(peer);
      });

      // Handle incoming WebRTC calls
      peer.on('call', (incomingCall) => {
        const callerCode = incomingCall.peer.replace('sobagu-peer-', '');
        if (onIncomingCall) {
          onIncomingCall({
            call: incomingCall,
            callerCode,
            callType: 'video',
            isSignalOnly: false,
          });
        }
      });
    } catch (_e) {
      resolve(null);
    }
  });
};

export const destroyPeer = () => {
  endCall();
  if (peer && !peer.destroyed) {
    try { peer.destroy(); } catch (_e) {}
    peer = null;
  }
};

// ── Media Stream Acquisition ───────────────────────────────────────────────
export const getLocalStream = async (video = true, facingMode = 'user') => {
  try {
    if (localStream) stopLocalStream();

    const constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: video
        ? {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            facingMode: facingMode,
          }
        : false,
    };

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      localStream = await navigator.mediaDevices.getUserMedia(constraints);
      currentFacingMode = facingMode;
      return localStream;
    }
    throw new Error('Media devices unavailable');
  } catch (err) {
    // If video failed (e.g. camera busy or permission denied), attempt audio-only
    if (video) {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        return localStream;
      } catch (_audioErr) {}
    }
    // Fallback: create silent audio stream
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const dest = audioCtx.createMediaStreamDestination();
      localStream = dest.stream;
      return localStream;
    } catch (_e) {
      return null;
    }
  }
};

export const stopLocalStream = () => {
  if (localStream) {
    try {
      localStream.getTracks().forEach(track => {
        track.stop();
      });
    } catch (_e) {}
    localStream = null;
  }
};

// ── Switch / Flip Camera ───────────────────────────────────────────────────
export const switchCamera = async () => {
  if (!localStream) return null;
  const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
  try {
    const newStream = await getLocalStream(true, newFacingMode);
    return newStream;
  } catch (_e) {
    return localStream;
  }
};

// ── Outgoing Call ──────────────────────────────────────────────────────────
export const callFriend = async (friendCode, myCode, myName, videoEnabled = true) => {
  const stream = await getLocalStream(videoEnabled, 'user');

  // Broadcast signal to other tabs / devices
  if (signalChannel) {
    signalChannel.postMessage({
      type: 'CALL_INCOMING',
      toCode: friendCode,
      fromCode: myCode,
      fromName: myName,
      callType: videoEnabled ? 'video' : 'voice',
      timestamp: Date.now(),
    });
  }

  // If Peer is ready, establish WebRTC call
  if (peer && !peer.destroyed) {
    try {
      const call = peer.call(toPeerId(friendCode), stream || new MediaStream());
      currentCall = call;

      if (call) {
        call.on('stream', (remote) => {
          if (onRemoteStream) onRemoteStream(remote);
        });
        call.on('close', () => {
          endCall();
          if (onCallEnded) onCallEnded();
        });
        call.on('error', () => {
          // Keep active with fallback
        });
      }
    } catch (_e) {}
  }

  return { localStream: stream };
};

// ── Answer Incoming Call ───────────────────────────────────────────────────
export const answerCall = async (incomingCall, videoEnabled = true) => {
  const stream = await getLocalStream(videoEnabled, 'user');

  if (incomingCall && typeof incomingCall.answer === 'function') {
    currentCall = incomingCall;
    try {
      incomingCall.answer(stream || new MediaStream());
      incomingCall.on('stream', (remote) => {
        if (onRemoteStream) onRemoteStream(remote);
      });
      incomingCall.on('close', () => {
        endCall();
        if (onCallEnded) onCallEnded();
      });
    } catch (_e) {}
  }

  return { localStream: stream };
};

// ── End Call ───────────────────────────────────────────────────────────────
export const endCall = () => {
  if (signalChannel) {
    try {
      signalChannel.postMessage({ type: 'CALL_ENDED', timestamp: Date.now() });
    } catch (_e) {}
  }

  if (currentCall) {
    try { currentCall.close(); } catch (_e) {}
    currentCall = null;
  }
  stopLocalStream();
};

// ── Mute / Unmute Mic ──────────────────────────────────────────────────────
export const toggleMute = () => {
  if (!localStream) return false;
  const audioTracks = localStream.getAudioTracks();
  if (audioTracks.length === 0) return false;
  audioTracks.forEach(t => { t.enabled = !t.enabled; });
  return audioTracks[0].enabled; // true = unmuted, false = muted
};

// ── Video Track Toggle ─────────────────────────────────────────────────────
export const toggleCamera = () => {
  if (!localStream) return false;
  const videoTracks = localStream.getVideoTracks();
  if (videoTracks.length === 0) return false;
  videoTracks.forEach(t => { t.enabled = !t.enabled; });
  return videoTracks[0].enabled; // true = camera on, false = camera off
};

export const getLocalStreamRef = () => localStream;

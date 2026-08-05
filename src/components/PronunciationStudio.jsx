import React, { useState, useEffect, useRef, useCallback } from 'react';
import { practiceModes, getExercisesForMode } from '../data/pronunciationData.js';
import { speakWithPreset, speakSyllableBreakdown, speakCompareSpeeds, cancelSpeech, getVoiceInfo, SPEECH_PRESETS, isTTSSupported } from '../utils/tts.js';
import { listenForKannada, stopListening, requestMicPermission, getSTTStatus } from '../utils/speechRecognition.js';
import { scorePronunciation, getXPForScore } from '../utils/pronunciationEngine.js';
import { addXP, updateUser, getCurrentUser, markExplored, unlockBadge } from '../utils/storage.js';

const MicWave = ({ active }) => (
  <div className={`mic-wave${active ? ' active' : ''}`}>
    {[...Array(5)].map((_, i) => (
      <span key={i} className="mic-bar" style={{ animationDelay: `${i * 0.1}s` }} />
    ))}
  </div>
);

const ScoreRing = ({ score, size = 120 }) => {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 85 ? '#4ade80' : score >= 60 ? '#fbbf24' : '#f87171';

  return (
    <svg width={size} height={size} className="score-ring">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x={size / 2} y={size / 2 + 6} textAnchor="middle" fill={color} fontSize="28" fontWeight="800">
        {score}
      </text>
    </svg>
  );
};

const PronunciationStudio = ({ onXP, onToast }) => {
  const [mode, setMode] = useState('words');
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [phase, setPhase] = useState('ready'); // ready | listening | scored
  const [result, setResult] = useState(null);
  const [interimText, setInterimText] = useState('');
  const [speechPreset, setSpeechPreset] = useState('normal');
  const [stats, setStats] = useState({ attempts: 0, avgScore: 0, bestScore: 0 });

  const exercises = getExercisesForMode(mode);
  const current = exercises[exerciseIdx] || exercises[0];
  const voiceInfo = getVoiceInfo();
  const sttStatus = getSTTStatus();

  useEffect(() => {
    setExerciseIdx(0);
    setPhase('ready');
    setResult(null);
  }, [mode]);

  const handleListen = async (preset) => {
    cancelSpeech();
    const p = preset || speechPreset;
    if (p === 'syllable') {
      await speakSyllableBreakdown(current.kannada);
    } else if (p === 'compare') {
      await speakCompareSpeeds(current.kannada);
    } else {
      await speakWithPreset(current.kannada, p);
    }
  };

  const handleRecord = useCallback(async () => {
    if (phase === 'listening') {
      stopListening();
      return;
    }

    cancelSpeech();
    setPhase('listening');
    setResult(null);
    setInterimText('');

    const permitted = await requestMicPermission();
    if (!permitted) {
      setPhase('ready');
      onToast?.('Microphone access denied. Please allow mic in browser settings.', 'error');
      return;
    }

    try {
      const { transcript, noSpeech } = await listenForKannada({
        timeoutMs: mode === 'phrases' || mode === 'twisters' ? 12000 : 8000,
        onInterim: setInterimText,
        onStart: () => {},
      });

      setInterimText('');
      const scored = scorePronunciation(current.kannada, current.transliteration, transcript);
      setResult({ ...scored, transcript, noSpeech });
      setPhase('scored');

      const xp = getXPForScore(scored.score);
      addXP(xp);
      onXP?.(xp);

      const itemKey = `pronunciation_${current.id}`;
      if (markExplored(itemKey)) {
        const u = getCurrentUser();
        if (u) {
          const prog = Math.min(100, (u.progress?.pronunciation || 0) + 3);
          updateUser({ progress: { ...(u.progress || {}), pronunciation: prog } });
        }
      }

      if (scored.score >= 85) unlockBadge('pronunciation_pro');
      if (stats.attempts + 1 >= 10) unlockBadge('pronunciation_10');

      setStats(prev => {
        const attempts = prev.attempts + 1;
        const avgScore = Math.round((prev.avgScore * prev.attempts + scored.score) / attempts);
        return { attempts, avgScore, bestScore: Math.max(prev.bestScore, scored.score) };
      });

    } catch (err) {
      setPhase('ready');
      onToast?.(err.message, 'error');
    }
  }, [phase, current, mode, onXP, onToast, stats.attempts]);

  const nextExercise = () => {
    setPhase('ready');
    setResult(null);
    setExerciseIdx(i => (i + 1) % exercises.length);
  };

  const prevExercise = () => {
    setPhase('ready');
    setResult(null);
    setExerciseIdx(i => (i - 1 + exercises.length) % exercises.length);
  };

  return (
    <div className="learning-screen pronunciation-studio">
      <div className="page-header">
        <h2>🎙️ ಉಚ್ಚಾರಣೆ ಅಭ್ಯಾಸ — Pronunciation Practice</h2>
        <p>Listen to native audio, speak, get scored — train yourself to sound like a real Kannadiga.</p>
      </div>

      {/* Status Bar */}
      <div className="glass-card pronun-status-bar">
        <div className="pronun-status-item">
          <span className="status-dot" data-ok={isTTSSupported()} />
          TTS: {voiceInfo.hasKannadaVoice ? `✅ ${voiceInfo.voiceName}` : '⚠️ No Kannada voice — install kn-IN language pack'}
        </div>
        <div className="pronun-status-item">
          <span className="status-dot" data-ok={sttStatus.supported} />
          STT: {sttStatus.supported ? '✅ Mic Ready' : '❌ Use Chrome or Edge'}
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="section-tabs">
        {practiceModes.map(m => (
          <button
            key={m.id}
            className={`section-tab${mode === m.id ? ' active' : ''}`}
            onClick={() => setMode(m.id)}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* Main Practice Panel — full width now */}
      <div className="pronun-main">
        <div className="glass-card pronun-card">
          <div className="pronun-meta">
            <span className="pill">{current.category || mode}</span>
            <span className="pill">{current.difficulty}</span>
            <span className="pill">{exerciseIdx + 1} / {exercises.length}</span>
          </div>

          <div className="pronun-word-display">
            <div className="pronun-kannada">{current.kannada}</div>
            <div className="pronun-translit">{current.transliteration}</div>
            <div className="pronun-hint">{current.hint}</div>
          </div>

          {/* Listen Controls */}
          <div className="pronun-listen-row">
            {Object.entries(SPEECH_PRESETS).map(([key, val]) => (
              <button
                key={key}
                className={`audio-btn${speechPreset === key ? ' active-preset' : ''}`}
                onClick={() => { setSpeechPreset(key); handleListen(key); }}
              >
                🔊 {val.label}
              </button>
            ))}
            <button className="audio-btn" onClick={() => handleListen('syllable')}>📖 Syllable</button>
            <button className="audio-btn" onClick={() => handleListen('compare')}>⚡ Compare</button>
          </div>

          {/* Mic Section */}
          <div className="pronun-mic-section">
            <MicWave active={phase === 'listening'} />
            <button
              className={`pronun-mic-btn${phase === 'listening' ? ' recording' : ''}`}
              onClick={handleRecord}
              disabled={!sttStatus.supported}
            >
              {phase === 'listening' ? '⏹️ Stop' : '🎤 Speak Now'}
            </button>
            {phase === 'listening' && (
              <p className="pronun-interim">{interimText || 'Listening... speak now!'}</p>
            )}
          </div>

          {/* Results */}
          {phase === 'scored' && result && (
            <div className="pronun-result">
              <div className="pronun-result-header">
                <ScoreRing score={result.score} />
                <div>
                  <div className="pronun-grade">Grade: {result.grade} {'⭐'.repeat(result.stars)}</div>
                  <p className="pronun-feedback">{result.feedback}</p>
                  {result.transcript && (
                    <p className="pronun-heard">Heard: &quot;{result.transcript}&quot;</p>
                  )}
                </div>
              </div>
              {result.tips?.length > 0 && (
                <div className="pronun-tips">
                  <strong>💡 Tips:</strong>
                  <ul>{result.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="pronun-nav">
            <button className="audio-btn" onClick={prevExercise}>← Prev</button>
            {phase === 'scored' ? (
              <button className="btn-primary" onClick={nextExercise}>Next Word →</button>
            ) : (
              <button className="audio-btn" onClick={nextExercise}>Skip →</button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid pronun-stats">
          <div className="glass-card stat-card">
            <span className="stat-value">{stats.attempts}</span>
            <span className="stat-label">Attempts</span>
          </div>
          <div className="glass-card stat-card">
            <span className="stat-value">{stats.avgScore}%</span>
            <span className="stat-label">Avg Score</span>
          </div>
          <div className="glass-card stat-card">
            <span className="stat-value">{stats.bestScore}%</span>
            <span className="stat-label">Best Score</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PronunciationStudio;

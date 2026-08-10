import { useState, useRef } from "react";

const VOWELS = ["ಅ","ಆ","ಇ","ಈ","ಉ","ಊ","ಋ","ಎ","ಏ","ಐ","ಒ","ಓ","ಔ","ಅಂ","ಅಃ"];
const VOWEL_DIACRITICS = ["ಾ","ಿ","ೀ","ು","ೂ","ೃ","ೆ","ೇ","ೈ","ೊ","ೋ","ೌ","ಂ","ಃ","್"];
const CONSONANT_ROWS = [
  ["ಕ","ಖ","ಗ","ಘ","ಙ"],
  ["ಚ","ಛ","ಜ","ಝ","ಞ"],
  ["ಟ","ಠ","ಡ","ಢ","ಣ"],
  ["ತ","ಥ","ದ","ಧ","ನ"],
  ["ಪ","ಫ","ಬ","ಭ","ಮ"],
  ["ಯ","ರ","ಲ","ವ","ಶ","ಷ","ಸ","ಹ","ಳ"],
];
const GRADIENTS = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
];

function KeyBtn({ char, idx, pressed, onClick }) {
  const g = GRADIENTS[idx % GRADIENTS.length];
  return (
    <button onClick={() => onClick(char)} style={{
      background: g, border: "none", borderRadius: 10,
      padding: "0.5rem 0.8rem", fontSize: "1.3rem", fontWeight: 700,
      color: "#fff", cursor: "pointer", minWidth: 48, userSelect: "none",
      boxShadow: pressed ? "inset 0 2px 6px rgba(0,0,0,0.4)" : "0 3px 8px rgba(0,0,0,0.25)",
      transform: pressed ? "scale(0.9)" : "scale(1)", transition: "all 0.1s",
    }}>{char}</button>
  );
}

export default function KannadaKeyboard({ onXP, onToast }) {
  const [text, setText] = useState("");
  const [pressed, setPressed] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const totalRef = useRef(0);
  const milestoneRef = useRef(0);

  const tap = (char) => {
    setText(t => t + char);
    setPressed(char);
    setTimeout(() => setPressed(null), 150);
    totalRef.current += 1;
    const m = Math.floor(totalRef.current / 10);
    if (m > milestoneRef.current) {
      milestoneRef.current = m;
      onXP && onXP(5);
      onToast && onToast("⌨️ +5 XP for typing!", "success");
    }
  };

  const speak = () => {
    if (!text.trim()) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "kn-IN"; u.rate = 0.85;
    setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>⌨️ ಕನ್ನಡ Keyboard</h2>
        <p>Tap keys to compose text • Earn 5 XP every 10 characters</p>
      </div>

      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1rem", textAlign: "center" }}>
        <div style={{ fontSize: "2.2rem", fontWeight: 700, minHeight: 64, wordBreak: "break-all", color: "var(--text-primary,#fff)", letterSpacing: 2 }}>
          {text || <span style={{ opacity: 0.3, fontSize: "1.2rem" }}>Start typing below…</span>}
        </div>
        <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={speak} disabled={speaking || !text}>
            {speaking ? "🔊 Speaking…" : "🔊 Speak"}
          </button>
          <button onClick={() => setText(t => t.slice(0,-1))} style={{ background: GRADIENTS[4], border: "none", borderRadius: 10, padding: "0.5rem 1rem", fontWeight: 700, cursor: "pointer", color: "#222" }}>⌫ Delete</button>
          <button onClick={() => setText("")} style={{ background: GRADIENTS[0], border: "none", borderRadius: 10, padding: "0.5rem 1rem", fontWeight: 700, cursor: "pointer", color: "#fff" }}>🗑 Clear</button>
        </div>
        <div style={{ marginTop: "0.4rem", fontSize: "0.8rem", opacity: 0.6 }}>
          {totalRef.current} chars typed · {milestoneRef.current * 5} XP earned
        </div>
      </div>

      {[
        { label: "Vowels (ಸ್ವರಗಳು)", keys: VOWELS },
        { label: "Vowel Markers (ಮಾತ್ರೆಗಳು)", keys: VOWEL_DIACRITICS },
      ].map(({ label, keys }) => (
        <div key={label} className="glass-card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", opacity: 0.7, marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {keys.map((k, i) => <KeyBtn key={k} char={k} idx={i} pressed={pressed === k} onClick={tap} />)}
          </div>
        </div>
      ))}

      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
        <div style={{ fontWeight: 700, fontSize: "0.85rem", opacity: 0.7, marginBottom: "0.8rem", textTransform: "uppercase", letterSpacing: 1 }}>Consonants (ವ್ಯಂಜನಗಳು)</div>
        {CONSONANT_ROWS.map((row, ri) => (
          <div key={ri} style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.4rem" }}>
            {row.map((c, ci) => <KeyBtn key={c} char={c} idx={ri + ci} pressed={pressed === c} onClick={tap} />)}
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <div style={{ fontWeight: 700, fontSize: "0.85rem", opacity: 0.7, marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: 1 }}>Kannada Digits (ಅಂಕಿಗಳು)</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {["೦","೧","೨","೩","೪","೫","೬","೭","೮","೯"].map((d, i) => <KeyBtn key={d} char={d} idx={i} pressed={pressed === d} onClick={tap} />)}
        </div>
      </div>
    </div>
  );
}

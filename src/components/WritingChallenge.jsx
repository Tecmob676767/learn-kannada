import { useState, useEffect } from "react";

const PROMPTS = [
  { prompt:'Write "Good Morning" in Kannada', hint:"ಶುಭ ಮುಂಜಾನೆ (Shubha Munjane)", day:0 },
  { prompt:'Write "Thank you very much" in Kannada', hint:"ತುಂಬಾ ಧನ್ಯವಾದ (Tumba Dhanyavada)", day:1 },
  { prompt:'Write "My name is ___" in Kannada', hint:"ನನ್ನ ಹೆಸರು ___ (Nanna hesaru ___)", day:2 },
  { prompt:'Write "I am learning Kannada" in Kannada', hint:"ನಾನು ಕನ್ನಡ ಕಲಿಯುತ್ತಿದ್ದೇನೆ", day:3 },
  { prompt:'Write "Where is the bus stop?" in Kannada', hint:"ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ? (Bus nildana ellide?)", day:4 },
  { prompt:'Write "How much does this cost?" in Kannada', hint:"ಇದರ ಬೆಲೆ ಎಷ್ಟು? (Idara bele eshtu?)", day:5 },
  { prompt:'Write "I am hungry" in Kannada', hint:"ನನಗೆ ಹಸಿವಾಗಿದೆ (Nanage hasivagide)", day:6 },
  { prompt:'Write "Good Night" in Kannada', hint:"ಶುಭ ರಾತ್ರಿ (Shubha Raatri)", day:7 },
  { prompt:'Write "Please help me" in Kannada', hint:"ದಯವಿಟ್ಟು ನನಗೆ ಸಹಾಯ ಮಾಡಿ (Dayavittu nanage sahaya maadi)", day:8 },
  { prompt:'Write "Karnataka is beautiful" in Kannada', hint:"ಕರ್ನಾಟಕ ಸುಂದರವಾಗಿದೆ (Karnataka sundaravagide)", day:9 },
];

const STREAK_KEY = "wc_streak";
const DONE_KEY = "wc_done_date";

export default function WritingChallenge({ onXP, onToast }) {
  const todayIdx = new Date().getDay() % PROMPTS.length;
  const prompt = PROMPTS[todayIdx];

  const [input, setInput] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem(STREAK_KEY) || "0"));
  const [alreadyDone, setAlreadyDone] = useState(() => {
    const d = localStorage.getItem(DONE_KEY);
    return d === new Date().toDateString();
  });

  const handleSubmit = () => {
    if (!input.trim()) {
      onToast && onToast("Please write something first!", "error");
      return;
    }
    if (alreadyDone) {
      onToast && onToast("Already completed today! Come back tomorrow.", "info");
      return;
    }
    const today = new Date().toDateString();
    const newStreak = streak + 1;
    setStreak(newStreak);
    setAlreadyDone(true);
    setSubmitted(true);
    localStorage.setItem(STREAK_KEY, newStreak);
    localStorage.setItem(DONE_KEY, today);
    onXP && onXP(20);
    onToast && onToast("🔥 +20 XP! Challenge complete!", "success");
  };

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>✍️ Daily Writing Challenge</h2>
        <p>One challenge per day · Build your Kannada writing habit</p>
      </div>

      {/* Streak */}
      <div className="glass-card" style={{ padding:"1.5rem", marginBottom:"1rem", textAlign:"center", background:"linear-gradient(135deg,rgba(250,112,154,0.2),rgba(254,225,64,0.15))" }}>
        <div style={{ fontSize:"2.5rem" }}>🔥</div>
        <div style={{ fontSize:"2rem", fontWeight:800, color:"#fa709a" }}>{streak}</div>
        <div style={{ fontWeight:600, opacity:0.8 }}>Day Streak</div>
        {alreadyDone && !submitted && (
          <div style={{ marginTop:"0.5rem", fontSize:"0.85rem", color:"#43e97b", fontWeight:600 }}>✅ Today already completed!</div>
        )}
      </div>

      {/* Prompt card */}
      <div className="glass-card" style={{ padding:"1.5rem", marginBottom:"1rem" }}>
        <div style={{ fontSize:"0.8rem", textTransform:"uppercase", letterSpacing:1, opacity:0.6, marginBottom:"0.5rem" }}>
          Day {todayIdx + 1} of 10 · {new Date().toDateString()}
        </div>
        <div style={{ fontSize:"1.4rem", fontWeight:700, marginBottom:"1.25rem", lineHeight:1.5 }}>
          📝 {prompt.prompt}
        </div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={alreadyDone}
          placeholder="ಕನ್ನಡದಲ್ಲಿ ಬರೆಯಿರಿ… (Write in Kannada or transliteration)"
          style={{
            width:"100%", minHeight:120, padding:"0.85rem", borderRadius:12,
            border:"2px solid rgba(102,126,234,0.4)", background:"rgba(0,0,0,0.2)",
            color:"inherit", fontSize:"1.2rem", resize:"vertical", fontFamily:"inherit", lineHeight:1.6,
            boxSizing:"border-box"
          }}
        />
        <div style={{ marginTop:"0.75rem", display:"flex", gap:"0.75rem", flexWrap:"wrap" }}>
          <button className="btn-primary" onClick={handleSubmit} disabled={alreadyDone}>
            {alreadyDone ? "✅ Submitted" : "Submit (+20 XP)"}
          </button>
          <button onClick={() => setShowHint(h => !h)} style={{ padding:"0.55rem 1.1rem", borderRadius:10, border:"none", background:"rgba(255,255,255,0.12)", cursor:"pointer", fontWeight:600 }}>
            {showHint ? "🙈 Hide Hint" : "💡 Show Hint"}
          </button>
        </div>
        {showHint && (
          <div style={{ marginTop:"1rem", padding:"0.85rem", borderRadius:10, background:"rgba(102,126,234,0.2)", border:"1px solid rgba(102,126,234,0.4)" }}>
            <span style={{ fontWeight:700 }}>Hint: </span>
            <span style={{ fontSize:"1.15rem" }}>{prompt.hint}</span>
          </div>
        )}
      </div>

      {submitted && (
        <div className="glass-card" style={{ padding:"1.5rem", textAlign:"center", background:"linear-gradient(135deg,rgba(67,233,123,0.2),rgba(56,249,215,0.15))" }}>
          <div style={{ fontSize:"3rem" }}>🎉</div>
          <div style={{ fontSize:"1.4rem", fontWeight:700, marginBottom:"0.5rem" }}>Excellent work!</div>
          <div style={{ opacity:0.8 }}>You earned <strong>20 XP</strong> and extended your streak to <strong>{streak} days</strong>!</div>
          <div style={{ marginTop:"0.75rem", fontSize:"1.2rem" }}>{prompt.hint}</div>
        </div>
      )}

      {/* All prompts preview */}
      <div className="glass-card" style={{ padding:"1.5rem", marginTop:"1rem" }}>
        <div style={{ fontWeight:700, marginBottom:"0.75rem", opacity:0.8 }}>📅 All 10 Prompts</div>
        {PROMPTS.map((p, i) => (
          <div key={i} style={{
            padding:"0.5rem 0.75rem", borderRadius:8, marginBottom:"0.4rem",
            background: i === todayIdx ? "rgba(102,126,234,0.25)" : "rgba(255,255,255,0.05)",
            fontWeight: i === todayIdx ? 700 : 400,
            fontSize:"0.9rem", display:"flex", gap:"0.5rem", alignItems:"center"
          }}>
            <span style={{ opacity:0.5, minWidth:24 }}>D{i+1}</span>
            {p.prompt}
            {i === todayIdx && <span style={{ marginLeft:"auto", color:"#4facfe", fontSize:"0.8rem" }}>← Today</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

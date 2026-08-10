import { useState, useCallback } from "react";

const ALL_CARDS = [
  { id:1, kannada:"ನಮಸ್ಕಾರ", roman:"Namaskara", english:"Hello / Greetings", category:"Greetings" },
  { id:2, kannada:"ಧನ್ಯವಾದ", roman:"Dhanyavada", english:"Thank you", category:"Greetings" },
  { id:3, kannada:"ಹೌದು", roman:"Howdu", english:"Yes", category:"Greetings" },
  { id:4, kannada:"ಇಲ್ಲ", roman:"Illa", english:"No", category:"Greetings" },
  { id:5, kannada:"ಹೇಗಿದ್ದೀರಾ?", roman:"Hegiddira?", english:"How are you?", category:"Greetings" },
  { id:6, kannada:"ಚೆನ್ನಾಗಿದ್ದೇನೆ", roman:"Chennagidhene", english:"I am fine", category:"Greetings" },
  { id:7, kannada:"ಊಟ", roman:"Oota", english:"Food / Meal", category:"Food" },
  { id:8, kannada:"ನೀರು", roman:"Neeru", english:"Water", category:"Food" },
  { id:9, kannada:"ಅನ್ನ", roman:"Anna", english:"Rice", category:"Food" },
  { id:10, kannada:"ತರಕಾರಿ", roman:"Tarakaari", english:"Vegetables", category:"Food" },
  { id:11, kannada:"ಹಣ್ಣು", roman:"Hannu", english:"Fruit", category:"Food" },
  { id:12, kannada:"ಹಾಲು", roman:"Haalu", english:"Milk", category:"Food" },
  { id:13, kannada:"ನಾಯಿ", roman:"Naayi", english:"Dog", category:"Animals" },
  { id:14, kannada:"ಬೆಕ್ಕು", roman:"Bekku", english:"Cat", category:"Animals" },
  { id:15, kannada:"ಆನೆ", roman:"Aane", english:"Elephant", category:"Animals" },
  { id:16, kannada:"ಹಸು", roman:"Hasu", english:"Cow", category:"Animals" },
  { id:17, kannada:"ಹಕ್ಕಿ", roman:"Hakki", english:"Bird", category:"Animals" },
  { id:18, kannada:"ಕೆಂಪು", roman:"Kempu", english:"Red", category:"Colors" },
  { id:19, kannada:"ನೀಲಿ", roman:"Neeli", english:"Blue", category:"Colors" },
  { id:20, kannada:"ಹಸಿರು", roman:"Hasiru", english:"Green", category:"Colors" },
  { id:21, kannada:"ಹಳದಿ", roman:"Haladi", english:"Yellow", category:"Colors" },
  { id:22, kannada:"ಬಿಳಿ", roman:"Bili", english:"White", category:"Colors" },
  { id:23, kannada:"ಕಪ್ಪು", roman:"Kappu", english:"Black", category:"Colors" },
  { id:24, kannada:"ಒಂದು", roman:"Ondu", english:"One", category:"Numbers" },
  { id:25, kannada:"ಎರಡು", roman:"Eradu", english:"Two", category:"Numbers" },
  { id:26, kannada:"ಮೂರು", roman:"Mooru", english:"Three", category:"Numbers" },
  { id:27, kannada:"ನಾಲ್ಕು", roman:"Naalku", english:"Four", category:"Numbers" },
  { id:28, kannada:"ಐದು", roman:"Aidu", english:"Five", category:"Numbers" },
  { id:29, kannada:"ಹತ್ತು", roman:"Hattu", english:"Ten", category:"Numbers" },
  { id:30, kannada:"ನೂರು", roman:"Nooru", english:"One Hundred", category:"Numbers" },
];

const CATS = ["All","Greetings","Food","Animals","Colors","Numbers"];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardDeck({ onXP, onToast }) {
  const [category, setCategory] = useState("All");
  const [deck, setDeck] = useState(() => shuffle(ALL_CARDS));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(new Set());
  const [practice, setPractice] = useState(new Set());

  const filtered = deck.filter(c => category === "All" || c.category === category);
  const card = filtered[index] || null;
  const total = filtered.length;

  const go = (dir) => {
    setFlipped(false);
    setIndex(i => Math.max(0, Math.min(total - 1, i + dir)));
  };

  const handleKnow = () => {
    if (!card) return;
    if (!known.has(card.id)) {
      setKnown(k => new Set([...k, card.id]));
      onXP && onXP(10);
      onToast && onToast("✅ +10 XP! Great recall!", "success");
    }
    go(1);
  };

  const handlePractice = () => {
    if (!card) return;
    setPractice(p => new Set([...p, card.id]));
    go(1);
  };

  const doShuffle = useCallback(() => {
    setDeck(shuffle(ALL_CARDS));
    setIndex(0);
    setFlipped(false);
  }, []);

  const catColor = { Greetings:"#667eea", Food:"#f5576c", Animals:"#43e97b", Colors:"#fa709a", Numbers:"#4facfe" };

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>🃏 Flashcard Deck</h2>
        <p>Spaced-repetition learning • 30 Kannada words</p>
      </div>

      {/* Stats */}
      <div style={{ display:"flex", gap:"0.75rem", marginBottom:"1rem", flexWrap:"wrap" }}>
        {[
          { label:"Progress", val:`${Math.min(index+1,total)} / ${total}`, color:"#4facfe" },
          { label:"Known", val:known.size, color:"#43e97b" },
          { label:"Practice", val:practice.size, color:"#fa709a" },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding:"0.75rem 1.25rem", flex:1, textAlign:"center", minWidth:90 }}>
            <div style={{ fontSize:"1.6rem", fontWeight:800, color:s.color }}>{s.val}</div>
            <div style={{ fontSize:"0.78rem", opacity:0.7 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap", marginBottom:"1rem" }}>
        {CATS.map(c => (
          <button key={c} onClick={() => { setCategory(c); setIndex(0); setFlipped(false); }} style={{
            padding:"0.4rem 0.9rem", borderRadius:20, border:"none", cursor:"pointer",
            fontWeight:600, fontSize:"0.85rem",
            background: category === c ? (catColor[c] || "#667eea") : "rgba(255,255,255,0.1)",
            color: category === c ? "#fff" : "inherit",
          }}>{c}</button>
        ))}
        <button onClick={doShuffle} style={{ marginLeft:"auto", padding:"0.4rem 0.9rem", borderRadius:20, border:"none", cursor:"pointer", background:"rgba(255,255,255,0.15)", fontWeight:600 }}>🔀 Shuffle</button>
      </div>

      {/* Card */}
      {card ? (
        <div onClick={() => setFlipped(f => !f)} style={{
          cursor:"pointer", perspective:1000, marginBottom:"1rem"
        }}>
          <div style={{
            position:"relative", height:260,
            transformStyle:"preserve-3d",
            transition:"transform 0.55s cubic-bezier(0.4,0,0.2,1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}>
            {/* Front */}
            <div className="glass-card" style={{
              padding:"1.5rem", position:"absolute", inset:0,
              backfaceVisibility:"hidden", display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", textAlign:"center",
              background:"linear-gradient(135deg,rgba(102,126,234,0.25),rgba(118,75,162,0.25))",
            }}>
              <div style={{ fontSize:"0.8rem", opacity:0.6, marginBottom:"0.5rem", textTransform:"uppercase", letterSpacing:1 }}>
                {card.category} · Tap to flip
              </div>
              <div style={{ fontSize:"3.5rem", fontWeight:800, marginBottom:"0.5rem" }}>{card.kannada}</div>
              <div style={{ fontSize:"1rem", opacity:0.6 }}>{card.roman}</div>
              <div style={{ marginTop:"1rem", fontSize:"0.8rem", opacity:0.5 }}>🔄 Tap to reveal meaning</div>
            </div>
            {/* Back */}
            <div className="glass-card" style={{
              padding:"1.5rem", position:"absolute", inset:0,
              backfaceVisibility:"hidden", transform:"rotateY(180deg)",
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center",
              background:"linear-gradient(135deg,rgba(67,233,123,0.2),rgba(56,249,215,0.2))",
            }}>
              <div style={{ fontSize:"0.8rem", opacity:0.6, marginBottom:"0.5rem", textTransform:"uppercase", letterSpacing:1 }}>English Meaning</div>
              <div style={{ fontSize:"2.4rem", fontWeight:800, marginBottom:"0.5rem" }}>{card.english}</div>
              <div style={{ fontSize:"1.1rem", opacity:0.7, marginBottom:"0.25rem" }}>{card.kannada}</div>
              <div style={{ fontSize:"0.95rem", opacity:0.55 }}>{card.roman}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ padding:"2rem", textAlign:"center", marginBottom:"1rem" }}>
          <div style={{ fontSize:"2rem" }}>🎉</div>
          <p>No cards in this category.</p>
        </div>
      )}

      {/* Controls */}
      <div style={{ display:"flex", gap:"0.75rem", justifyContent:"center", flexWrap:"wrap" }}>
        <button onClick={() => go(-1)} disabled={index === 0} style={{ padding:"0.6rem 1.2rem", borderRadius:10, border:"none", background:"rgba(255,255,255,0.12)", cursor:"pointer", fontWeight:600 }}>← Prev</button>
        <button className="btn-primary" onClick={handleKnow} style={{ background:"linear-gradient(135deg,#43e97b,#38f9d7)", color:"#111" }}>✅ Know It (+10 XP)</button>
        <button onClick={handlePractice} style={{ padding:"0.6rem 1.2rem", borderRadius:10, border:"none", background:"linear-gradient(135deg,#fa709a,#fee140)", cursor:"pointer", fontWeight:600, color:"#111" }}>🔁 Practice More</button>
        <button onClick={() => go(1)} disabled={index >= total - 1} style={{ padding:"0.6rem 1.2rem", borderRadius:10, border:"none", background:"rgba(255,255,255,0.12)", cursor:"pointer", fontWeight:600 }}>Next →</button>
      </div>
    </div>
  );
}

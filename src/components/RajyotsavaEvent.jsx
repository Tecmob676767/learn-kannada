import React, { useState, useEffect, useRef } from 'react';
import { speakKannada } from '../utils/tts.js';
import { playSuccess, playFanfare, playClick, playError } from '../utils/soundEffects.js';
import { unlockBadge, getCurrentUser } from '../utils/storage.js';

// ── Petal and Confetti Particle Canvas ────────────────────────────────────────
const MarigoldPetalsCanvas = ({ active, triggerKey }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    const height = (canvas.height = canvas.parentElement?.offsetHeight || 600);

    // Karnataka Flag inspired colors: Haladi (Yellow/Gold), Kempu (Red/Crimson), Marigold orange, sparkle white
    const colors = ['#f59e0b', '#fbbf24', '#ffd700', '#dc2626', '#ef4444', '#b91c1c', '#ffffff'];

    const particleCount = active ? 75 : 25;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      size: Math.random() * 9 + 5,
      speedY: Math.random() * 2 + 1.2,
      speedX: (Math.random() - 0.5) * 1.5,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.6 + 0.4,
      isPetal: Math.random() > 0.4,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += Math.sin(p.y / 25) * 0.8 + p.speedX;
        p.rotation += p.rotSpeed;

        if (p.y > height) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.isPetal) {
          // Draw organic flower petal
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.6, p.size, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Draw festive golden confetti
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        }

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [active, triggerKey]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2,
        borderRadius: 'inherit',
      }}
    />
  );
};

// ── Quiz Questions Data ────────────────────────────────────────────────────────
const QUIZ_QUESTIONS = [
  {
    id: 1,
    questionKn: 'ಪ್ರತಿ ವರ್ಷ ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವವನ್ನು ಯಾವ ದಿನಾಂಕದಂದು ಆಚರಿಸಲಾಗುತ್ತದೆ?',
    questionEn: 'On which date is Kannada Rajyotsava celebrated every year?',
    options: [
      { text: '೧ ನವೆಂಬರ್ (November 1)', correct: true },
      { text: '೧೫ ಆಗಸ್ಟ್ (August 15)', correct: false },
      { text: '೨೬ ಜನವರಿ (January 26)', correct: false },
      { text: '೧ ಅಕ್ಟೋಬರ್ (October 1)', correct: false },
    ],
    explanation:
      '೧ ನವೆಂಬರ್ ೧೯೫೬ ರಂದು ಮೈಸೂರು ರಾಜ್ಯ ಉದಯವಾಯಿತು. ಆ ದಿನವನ್ನು ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ ಅಥವಾ ಕರ್ನಾಟಕ ಏಕೀಕರಣ ದಿನವೆಂದು ವಿಜೃಂಭಣೆಯಿಂದ ಆಚರಿಸಲಾಗುತ್ತದೆ.',
  },
  {
    id: 2,
    questionKn: 'ಕನ್ನಡ ಬಾವುಟದ ಹಳದಿ ಮತ್ತು ಕೆಂಪು ಬಣ್ಣಗಳು ಏನನ್ನು ಸಂಕೇತಿಸುತ್ತವೆ?',
    questionEn: 'What do the Yellow and Red colors of the Karnataka flag symbolize?',
    options: [
      { text: 'ಸೂರ್ಯ ಮತ್ತು ಚಂದ್ರ (Sun and Moon)', correct: false },
      { text: 'ಅರಸಿನ ಮತ್ತು ಕುಂಕುಮ - ಮಂಗಳಕರ ಸಮೃದ್ಧಿ ಹಾಗೂ ಕನ್ನಡಿಗರ ಶೌರ್ಯ', correct: true },
      { text: 'ಬೆಟ್ಟ ಮತ್ತು ನದಿಗಳು (Hills and Rivers)', correct: false },
      { text: 'ಚಿನ್ನ ಮತ್ತು ರಕ್ತ (Gold and Blood)', correct: false },
    ],
    explanation:
      'ಹಳದಿ ಬಣ್ಣವು ಅರಸಿನ (ಶಾಂತಿ, ಸಮೃದ್ಧಿ, ಸೌಹಾರ್ದತೆ) ಮತ್ತು ಕೆಂಪು ಬಣ್ಣವು ಕುಂಕುಮ (ತ್ಯಾಗ, ಶೌರ್ಯ ಹಾಗೂ ಕ್ರಾಂತಿ) ಯ ಸಂಕೇತವಾಗಿದೆ.',
  },
  {
    id: 3,
    questionKn: "ಕರ್ನಾಟಕದ ಹೆಮ್ಮೆಯ ರಾಜ್ಯ ಗೀತೆ 'ಜಯ ಭಾರತ ಜನನಿಯ ತನುಜಾತೆ'ಯನ್ನು ರಚಿಸಿದ ಕವಿ ಯಾರು?",
    questionEn: "Who authored Karnataka's official State Anthem 'Jaya Bharata Jananiya Tanujate'?",
    options: [
      { text: 'ದ.ರಾ. ಬೇಂದ್ರೆ (Da Ra Bendre)', correct: false },
      { text: 'ರಾಷ್ಟ್ರಕವಿ ಕುವೆಂಪು (Rashtrakavi Kuvempu)', correct: true },
      { text: 'ಶಿವರಾಮ ಕಾರಂತ (K. Shivaram Karanth)', correct: false },
      { text: 'ಮಾಸ್ತಿ ವೆಂಕಟೇಶ ಅಯ್ಯಂಗಾರ್ (Masti)', correct: false },
    ],
    explanation:
      "ಜ್ಞಾನಪೀಠ ಪ್ರಶಸ್ತಿ ವಿಜೇತ ರಾಷ್ಟ್ರಕವಿ ಕುವೆಂಪು (ಕೆ.ವಿ. ಪುಟ್ಟಪ್ಪ) ಅವರು 'ಜಯ ಭಾರತ ಜನನಿಯ ತನುಜಾತೆ' ನಾಡಗೀತೆಯನ್ನು ರಚಿಸಿದ್ದಾರೆ.",
  },
  {
    id: 4,
    questionKn: "ಮೈಸೂರು ರಾಜ್ಯಕ್ಕೆ ಅಧಿಕೃತವಾಗಿ 'ಕರ್ನಾಟಕ' ಎಂದು ಮರುನಾಮಕರಣವಾದ ವರ್ಷ ಯಾವುದು?",
    questionEn: "In which year was Mysore State officially renamed as 'Karnataka'?",
    options: [
      { text: '೧೯೫೬ (1956)', correct: false },
      { text: '೧೯೬೯ (1969)', correct: false },
      { text: '೧೯೭೩ (1973)', correct: true },
      { text: '೧೯೮೩ (1983)', correct: false },
    ],
    explanation:
      '೧ ನವೆಂಬರ್ ೧೯೭೩ ರಂದು ಅಂದಿನ ಮುಖ್ಯಮಂತ್ರಿ ಶ್ರೀ ಡಿ. ದೇವರಾಜ ಅರಸು ಅವರ ನೇತೃತ್ವದಲ್ಲಿ ಮೈಸೂರು ರಾಜ್ಯಕ್ಕೆ "ಕರ್ನಾಟಕ" ಎಂದು ನಾಮಕರಣ ಮಾಡಲಾಯಿತು.',
  },
  {
    id: 5,
    questionKn: 'ಕರ್ನಾಟಕ ರಾಜ್ಯದ ಅಧಿಕೃತ ರಾಜ್ಯ ಪ್ರಾಣಿ ಯಾವುದು?',
    questionEn: "What is the official State Animal of Karnataka?",
    options: [
      { text: 'ಹುಲಿ (Bengal Tiger)', correct: false },
      { text: 'ಏಷ್ಯನ್ ಆನೆ (Asian Elephant)', correct: true },
      { text: 'ಜಿಂಕೆ (Spotted Deer)', correct: false },
      { text: 'ಸಿಂಹ (Lion)', correct: false },
    ],
    explanation:
      'ಕರ್ನಾಟಕದ ರಾಜ್ಯ ಪ್ರಾಣಿ ಏಷ್ಯನ್ ಆನೆ (Asian Elephant), ರಾಜ್ಯ ಪಕ್ಷಿ ನೀಲಕಂಠ (Indian Roller), ಮತ್ತು ರಾಜ್ಯ ಹೂ ಕಮಲ (Lotus).',
  },
];

// ── Jnanpith & Cultural Legends Data ──────────────────────────────────────────
const LEGENDS = [
  {
    id: 'kuvempu',
    name: 'ಕುವೆಂಪು (Kuvempu)',
    title: 'ರಾಷ್ಟ್ರಕವಿ · ೧ನೇ ಜ್ಞಾನಪೀಠ ಪುರಸ್ಕೃತರು',
    era: '1904 – 1994',
    work: 'ಶ್ರೀ ರಾಮಾಯಣ ದರ್ಶನಂ',
    quote: 'ಎಲ್ಲಾದರೂ ಇರು, ಎಂತಾದರೂ ಇರು, ಎಂದೆಂದಿಗೂ ನೀ ಕನ್ನಡವಾಗಿರು!',
    quoteEn: 'Wherever you are, whatever you become, always remain true to Kannada!',
    category: 'jnanpith',
  },
  {
    id: 'bendre',
    name: 'ದ.ರಾ. ಬೇಂದ್ರೆ (Da Ra Bendre)',
    title: 'ವರಕವಿ · ೨ನೇ ಜ್ಞಾನಪೀಠ ಪುರಸ್ಕೃತರು',
    era: '1896 – 1981',
    work: 'ನಾಕುತಂತಿ',
    quote: 'ಕನ್ನಡವೇ ಸತ್ಯ, ಕನ್ನಡವೇ ನಿತ್ಯ!',
    quoteEn: 'Kannada is Truth, Kannada is Eternal!',
    category: 'jnanpith',
  },
  {
    id: 'karanth',
    name: 'ಕೆ. ಶಿವರಾಮ ಕಾರಂತ (K. Shivaram Karanth)',
    title: 'ಕಡಲತೀರದ ಭಾರ್ಗವ · ೩ನೇ ಜ್ಞಾನಪೀಠ',
    era: '1902 – 1997',
    work: 'ಮೂಕಜ್ಜಿಯ ಕನಸುಗಳು · ಚೋಮನ ದುಡಿ',
    quote: 'ಬದುಕಿ ನೋಡು, ಬಾಳಿ ನೋಡು, ಜಗತ್ತನ್ನು ಅರಿತು ನೋಡು.',
    quoteEn: 'Experience life, live fully, and understand the universe.',
    category: 'jnanpith',
  },
  {
    id: 'masti',
    name: 'ಮಾಸ್ತಿ ವೆಂಕಟೇಶ ಅಯ್ಯಂಗಾರ್ (Masti)',
    title: 'ಕನ್ನಡ ಸಣ್ಣ ಕಥೆಗಳ ಜನಕ · ೪ನೇ ಜ್ಞಾನಪೀಠ',
    era: '1891 – 1986',
    work: 'ಚಿಕ್ಕವೀರ ರಾಜೇಂದ್ರ',
    quote: 'ಭಾಷೆ ಮನಸ್ಸಿನ ಭಾವನೆಗಳನ್ನು ಬೆಸೆಯುವ ಮಧುರ ಸೇತುವೆ.',
    quoteEn: 'Language is a sweet bridge uniting human hearts.',
    category: 'jnanpith',
  },
  {
    id: 'gokak',
    name: 'ವಿ. ಕೃ. ಗೋಕಾಕ್ (V. K. Gokak)',
    title: 'ಗೋಕಾಕ್ ಚಳವಳಿಯ ನಾಯಕ · ೫ನೇ ಜ್ಞಾನಪೀಠ',
    era: '1909 – 1992',
    work: 'ಭಾರತ ಸಿಂಧು ರಶ್ಮಿ',
    quote: 'ಕನ್ನಡ ನಾಡಿನಲ್ಲಿ ಕನ್ನಡವೇ ಸಾರ್ವಭೌಮ ಭಾಷೆ!',
    quoteEn: 'In Karnataka, Kannada alone shall reign supreme!',
    category: 'jnanpith',
  },
  {
    id: 'ananthamurthy',
    name: 'ಯು. ಆರ್. ಅನಂತಮೂರ್ತಿ (U. R. Ananthamurthy)',
    title: 'ಚಿಂತಕ & ಸಾಹಿತಿ · ೬ನೇ ಜ್ಞಾನಪೀಠ',
    era: '1932 – 2014',
    work: 'ಸಂಸ್ಕಾರ · ಭಾರತೀಪುರ',
    quote: 'ಸಾಹಿತ್ಯವು ನಮ್ಮ ಅಂತರಂಗದ ಕಣ್ಣನ್ನು ತೆರೆಸುವ ದಿವ್ಯ ಶಕ್ತಿ.',
    quoteEn: 'Literature opens the eyes of our deeper conscience.',
    category: 'jnanpith',
  },
  {
    id: 'karnad',
    name: 'ಗಿರೀಶ್ ಕಾರ್ನಾಡ್ (Girish Karnad)',
    title: 'ಅಂತಾರಾಷ್ಟ್ರೀಯ ನಾಟಕಕಾರ · ೭ನೇ ಜ್ಞಾನಪೀಠ',
    era: '1938 – 2019',
    work: 'ಯಯಾತಿ · ತುಘಲಕ್ · ಹಯವದನ',
    quote: 'ರಂಗಭೂಮಿ ಸಂಸ್ಕೃತಿಯ ಜೀವಂತ ಕನ್ನಡಿ.',
    quoteEn: 'Theater is the living mirror of culture.',
    category: 'jnanpith',
  },
  {
    id: 'kambara',
    name: 'ಚಂದ್ರಶೇಖರ ಕಂಬಾರ (Chandrashekhara Kambara)',
    title: 'ಜಾನಪದ ಮಾಂತ್ರಿಕ · ೮ನೇ ಜ್ಞಾನಪೀಠ',
    era: '1937 – Present',
    work: 'ಸಿರಿಸಂಪಿಗೆ · ಜೋಕುಮಾರಸ್ವಾಮಿ',
    quote: 'ನಮ್ಮ ಜಾನಪದ ಬೇರುಗಳೇ ನಮ್ಮ ಭಾಷೆಯ ನಿಜವಾದ ಜೀವಸೆಲೆ.',
    quoteEn: 'Our folk heritage is the true lifeblood of our language.',
    category: 'jnanpith',
  },
  {
    id: 'rajkumar',
    name: 'ಡಾ. ರಾಜ್‌ಕುಮಾರ್ (Dr. Rajkumar)',
    title: 'ನಟಸಾರ್ವಭೌಮ · ಕರ್ನಾಟಕ ರತ್ನ',
    era: '1929 – 2006',
    work: 'ಬಂಗಾರದ ಮನುಷ್ಯ · ಕಸ್ತೂರಿ ನಿವಾಸ',
    quote: 'ಹುಟ್ಟಿದರೆ ಕನ್ನಡ ನಾಡಲ್ಲಿ ಹುಟ್ಟಬೇಕು, ಮೆಟ್ಟಿದರೆ ಕನ್ನಡ ಮಣ್ಣ ಮೆಟ್ಟಬೇಕು!',
    quoteEn: 'If born, be born in Kannada land; walk upon the sacred Kannada soil!',
    category: 'cultural',
  },
  {
    id: 'chennamma',
    name: 'ಕಿತ್ತೂರು ರಾಣಿ ಚೆನ್ನಮ್ಮ (Rani Chennamma)',
    title: 'ಸ್ವಾತಂತ್ರ್ಯ ಕಹಳೆ ಮೊಳಗಿಸಿದ ವೀರ ರಾಣಿ',
    era: '1778 – 1829',
    work: 'ಬ್ರಿಟಿಷರ ವಿರುದ್ಧ ಮೊದಲ ಸಶಸ್ತ್ರ ಸಂಗ್ರಾಮ',
    quote: 'ಕಪ್ಪ ಕೊಡಲು ನಾವೇಕೆ ಕೊಡಬೇಕು? ನೀವೇನು ನಮ್ಮ ಅಣ್ಣತಮ್ಮಂದಿರೆ?',
    quoteEn: 'Why should we pay tax to you? Are you our kin or brothers?',
    category: 'historical',
  },
];

// ── State Anthem Verses ───────────────────────────────────────────────────────
const ANTHEM_STANZAS = [
  {
    id: 1,
    kannada: 'ಜಯ ಭಾರತ ಜನನಿಯ ತನುಜಾತೆ,\nಜಯ ಹೇ ಕರ್ನಾಟಕ ಮಾತೆ!',
    translit: 'Jaya Bharata jananiya tanujaate,\nJaya hey Karnataka maate!',
    english: 'Victory to you, daughter of Mother India, Victory to you, Mother Karnataka!',
  },
  {
    id: 2,
    kannada: 'ಜಯ ಸುಂದರ ನದಿ ವನಗಳ ಗೇಹೆ,\nಜಯ ಹೇ ರಸಋಷಿಗಳ ಧಾಮ!\nಜನನಿಯ ಸಿರಿಮುಡಿಯ ಲತೆಯ ನಗೆಯ,\nಹೊನ್ನಿನ ಗಣಿಗಳ ತಾಯೆ!',
    translit:
      'Jaya sundara nadi vanagala gehe,\nJaya hey rasa rishigala dhaama!\nJananiya sirimudiya lateya nageya,\nHonnina ganigala taaye!',
    english:
      'Abode of beautiful rivers and lush groves! Sanctuary of saintly poets! Mother of golden mines and radiant smiles!',
  },
  {
    id: 3,
    kannada: 'ಬಾರಿಸು ಕನ್ನಡ ಡಿಂಡಿಮವ,\nಓ ಕರ್ನಾಟಕ ಹೃದಯಶಿವ!\nಸತ್ತಂತಿಹರನು ಬಡಿದೆಬ್ಬಿಸು,\nಹೊಸ ಹುರುಪನು ನೀ ತರಿಸು!',
    translit:
      'Baarisu Kannada dindimava,\nOh Karnataka hrudaya shiva!\nSattantiharanu badidebbisu,\nHosa hurupanu nee tarisu!',
    english: 'Sound the resonant drum of Kannada! Awaken the sleeping souls with fresh energy and pride!',
  },
];

// ── Festive Slogans & Speech Studio ───────────────────────────────────────────
const FESTIVE_SLOGANS = [
  {
    kn: 'ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವದ ಹಾರ್ದಿಕ ಶುಭಾಶಯಗಳು!',
    t: 'Kannada rajyotsavada haardika shubhashayagalu!',
    en: 'Warm greetings and Happy Kannada Rajyotsava!',
  },
  {
    kn: 'ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ! ಸಿರಿಗನ್ನಡಂ ಬಾಳ್ಗೆ!',
    t: 'Sirigannadam gelge! Sirigannadam baalge!',
    en: 'May rich Kannada be victorious! May rich Kannada flourish forever!',
  },
  {
    kn: 'ಕನ್ನಡ ನಮ್ಮ ಉಸಿರು, ಕರ್ನಾಟಕ ನಮ್ಮ ಹೆಮ್ಮೆ!',
    t: 'Kannada namma usiru, Karnataka namma hemme!',
    en: 'Kannada is our breath, Karnataka is our eternal pride!',
  },
  {
    kn: 'ಎಲ್ಲಾದರೂ ಇರು, ಎಂತಾದರೂ ಇರು, ಎಂದೆಂದಿಗೂ ನೀ ಕನ್ನಡವಾಗಿರು!',
    t: 'Ellaadaru iru, entaadaru iru, endendigu nee Kannadavaagiru!',
    en: 'Wherever you reside, whatever you do, always keep Kannada alive in your soul!',
  },
  {
    kn: 'ನಾನು ಹೆಮ್ಮೆಯ ಕನ್ನಡಿಗ / ಕನ್ನಡಿಗಳ್ಳು!',
    t: 'Naanu hemmeya Kannadiga / Kannadigalu!',
    en: 'I am a proud Kannadiga!',
  },
  {
    kn: 'ಕನ್ನಡ ಕಲಿಯಿರಿ, ಕನ್ನಡದಲ್ಲೇ ಮಾತನಾಡಿರಿ!',
    t: 'Kannada kaliyiri, Kannadadalle maatanaadiri!',
    en: 'Learn Kannada, speak Kannada with love!',
  },
];

export default function RajyotsavaEvent({ onXP, onToast, user, onNavigate }) {
  // Navigation tabs within Event
  const [activeTab, setActiveTab] = useState('flag'); // 'flag', 'quiz', 'anthem', 'legends', 'card', 'slogans'
  const [filterLegend, setFilterLegend] = useState('all');

  // Flag ceremony state
  const [flagHoisted, setFlagHoisted] = useState(() => {
    try {
      return localStorage.getItem('sobagu_rajyotsava_flag_hoisted') === 'true';
    } catch {
      return false;
    }
  });
  const [showerPetals, setShowerPetals] = useState(false);
  const [petalsKey, setPetalsKey] = useState(0);

  // Pledge state
  const [pledgeSigned, setPledgeSigned] = useState(() => {
    try {
      return localStorage.getItem('sobagu_rajyotsava_pledge_taken') === 'true';
    } catch {
      return false;
    }
  });
  const [pledgeName, setPledgeName] = useState(user?.name || '');

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Card Studio state
  const [cardSender, setCardSender] = useState(user?.name || 'A Proud Kannada Learner');
  const [cardTheme, setCardTheme] = useState('gold'); // 'gold', 'flag', 'royal'
  const [cardCopied, setCardCopied] = useState(false);

  // Audio playing index for anthem
  const [playingAnthemIndex, setPlayingAnthemIndex] = useState(null);

  // Live countdown to Kannada Rajyotsava (November 1, 2026)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      let targetYear = now.getFullYear();
      let targetDate = new Date(targetYear, 10, 1, 0, 0, 0); // Month is 0-indexed: 10 = November

      if (now.getMonth() === 10) {
        // We are currently in November - Rajyotsava Month!
        targetDate = new Date(targetYear, 10, 30, 23, 59, 59);
      } else if (now > targetDate) {
        targetDate = new Date(targetYear + 1, 10, 1, 0, 0, 0);
      }

      const diff = targetDate.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Trigger petal shower
  const triggerCelebration = () => {
    setShowerPetals(true);
    setPetalsKey((k) => k + 1);
    setTimeout(() => setShowerPetals(false), 8000);
  };

  // Flag hoisting action
  const handleHoistFlag = () => {
    playFanfare();
    setFlagHoisted(true);
    triggerCelebration();
    try {
      localStorage.setItem('sobagu_rajyotsava_flag_hoisted', 'true');
    } catch {}

    const alreadyAwarded = localStorage.getItem('sobagu_rajyotsava_flag_xp');
    if (!alreadyAwarded) {
      onXP?.(50);
      unlockBadge('rajyotsava_hero');
      onToast?.('🚩 ಕನ್ನಡ ಧ್ವಜ ವಂದನೆ ಯಶಸ್ವಿ! +50 XP & Rajyotsava Badge Unlocked!', 'xp');
      try {
        localStorage.setItem('sobagu_rajyotsava_flag_xp', 'true');
      } catch {}
    } else {
      onToast?.('🚩 ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ! ಕನ್ನಡ ಬಾವುಟ ಹೆಮ್ಮೆಯಿಂದ ಹಾರಾಡುತ್ತಿದೆ!', 'success');
    }
  };

  // Pledge signing action
  const handleSignPledge = (e) => {
    e.preventDefault();
    if (!pledgeName.trim()) return;

    playSuccess();
    setPledgeSigned(true);
    triggerCelebration();
    try {
      localStorage.setItem('sobagu_rajyotsava_pledge_taken', 'true');
    } catch {}

    const alreadyAwarded = localStorage.getItem('sobagu_rajyotsava_pledge_xp');
    if (!alreadyAwarded) {
      onXP?.(50);
      unlockBadge('rajyotsava_hero');
      onToast?.(`✍️ ಅಭಿನಂದನೆಗಳು ${pledgeName}! ನೀವು ಕನ್ನಡ ಕಾಯಕ ಪ್ರತಿಜ್ಞೆ ಸ್ವೀಕರಿಸಿದ್ದೀರಿ! (+50 XP)`, 'xp');
      try {
        localStorage.setItem('sobagu_rajyotsava_pledge_xp', 'true');
      } catch {}
    } else {
      onToast?.(`❤️ ನಿಮ್ಮ ಕನ್ನಡ ಭಕ್ತಿಯು ಸದಾ ನಾವಿನ್ಯವಾಗಿರಲಿ, ${pledgeName}!`, 'info');
    }
  };

  // Quiz submission
  const handleSelectQuizAnswer = (qId, optionIdx) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
    playClick();
  };

  const handleSubmitQuiz = () => {
    if (Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length) {
      playError();
      onToast?.('ದಯವಿಟ್ಟು ಎಲ್ಲಾ ೫ ಪ್ರಶ್ನೆಗಳಿಗೂ ಉತ್ತರಿಸಿ! Please answer all 5 questions.', 'error');
      return;
    }

    let correctCount = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      const selected = quizAnswers[q.id];
      if (selected !== undefined && q.options[selected].correct) {
        correctCount += 1;
      }
    });

    setQuizScore(correctCount);
    setQuizSubmitted(true);

    if (correctCount >= 4) {
      playFanfare();
      triggerCelebration();
      const awarded = localStorage.getItem('sobagu_rajyotsava_quiz_xp');
      if (!awarded) {
        onXP?.(100);
        unlockBadge('rajyotsava_hero');
        onToast?.(`🎉 ಅದ್ಭುತ! ನೀವು ${correctCount}/5 ಅಂಕ ಪಡೆದಿದ್ದೀರಿ! +100 XP ಗಳಿಸಿದ್ದೀರಿ!`, 'xp');
        try {
          localStorage.setItem('sobagu_rajyotsava_quiz_xp', 'true');
        } catch {}
      } else {
        onToast?.(`🏆 ಅದ್ಭುತ ಜ್ಞಾನ! ${correctCount}/5 ಅಂಕಗಳು!`, 'success');
      }
    } else {
      playSuccess();
      onToast?.(`ನೀವು ${correctCount}/5 ಅಂಕ ಪಡೆದಿದ್ದೀರಿ. ವಿವರಣೆಗಳನ್ನು ಗಮನಿಸಿ!`, 'info');
    }
  };

  const handleResetQuiz = () => {
    playClick();
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  // Speak Stanza
  const handleReciteStanza = (text, idx) => {
    playClick();
    setPlayingAnthemIndex(idx);
    speakKannada(text);
    setTimeout(() => setPlayingAnthemIndex(null), 6000);
  };

  // Share Card
  const handleShareCard = () => {
    playClick();
    const greetingText = `💛❤️ ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ! ಸಿರಿಗನ್ನಡಂ ಬಾಳ್ಗೆ! 💛❤️\n\n🎉 ೬೯ನೇ ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವದ ಹಾರ್ದಿಕ ಶುಭಾಶಯಗಳು!\nWish you and your family a very Happy Kannada Rajyotsava 2026!\n\n— ಪ್ರೀತಿಯಿಂದ: ${cardSender}\n\nಕನ್ನಡ ಕಲಿಯಲು ಸೊಬಗು ಆ್ಯಪ್ ಬಳಸಿ: https://sobagukannadaedu.vercel.app`;

    if (navigator.share) {
      navigator
        .share({
          title: 'ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ ಶುಭಾಶಯಗಳು | Sobagu',
          text: greetingText,
          url: 'https://sobagukannadaedu.vercel.app',
        })
        .then(() => onToast?.('ಶುಭಾಶಯ ಯಶಸ್ವಿಯಾಗಿ ಹಂಚಿಕೊಳ್ಳಲಾಗಿದೆ!', 'success'))
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(greetingText);
      setCardCopied(true);
      setTimeout(() => setCardCopied(false), 3000);
      onToast?.('📋 ಶುಭಾಶಯ ಸಂದೇಶವನ್ನು ಕಾಪಿ ಮಾಡಲಾಗಿದೆ! WhatsApp ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ.', 'success');
    }
  };

  const filteredLegends =
    filterLegend === 'all' ? LEGENDS : LEGENDS.filter((l) => l.category === filterLegend);

  return (
    <div className="learning-screen" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* ── Background Flower Petals & Gold Sparkle Canvas ── */}
      <MarigoldPetalsCanvas active={showerPetals} triggerKey={petalsKey} />

      {/* ── Grand Regal Hero Header ── */}
      <div
        className="glass-card"
        style={{
          position: 'relative',
          padding: '2.5rem 2rem',
          marginBottom: '2rem',
          borderRadius: '24px',
          background:
            'linear-gradient(135deg, rgba(220, 38, 38, 0.28) 0%, rgba(245, 158, 11, 0.24) 50%, rgba(185, 28, 28, 0.3) 100%)',
          border: '2px solid rgba(251, 191, 36, 0.65)',
          boxShadow: '0 16px 50px rgba(220, 38, 38, 0.25), inset 0 0 30px rgba(251, 191, 36, 0.15)',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Watermark Kannada Script */}
        <div
          style={{
            position: 'absolute',
            right: '-10px',
            bottom: '-25px',
            fontSize: '9rem',
            fontFamily: 'Noto Sans Kannada, sans-serif',
            fontWeight: 900,
            color: 'rgba(251, 191, 36, 0.08)',
            userSelect: 'none',
            pointerEvents: 'none',
            lineHeight: 1,
          }}
        >
          ಕನ್ನಡ
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 3 }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            {/* Festival Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(90deg, #dc2626, #f59e0b)',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '50px',
                fontSize: '0.82rem',
                fontWeight: 900,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)',
                marginBottom: '1rem',
              }}
            >
              <span>💛❤️</span>
              <span>ನಾಡಹಬ್ಬ ಮಹೋತ್ಸವ · ೬೯ನೇ ಕರ್ನಾಟಕ ಏಕೀಕರಣ ದಿನ</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(1.9rem, 4vw, 2.8rem)',
                fontWeight: 900,
                margin: '0 0 0.5rem 0',
                color: '#fff',
                fontFamily: 'Noto Sans Kannada, sans-serif',
                lineHeight: 1.2,
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              }}
            >
              🎉 ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ ಮಹೋತ್ಸವ ೨೦೨೬
            </h1>

            <div
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#ffd700',
                marginBottom: '0.85rem',
                fontFamily: 'Noto Sans Kannada, sans-serif',
              }}
            >
              ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ, ಸಿರಿಗನ್ನಡಂ ಬಾಳ್ಗೆ! 🌸
            </div>

            <p
              style={{
                fontSize: '0.98rem',
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: 1.6,
                maxWidth: '620px',
                margin: '0 0 1.25rem 0',
              }}
            >
              Welcome to the grand celebration of Karnataka's soul! Hoist the sacred Yellow & Red flag, recite the divine State Anthem, sign the Kannada Learner's pledge, test your knowledge in the Grand Quiz, and earn the exclusive <strong>ರಾಜ್ಯೋತ್ಸವ ರತ್ನ (Rajyotsava Ratna)</strong> honor.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button
                className="btn-primary"
                onClick={() => {
                  playClick();
                  setActiveTab('flag');
                }}
                style={{
                  background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                  color: '#000',
                  fontWeight: 900,
                  padding: '0.75rem 1.4rem',
                  borderRadius: '12px',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                }}
              >
                🚩 ಧ್ವಜ ವಂದನೆ & ಪ್ರತಿಜ್ಞೆ
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  playClick();
                  setActiveTab('quiz');
                }}
                style={{
                  background: 'rgba(220, 38, 38, 0.4)',
                  borderColor: 'rgba(251, 191, 36, 0.4)',
                  color: '#fff',
                  fontWeight: 800,
                  padding: '0.75rem 1.4rem',
                  borderRadius: '12px',
                }}
              >
                🎯 ರಾಜ್ಯೋತ್ಸವ ರಸಪ್ರಶ್ನೆ (+100 XP)
              </button>
              <button
                onClick={triggerCelebration}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#ffd700',
                  fontWeight: 800,
                  padding: '0.75rem 1.2rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                title="Shower festive marigold petals"
              >
                <span>🎊</span>
                <span>ಹೂಮಳೆ ಸುರಿಸಿ</span>
              </button>
            </div>
          </div>

          {/* ── Live Countdown Clock Box ── */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(16px)',
              padding: '1.5rem',
              borderRadius: '20px',
              border: '1.5px solid rgba(251, 191, 36, 0.5)',
              minWidth: '260px',
              textAlign: 'center',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 900,
                color: '#ffd700',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>⏳</span>
              <span>ಮುಂಬರುವ ರಾಜ್ಯೋತ್ಸವ ಕೌಂಟ್‌ಡೌನ್</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                marginBottom: '0.85rem',
              }}
            >
              {[
                { val: timeLeft.days, labelKn: 'ದಿನ', labelEn: 'Days' },
                { val: timeLeft.hours, labelKn: 'ಗಂಟೆ', labelEn: 'Hrs' },
                { val: timeLeft.minutes, labelKn: 'ನಿಮಿಷ', labelEn: 'Mins' },
                { val: timeLeft.seconds, labelKn: 'ಸೆಕೆಂಡ್', labelEn: 'Secs' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'linear-gradient(180deg, rgba(220, 38, 38, 0.4), rgba(0,0,0,0.6))',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    borderRadius: '12px',
                    padding: '8px 4px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 900,
                      color: '#ffd700',
                      lineHeight: 1.1,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {String(item.val).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#fff', fontWeight: 800, marginTop: '2px' }}>
                    {item.labelKn}
                  </div>
                  <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.6)' }}>
                    {item.labelEn}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#4ade80',
                background: 'rgba(74, 222, 128, 0.12)',
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(74, 222, 128, 0.3)',
              }}
            >
              ✨ 2X Double XP Active on All Rajyotsava Tasks!
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '1.75rem',
          scrollbarWidth: 'none',
        }}
      >
        {[
          { id: 'flag', icon: '🚩', label: 'ಧ್ವಜ ವಂದನೆ & ಪ್ರತಿಜ್ಞೆ', sub: 'Flag & Pledge' },
          { id: 'quiz', icon: '🎯', label: 'ರಾಜ್ಯೋತ್ಸವ ರಸಪ್ರಶ್ನೆ', sub: 'Grand Quiz' },
          { id: 'anthem', icon: '🎶', label: 'ನಾಡಗೀತೆ', sub: 'State Anthem' },
          { id: 'legends', icon: '👑', label: 'ಜ್ಞಾನಪೀಠ ರತ್ನಗಳು', sub: 'Hall of Legends' },
          { id: 'card', icon: '💌', label: 'ಶುಭಾಶಯ ಕಾರ್ಡ್', sub: 'Card Studio' },
          { id: 'slogans', icon: '🗣️', label: 'ಘೋಷಣೆಗಳು & ಮಾತುಗಳು', sub: 'Festive Phrases' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              playClick();
              setActiveTab(tab.id);
            }}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '14px',
              border: activeTab === tab.id ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.1)',
              background:
                activeTab === tab.id
                  ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.4), rgba(245, 158, 11, 0.3))'
                  : 'rgba(255,255,255,0.05)',
              color: activeTab === tab.id ? '#ffd700' : 'rgba(255,255,255,0.8)',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === tab.id ? '0 4px 15px rgba(251, 191, 36, 0.25)' : 'none',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.88rem', fontFamily: 'Noto Sans Kannada, sans-serif' }}>{tab.label}</div>
              <div style={{ fontSize: '0.68rem', opacity: 0.75 }}>{tab.sub}</div>
            </div>
          </button>
        ))}
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: FLAG HOISTING & PLEDGE CEREMONY                                   */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'flag' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
          {/* Virtual Flagpole */}
          <div
            className="glass-card"
            style={{
              padding: '2rem',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(0,0,0,0.5))',
              border: '1.5px solid rgba(251, 191, 36, 0.4)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  color: '#ffd700',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                🚩 VIRTUAL CEREMONY
              </div>
              <h2 style={{ fontSize: '1.5rem', color: '#fff', margin: '0 0 0.5rem 0', fontFamily: 'Noto Sans Kannada' }}>
                ಕನ್ನಡ ಧ್ವಜಾರೋಹಣ ಸಂಭ್ರಮ
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', margin: '0 0 1.5rem 0' }}>
                Click to hoist the majestic Karnataka Yellow-Red flag atop the Suvarna Soudha mast.
              </p>
            </div>

            {/* Flagpole Animation Canvas / Graphic */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '240px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                paddingBottom: '20px',
              }}
            >
              {/* Mast / Pole */}
              <div
                style={{
                  position: 'relative',
                  width: '8px',
                  height: '200px',
                  background: 'linear-gradient(90deg, #d4af37, #fff, #996515)',
                  borderRadius: '4px',
                  boxShadow: '0 0 15px rgba(255, 215, 0, 0.4)',
                }}
              >
                {/* Golden Finial (Top of pole) */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-14px',
                    left: '-7px',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #fff 0%, #ffd700 60%, #b8860b 100%)',
                    boxShadow: '0 0 10px #ffd700',
                  }}
                />

                {/* Pedestal Base */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-12px',
                    left: '-24px',
                    width: '56px',
                    height: '14px',
                    background: 'linear-gradient(180deg, #b8860b, #553c00)',
                    borderRadius: '4px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.6)',
                  }}
                />

                {/* Animated Karnataka Flag */}
                <div
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: flagHoisted ? '10px' : '120px',
                    transition: 'top 1.8s cubic-bezier(0.25, 1, 0.5, 1)',
                    width: '140px',
                    height: '90px',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
                    borderRadius: '0 4px 4px 0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: flagHoisted ? 'flutterFlag 3s ease-in-out infinite alternate' : 'none',
                    transformOrigin: 'left center',
                  }}
                >
                  {/* Top Haladi / Yellow Band */}
                  <div
                    style={{
                      flex: 1,
                      background: 'linear-gradient(90deg, #f59e0b, #ffd700)',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(0,0,0,0.4)', letterSpacing: '2px' }}>
                      ಅರಸಿನ
                    </span>
                  </div>
                  {/* Bottom Kempu / Red Band */}
                  <div
                    style={{
                      flex: 1,
                      background: 'linear-gradient(90deg, #dc2626, #b91c1c)',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.6)', letterSpacing: '2px' }}>
                      ಕುಂಕುಮ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hoist Action Button */}
            <div style={{ width: '100%', marginTop: '1rem' }}>
              <button
                className="btn-primary"
                onClick={handleHoistFlag}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  fontSize: '1rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #dc2626, #f59e0b)',
                  borderRadius: '12px',
                  boxShadow: '0 6px 20px rgba(220, 38, 38, 0.4)',
                }}
              >
                {flagHoisted ? '🚩 ಧ್ವಜ ಮರು-ಆರೋಹಣ (Re-hoist & Shower Petals)' : '🚩 ಧ್ವಜಾರೋಹಣ ಮಾಡಿ (+50 XP)'}
              </button>
            </div>

            {/* Color Symbolism Guide */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                marginTop: '1.25rem',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <div style={{ color: '#ffd700', fontWeight: 800, fontSize: '0.8rem' }}>🟡 ಹಳದಿ (Arasina)</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem' }}>ಶಾಂತಿ, ಸಮೃದ್ಧಿ, ಜ್ಞಾನ & ಸಂಸ್ಕೃತಿ</div>
              </div>
              <div style={{ background: 'rgba(220, 38, 38, 0.15)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(220, 38, 38, 0.3)' }}>
                <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.8rem' }}>🔴 ಕೆಂಪು (Kunkuma)</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem' }}>ಶೌರ್ಯ, ತ್ಯಾಗ, ಕ್ರಾಂತಿ & ವಿಜಯ</div>
              </div>
            </div>
          </div>

          {/* ── Kannada Learner's Pledge (ಕನ್ನಡ ಪ್ರತಿಜ್ಞೆ) ── */}
          <div
            className="glass-card"
            style={{
              padding: '2rem',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(0,0,0,0.5))',
              border: '1.5px solid rgba(251, 191, 36, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  color: '#ffd700',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                📜 SACRED COMMITMENT
              </div>
              <h2 style={{ fontSize: '1.5rem', color: '#fff', margin: '0 0 0.5rem 0', fontFamily: 'Noto Sans Kannada' }}>
                ಕನ್ನಡ ಕಾಯಕ ಪ್ರತಿಜ್ಞೆ
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', margin: '0 0 1.25rem 0' }}>
                Take the official Kannada learner’s solemn pledge to honor Karnataka and speak its golden language.
              </p>

              {/* Pledge Vows */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  padding: '1.25rem',
                  borderRadius: '14px',
                  border: '1px solid rgba(251, 191, 36, 0.25)',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.9rem',
                }}
              >
                {[
                  {
                    kn: '೧. ನಾನು ಕರ್ನಾಟಕದಲ್ಲಿದ್ದಾಗ ಹೆಮ್ಮೆಯಿಂದ ಕನ್ನಡ ಮಾತನಾಡಲು ಸದಾ ಶ್ರಮಿಸುತ್ತೇನೆ.',
                    en: 'I will take pride in speaking Kannada in my daily life in Karnataka.',
                  },
                  {
                    kn: '೨. ದಿನವೂ ಹೊಸ ಕನ್ನಡ ಪದಗಳನ್ನು ಪ್ರೀತಿಯಿಂದ ಕಲಿಯುತ್ತೇನೆ ಮತ್ತು ಬಳಸುತ್ತೇನೆ.',
                    en: 'I will enthusiastically learn and practice new Kannada words every day.',
                  },
                  {
                    kn: '೩. ಕರ್ನಾಟಕದ ಶ್ರೀಮಂತ ಸಾಹಿತ್ಯ, ಸಂಸ್ಕೃತಿ ಹಾಗೂ ಜನರನ್ನು ಸದಾ ಗೌರವಿಸುತ್ತೇನೆ.',
                    en: 'I will honor and respect Karnataka’s rich heritage, literature, and people.',
                  },
                  {
                    kn: '೪. ಇತರರಿಗೂ ಕನ್ನಡ ಕಲಿಯಲು ಪ್ರೋತ್ಸಾಹಿಸಿ, ಪ್ರೀತಿಯಿಂದ ನೆರವಾಗುತ್ತೇನೆ.',
                    en: 'I will warmly encourage and assist fellow learners on their Kannada journey.',
                  },
                ].map((vow, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#ffd700', fontSize: '1rem' }}>✨</span>
                    <div>
                      <div style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 700, fontFamily: 'Noto Sans Kannada' }}>
                        {vow.kn}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginTop: '2px' }}>
                        {vow.en}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Signing Form */}
            <form onSubmit={handleSignPledge}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#ffd700', fontWeight: 700, marginBottom: '6px' }}>
                  ನಿಮ್ಮ ಶುಭ ಹೆಸರು / Your Name:
                </label>
                <input
                  type="text"
                  value={pledgeName}
                  onChange={(e) => setPledgeName(e.target.value)}
                  placeholder="Enter your name"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1.5px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(0,0,0,0.4)',
                    color: '#fff',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  fontSize: '1rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                  color: '#000',
                  borderRadius: '12px',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                }}
              >
                {pledgeSigned ? '✍️ ಪ್ರತಿಜ್ಞೆ ಪ್ರಮಾಣೀಕರಿಸಲಾಗಿದೆ (Pledge Signed ✓)' : '✍️ ಪ್ರತಿಜ್ಞೆ ಸ್ವೀಕರಿಸಿ & Badge ಗಳಿಸಿ (+50 XP)'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: GRAND RAJYOTSAVA QUIZ                                              */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'quiz' && (
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '20px', border: '1.5px solid rgba(251, 191, 36, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#ffd700', letterSpacing: '1px', textTransform: 'uppercase' }}>
                🎯 CULTURAL & HISTORY QUEST
              </div>
              <h2 style={{ fontSize: '1.6rem', color: '#fff', margin: '0.2rem 0', fontFamily: 'Noto Sans Kannada' }}>
                ರಾಜ್ಯೋತ್ಸವ ಮಹಾ ರಸಪ್ರಶ್ನೆ
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                Answer all 5 questions to test your knowledge of Karnataka's glorious history and earn +100 XP!
              </p>
            </div>
            {quizSubmitted && (
              <div
                style={{
                  background: quizScore >= 4 ? 'rgba(74, 222, 128, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  border: `1.5px solid ${quizScore >= 4 ? '#4ade80' : '#f59e0b'}`,
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: quizScore >= 4 ? '#4ade80' : '#ffd700' }}>
                  YOUR SCORE
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff' }}>
                  {quizScore} / {QUIZ_QUESTIONS.length}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {QUIZ_QUESTIONS.map((q, idx) => {
              const selectedOpt = quizAnswers[q.id];
              return (
                <div
                  key={q.id}
                  style={{
                    background: 'rgba(0, 0, 0, 0.35)',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '1rem' }}>
                    <span
                      style={{
                        background: 'linear-gradient(135deg, #dc2626, #f59e0b)',
                        color: '#fff',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '0.85rem',
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', fontFamily: 'Noto Sans Kannada' }}>
                        {q.questionKn}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                        {q.questionEn}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                    {q.options.map((opt, oIdx) => {
                      const isSelected = selectedOpt === oIdx;
                      let bg = 'rgba(255,255,255,0.05)';
                      let border = 'rgba(255,255,255,0.15)';
                      let color = '#fff';

                      if (quizSubmitted) {
                        if (opt.correct) {
                          bg = 'rgba(74, 222, 128, 0.25)';
                          border = '#4ade80';
                          color = '#4ade80';
                        } else if (isSelected && !opt.correct) {
                          bg = 'rgba(239, 68, 68, 0.25)';
                          border = '#ef4444';
                          color = '#f87171';
                        }
                      } else if (isSelected) {
                        bg = 'rgba(251, 191, 36, 0.25)';
                        border = '#ffd700';
                        color = '#ffd700';
                      }

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectQuizAnswer(q.id, oIdx)}
                          disabled={quizSubmitted}
                          style={{
                            padding: '0.85rem 1rem',
                            borderRadius: '12px',
                            background: bg,
                            border: `1.5px solid ${border}`,
                            color: color,
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            textAlign: 'left',
                            cursor: quizSubmitted ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{['A', 'B', 'C', 'D'][oIdx]}.</span>
                          <span>{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div
                      style={{
                        marginTop: '1rem',
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        background: 'rgba(251, 191, 36, 0.12)',
                        border: '1px solid rgba(251, 191, 36, 0.3)',
                        fontSize: '0.82rem',
                        color: 'rgba(255,255,255,0.9)',
                      }}
                    >
                      💡 <strong>ತಿಳಿದುಕೊಳ್ಳಿ:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            {quizSubmitted ? (
              <button
                className="btn-primary"
                onClick={handleResetQuiz}
                style={{ padding: '0.85rem 1.8rem', fontWeight: 800 }}
              >
                🔄 ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ (Retake Quiz)
              </button>
            ) : (
              <button
                className="btn-primary"
                onClick={handleSubmitQuiz}
                style={{
                  padding: '0.85rem 2rem',
                  fontWeight: 900,
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                  color: '#000',
                }}
              >
                🎯 ಉತ್ತರಗಳನ್ನು ಸಲ್ಲಿಸಿ (Submit Answers)
              </button>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: STATE ANTHEM RECITER                                               */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'anthem' && (
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '20px', border: '1.5px solid rgba(251, 191, 36, 0.4)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#ffd700', letterSpacing: '1px', textTransform: 'uppercase' }}>
              🎵 OFFICIAL STATE ANTHEM · ರಾಷ್ಟ್ರಕವಿ ಕುವೆಂಪು
            </div>
            <h2 style={{ fontSize: '1.6rem', color: '#fff', margin: '0.2rem 0', fontFamily: 'Noto Sans Kannada' }}>
              ಜಯ ಭಾರತ ಜನನಿಯ ತನುಜಾತೆ
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
              Listen and sing along to the official anthem of Karnataka composed by Rashtrakavi Kuvempu.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {ANTHEM_STANZAS.map((stanza, idx) => (
              <div
                key={stanza.id}
                style={{
                  background: playingAnthemIndex === idx ? 'rgba(251, 191, 36, 0.2)' : 'rgba(0, 0, 0, 0.35)',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: `1.5px solid ${playingAnthemIndex === idx ? '#ffd700' : 'rgba(255, 255, 255, 0.1)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div
                    style={{
                      fontFamily: 'Noto Sans Kannada, sans-serif',
                      fontSize: '1.3rem',
                      fontWeight: 900,
                      color: '#ffd700',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {stanza.kannada}
                  </div>
                  <div
                    style={{
                      fontSize: '0.88rem',
                      fontStyle: 'italic',
                      color: 'rgba(255,255,255,0.75)',
                      marginTop: '0.5rem',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {stanza.translit}
                  </div>
                  <div
                    style={{
                      fontSize: '0.82rem',
                      color: 'rgba(255,255,255,0.6)',
                      marginTop: '0.4rem',
                    }}
                  >
                    {stanza.english}
                  </div>
                </div>

                <button
                  className="glass-btn"
                  onClick={() => handleReciteStanza(stanza.kannada, idx)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: '12px',
                    background: playingAnthemIndex === idx ? '#ffd700' : 'rgba(255,255,255,0.1)',
                    color: playingAnthemIndex === idx ? '#000' : '#fff',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>{playingAnthemIndex === idx ? '🔊 ನುಡಿಯುತ್ತಿದೆ...' : '🎙️ ಧ್ವನಿ ಆಲಿಸಿ'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 4: HALL OF JNANPITH & CULTURAL LEGENDS                                 */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'legends' && (
        <div>
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'ಎಲ್ಲಾ ಮಹನೀಯರು (All Legends)' },
              { id: 'jnanpith', label: '೮ ಜ್ಞಾನಪೀಠ ರತ್ನಗಳು (8 Jnanpith Laureates)' },
              { id: 'cultural', label: 'ಸಾಂಸ್ಕೃತಿಕ ಧ್ರುವತಾರೆಗಳು (Cultural Icons)' },
              { id: 'historical', label: 'ಐತಿಹಾಸಿಕ ನಾಯಕರು (Historic Heroes)' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  playClick();
                  setFilterLegend(f.id);
                }}
                style={{
                  padding: '0.55rem 1.1rem',
                  borderRadius: '20px',
                  background: filterLegend === f.id ? '#ffd700' : 'rgba(255,255,255,0.06)',
                  color: filterLegend === f.id ? '#000' : '#fff',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {filteredLegends.map((leg) => (
              <div
                key={leg.id}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: '1.5px solid rgba(251, 191, 36, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#ffd700', margin: 0, fontFamily: 'Noto Sans Kannada' }}>
                      {leg.name}
                    </h3>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
                      {leg.era}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f87171', marginBottom: '0.5rem' }}>
                    {leg.title}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.9rem' }}>
                    📚 <strong>ಪ್ರಮುಖ ಕೃತಿ:</strong> {leg.work}
                  </div>

                  {/* Evergreen Quote */}
                  <div
                    style={{
                      background: 'rgba(0, 0, 0, 0.35)',
                      padding: '0.9rem',
                      borderRadius: '10px',
                      borderLeft: '3px solid #ffd700',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 800, fontFamily: 'Noto Sans Kannada' }}>
                      "{leg.quote}"
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginTop: '4px' }}>
                      {leg.quoteEn}
                    </div>
                  </div>
                </div>

                <button
                  className="glass-btn"
                  onClick={() => {
                    playClick();
                    speakKannada(leg.quote);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <span>🔊 ಮಾತನ್ನು ಆಲಿಸಿ (Hear Quote)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 5: GREETING CARD STUDIO                                               */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'card' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Controls */}
          <div className="glass-card" style={{ padding: '2rem', borderRadius: '20px', border: '1.5px solid rgba(251, 191, 36, 0.4)' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#fff', margin: '0 0 0.5rem 0', fontFamily: 'Noto Sans Kannada' }}>
              💌 ರಾಜ್ಯೋತ್ಸವ ಶುಭಾಶಯ ಕಾರ್ಡ್ ಸೃಷ್ಟಿಕರ್ತ
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: '0 0 1.5rem 0' }}>
              Create a personalized Kannada Rajyotsava festive card to share with family, colleagues & friends.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#ffd700', fontWeight: 700, marginBottom: '6px' }}>
                ಕಳುಹಿಸುವವರ ಹೆಸರು / Your Name:
              </label>
              <input
                type="text"
                value={cardSender}
                onChange={(e) => setCardSender(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1.5px solid rgba(251, 191, 36, 0.4)',
                  background: 'rgba(0,0,0,0.4)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#ffd700', fontWeight: 700, marginBottom: '6px' }}>
                ಕಾರ್ಡ್ ಥೀಮ್ / Card Style:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[
                  { id: 'gold', label: 'Suvarna Gold' },
                  { id: 'flag', label: 'Haladi-Kempu' },
                  { id: 'royal', label: 'Royal Crimson' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => {
                      playClick();
                      setCardTheme(th.id);
                    }}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: '8px',
                      background: cardTheme === th.id ? '#ffd700' : 'rgba(255,255,255,0.08)',
                      color: cardTheme === th.id ? '#000' : '#fff',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleShareCard}
              style={{
                width: '100%',
                padding: '0.9rem',
                fontSize: '1rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #25d366, #128c7e)',
                color: '#fff',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span>📲</span>
              <span>{cardCopied ? 'ಕಾಪಿ ಮಾಡಲಾಗಿದೆ! (Copied ✓)' : 'WhatsApp / ಲಿಂಕ್‌ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ'}</span>
            </button>
          </div>

          {/* Live Card Preview */}
          <div
            style={{
              padding: '2.5rem 2rem',
              borderRadius: '24px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '340px',
              border: '2px solid rgba(251, 191, 36, 0.7)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              background:
                cardTheme === 'gold'
                  ? 'radial-gradient(circle at top, #2e1a06 0%, #0d0702 100%)'
                  : cardTheme === 'flag'
                  ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.3) 0%, rgba(220, 38, 38, 0.4) 100%), #0a0000'
                  : 'radial-gradient(circle at top, #450a0a 0%, #1c0303 100%)',
            }}
          >
            {/* Ornate Gold Border Accent */}
            <div
              style={{
                position: 'absolute',
                inset: '10px',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                borderRadius: '16px',
                pointerEvents: 'none',
              }}
            />

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🌸</span>
                <span
                  style={{
                    background: 'linear-gradient(90deg, #ffd700, #f59e0b)',
                    color: '#000',
                    fontWeight: 900,
                    fontSize: '0.7rem',
                    padding: '4px 12px',
                    borderRadius: '50px',
                    letterSpacing: '1px',
                  }}
                >
                  ೬೯ನೇ ಕರ್ನಾಟಕ ರಾಜ್ಯೋತ್ಸವ
                </span>
                <span style={{ fontSize: '1.5rem' }}>🌸</span>
              </div>

              <div style={{ textAlign: 'center' }}>
                <h3
                  style={{
                    fontSize: '1.8rem',
                    fontFamily: 'Noto Sans Kannada, sans-serif',
                    fontWeight: 900,
                    color: '#ffd700',
                    margin: '0 0 0.5rem 0',
                    lineHeight: 1.3,
                  }}
                >
                  ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವದ ಹಾರ್ದಿಕ ಶುಭಾಶಯಗಳು!
                </h3>
                <div style={{ fontSize: '0.95rem', color: '#fff', fontStyle: 'italic', marginBottom: '1.25rem' }}>
                  Happy Kannada Rajyotsava 2026! 💛❤️
                </div>

                <div
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px dashed rgba(251, 191, 36, 0.4)',
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '0.92rem',
                    lineHeight: 1.5,
                    fontFamily: 'Noto Sans Kannada',
                  }}
                >
                  "ಎಲ್ಲಾದರೂ ಇರು, ಎಂತಾದರೂ ಇರು, ಎಂದೆಂದಿಗೂ ನೀ ಕನ್ನಡವಾಗಿರು!"
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>ಪ್ರೀತಿಯ ಶುಭಾಶಯಗಳೊಂದಿಗೆ:</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffd700', marginTop: '2px' }}>
                {cardSender}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                ಸೊಬಗು ಕನ್ನಡ ಕಲಿಕಾ ವೇದಿಕೆ · Sobagu Kannada Academy
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 6: FESTIVE SLOGANS & PHRASES                                         */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'slogans' && (
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '20px', border: '1.5px solid rgba(251, 191, 36, 0.4)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#ffd700', letterSpacing: '1px', textTransform: 'uppercase' }}>
              🗣️ FESTIVE VOCABULARY & SLOGANS
            </div>
            <h2 style={{ fontSize: '1.6rem', color: '#fff', margin: '0.2rem 0', fontFamily: 'Noto Sans Kannada' }}>
              ರಾಜ್ಯೋತ್ಸವ ವಿಶೇಷ ಮಾತುಗಳು & ಘೋಷಣೆಗಳು
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
              Practice these high-energy Kannada phrases to speak proudly throughout November!
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {FESTIVE_SLOGANS.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(0,0,0,0.35)',
                  padding: '1.25rem',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.8rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffd700', fontFamily: 'Noto Sans Kannada' }}>
                    {item.kn}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                    {item.t}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', marginTop: '4px' }}>
                    {item.en}
                  </div>
                </div>

                <button
                  className="glass-btn"
                  onClick={() => {
                    playClick();
                    speakKannada(item.kn);
                  }}
                  style={{
                    padding: '0.55rem 0.85rem',
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontWeight: 700,
                  }}
                >
                  <span>🔊 ಉಚ್ಚಾರಣೆ ಆಲಿಸಿ (Speak)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

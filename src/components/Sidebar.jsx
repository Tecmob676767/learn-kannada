import React, { useState, useEffect } from 'react';
import { getLevelTitle, getXPForNextLevel, subscribeToSyncStatus } from '../utils/storage.js';

const NAV_MAIN = [
  { id: 'dashboard',     icon: '🏠', label: 'Dashboard',         bg: 'linear-gradient(135deg, #ff9a9e, #fecfef)' },
  { id: 'sobaguai',      icon: '🤖', label: 'Sobagu AI Tutor',   labelKannada: 'ಕನ್ನಡ AI ಗುರು',   bg: 'linear-gradient(135deg, #ff0844, #ffb199)' },
  { id: 'lessons',       icon: '🗺️', label: 'Lesson Path',        labelKannada: 'ಪಾಠ ಮಾರ್ಗ (೩೨)', bg: 'linear-gradient(135deg, #ff6b35, #ffa366)' },
  { id: 'leagues',       icon: '🏆', label: 'Weekly Leagues',     labelKannada: 'ಸಾಪ್ತಾಹಿಕ ಲೀಗ್', bg: 'linear-gradient(135deg, #ffcf71, #ff923b)' },
  { id: 'certificates',  icon: '📜', label: 'Fluency Certificate',labelKannada: 'ಪ್ರಮಾಣ ಪತ್ರ',     bg: 'linear-gradient(135deg, #ffd700, #b8860b)' },
  { id: 'leaderboard',  icon: '🌐', label: 'Live Leaderboard',   bg: 'linear-gradient(135deg, #38ef7d, #11998e)' },
  { id: 'roadmap',      icon: '🧭', label: 'Curriculum Roadmap', labelKannada: 'ಅಧ್ಯಯನ ಮಾರ್ಗ',   bg: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
  { id: 'progress',     icon: '📊', label: 'Progress Report',     labelKannada: 'ಪ್ರಗತಿ ವರದಿ',    bg: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  { id: 'rewards',      icon: '🎁', label: 'Refer & Rewards',    labelKannada: 'ಬಹುಮಾನಗಳು (+500 XP)', bg: 'linear-gradient(135deg, #ff0844, #ffb199)' },
  { id: 'dailychallenge',icon:'🌟', label: 'Daily Challenge',     labelKannada: 'ದೈನಂದಿನ ಸವಾಲು', bg: 'linear-gradient(135deg, #f39c12, #f1c40f)' },
  { id: 'wordofday',    icon: '📅', label: 'Word of the Day',     labelKannada: 'ದಿನದ ಪದ',       bg: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
];

const NAV_GAMES = [
  { id: 'scrambled',  icon: '🎲', label: 'Scrambled Words',    labelKannada: 'ಪದ ಜೋಡಣೆ',  bg: 'linear-gradient(135deg, #ff5858, #f09819)' },
  { id: 'memorygame', icon: '🃏', label: 'Memory Card Flip',   labelKannada: 'ನೆನಪಿನ ಆಟ',  bg: 'linear-gradient(135deg, #e14efa, #b400ff)' },
  { id: 'wordmatch',  icon: '🎮', label: 'Word Match Arena',   labelKannada: 'ಪದ ಪಂದ್ಯ',   bg: 'linear-gradient(135deg, #7f00ff, #e100ff)' },
  { id: 'crossword',  icon: '🧩', label: 'Kannada Crossword',  labelKannada: 'ಪದಬಂಧ',      bg: 'linear-gradient(135deg, #11998e, #38ef7d)' },
  { id: 'fillblanks', icon: '✍️', label: 'Fill in the Blanks', labelKannada: 'ಬಿಟ್ಟು ತುಂಬಿಸಿ', bg: 'linear-gradient(135deg, #fc4a1a, #f7b733)' },
];

const NAV_LESSONS = [
  { id: 'varnamale',   icon: '🔡', label: 'Varnamale',              labelKannada: 'ಅಕ್ಷರ ಮಾಲೆ',        bg: 'linear-gradient(135deg, #30cfd0, #330867)' },
  { id: 'kagunita',   icon: '📊', label: 'Kagunita',               labelKannada: 'ಕಾಗುಣಿತ',            bg: 'linear-gradient(135deg, #00c6fb, #005bea)' },
  { id: 'handwriting',icon: '✍️', label: 'Handwriting Practice',   labelKannada: 'ಲಿಖಿತ ಅಭ್ಯಾಸ',       bg: 'linear-gradient(135deg, #f857a6, #ff5858)' },
  { id: 'vocabulary', icon: '📚', label: 'Vocabulary',              labelKannada: 'ಶಬ್ದಕೋಶ',            bg: 'linear-gradient(135deg, #00c9ff, #92fe9d)' },
  { id: 'phrasebook', icon: '📱', label: 'Phrasebook',              labelKannada: 'ವಾಕ್ಯ ಕೋಶ',          bg: 'linear-gradient(135deg, #f77062, #fe5196)' },
  { id: 'phrasebuilder',icon:'🏗️',label: 'Phrase Builder',          labelKannada: 'ವಾಕ್ಯ ರಚನೆ',         bg: 'linear-gradient(135deg, #f6d365, #fda085)' },
  { id: 'numbers',    icon: '🔢', label: 'Numbers Studio',          labelKannada: 'ಸಂಖ್ಯೆಗಳು',          bg: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
  { id: 'typing',     icon: '⌨️', label: 'Script Trainer',          labelKannada: 'ಲಿಪಿ ಅಭ್ಯಾಸ',        bg: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { id: 'typingtutor',icon: '🎮', label: 'Typing Tutor',            labelKannada: 'ಟೈಪಿಂಗ್ ಅಭ್ಯಾಸ',    bg: 'linear-gradient(135deg, #b224ef, #7579ff)' },
  { id: 'translit',   icon: '🔠', label: 'Transliteration Trainer', labelKannada: 'ಲಿಪ್ಯಂತರ ಅಭ್ಯಾಸ',   bg: 'linear-gradient(135deg, #ff758c, #ff7eb3)' },
  { id: 'grammar',    icon: '✏️', label: 'Sentence Architect',      labelKannada: 'ವ್ಯಾಕರಣ',            bg: 'linear-gradient(135deg, #f83600, #fe8c00)' },
  { id: 'storymode',  icon: '📖', label: 'Story Mode',              labelKannada: 'ಕಥೆಗಳು',             bg: 'linear-gradient(135deg, #ff9a9e, #fecfef)' },
  { id: 'conversations',icon:'🗣️',label: 'Conversation Studio',     labelKannada: 'ಸಂಭಾಷಣೆ',           bg: 'linear-gradient(135deg, #ff0844, #ffb199)' },
  { id: 'voicerecog', icon: '🎙️', label: 'Voice Quiz',              labelKannada: 'ಧ್ವನಿ ಪರೀಕ್ಷೆ',       bg: 'linear-gradient(135deg, #e52d27, #b31217)' },
  { id: 'pronunciation',icon:'🔊',label: 'Pronunciation Practice',  labelKannada: 'ಉಚ್ಚಾರಣೆ ಅಭ್ಯಾಸ',    bg: 'linear-gradient(135deg, #f000ff, #00e7ff)' },
  { id: 'songs',      icon: '🎵', label: 'Songs & Rhymes',          labelKannada: 'ಹಾಡುಗಳು',            bg: 'linear-gradient(135deg, #f355da, #7000ff)' },
  { id: 'tour',       icon: '🗺️', label: 'Virtual Karnataka Tour',  labelKannada: 'ಕರ್ನಾಟಕ ಪ್ರವಾಸ',     bg: 'linear-gradient(135deg, #13547a, #80d0c7)' },
  { id: 'proverbs',   icon: '📜', label: 'Kannada Proverbs',        labelKannada: 'ಗಾದೆ ಮಾತುಗಳು',      bg: 'linear-gradient(135deg, #ffe000, #799f0c)' },
  { id: 'literature', icon: '🎭', label: 'Literature',              labelKannada: 'ಸಾಹಿತ್ಯ',            bg: 'linear-gradient(135deg, #b06ab3, #4568dc)' },
  { id: 'quizzes',    icon: '🎯', label: 'Quizzes',                 labelKannada: 'ಪರೀಕ್ಷೆ',            bg: 'linear-gradient(135deg, #ff416c, #ff4b2b)' },
  { id: 'srs',        icon: '🔄', label: 'SRS Review',              labelKannada: 'ಪುನರಾವರ್ತನೆ',       bg: 'linear-gradient(135deg, #00b09b, #96c93d)' },
];

const NAV_MORE = [
  { id: 'blog',          icon: '📰', label: 'Blog & Stories',       labelKannada: 'ಲೇಖನಗಳು',            bg: 'linear-gradient(135deg,#ff6b35,#ffa366)' },
  { id: 'about',         icon: '❤️', label: 'Our Mission',          labelKannada: 'ನಮ್ಮ ಧ್ಯೇಯ',         bg: 'linear-gradient(135deg,#ff0844,#ffb199)' },
  { id: 'achievements',  icon: '🏅', label: 'Achievements',         bg: 'linear-gradient(135deg,#f8b500,#fce043)' },
  { id: 'dictionary',    icon: '📖', label: 'Dictionary',           bg: 'linear-gradient(135deg,#0ba360,#3cba92)' },
  { id: 'emblem',        icon: '🌺', label: 'Emblem Studio',        bg: 'linear-gradient(135deg,#ff9a9e,#ff6b6b)' },
  { id: 'grammarstudio', icon: '🖊️', label: 'Grammar Studio',       bg: 'linear-gradient(135deg,#a18cd1,#fbc2eb)' },
  { id: 'settings',      icon: '⚙️', label: 'Settings',             bg: 'linear-gradient(135deg,#485563,#29323c)' },
];

const NAV_SOCIAL = [
  { id: 'socialhub',        icon: '👥', label: 'Social Hub',         labelKannada: 'ಸ್ನೇಹಿತರ ಕೇಂದ್ರ',      bg: 'linear-gradient(135deg,#ff6b35,#ffa366)' },
  { id: 'addfriend',        icon: '➕', label: 'Add Friend',          labelKannada: 'ಸ್ನೇಹಿತರನ್ನು ಸೇರಿಸಿ',  bg: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { id: 'friendslist',      icon: '👤', label: 'Friends List',        labelKannada: 'ಸ್ನೇಹಿತರ ಪಟ್ಟಿ',       bg: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { id: 'friendchat',       icon: '💬', label: 'Friend Chat',         labelKannada: 'ಸ್ನೇಹಿತ ಚಾಟ್',        bg: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
  { id: 'multiplayerarena', icon: '⚔️', label: 'Multiplayer Arena',  labelKannada: 'ಬಹು-ಆಟಗಾರ ಅಖಾಡ',      bg: 'linear-gradient(135deg,#7f00ff,#e100ff)' },
  { id: 'liveduel',         icon: '🎯', label: '1v1 Duel',            labelKannada: '1v1 ಶಬ್ದ ಯುದ್ಧ',      bg: 'linear-gradient(135deg,#ff416c,#ff4b2b)' },
  { id: 'groupquiz',        icon: '🧠', label: 'Group Quiz Room',     labelKannada: 'ಗುಂಪು ಪರೀಕ್ಷೆ',       bg: 'linear-gradient(135deg,#a18cd1,#fbc2eb)' },
  { id: 'friendleaderboard',icon: '🏆', label: 'Friends Board',       labelKannada: 'ಸ್ನೇಹಿತರ ಶ್ರೇಣಿ',      bg: 'linear-gradient(135deg,#ffd700,#ff923b)' },
  { id: 'challengesystem',  icon: '🔥', label: 'Challenges',          labelKannada: 'ಸ್ಪರ್ಧೆ',              bg: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
  { id: 'speedtypingrace',  icon: '⚡', label: 'Speed Typing Race',   labelKannada: 'ಟೈಪಿಂಗ್ ಓಟ',          bg: 'linear-gradient(135deg,#667eea,#764ba2)' },
];

const NAV_CUTTING_EDGE = [
  { id: 'waveform',      icon: '🎙️', label: 'Accent Analyzer',       labelKannada: 'ಧ್ವನಿ ತರಂಗ',          bg: 'linear-gradient(135deg,#ff416c,#ff4b2b)' },
  { id: 'scanner',       icon: '📸', label: 'Photo Object Scanner',  labelKannada: 'ವಸ್ತು ಸ್ಕ್ಯಾನರ್',       bg: 'linear-gradient(135deg,#11998e,#38ef7d)' },
  { id: 'adventure',     icon: '🗺️', label: 'AI Story Adventure',    labelKannada: 'ಸಾಹಸ ಕಥೆ',            bg: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { id: 'autorickshaw',  icon: '🛺', label: 'Auto Rickshaw AI',      labelKannada: 'ಆಟೋ ಚೌಕಾಶಿ',          bg: 'linear-gradient(135deg,#ff5858,#f09819)' },
  { id: 'duel',          icon: '⚔️', label: 'Multiplayer Universe',  labelKannada: 'ಜಾಗತಿಕ ರಣರಂಗ (Live)', bg: 'linear-gradient(135deg,#7f00ff,#e100ff)' },
  { id: 'circles',       icon: '👥', label: 'Study Circles',         labelKannada: 'ಅಧ್ಯಯನ ಕೂಟ',          bg: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { id: 'voicedaily',    icon: '🔥', label: 'Voice Daily Note',      labelKannada: 'ಧ್ವನಿ ಸವಾಲು',         bg: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
  { id: 'wordle',        icon: '🟩', label: 'Kannada Wordle',        labelKannada: 'ಪದ-ಜಾಲ',              bg: 'linear-gradient(135deg,#22c55e,#15803d)' },
  { id: 'techpark',      icon: '🏢', label: 'Tech-Park Kannada',     labelKannada: 'ಟೆಕ್ ಪಾರ್ಕ್ ಕಿಟ್',     bg: 'linear-gradient(135deg,#ffb7c5,#e8547a)' },
  { id: 'signboards',    icon: '🚏', label: 'Signboard Decoder',     labelKannada: 'ಫಲಕ ವಾಚಕ',            bg: 'linear-gradient(135deg,#f59e0b,#d97706)' },
  { id: 'metro',         icon: '🚇', label: 'Namma Metro Transit',   labelKannada: 'ನಮ್ಮ ಮೆಟ್ರೋ',         bg: 'linear-gradient(135deg,#a855f7,#6b21a8)' },
  { id: 'dialects',      icon: '🌾', label: 'Dialect Explorer',      labelKannada: 'ಪ್ರಾದೇಶಿಕ ಕನ್ನಡ',     bg: 'linear-gradient(135deg,#0ba360,#3cba92)' },
  { id: 'tracing',       icon: '✏️', label: 'Animated Tracing',      labelKannada: 'ಅಕ್ಷರ ತರಬೇತಿ',        bg: 'linear-gradient(135deg,#fa709a,#fee140)' },
  { id: 'comics',        icon: '💬', label: 'Comic Strip Builder',   labelKannada: 'ಕಾಮಿಕ್ಸ್ ರಚನೆ',       bg: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { id: 'subtitles',     icon: '🎬', label: 'Song Subtitle Reader',  labelKannada: 'ಹಾಡು & ಸಿನೆಮಾ',       bg: 'linear-gradient(135deg,#ec4899,#8b5cf6)' },
  { id: 'offlinepacks',  icon: '📦', label: 'Offline PWA Packs',     labelKannada: 'ಆಫ್‌ಲೈನ್ ಪ್ಯಾಕ್',     bg: 'linear-gradient(135deg,#38ef7d,#11998e)' },
  { id: 'customdeck',    icon: '🗂️', label: 'Custom Deck Creator',   labelKannada: 'ಸ್ವಂತ ಶಬ್ದಕೋಶ',       bg: 'linear-gradient(135deg,#ffa366,#ff6b35)' },
  { id: 'yakshagana',    icon: '🎭', label: 'Yakshagana Theater',    labelKannada: 'ಯಕ್ಷಗಾನ ನಾಟಕ',        bg: 'linear-gradient(135deg,#8b5cf6,#ec4899)' },
  { id: 'mistakes',      icon: '🧠', label: 'Smart Mistake Bank',    labelKannada: 'ತಪ್ಪುಗಳ ತಿದ್ದುವಿಕೆ',   bg: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' },
  { id: 'news',          icon: '📰', label: 'Daily News Digest',     labelKannada: 'ಕನ್ನಡ ಸಮಾಚಾರ',        bg: 'linear-gradient(135deg,#10b981,#047857)' },
];

const NAV_NEW = [
  // ── 20 Ultra-Advanced New Features ────────────────────────────────
  { id: 'colors',          icon: '🎨', label: 'Color Studio',          labelKannada: 'ಬಣ್ಣಗಳು',             bg: 'linear-gradient(135deg,#ff0844,#ffb199)' },
  { id: 'family',          icon: '👨‍👩‍👧', label: 'Family Tree',           labelKannada: 'ಕುಟುಂಬ ಸಂಬಂಧಗಳು',    bg: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { id: 'food',            icon: '🍽️', label: 'Karnataka Food Menu',   labelKannada: 'ಊಟೋಪಹಾರ',            bg: 'linear-gradient(135deg,#f6d365,#fda085)' },
  { id: 'animals',         icon: '🦁', label: 'Animal Kingdom',        labelKannada: 'ಪ್ರಾಣಿ ಪ್ರಪಂಚ',       bg: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
  { id: 'emotions',        icon: '💭', label: 'Emotion Cards',         labelKannada: 'ಭಾವನೆಗಳು',            bg: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { id: 'body',            icon: '🫀', label: 'Body Parts',            labelKannada: 'ದೇಹದ ಭಾಗಗಳು',         bg: 'linear-gradient(135deg,#fa709a,#fee140)' },
  { id: 'days',            icon: '📅', label: 'Days & Months',         labelKannada: 'ದಿನಗಳು & ತಿಂಗಳುಗಳು',  bg: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { id: 'nature',          icon: '🌿', label: 'Nature & Weather',      labelKannada: 'ಪ್ರಕೃತಿ & ಹವಾಮಾನ',    bg: 'linear-gradient(135deg,#0ba360,#3cba92)' },
  { id: 'riddles',         icon: '🎭', label: 'Kannada Riddles',       labelKannada: 'ಒಗಟುಗಳು',             bg: 'linear-gradient(135deg,#b06ab3,#4568dc)' },
  { id: 'verbs',           icon: '🔤', label: 'Verb Conjugation',      labelKannada: 'ಕ್ರಿಯಾಪದ ರೂಪಗಳು',     bg: 'linear-gradient(135deg,#f83600,#fe8c00)' },
  { id: 'time',            icon: '⏰', label: 'Time & Clock',          labelKannada: 'ಸಮಯ & ಗಂಟೆ',          bg: 'linear-gradient(135deg,#ffcf71,#ff923b)' },
  { id: 'opposites',       icon: '↔️', label: 'Opposites Game',        labelKannada: 'ವಿರುದ್ಧ ಪದಗಳು',       bg: 'linear-gradient(135deg,#30cfd0,#330867)' },
  { id: 'bargain',         icon: '🛍️', label: 'Market Bargaining',     labelKannada: 'ಮಾರುಕಟ್ಟೆ ಚೌಕಾಶಿ',   bg: 'linear-gradient(135deg,#ff5858,#f09819)' },
  { id: 'jokes',           icon: '😂', label: 'Kannada Laugh Club',    labelKannada: 'ಹಾಸ್ಯ ಕೂಟ',           bg: 'linear-gradient(135deg,#f39c12,#f1c40f)' },
  { id: 'professions',     icon: '💼', label: 'Profession Studio',     labelKannada: 'ಉದ್ಯೋಗಗಳು',          bg: 'linear-gradient(135deg,#11998e,#38ef7d)' },
  { id: 'home',            icon: '🏡', label: 'House & Home',          labelKannada: 'ಮನೆ & ಕೋಣೆಗಳು',       bg: 'linear-gradient(135deg,#a18cd1,#fbc2eb)' },
  { id: 'transport',       icon: '🛺', label: 'Vehicle & Transport',   labelKannada: 'ವಾಹನಗಳು & ಪ್ರಯಾಣ',    bg: 'linear-gradient(135deg,#e14efa,#b400ff)' },
  { id: 'shapes',          icon: '📐', label: 'Shapes & Math',         labelKannada: 'ಆಕಾರಗಳು & ಗಣಿತ',      bg: 'linear-gradient(135deg,#00c6fb,#005bea)' },
  { id: 'clothing',        icon: '🥻', label: 'Clothing & Attire',     labelKannada: 'ಉಡುಪುಗಳು & ಸೀರೆ',     bg: 'linear-gradient(135deg,#f857a6,#ff5858)' },
  { id: 'kitchen',         icon: '🍳', label: 'Kitchen Cookware',      labelKannada: 'ಅಡುಗೆ ಪಾತ್ರೆಗಳು',     bg: 'linear-gradient(135deg,#fc4a1a,#f7b733)' },
  // ── Existing 10 Features ──────────────────────────────────────────
  { id: 'keyboard',      icon: '⌨️', label: 'Kannada Keyboard',     labelKannada: 'ಕೀಬೋರ್ಡ್',         bg: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { id: 'flashcards',    icon: '🃏', label: 'Flashcard Deck',       labelKannada: 'ಫ್ಲಾಶ್‌ಕಾರ್ಡ್',      bg: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { id: 'writing',       icon: '✍️', label: 'Writing Challenge',    labelKannada: 'ಬರಹ ಸವಾಲು',         bg: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { id: 'audiolessons',  icon: '🎧', label: 'Audio Lessons',        labelKannada: 'ಶ್ರವ್ಯ ಪಾಠ',         bg: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
  { id: 'culturalquiz',  icon: '🏯', label: 'Cultural Quiz',        labelKannada: 'ಸಾಂಸ್ಕೃತಿಕ ಪರೀಕ್ಷೆ',  bg: 'linear-gradient(135deg,#ff9a9e,#fecfef)' },
  { id: 'translator',    icon: '🌐', label: 'Phrase Translator',    labelKannada: 'ಅನುವಾದಕ',           bg: 'linear-gradient(135deg,#30cfd0,#330867)' },
  { id: 'numbergame',    icon: '🔢', label: 'Number Game',          labelKannada: 'ಸಂಖ್ಯೆ ಆಟ',          bg: 'linear-gradient(135deg,#ffcf71,#ff923b)' },
  { id: 'grammarhelp',   icon: '📝', label: 'Grammar Explainer',    labelKannada: 'ವ್ಯಾಕರಣ ಮಾರ್ಗದರ್ಶಿ',  bg: 'linear-gradient(135deg,#f83600,#fe8c00)' },
  { id: 'festivals',     icon: '🎉', label: 'Festival Calendar',    labelKannada: 'ಹಬ್ಬ ಕ್ಯಾಲೆಂಡರ್',      bg: 'linear-gradient(135deg,#b06ab3,#4568dc)' },
  { id: 'speedtyping',   icon: '⚡', label: 'Speed Typing',         labelKannada: 'ತ್ವರಿತ ಟೈಪಿಂಗ್',      bg: 'linear-gradient(135deg,#f39c12,#f1c40f)' },
];

const NavButton = ({ item, activePage, onNavigate, onCloseMobile }) => (
  <button
    className={`nav-item${activePage === item.id ? ' active' : ''}`}
    onClick={() => { onNavigate(item.id); onCloseMobile(); }}
  >
    <span className="nav-icon-badge" style={{ background: item.bg || 'var(--sakura-deep)' }}>
      {item.icon}
    </span>
    {item.labelKannada ? (
      <div>
        <div style={{ lineHeight: 1.2 }}>{item.label}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'Noto Sans Kannada, sans-serif' }}>
          {item.labelKannada}
        </div>
      </div>
    ) : (
      <span>{item.label}</span>
    )}
  </button>
);

/* ── Royal Crown Sobagu Logo ─────────────────────────────────────────── */
const SobaguLogo = () => (
  <svg width="42" height="42" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sb_logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d90429" />
        <stop offset="50%" stopColor="#ef233c" />
        <stop offset="100%" stopColor="#8d0801" />
      </linearGradient>
      <linearGradient id="sb_goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff3b0" />
        <stop offset="50%" stopColor="#ffb703" />
        <stop offset="100%" stopColor="#fb8500" />
      </linearGradient>
      <filter id="sb_logoGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <circle cx="50" cy="50" r="46" fill="url(#sb_logoBg)" stroke="url(#sb_goldGrad)" strokeWidth="4" filter="url(#sb_logoGlow)" />
    <circle cx="50" cy="50" r="40" stroke="url(#sb_goldGrad)" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.8" />
    <path d="M35 34 L42 42 L50 28 L58 42 L65 34 L62 50 L38 50 Z" fill="url(#sb_goldGrad)" />
    <circle cx="35" cy="32" r="2.5" fill="#fff" />
    <circle cx="50" cy="26" r="3" fill="#fff" />
    <circle cx="65" cy="32" r="2.5" fill="#fff" />
    <text x="50" y="74" textAnchor="middle" fill="url(#sb_goldGrad)" fontSize="28" fontWeight="900" fontFamily="Noto Sans Kannada, sans-serif">
      ಸೊ
    </text>
  </svg>
);

/* ── YouTube Subscribe Banner ────────────────────────────────────────────── */
const SUBSCRIBED_KEY = 'sobagu_yt_subscribed';

const YTBanner = () => {
  const [hidden, setHidden] = useState(() => localStorage.getItem(SUBSCRIBED_KEY) === 'true');

  const handleSubscribeClick = () => {
    // Open channel in new tab
    window.open('https://www.youtube.com/@Sobaguteam', '_blank', 'noopener,noreferrer');
    // After a short delay show a "I've subscribed" confirmation prompt
    setTimeout(() => {
      const confirmed = window.confirm('Have you subscribed to @Sobaguteam? Click OK to hide this banner.');
      if (confirmed) {
        localStorage.setItem(SUBSCRIBED_KEY, 'true');
        setHidden(true);
      }
    }, 800);
  };

  if (hidden) return null;

  return (
    <div style={{
      margin: '0.75rem 0.75rem 0.25rem',
      padding: '0.85rem',
      background: 'linear-gradient(135deg, rgba(255,0,0,0.18), rgba(180,0,0,0.1))',
      border: '1px solid rgba(255, 60, 60, 0.4)',
      borderRadius: '14px',
      textAlign: 'center',
      boxShadow: '0 4px 18px rgba(255,0,0,0.12)',
      position: 'relative',
    }}>
      {/* Close / "already subscribed" shortcut */}
      <button
        title="I'm already subscribed"
        onClick={() => {
          localStorage.setItem(SUBSCRIBED_KEY, 'true');
          setHidden(true);
        }}
        style={{
          position: 'absolute', top: '6px', right: '8px',
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)',
          fontSize: '0.8rem', cursor: 'pointer', lineHeight: 1,
        }}
      >
        ✕
      </button>

      <div style={{
        fontSize: '0.82rem', color: '#ff6666', fontWeight: 700,
        marginBottom: '0.3rem', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '0.4rem',
      }}>
        <svg width="16" height="12" viewBox="0 0 24 17" fill="#ff3333">
          <path d="M23.5 2.5a3 3 0 0 0-2.1-2.1C19.5 0 12 0 12 0S4.5 0 2.6.4A3 3 0 0 0 .5 2.5C0 4.4 0 8.5 0 8.5s0 4.1.5 6a3 3 0 0 0 2.1 2.1C4.5 17 12 17 12 17s7.5 0 9.4-.4a3 3 0 0 0 2.1-2.1C24 12.6 24 8.5 24 8.5s0-4.1-.5-6Z" />
          <polygon points="9.6,12.1 15.8,8.5 9.6,4.9" fill="white" />
        </svg>
        YouTube Channel
      </div>

      <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.35, marginBottom: '0.65rem' }}>
        Subscribe to <strong style={{ color: '#ff9999' }}>@Sobaguteam</strong> to get notified of the latest features!
      </p>

      <button
        onClick={handleSubscribeClick}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.4rem', padding: '0.45rem 1.1rem',
          background: 'linear-gradient(135deg, #ff0000, #cc0000)',
          color: '#ffffff', fontWeight: 800, fontSize: '0.8rem',
          borderRadius: '20px', border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(255,0,0,0.4)',
          transition: 'transform 0.18s, box-shadow 0.18s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,0,0,0.55)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';   e.currentTarget.style.boxShadow = '0 4px 14px rgba(255,0,0,0.4)'; }}
      >
        ▶ Subscribe @Sobaguteam
      </button>
    </div>
  );
};

/* ── Sidebar ─────────────────────────────────────────────────────────────── */
const Sidebar = ({ user, activePage, onNavigate, onLogout, onOpenPlumineModal, mobileOpen, onCloseMobile }) => {
  const xpNext  = getXPForNextLevel(user.xp || 0);
  const xpPct   = Math.min(100, Math.round(((user.xp || 0) % 500) / 500 * 100));
  const levelTitle = getLevelTitle(user.level || 1);

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay show" onClick={onCloseMobile} />}
      <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>

        {/* ── Logo Header ────────────────────────────────────────────── */}
        <div className="sidebar-header">
          <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <SobaguLogo />
            <span style={{
              fontSize: '1.45rem', fontWeight: 900,
              background: 'linear-gradient(135deg, #ffb7c5, #e8547a, #ffd700)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}>
              ಸೊಬಗು
            </span>
          </div>
          <div className="sidebar-user">
            <div className="name">{user.name}</div>
            <div className="level">⭐ {levelTitle}</div>
          </div>
        </div>

        {/* ── XP Bar & Plumine CS+ Quantum Hub ────────────────────────── */}
        <div className="sidebar-xp">
          <div className="xp-bar-wrap">
            <span className="xp-label">XP</span>
            <span className="xp-value">{user.xp || 0} / {xpNext}</span>
          </div>
          <div className="xp-bar">
            <div className="xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem', gap: '0.35rem' }}>
            <div className="streak-badge" style={{ margin: 0 }}>🔥 {user.streak || 0}d</div>
            <button
              onClick={() => onOpenPlumineModal?.()}
              style={{
                background: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                borderRadius: '12px',
                padding: '0.22rem 0.55rem',
                color: '#c084fc',
                fontSize: '0.7rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 0 10px rgba(168, 85, 247, 0.2)',
              }}
              title="Plumine CS+ Quantum Cloud Mesh · Click to open Terminal"
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#4ade80',
                  boxShadow: '0 0 6px #4ade80',
                  display: 'inline-block',
                }}
              />
              <span>☁️ Plumine CS+</span>
            </button>
          </div>
        </div>

        {/* ── YouTube Banner ───────────────────────────────────────────── */}
        <YTBanner />

        {/* ── Navigation ──────────────────────────────────────────────── */}
        <nav className="sidebar-nav">
          <p className="nav-section-label">Main</p>
          {NAV_MAIN.map(item => (
            <NavButton key={item.id} item={item} activePage={activePage} onNavigate={onNavigate} onCloseMobile={onCloseMobile} />
          ))}

          <p className="nav-section-label" style={{ marginTop: '0.5rem' }}>Games & Quizzes</p>
          {NAV_GAMES.map(item => (
            <NavButton key={item.id} item={item} activePage={activePage} onNavigate={onNavigate} onCloseMobile={onCloseMobile} />
          ))}

          <p className="nav-section-label" style={{ marginTop: '0.5rem' }}>Lessons & Practice</p>
          {NAV_LESSONS.map(item => (
            <NavButton key={item.id} item={item} activePage={activePage} onNavigate={onNavigate} onCloseMobile={onCloseMobile} />
          ))}

          <p className="nav-section-label" style={{ marginTop: '0.5rem' }}>More</p>
          {NAV_MORE.map(item => (
            <NavButton key={item.id} item={item} activePage={activePage} onNavigate={onNavigate} onCloseMobile={onCloseMobile} />
          ))}

          {(user?.role === 'admin' || user?.role === 'founder') && (
            <>
              <p className="nav-section-label" style={{ marginTop: '0.5rem' }}>🛡️ Admin</p>
              <NavButton
                item={{ id: 'controlcenter', icon: '🛡️', label: 'Control Center', bg: 'linear-gradient(135deg,#ffd700,#ff6b35)' }}
                activePage={activePage}
                onNavigate={onNavigate}
                onCloseMobile={onCloseMobile}
              />
            </>
          )}

          <p className="nav-section-label" style={{ marginTop: '0.5rem' }}>🚀 AI, Multiplayer & Transit</p>
          {NAV_CUTTING_EDGE.map(item => (
            <NavButton key={item.id} item={item} activePage={activePage} onNavigate={onNavigate} onCloseMobile={onCloseMobile} />
          ))}

          <p className="nav-section-label" style={{ marginTop: '0.5rem' }}>🆕 New Features</p>
          {NAV_NEW.map(item => (
            <NavButton key={item.id} item={item} activePage={activePage} onNavigate={onNavigate} onCloseMobile={onCloseMobile} />
          ))}

          <p className="nav-section-label" style={{ marginTop: '0.5rem' }}>👥 Social & Multiplayer</p>
          {NAV_SOCIAL.map(item => (
            <NavButton key={item.id} item={item} activePage={activePage} onNavigate={onNavigate} onCloseMobile={onCloseMobile} />
          ))}
        </nav>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            🚪 <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

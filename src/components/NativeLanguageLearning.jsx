import React, { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, updateUser, addXP, markExplored } from '../utils/storage.js';

// ── Supported Native Languages ─────────────────────────────────────────────
export const NATIVE_LANGUAGES = [
  { code: 'en',    name: 'English',    nativeName: 'English',         flag: '🇬🇧' },
  { code: 'hi',    name: 'Hindi',      nativeName: 'हिन्दी',           flag: '🇮🇳' },
  { code: 'ta',    name: 'Tamil',      nativeName: 'தமிழ்',            flag: '🏴' },
  { code: 'te',    name: 'Telugu',     nativeName: 'తెలుగు',           flag: '🏴' },
  { code: 'ml',    name: 'Malayalam',  nativeName: 'മലയാളം',          flag: '🏴' },
  { code: 'mr',    name: 'Marathi',    nativeName: 'मराठी',            flag: '🏴' },
  { code: 'gu',    name: 'Gujarati',   nativeName: 'ગુજરાતી',          flag: '🏴' },
  { code: 'bn',    name: 'Bengali',    nativeName: 'বাংলা',            flag: '🇧🇩' },
  { code: 'ur',    name: 'Urdu',       nativeName: 'اردو',             flag: '🇵🇰' },
  { code: 'pa',    name: 'Punjabi',    nativeName: 'ਪੰਜਾਬੀ',           flag: '🏴' },
  { code: 'or',    name: 'Odia',       nativeName: 'ଓଡ଼ିଆ',            flag: '🏴' },
  { code: 'as',    name: 'Assamese',   nativeName: 'অসমীয়া',          flag: '🏴' },
  { code: 'fr',    name: 'French',     nativeName: 'Français',         flag: '🇫🇷' },
  { code: 'es',    name: 'Spanish',    nativeName: 'Español',          flag: '🇪🇸' },
  { code: 'de',    name: 'German',     nativeName: 'Deutsch',          flag: '🇩🇪' },
  { code: 'ar',    name: 'Arabic',     nativeName: 'العربية',          flag: '🇸🇦' },
  { code: 'zh',    name: 'Chinese',    nativeName: '中文',              flag: '🇨🇳' },
  { code: 'ja',    name: 'Japanese',   nativeName: '日本語',            flag: '🇯🇵' },
  { code: 'ko',    name: 'Korean',     nativeName: '한국어',            flag: '🇰🇷' },
  { code: 'pt',    name: 'Portuguese', nativeName: 'Português',        flag: '🇧🇷' },
  { code: 'ru',    name: 'Russian',    nativeName: 'Русский',          flag: '🇷🇺' },
  { code: 'it',    name: 'Italian',    nativeName: 'Italiano',         flag: '🇮🇹' },
];

// ── Multilingual Vocabulary Dataset ───────────────────────────────────────
// Each word has Kannada + romanization + translations in all supported languages
const VOCAB = [
  {
    id: 'nl_water', category: 'Daily Life', kannada: 'ನೀರು', roman: 'neeru',
    translations: {
      en: 'Water', hi: 'पानी', ta: 'தண்ணீர்', te: 'నీరు', ml: 'വെള്ളം',
      mr: 'पाणी', gu: 'પાણી', bn: 'জল', ur: 'پانی', pa: 'ਪਾਣੀ',
      or: 'ଜଳ', as: 'পানী', fr: 'Eau', es: 'Agua', de: 'Wasser',
      ar: 'ماء', zh: '水', ja: '水', ko: '물', pt: 'Água', ru: 'Вода', it: 'Acqua',
    },
  },
  {
    id: 'nl_food', category: 'Daily Life', kannada: 'ಊಟ', roman: 'uta',
    translations: {
      en: 'Food / Meal', hi: 'खाना', ta: 'சாப்பாடு', te: 'భోజనం', ml: 'ഭക്ഷണം',
      mr: 'जेवण', gu: 'ભોજન', bn: 'খাবার', ur: 'کھانا', pa: 'ਖਾਣਾ',
      or: 'ଭୋଜନ', as: 'খাদ্য', fr: 'Nourriture', es: 'Comida', de: 'Essen',
      ar: 'طعام', zh: '食物', ja: '食べ物', ko: '음식', pt: 'Comida', ru: 'Еда', it: 'Cibo',
    },
  },
  {
    id: 'nl_house', category: 'Daily Life', kannada: 'ಮನೆ', roman: 'mane',
    translations: {
      en: 'House', hi: 'घर', ta: 'வீடு', te: 'ఇల్లు', ml: 'വീട്',
      mr: 'घर', gu: 'ઘર', bn: 'বাড়ি', ur: 'گھر', pa: 'ਘਰ',
      or: 'ଘର', as: 'ঘৰ', fr: 'Maison', es: 'Casa', de: 'Haus',
      ar: 'بيت', zh: '房子', ja: '家', ko: '집', pt: 'Casa', ru: 'Дом', it: 'Casa',
    },
  },
  {
    id: 'nl_hello', category: 'Greetings', kannada: 'ನಮಸ್ಕಾರ', roman: 'namaskara',
    translations: {
      en: 'Hello / Greetings', hi: 'नमस्कार', ta: 'வணக்கம்', te: 'నమస్కారం', ml: 'നമസ്കാരം',
      mr: 'नमस्कार', gu: 'નમસ્કાર', bn: 'নমস্কার', ur: 'سلام', pa: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
      or: 'ନମସ୍କାର', as: 'নমস্কাৰ', fr: 'Bonjour', es: 'Hola', de: 'Hallo',
      ar: 'مرحبا', zh: '你好', ja: 'こんにちは', ko: '안녕하세요', pt: 'Olá', ru: 'Привет', it: 'Ciao',
    },
  },
  {
    id: 'nl_thankyou', category: 'Greetings', kannada: 'ಧನ್ಯವಾದ', roman: 'dhanyavada',
    translations: {
      en: 'Thank you', hi: 'धन्यवाद', ta: 'நன்றி', te: 'ధన్యవాదాలు', ml: 'നന്ദി',
      mr: 'धन्यवाद', gu: 'આભાર', bn: 'ধন্যবাদ', ur: 'شکریہ', pa: 'ਧੰਨਵਾਦ',
      or: 'ଧନ୍ୟବାଦ', as: 'ধন্যবাদ', fr: 'Merci', es: 'Gracias', de: 'Danke',
      ar: 'شكرا', zh: '谢谢', ja: 'ありがとう', ko: '감사합니다', pt: 'Obrigado', ru: 'Спасибо', it: 'Grazie',
    },
  },
  {
    id: 'nl_yes', category: 'Basic', kannada: 'ಹೌದು', roman: 'houdu',
    translations: {
      en: 'Yes', hi: 'हाँ', ta: 'ஆமாம்', te: 'అవును', ml: 'അതെ',
      mr: 'हो', gu: 'હા', bn: 'হ্যাঁ', ur: 'ہاں', pa: 'ਹਾਂ',
      or: 'ହଁ', as: 'হয়', fr: 'Oui', es: 'Sí', de: 'Ja',
      ar: 'نعم', zh: '是', ja: 'はい', ko: '네', pt: 'Sim', ru: 'Да', it: 'Sì',
    },
  },
  {
    id: 'nl_no', category: 'Basic', kannada: 'ಇಲ್ಲ', roman: 'illa',
    translations: {
      en: 'No', hi: 'नहीं', ta: 'இல்லை', te: 'లేదు', ml: 'ഇല്ല',
      mr: 'नाही', gu: 'ના', bn: 'না', ur: 'نہیں', pa: 'ਨਹੀਂ',
      or: 'ନା', as: 'নহয়', fr: 'Non', es: 'No', de: 'Nein',
      ar: 'لا', zh: '不', ja: 'いいえ', ko: '아니요', pt: 'Não', ru: 'Нет', it: 'No',
    },
  },
  {
    id: 'nl_mother', category: 'Family', kannada: 'ಅಮ್ಮ', roman: 'amma',
    translations: {
      en: 'Mother / Mom', hi: 'माँ', ta: 'அம்மா', te: 'అమ్మ', ml: 'അമ്മ',
      mr: 'आई', gu: 'મા', bn: 'মা', ur: 'ماں', pa: 'ਮਾਂ',
      or: 'ମା', as: 'মা', fr: 'Mère', es: 'Madre', de: 'Mutter',
      ar: 'أم', zh: '妈妈', ja: 'お母さん', ko: '어머니', pt: 'Mãe', ru: 'Мама', it: 'Madre',
    },
  },
  {
    id: 'nl_father', category: 'Family', kannada: 'ಅಪ್ಪ', roman: 'appa',
    translations: {
      en: 'Father / Dad', hi: 'पिता / बाप', ta: 'அப்பா', te: 'నాన్న', ml: 'അച്ഛൻ',
      mr: 'वडील', gu: 'પપ્પા', bn: 'বাবা', ur: 'ابو', pa: 'ਪਾਪਾ',
      or: 'ବାପା', as: 'দেউতা', fr: 'Père', es: 'Padre', de: 'Vater',
      ar: 'أب', zh: '爸爸', ja: 'お父さん', ko: '아버지', pt: 'Pai', ru: 'Папа', it: 'Padre',
    },
  },
  {
    id: 'nl_good', category: 'Basic', kannada: 'ಚೆನ್ನಾಗಿದೆ', roman: 'channagide',
    translations: {
      en: 'It is good / Nice', hi: 'अच्छा है', ta: 'நல்லது', te: 'మంచిది', ml: 'നല്ലതാണ്',
      mr: 'छान आहे', gu: 'સારું છે', bn: 'ভালো', ur: 'اچھا ہے', pa: 'ਚੰਗਾ ਹੈ',
      or: 'ଭଲ', as: 'ভাল', fr: "C'est bien", es: 'Está bien', de: 'Es ist gut',
      ar: 'جيد', zh: '好的', ja: 'いいですね', ko: '좋아요', pt: 'É bom', ru: 'Хорошо', it: 'È bello',
    },
  },
  {
    id: 'nl_come', category: 'Actions', kannada: 'ಬನ್ನಿ', roman: 'banni',
    translations: {
      en: 'Come / Please come', hi: 'आइए', ta: 'வாருங்கள்', te: 'రండి', ml: 'വരൂ',
      mr: 'या', gu: 'આવો', bn: 'আসুন', ur: 'آئیں', pa: 'ਆਓ',
      or: 'ଆସ', as: 'আহক', fr: 'Venez', es: 'Venga', de: 'Kommen Sie',
      ar: 'تفضل', zh: '请来', ja: '来てください', ko: '오세요', pt: 'Venha', ru: 'Приходите', it: 'Venga',
    },
  },
  {
    id: 'nl_go', category: 'Actions', kannada: 'ಹೋಗಿ', roman: 'hogi',
    translations: {
      en: 'Go / Please go', hi: 'जाइए', ta: 'போங்கள்', te: 'వెళ్ళండి', ml: 'പോകൂ',
      mr: 'जा', gu: 'જાઓ', bn: 'যান', ur: 'جائیں', pa: 'ਜਾਓ',
      or: 'ଯାଅ', as: 'যাওক', fr: 'Allez', es: 'Vaya', de: 'Gehen Sie',
      ar: 'اذهب', zh: '走吧', ja: '行ってください', ko: '가세요', pt: 'Vá', ru: 'Идите', it: 'Vai',
    },
  },
  {
    id: 'nl_eat', category: 'Actions', kannada: 'ತಿನ್ನಿ', roman: 'thinni',
    translations: {
      en: 'Eat / Please eat', hi: 'खाइए', ta: 'சாப்பிடுங்கள்', te: 'తినండి', ml: 'കഴിക്കൂ',
      mr: 'खा', gu: 'ખાઓ', bn: 'খান', ur: 'کھائیں', pa: 'ਖਾਓ',
      or: 'ଖାଅ', as: 'খাওক', fr: 'Mangez', es: 'Come', de: 'Essen Sie',
      ar: 'كل', zh: '吃吧', ja: '食べてください', ko: '드세요', pt: 'Coma', ru: 'Ешьте', it: 'Mangia',
    },
  },
  {
    id: 'nl_name', category: 'Basic', kannada: 'ಹೆಸರು', roman: 'hesaru',
    translations: {
      en: 'Name', hi: 'नाम', ta: 'பெயர்', te: 'పేరు', ml: 'പേര്',
      mr: 'नाव', gu: 'નામ', bn: 'নাম', ur: 'نام', pa: 'ਨਾਮ',
      or: 'ନାମ', as: 'নাম', fr: 'Nom', es: 'Nombre', de: 'Name',
      ar: 'اسم', zh: '名字', ja: '名前', ko: '이름', pt: 'Nome', ru: 'Имя', it: 'Nome',
    },
  },
  {
    id: 'nl_day', category: 'Time', kannada: 'ದಿನ', roman: 'dina',
    translations: {
      en: 'Day', hi: 'दिन', ta: 'நாள்', te: 'రోజు', ml: 'ദിവസം',
      mr: 'दिवस', gu: 'દિવસ', bn: 'দিন', ur: 'دن', pa: 'ਦਿਨ',
      or: 'ଦିନ', as: 'দিন', fr: 'Jour', es: 'Día', de: 'Tag',
      ar: 'يوم', zh: '天', ja: '日', ko: '날', pt: 'Dia', ru: 'День', it: 'Giorno',
    },
  },
  {
    id: 'nl_night', category: 'Time', kannada: 'ರಾತ್ರಿ', roman: 'raatri',
    translations: {
      en: 'Night', hi: 'रात', ta: 'இரவு', te: 'రాత్రి', ml: 'രാത്രി',
      mr: 'रात', gu: 'રાત', bn: 'রাত', ur: 'رات', pa: 'ਰਾਤ',
      or: 'ରାତ', as: 'ৰাতি', fr: 'Nuit', es: 'Noche', de: 'Nacht',
      ar: 'ليل', zh: '夜晚', ja: '夜', ko: '밤', pt: 'Noite', ru: 'Ночь', it: 'Notte',
    },
  },
  {
    id: 'nl_sun', category: 'Nature', kannada: 'ಸೂರ್ಯ', roman: 'surya',
    translations: {
      en: 'Sun', hi: 'सूरज', ta: 'சூரியன்', te: 'సూర్యుడు', ml: 'സൂര്യൻ',
      mr: 'सूर्य', gu: 'સૂર્ય', bn: 'সূর্য', ur: 'سورج', pa: 'ਸੂਰਜ',
      or: 'ସୂର୍ଯ୍ୟ', as: 'সূৰ্য', fr: 'Soleil', es: 'Sol', de: 'Sonne',
      ar: 'شمس', zh: '太阳', ja: '太陽', ko: '태양', pt: 'Sol', ru: 'Солнце', it: 'Sole',
    },
  },
  {
    id: 'nl_moon', category: 'Nature', kannada: 'ಚಂದ್ರ', roman: 'chandra',
    translations: {
      en: 'Moon', hi: 'चाँद', ta: 'நிலவு', te: 'చంద్రుడు', ml: 'ചന്ദ്രൻ',
      mr: 'चंद्र', gu: 'ચંદ્ર', bn: 'চাঁদ', ur: 'چاند', pa: 'ਚੰਦ',
      or: 'ଚନ୍ଦ୍ର', as: 'চন্দ্ৰ', fr: 'Lune', es: 'Luna', de: 'Mond',
      ar: 'قمر', zh: '月亮', ja: '月', ko: '달', pt: 'Lua', ru: 'Луна', it: 'Luna',
    },
  },
  {
    id: 'nl_flower', category: 'Nature', kannada: 'ಹೂವು', roman: 'hooву',
    translations: {
      en: 'Flower', hi: 'फूल', ta: 'பூ', te: 'పువ్వు', ml: 'പൂവ്',
      mr: 'फूल', gu: 'ફૂલ', bn: 'ফুল', ur: 'پھول', pa: 'ਫੁੱਲ',
      or: 'ଫୁଲ', as: 'ফুল', fr: 'Fleur', es: 'Flor', de: 'Blume',
      ar: 'زهرة', zh: '花', ja: '花', ko: '꽃', pt: 'Flor', ru: 'Цветок', it: 'Fiore',
    },
  },
  {
    id: 'nl_money', category: 'Daily Life', kannada: 'ಹಣ', roman: 'hana',
    translations: {
      en: 'Money', hi: 'पैसा', ta: 'பணம்', te: 'డబ్బు', ml: 'പണം',
      mr: 'पैसे', gu: 'પૈસા', bn: 'টাকা', ur: 'پیسہ', pa: 'ਪੈਸਾ',
      or: 'ପଇସା', as: 'পইচা', fr: 'Argent', es: 'Dinero', de: 'Geld',
      ar: 'مال', zh: '钱', ja: 'お金', ko: '돈', pt: 'Dinheiro', ru: 'Деньги', it: 'Soldi',
    },
  },
  {
    id: 'nl_friend', category: 'Relationships', kannada: 'ಗೆಳೆಯ', roman: 'geleya',
    translations: {
      en: 'Friend', hi: 'दोस्त', ta: 'நண்பன்', te: 'స్నేహితుడు', ml: 'സ്നേഹിതൻ',
      mr: 'मित्र', gu: 'મિત્ર', bn: 'বন্ধু', ur: 'دوست', pa: 'ਦੋਸਤ',
      or: 'ବନ୍ଧୁ', as: 'বন্ধু', fr: 'Ami', es: 'Amigo', de: 'Freund',
      ar: 'صديق', zh: '朋友', ja: '友達', ko: '친구', pt: 'Amigo', ru: 'Друг', it: 'Amico',
    },
  },
  {
    id: 'nl_beautiful', category: 'Adjectives', kannada: 'ಸುಂದರ', roman: 'sundara',
    translations: {
      en: 'Beautiful', hi: 'सुंदर', ta: 'அழகான', te: 'అందమైన', ml: 'സുന്ദരമായ',
      mr: 'सुंदर', gu: 'સુંદર', bn: 'সুন্দর', ur: 'خوبصورت', pa: 'ਸੁੰਦਰ',
      or: 'ସୁନ୍ଦର', as: 'সুন্দৰ', fr: 'Beau', es: 'Hermoso', de: 'Schön',
      ar: 'جميل', zh: '美丽', ja: '美しい', ko: '아름다운', pt: 'Bonito', ru: 'Красивый', it: 'Bello',
    },
  },
  {
    id: 'nl_big', category: 'Adjectives', kannada: 'ದೊಡ್ಡ', roman: 'dodda',
    translations: {
      en: 'Big / Large', hi: 'बड़ा', ta: 'பெரிய', te: 'పెద్ద', ml: 'വലിയ',
      mr: 'मोठे', gu: 'મોટો', bn: 'বড়', ur: 'بڑا', pa: 'ਵੱਡਾ',
      or: 'ବଡ', as: 'ডাঙৰ', fr: 'Grand', es: 'Grande', de: 'Groß',
      ar: 'كبير', zh: '大', ja: '大きい', ko: '큰', pt: 'Grande', ru: 'Большой', it: 'Grande',
    },
  },
  {
    id: 'nl_small', category: 'Adjectives', kannada: 'ಚಿಕ್ಕ', roman: 'chikka',
    translations: {
      en: 'Small / Little', hi: 'छोटा', ta: 'சிறிய', te: 'చిన్న', ml: 'ചെറിയ',
      mr: 'छोटे', gu: 'નાનો', bn: 'ছোট', ur: 'چھوٹا', pa: 'ਛੋਟਾ',
      or: 'ଛୋଟ', as: 'সৰু', fr: 'Petit', es: 'Pequeño', de: 'Klein',
      ar: 'صغير', zh: '小', ja: '小さい', ko: '작은', pt: 'Pequeno', ru: 'Маленький', it: 'Piccolo',
    },
  },
  {
    id: 'nl_please', category: 'Greetings', kannada: 'ದಯವಿಟ್ಟು', roman: 'dayavittu',
    translations: {
      en: 'Please', hi: 'कृपया', ta: 'தயவுசெய்து', te: 'దయచేసి', ml: 'ദയവായി',
      mr: 'कृपया', gu: 'કૃપા કરીને', bn: 'অনুগ্রহ করে', ur: 'براہ کرم', pa: 'ਕਿਰਪਾ ਕਰਕੇ',
      or: 'ଦୟାକରି', as: 'অনুগ্ৰহ কৰি', fr: "S'il vous plaît", es: 'Por favor', de: 'Bitte',
      ar: 'من فضلك', zh: '请', ja: 'お願いします', ko: '제발', pt: 'Por favor', ru: 'Пожалуйста', it: 'Per favore',
    },
  },
  {
    id: 'nl_sorry', category: 'Greetings', kannada: 'ಕ್ಷಮಿಸಿ', roman: 'kshamisi',
    translations: {
      en: 'Sorry / Excuse me', hi: 'माफ़ करें', ta: 'மன்னிக்கவும்', te: 'క్షమించండి', ml: 'ക്ഷമിക്കൂ',
      mr: 'माफ करा', gu: 'માફ કરો', bn: 'মাফ করবেন', ur: 'معاف کریں', pa: 'ਮਾਫ਼ ਕਰੋ',
      or: 'କ୍ଷମା', as: 'মাফ কৰিব', fr: 'Pardon', es: 'Perdón', de: 'Entschuldigung',
      ar: 'آسف', zh: '对不起', ja: 'すみません', ko: '죄송합니다', pt: 'Desculpe', ru: 'Извините', it: 'Scusi',
    },
  },
];

// ── Category colors ─────────────────────────────────────────────────────────
const CAT_COLORS = {
  'Daily Life': 'linear-gradient(135deg,#ff6b35,#ffa366)',
  'Greetings':  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'Basic':      'linear-gradient(135deg,#4facfe,#00f2fe)',
  'Family':     'linear-gradient(135deg,#f093fb,#f5576c)',
  'Actions':    'linear-gradient(135deg,#f83600,#fe8c00)',
  'Time':       'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'Nature':     'linear-gradient(135deg,#0ba360,#3cba92)',
  'Relationships': 'linear-gradient(135deg,#ff0844,#ffb199)',
  'Adjectives': 'linear-gradient(135deg,#667eea,#764ba2)',
};

const speak = (text, lang = 'kn-IN') => {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch (_) {}
};

// ── Main Component ──────────────────────────────────────────────────────────
const NativeLanguageLearning = ({ onToast, onXP, user }) => {
  const [nativeLang, setNativeLang] = useState(() => {
    const u = getCurrentUser();
    return u?.settings?.nativeLang || 'en';
  });
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [category, setCategory] = useState('All');
  const [flippedCards, setFlippedCards] = useState({});
  const [learnedCards, setLearnedCards] = useState({});
  const [quizMode, setQuizMode] = useState(false);
  const [quizCard, setQuizCard] = useState(null);
  const [quizOptions, setQuizOptions] = useState([]);
  const [quizResult, setQuizResult] = useState(null); // null | 'correct' | 'wrong'
  const [score, setScore] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [searchQ, setSearchQ] = useState('');

  const currentLang = NATIVE_LANGUAGES.find(l => l.code === nativeLang) || NATIVE_LANGUAGES[0];
  const categories = ['All', ...Array.from(new Set(VOCAB.map(v => v.category)))];

  const filtered = VOCAB.filter(v => {
    const inCat = category === 'All' || v.category === category;
    const q = searchQ.toLowerCase();
    const inSearch = !q || v.kannada.includes(q) || v.roman.toLowerCase().includes(q)
      || (v.translations[nativeLang] || '').toLowerCase().includes(q);
    return inCat && inSearch;
  });

  const saveNativeLang = useCallback((code) => {
    setNativeLang(code);
    setShowLangPicker(false);
    const u = getCurrentUser();
    if (u) {
      const s = u.settings || {};
      updateUser({ settings: { ...s, nativeLang: code } });
    }
    onToast?.(`🌍 Native language set to ${NATIVE_LANGUAGES.find(l => l.code === code)?.name}!`, 'success');
  }, [onToast]);

  const toggleFlip = (id) => {
    setFlippedCards(f => ({ ...f, [id]: !f[id] }));
  };

  const markLearned = (id) => {
    if (learnedCards[id]) return;
    setLearnedCards(f => ({ ...f, [id]: true }));
    const isNew = markExplored(`nl_${id}`);
    if (isNew) {
      addXP(5);
      onXP?.(5);
      onToast?.('✅ Word learned! +5 XP', 'xp');
    }
  };

  // ── Quiz Logic ──────────────────────────────────────────────────────────
  const startQuiz = useCallback(() => {
    setQuizMode(true);
    setScore(0);
    setQuizCount(0);
    loadNextQuiz(filtered);
  }, [filtered]);

  const loadNextQuiz = (pool) => {
    if (pool.length < 4) {
      onToast?.('Need at least 4 words in this category for quiz!', 'error');
      return;
    }
    const correct = pool[Math.floor(Math.random() * pool.length)];
    const wrong = pool.filter(v => v.id !== correct.id)
      .sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [...wrong, correct].sort(() => Math.random() - 0.5);
    setQuizCard(correct);
    setQuizOptions(opts);
    setQuizResult(null);
  };

  const handleQuizAnswer = (opt) => {
    if (quizResult) return;
    const isCorrect = opt.id === quizCard.id;
    setQuizResult(isCorrect ? 'correct' : 'wrong');
    setQuizCount(c => c + 1);
    if (isCorrect) {
      setScore(s => s + 1);
      addXP(10);
      onXP?.(10);
      onToast?.('🎉 Correct! +10 XP', 'xp');
    } else {
      onToast?.(`❌ Wrong! Correct: ${quizCard.kannada} (${quizCard.translations[nativeLang] || quizCard.translations.en})`, 'error');
    }
    setTimeout(() => loadNextQuiz(filtered), 1500);
  };

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>🌍 Learn Kannada From Your Language</h2>
        <p>Choose your native language and learn Kannada words and phrases the natural way.</p>
      </div>

      {/* ── Language Selector ─────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => setShowLangPicker(p => !p)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.85rem 1.4rem', borderRadius: '14px',
            background: 'linear-gradient(135deg,rgba(255,107,53,0.2),rgba(79,172,254,0.15))',
            border: '1.5px solid rgba(255,107,53,0.4)', cursor: 'pointer', color: '#fff',
            fontSize: '1rem', fontWeight: 700, transition: 'all 0.2s',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>{currentLang.flag}</span>
          <span>{currentLang.nativeName}</span>
          <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>({currentLang.name})</span>
          <span style={{ marginLeft: 'auto', opacity: 0.6 }}>▼</span>
        </button>

        {showLangPicker && (
          <div style={{
            marginTop: '0.75rem', padding: '1rem',
            background: 'rgba(20,10,5,0.95)', borderRadius: '16px',
            border: '1px solid rgba(255,107,53,0.3)',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px,1fr))', gap: '0.5rem',
            maxHeight: '320px', overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}>
            {NATIVE_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => saveNativeLang(lang.code)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.6rem 0.85rem', borderRadius: '10px',
                  background: nativeLang === lang.code ? 'rgba(255,107,53,0.25)' : 'rgba(255,255,255,0.05)',
                  border: nativeLang === lang.code ? '1.5px solid var(--sakura-pink)' : '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer', color: '#fff', textAlign: 'left', transition: 'all 0.15s',
                  fontWeight: nativeLang === lang.code ? 800 : 500,
                }}
              >
                <span>{lang.flag}</span>
                <div>
                  <div style={{ fontSize: '0.82rem' }}>{lang.nativeName}</div>
                  <div style={{ fontSize: '0.68rem', opacity: 0.55 }}>{lang.name}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Toolbar: Search, Category filter, Quiz mode ───────────────── */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
        <input
          type="text" placeholder="🔍 Search words..."
          value={searchQ} onChange={e => setSearchQ(e.target.value)}
          className="form-input"
          style={{ flex: 1, minWidth: '180px', padding: '0.7rem 1rem', fontSize: '0.9rem' }}
        />
        <button
          onClick={() => { setQuizMode(false); startQuiz(); }}
          style={{
            padding: '0.7rem 1.3rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 800,
            background: 'linear-gradient(135deg,#ff6b35,#ffa366)', border: 'none', color: '#fff', fontSize: '0.88rem',
          }}
        >
          🎯 Quiz Me!
        </button>
      </div>

      {/* ── Category Pills ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: '0.4rem 0.9rem', borderRadius: '20px', cursor: 'pointer', fontWeight: 700,
              fontSize: '0.78rem', border: 'none',
              background: category === cat
                ? (CAT_COLORS[cat] || 'linear-gradient(135deg,var(--sakura-deep),var(--sakura-pink))')
                : 'rgba(255,255,255,0.08)',
              color: '#fff', transition: 'all 0.2s',
              boxShadow: category === cat ? '0 4px 14px rgba(255,107,53,0.3)' : 'none',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Quiz Modal ─────────────────────────────────────────────────── */}
      {quizMode && quizCard && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div style={{
            background: 'linear-gradient(135deg,#1c0c02,#381e0f)', borderRadius: '24px',
            padding: '2rem', maxWidth: '480px', width: '100%',
            border: '1px solid rgba(255,107,53,0.4)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 800, color: 'var(--sakura-pink)' }}>🎯 Quiz Mode</div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                <span>✅ {score}</span>
                <span style={{ opacity: 0.5 }}>Q#{quizCount + 1}</span>
              </div>
              <button
                onClick={() => setQuizMode(false)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.6, fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                What does this Kannada word mean in {currentLang.name}?
              </div>
              <div style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'Noto Sans Kannada, sans-serif', color: '#fff', marginBottom: '0.25rem' }}>
                {quizCard.kannada}
              </div>
              <div style={{ fontSize: '1rem', color: 'var(--sakura-pink)', fontStyle: 'italic' }}>({quizCard.roman})</div>
              <button
                onClick={() => speak(quizCard.kannada)}
                style={{ marginTop: '0.75rem', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '20px', padding: '0.35rem 0.9rem', color: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                🔊 Hear it
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {quizOptions.map(opt => {
                const isCorrect = opt.id === quizCard.id;
                let bg = 'rgba(255,255,255,0.07)';
                if (quizResult === 'correct' && isCorrect) bg = 'rgba(67,233,123,0.25)';
                if (quizResult === 'wrong' && isCorrect) bg = 'rgba(67,233,123,0.2)';
                if (quizResult === 'wrong' && !isCorrect) bg = 'rgba(255,88,88,0.2)';
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleQuizAnswer(opt)}
                    style={{
                      padding: '1rem', borderRadius: '14px', cursor: quizResult ? 'default' : 'pointer',
                      background: bg, border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s',
                    }}
                  >
                    {opt.translations[nativeLang] || opt.translations.en}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Vocab Cards ────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: '1rem' }}>
        {filtered.length === 0 && (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1/-1' }}>
            No words found. Try changing your filter or search.
          </div>
        )}
        {filtered.map(word => {
          const nativeTranslation = word.translations[nativeLang] || word.translations.en;
          const isFlipped = !!flippedCards[word.id];
          const isLearned = !!learnedCards[word.id];
          return (
            <div
              key={word.id}
              className="glass-card"
              style={{
                padding: '1.5rem', cursor: 'pointer', position: 'relative',
                border: isLearned ? '1.5px solid rgba(67,233,123,0.5)' : '1px solid var(--glass-border)',
                transition: 'all 0.2s',
                background: isLearned ? 'rgba(67,233,123,0.05)' : undefined,
              }}
              onClick={() => toggleFlip(word.id)}
            >
              {/* Category badge */}
              <div style={{
                display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '8px',
                background: CAT_COLORS[word.category] || 'rgba(255,107,53,0.2)',
                fontSize: '0.68rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem',
              }}>
                {word.category}
              </div>

              {isLearned && (
                <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', fontSize: '1rem' }}>✅</div>
              )}

              {!isFlipped ? (
                /* Front: Kannada */
                <div>
                  <div style={{
                    fontSize: '2.2rem', fontWeight: 900, color: '#fff',
                    fontFamily: 'Noto Sans Kannada, sans-serif', marginBottom: '0.25rem', lineHeight: 1.3,
                  }}>
                    {word.kannada}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--sakura-pink)', fontStyle: 'italic', marginBottom: '1rem' }}>
                    {word.roman}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    👆 Tap to see in {currentLang.name}
                  </div>
                </div>
              ) : (
                /* Back: Native language translation */
                <div>
                  <div style={{
                    fontSize: '1.6rem', fontWeight: 800, color: 'var(--sakura-pink)',
                    marginBottom: '0.5rem', lineHeight: 1.3,
                  }}>
                    {nativeTranslation}
                  </div>
                  <div style={{
                    fontSize: '1.5rem', fontWeight: 900, color: '#fff',
                    fontFamily: 'Noto Sans Kannada, sans-serif', marginBottom: '0.25rem',
                  }}>
                    {word.kannada}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--sakura-pink)', fontStyle: 'italic', marginBottom: '1rem' }}>
                    ({word.roman})
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={e => { e.stopPropagation(); speak(word.kannada, 'kn-IN'); }}
                      style={{
                        padding: '0.35rem 0.8rem', borderRadius: '20px', border: 'none',
                        background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: '0.78rem',
                      }}
                    >
                      🔊 Kannada
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); markLearned(word.id); }}
                      disabled={isLearned}
                      style={{
                        padding: '0.35rem 0.8rem', borderRadius: '20px', border: 'none',
                        background: isLearned ? 'rgba(67,233,123,0.2)' : 'rgba(255,107,53,0.3)',
                        color: '#fff', cursor: isLearned ? 'default' : 'pointer', fontSize: '0.78rem', fontWeight: 700,
                      }}
                    >
                      {isLearned ? '✅ Learned' : '📌 Mark Learned'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Progress Summary ───────────────────────────────────────────── */}
      <div className="glass-card" style={{ padding: '1.5rem', marginTop: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          Your Learning Progress
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--sakura-pink)' }}>
              {Object.values(learnedCards).filter(Boolean).length}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Learned</div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#4facfe' }}>
              {VOCAB.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Words</div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#43e97b' }}>
              {currentLang.flag} {currentLang.name}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Native Language</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NativeLanguageLearning;

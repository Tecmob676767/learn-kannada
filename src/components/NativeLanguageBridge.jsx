import React, { useState, useCallback } from 'react';
import { speakKannada } from '../utils/tts.js';
import { playSuccess, playClick, playFanfare } from '../utils/soundEffects.js';

// ─────────────────────────────────────────────────────────────────────────────
// Supported native languages with metadata
// ─────────────────────────────────────────────────────────────────────────────
const NATIVE_LANGUAGES = [
  { code: 'hi', name: 'Hindi',      nameNative: 'हिंदी',         flag: '🇮🇳', script: 'devanagari', ttsLang: 'hi-IN' },
  { code: 'ta', name: 'Tamil',      nameNative: 'தமிழ்',         flag: '🇮🇳', script: 'brahmic',    ttsLang: 'ta-IN' },
  { code: 'te', name: 'Telugu',     nameNative: 'తెలుగు',        flag: '🇮🇳', script: 'brahmic',    ttsLang: 'te-IN' },
  { code: 'ml', name: 'Malayalam',  nameNative: 'മലയാളം',        flag: '🇮🇳', script: 'brahmic',    ttsLang: 'ml-IN' },
  { code: 'mr', name: 'Marathi',    nameNative: 'मराठी',          flag: '🇮🇳', script: 'devanagari', ttsLang: 'mr-IN' },
  { code: 'gu', name: 'Gujarati',   nameNative: 'ગુજરાતી',        flag: '🇮🇳', script: 'brahmic',    ttsLang: 'gu-IN' },
  { code: 'bn', name: 'Bengali',    nameNative: 'বাংলা',          flag: '🇮🇳', script: 'brahmic',    ttsLang: 'bn-IN' },
  { code: 'pa', name: 'Punjabi',    nameNative: 'ਪੰਜਾਬੀ',         flag: '🇮🇳', script: 'brahmic',    ttsLang: 'pa-IN' },
  { code: 'ur', name: 'Urdu',       nameNative: 'اردو',           flag: '🇵🇰', script: 'arabic',     ttsLang: 'ur-IN' },
  { code: 'en', name: 'English',    nameNative: 'English',        flag: '🇬🇧', script: 'latin',      ttsLang: 'en-IN' },
  { code: 'fr', name: 'French',     nameNative: 'Français',       flag: '🇫🇷', script: 'latin',      ttsLang: 'fr-FR' },
  { code: 'de', name: 'German',     nameNative: 'Deutsch',        flag: '🇩🇪', script: 'latin',      ttsLang: 'de-DE' },
  { code: 'es', name: 'Spanish',    nameNative: 'Español',        flag: '🇪🇸', script: 'latin',      ttsLang: 'es-ES' },
  { code: 'ar', name: 'Arabic',     nameNative: 'العربية',        flag: '🇸🇦', script: 'arabic',     ttsLang: 'ar-SA' },
  { code: 'zh', name: 'Chinese',    nameNative: '中文',            flag: '🇨🇳', script: 'cjk',        ttsLang: 'zh-CN' },
  { code: 'ja', name: 'Japanese',   nameNative: '日本語',          flag: '🇯🇵', script: 'cjk',        ttsLang: 'ja-JP' },
  { code: 'ko', name: 'Korean',     nameNative: '한국어',           flag: '🇰🇷', script: 'cjk',        ttsLang: 'ko-KR' },
  { code: 'ru', name: 'Russian',    nameNative: 'Русский',        flag: '🇷🇺', script: 'cyrillic',   ttsLang: 'ru-RU' },
  { code: 'pt', name: 'Portuguese', nameNative: 'Português',      flag: '🇧🇷', script: 'latin',      ttsLang: 'pt-BR' },
  { code: 'id', name: 'Indonesian', nameNative: 'Bahasa Indonesia',flag:'🇮🇩', script: 'latin',      ttsLang: 'id-ID' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Bilingual Kannada phrase database — one entry per category
// Each phrase has: kannadaKn, kannadaEn, kannadaTranslit, and a `translations`
// map from language code → native‑language translation string.
// ─────────────────────────────────────────────────────────────────────────────
const PHRASE_CATEGORIES = [
  {
    id: 'greetings',
    icon: '👋',
    title: 'ನಮಸ್ಕಾರ & ಅಭಿವಾದನ (Greetings)',
    phrases: [
      {
        id: 'namaskara',
        kanKn: 'ನಮಸ್ಕಾರ',
        kanEn: 'Hello / Greetings',
        translit: 'Namaskara',
        translations: {
          hi: 'नमस्ते / हेलो',     ta: 'வணக்கம்',           te: 'నమస్కారం',
          ml: 'ഹലോ / നമസ്കാരം',   mr: 'नमस्कार',           gu: 'નમસ્તે',
          bn: 'নমস্কার',           pa: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',       ur: 'السلام علیکم',
          en: 'Hello',             fr: 'Bonjour',           de: 'Hallo',
          es: 'Hola',             ar: 'مرحبا',              zh: '你好',
          ja: 'こんにちは',          ko: '안녕하세요',            ru: 'Привет',
          pt: 'Olá',              id: 'Halo',
        }
      },
      {
        id: 'howru',
        kanKn: 'ನೀವು ಹೇಗಿದ್ದೀರಿ?',
        kanEn: 'How are you?',
        translit: 'Neevu hegiddiri?',
        translations: {
          hi: 'आप कैसे हैं?',       ta: 'நீங்கள் எப்படி இருக்கிறீர்கள்?', te: 'మీరు ఎలా ఉన్నారు?',
          ml: 'നിങ്ങൾ എങ്ങനെ ഉണ്ട്?',mr: 'तुम्ही कसे आहात?',   gu: 'તમે કેમ છો?',
          bn: 'আপনি কেমন আছেন?',   pa: 'ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?',    ur: 'آپ کیسے ہیں؟',
          en: 'How are you?',      fr: 'Comment allez-vous?', de: 'Wie geht es Ihnen?',
          es: '¿Cómo está usted?', ar: 'كيف حالك؟',          zh: '你好吗?',
          ja: 'お元気ですか?',        ko: '어떻게 지내세요?',        ru: 'Как вы поживаете?',
          pt: 'Como você está?',   id: 'Apa kabar?',
        }
      },
      {
        id: 'goodmorning',
        kanKn: 'ಶುಭೋದಯ',
        kanEn: 'Good Morning',
        translit: 'Shubhodaya',
        translations: {
          hi: 'सुप्रभात',           ta: 'காலை வணக்கம்',       te: 'శుభోదయం',
          ml: 'ശുഭ പ്രഭാതം',         mr: 'सुप्रभात',           gu: 'સુ-પ્રભાત',
          bn: 'শুভ সকাল',           pa: 'ਸ਼ੁਭ ਸਵੇਰਾ',         ur: 'صبح بخیر',
          en: 'Good Morning',      fr: 'Bonjour',           de: 'Guten Morgen',
          es: 'Buenos días',       ar: 'صباح الخير',         zh: '早上好',
          ja: 'おはようございます',     ko: '좋은 아침이에요',         ru: 'Доброе утро',
          pt: 'Bom dia',           id: 'Selamat pagi',
        }
      },
      {
        id: 'goodbye',
        kanKn: 'ಮತ್ತೆ ಸಿಗೋಣ',
        kanEn: 'See you again / Goodbye',
        translit: 'Matte sigona',
        translations: {
          hi: 'फिर मिलेंगे',        ta: 'மீண்டும் சந்திப்போம்', te: 'మళ్ళీ కలుద్దాం',
          ml: 'വീണ്ടും കാണാം',      mr: 'पुन्हा भेटू',          gu: 'ફરી મળીશું',
          bn: 'আবার দেখা হবে',     pa: 'ਫਿਰ ਮਿਲਾਂਗੇ',        ur: 'پھر ملیں گے',
          en: 'See you again',     fr: 'À bientôt',          de: 'Auf Wiedersehen',
          es: 'Hasta luego',       ar: 'إلى اللقاء',          zh: '再见',
          ja: 'またね',              ko: '다시 만나요',             ru: 'До свидания',
          pt: 'Até logo',          id: 'Sampai jumpa lagi',
        }
      },
    ]
  },
  {
    id: 'essentials',
    icon: '🗣️',
    title: 'ಅಗತ್ಯ ನುಡಿಗಳು (Essential Phrases)',
    phrases: [
      {
        id: 'please',
        kanKn: 'ದಯವಿಟ್ಟು',
        kanEn: 'Please (Kindly)',
        translit: 'Dayavittu',
        translations: {
          hi: 'कृपया',              ta: 'தயவுசெய்து',          te: 'దయచేసి',
          ml: 'ദയവായി',             mr: 'कृपया',               gu: 'કૃપા કરીને',
          bn: 'অনুগ্রহ করে',        pa: 'ਕਿਰਪਾ ਕਰਕੇ',           ur: 'براہ کرم',
          en: 'Please',            fr: 'S\'il vous plaît',   de: 'Bitte',
          es: 'Por favor',         ar: 'من فضلك',             zh: '请',
          ja: 'お願いします',         ko: '제발',                  ru: 'Пожалуйста',
          pt: 'Por favor',         id: 'Tolong',
        }
      },
      {
        id: 'thankyou',
        kanKn: 'ಧನ್ಯವಾದಗಳು',
        kanEn: 'Thank You',
        translit: 'Dhanyavadagalu',
        translations: {
          hi: 'धन्यवाद / शुक्रिया',  ta: 'நன்றி',               te: 'ధన్యవాదాలు',
          ml: 'നന്ദി',               mr: 'धन्यवाद',              gu: 'આભારી',
          bn: 'ধন্যবাদ',             pa: 'ਧੰਨਵਾਦ',               ur: 'شکریہ',
          en: 'Thank you',         fr: 'Merci',              de: 'Danke schön',
          es: 'Gracias',           ar: 'شكراً',               zh: '谢谢你',
          ja: 'ありがとうございます',    ko: '감사합니다',              ru: 'Спасибо',
          pt: 'Obrigado',          id: 'Terima kasih',
        }
      },
      {
        id: 'sorry',
        kanKn: 'ಕ್ಷಮಿಸಿ',
        kanEn: 'Sorry / Excuse me',
        translit: 'Kshamisi',
        translations: {
          hi: 'माफ करें / क्षमा करें', ta: 'மன்னிக்கவும்',      te: 'క్షమించండి',
          ml: 'ക്ഷമിക്കൂ',            mr: 'माफ करा',             gu: 'માફ કરો',
          bn: 'ক্ষমা করবেন',          pa: 'ਮਾਫ਼ ਕਰੋ',             ur: 'معاف کریں',
          en: 'Sorry / Excuse me', fr: 'Pardon / Excusez-moi', de: 'Entschuldigung',
          es: 'Lo siento',         ar: 'آسف / عذراً',         zh: '对不起',
          ja: 'すみません',            ko: '죄송합니다',              ru: 'Извините',
          pt: 'Desculpe',          id: 'Maaf',
        }
      },
      {
        id: 'yes_no',
        kanKn: 'ಹೌದು / ಇಲ್ಲ',
        kanEn: 'Yes / No',
        translit: 'Haudu / Illa',
        translations: {
          hi: 'हाँ / नहीं',          ta: 'ஆம் / இல்லை',         te: 'అవును / లేదు',
          ml: 'ആണ് / ഇല്ല',          mr: 'हो / नाही',            gu: 'હા / ના',
          bn: 'হ্যাঁ / না',          pa: 'ਹਾਂ / ਨਹੀਂ',           ur: 'ہاں / نہیں',
          en: 'Yes / No',          fr: 'Oui / Non',          de: 'Ja / Nein',
          es: 'Sí / No',           ar: 'نعم / لا',            zh: '是 / 不是',
          ja: 'はい / いいえ',          ko: '예 / 아니요',            ru: 'Да / Нет',
          pt: 'Sim / Não',         id: 'Ya / Tidak',
        }
      },
    ]
  },
  {
    id: 'food',
    icon: '🍽️',
    title: 'ಊಟ & ತಿಂಡಿ (Food & Dining)',
    phrases: [
      {
        id: 'hungry',
        kanKn: 'ನನಗೆ ಹಸಿವಾಗಿದೆ',
        kanEn: 'I am hungry',
        translit: 'Nanage hasivaagide',
        translations: {
          hi: 'मुझे भूख लगी है',    ta: 'எனக்கு பசிக்கிறது',    te: 'నాకు ఆకలిగా ఉంది',
          ml: 'എനിക്ക് വിശക്കുന്നു', mr: 'मला भूक लागली आहे',   gu: 'મને ભૂખ લાગી છે',
          bn: 'আমার ক্ষুধা লেগেছে',  pa: 'ਮੈਨੂੰ ਭੁੱਖ ਲੱਗੀ ਹੈ',   ur: 'مجھے بھوک لگی ہے',
          en: 'I am hungry',       fr: 'J\'ai faim',           de: 'Ich habe Hunger',
          es: 'Tengo hambre',      ar: 'أنا جائع',             zh: '我饿了',
          ja: 'お腹が空いています',     ko: '배가 고파요',             ru: 'Я голоден',
          pt: 'Estou com fome',    id: 'Saya lapar',
        }
      },
      {
        id: 'water',
        kanKn: 'ನೀರು ಕೊಡಿ ದಯವಿಟ್ಟು',
        kanEn: 'Please give water',
        translit: 'Neeru kodi dayavittu',
        translations: {
          hi: 'कृपया पानी दें',      ta: 'தயவுசெய்து தண்ணீர் தாருங்கள்', te: 'దయచేసి నీళ్ళు ఇవ్వండి',
          ml: 'ദയവായി വെള്ളം തരൂ',   mr: 'कृपया पाणी द्या',       gu: 'કૃપા કરીને પાણી આપો',
          bn: 'দয়া করে জল দিন',     pa: 'ਕਿਰਪਾ ਕਰਕੇ ਪਾਣੀ ਦਿਓ',  ur: 'براہ کرم پانی دیں',
          en: 'Please give water',  fr: 'De l\'eau s\'il vous plaît', de: 'Wasser bitte',
          es: 'Agua por favor',    ar: 'ماء من فضلك',          zh: '请给我水',
          ja: '水をください',           ko: '물 주세요',               ru: 'Воду пожалуйста',
          pt: 'Água por favor',    id: 'Tolong berikan air',
        }
      },
      {
        id: 'bill',
        kanKn: 'ಬಿಲ್ ತನ್ನಿ',
        kanEn: 'Bring the bill',
        translit: 'Bill tanni',
        translations: {
          hi: 'बिल लाइए',            ta: 'பில் கொண்டு வாருங்கள்', te: 'బిల్లు తీసుకు రండి',
          ml: 'ബിൽ കൊണ്ടുവരൂ',        mr: 'बिल आणा',               gu: 'બિલ લાવો',
          bn: 'বিল আনুন',            pa: 'ਬਿੱਲ ਲਿਆਓ',             ur: 'بل لائیں',
          en: 'Bring the bill',    fr: 'L\'addition s\'il vous plaît', de: 'Die Rechnung bitte',
          es: 'La cuenta por favor', ar: 'الحساب من فضلك',      zh: '请结账',
          ja: 'お会計をお願いします',    ko: '계산서 주세요',             ru: 'Счёт пожалуйста',
          pt: 'A conta por favor',  id: 'Minta tagihan',
        }
      },
    ]
  },
  {
    id: 'directions',
    icon: '🗺️',
    title: 'ಮಾರ್ಗ & ಸ್ಥಳ (Directions & Places)',
    phrases: [
      {
        id: 'where',
        kanKn: '...ಎಲ್ಲಿದೆ?',
        kanEn: 'Where is ...?',
        translit: '...ellide?',
        translations: {
          hi: '...कहाँ है?',          ta: '...எங்கே உள்ளது?',      te: '...ఎక్కడ ఉంది?',
          ml: '...എവിടെ ഉണ്ട്?',      mr: '...कुठे आहे?',           gu: '...ક્યાં છે?',
          bn: '...কোথায় আছে?',        pa: '...ਕਿੱਥੇ ਹੈ?',           ur: '...کہاں ہے؟',
          en: 'Where is ...?',      fr: 'Où est ...?',           de: 'Wo ist ...?',
          es: '¿Dónde está ...?',   ar: '...أين؟',               zh: '...在哪里?',
          ja: '...どこですか？',         ko: '...어디 있어요?',          ru: 'Где ...?',
          pt: 'Onde fica ...?',     id: 'Di mana ...?',
        }
      },
      {
        id: 'howtogo',
        kanKn: 'ಇಲ್ಲಿಗೆ ಹೇಗೆ ಹೋಗಬೇಕು?',
        kanEn: 'How do I get here?',
        translit: 'Illige hege hogabeku?',
        translations: {
          hi: 'यहाँ कैसे जाएं?',     ta: 'இங்கே எப்படி போவது?',  te: 'ఇక్కడికి ఎలా వెళ్ళాలి?',
          ml: 'ഇവിടെ എത്തിച്ചേരുന്നതെങ്ങനെ?', mr: 'इथे कसे जायचे?',   gu: 'અહીં કેવી રીતે જવું?',
          bn: 'এখানে কিভাবে যাব?',   pa: 'ਇੱਥੇ ਕਿਵੇਂ ਜਾਣਾ ਹੈ?',   ur: 'یہاں کیسے جائیں؟',
          en: 'How do I get here?', fr: 'Comment aller ici?',    de: 'Wie komme ich hierher?',
          es: '¿Cómo llego aquí?',  ar: 'كيف أصل إلى هنا؟',     zh: '我怎么去这里?',
          ja: 'ここへはどうやって行きますか？', ko: '여기 어떻게 가나요?',    ru: 'Как добраться сюда?',
          pt: 'Como chego aqui?',   id: 'Bagaimana cara ke sini?',
        }
      },
      {
        id: 'left_right',
        kanKn: 'ಎಡಕ್ಕೆ / ಬಲಕ್ಕೆ / ನೇರ',
        kanEn: 'Left / Right / Straight',
        translit: 'Edakke / Balakke / Nera',
        translations: {
          hi: 'बाएं / दाएं / सीधे',   ta: 'இடது / வலது / நேராக',  te: 'ఎడమ / కుడి / నేరుగా',
          ml: 'ഇടത്ത് / വലത്ത് / നേരെ', mr: 'डावीकडे / उजवीकडे / सरळ', gu: 'ડાબે / જમણે / સીધું',
          bn: 'বাম / ডান / সোজা',    pa: 'ਖੱਬੇ / ਸੱਜੇ / ਸਿੱਧੇ',  ur: 'بائیں / دائیں / سیدھا',
          en: 'Left / Right / Straight', fr: 'Gauche / Droite / Tout droit', de: 'Links / Rechts / Geradeaus',
          es: 'Izquierda / Derecha / Recto', ar: 'يسار / يمين / مستقيم', zh: '左 / 右 / 直走',
          ja: '左 / 右 / まっすぐ',    ko: '왼쪽 / 오른쪽 / 직진',      ru: 'Лево / Право / Прямо',
          pt: 'Esquerda / Direita / Em frente', id: 'Kiri / Kanan / Lurus',
        }
      },
    ]
  },
  {
    id: 'numbers',
    icon: '🔢',
    title: 'ಸಂಖ್ಯೆಗಳು (Numbers 1-10)',
    phrases: [
      { id: 'n1', kanKn: 'ಒಂದು (೧)',  kanEn: 'One',   translit: 'Ondu',      translations: { hi:'एक', ta:'ஒன்று', te:'ఒకటి', ml:'ഒന്ന്', mr:'एक', gu:'એક', bn:'এক', pa:'ਇੱਕ', ur:'ایک', en:'One', fr:'Un', de:'Eins', es:'Uno', ar:'واحد', zh:'一', ja:'いち', ko:'일', ru:'Один', pt:'Um', id:'Satu' } },
      { id: 'n2', kanKn: 'ಎರಡು (೨)',  kanEn: 'Two',   translit: 'Eradu',     translations: { hi:'दो', ta:'இரண்டு', te:'రెండు', ml:'രണ്ട്', mr:'दोन', gu:'બે', bn:'দুই', pa:'ਦੋ', ur:'دو', en:'Two', fr:'Deux', de:'Zwei', es:'Dos', ar:'اثنان', zh:'二', ja:'に', ko:'이', ru:'Два', pt:'Dois', id:'Dua' } },
      { id: 'n3', kanKn: 'ಮೂರು (೩)',  kanEn: 'Three', translit: 'Mooru',     translations: { hi:'तीन', ta:'மூன்று', te:'మూడు', ml:'മൂന്ന്', mr:'तीन', gu:'ત્રણ', bn:'তিন', pa:'ਤਿੰਨ', ur:'تین', en:'Three', fr:'Trois', de:'Drei', es:'Tres', ar:'ثلاثة', zh:'三', ja:'さん', ko:'삼', ru:'Три', pt:'Três', id:'Tiga' } },
      { id: 'n4', kanKn: 'ನಾಲ್ಕು (೪)', kanEn: 'Four',  translit: 'Naalku',    translations: { hi:'चार', ta:'நான்கு', te:'నాలుగు', ml:'നാല്', mr:'चार', gu:'ચાર', bn:'চার', pa:'ਚਾਰ', ur:'چار', en:'Four', fr:'Quatre', de:'Vier', es:'Cuatro', ar:'أربعة', zh:'四', ja:'し', ko:'사', ru:'Четыре', pt:'Quatro', id:'Empat' } },
      { id: 'n5', kanKn: 'ಐದು (೫)',   kanEn: 'Five',  translit: 'Aidu',      translations: { hi:'पाँच', ta:'ஐந்து', te:'ఐదు', ml:'അഞ്ച്', mr:'पाच', gu:'પાંચ', bn:'পাঁচ', pa:'ਪੰਜ', ur:'پانچ', en:'Five', fr:'Cinq', de:'Fünf', es:'Cinco', ar:'خمسة', zh:'五', ja:'ご', ko:'오', ru:'Пять', pt:'Cinco', id:'Lima' } },
      { id: 'n6', kanKn: 'ಆರು (೬)',   kanEn: 'Six',   translit: 'Aaru',      translations: { hi:'छह', ta:'ஆறு', te:'ఆరు', ml:'ആറ്', mr:'सहा', gu:'છ', bn:'ছয়', pa:'ਛੇ', ur:'چھ', en:'Six', fr:'Six', de:'Sechs', es:'Seis', ar:'ستة', zh:'六', ja:'ろく', ko:'육', ru:'Шесть', pt:'Seis', id:'Enam' } },
      { id: 'n7', kanKn: 'ಏಳು (೭)',   kanEn: 'Seven', translit: 'Yelu',      translations: { hi:'सात', ta:'ஏழு', te:'ఏడు', ml:'ഏഴ്', mr:'सात', gu:'સાત', bn:'সাত', pa:'ਸੱਤ', ur:'سات', en:'Seven', fr:'Sept', de:'Sieben', es:'Siete', ar:'سبعة', zh:'七', ja:'なな', ko:'칠', ru:'Семь', pt:'Sete', id:'Tujuh' } },
      { id: 'n8', kanKn: 'ಎಂಟು (೮)',  kanEn: 'Eight', translit: 'Entu',      translations: { hi:'आठ', ta:'எட்டு', te:'ఎనిమిది', ml:'എട്ട്', mr:'आठ', gu:'આઠ', bn:'আট', pa:'ਅੱਠ', ur:'آٹھ', en:'Eight', fr:'Huit', de:'Acht', es:'Ocho', ar:'ثمانية', zh:'八', ja:'はち', ko:'팔', ru:'Восемь', pt:'Oito', id:'Delapan' } },
      { id: 'n9', kanKn: 'ಒಂಬತ್ತು (೯)', kanEn:'Nine', translit:'Ombattu',   translations: { hi:'नौ', ta:'ஒன்பது', te:'తొమ్మిది', ml:'ഒമ്പത്', mr:'नऊ', gu:'નવ', bn:'নয়', pa:'ਨੌ', ur:'نو', en:'Nine', fr:'Neuf', de:'Neun', es:'Nueve', ar:'تسعة', zh:'九', ja:'きゅう', ko:'구', ru:'Девять', pt:'Nove', id:'Sembilan' } },
      { id: 'n10', kanKn: 'ಹತ್ತು (೧೦)', kanEn:'Ten', translit:'Hattu',     translations: { hi:'दस', ta:'பத்து', te:'పది', ml:'പത്ത്', mr:'दहा', gu:'દસ', bn:'দশ', pa:'ਦਸ', ur:'دس', en:'Ten', fr:'Dix', de:'Zehn', es:'Diez', ar:'عشرة', zh:'十', ja:'じゅう', ko:'십', ru:'Десять', pt:'Dez', id:'Sepuluh' } },
    ]
  },
  {
    id: 'colors',
    icon: '🎨',
    title: 'ಬಣ್ಣಗಳು (Colors)',
    phrases: [
      { id: 'red',    kanKn: 'ಕೆಂಪು',  kanEn: 'Red',    translit: 'Kempu',    translations: { hi:'लाल', ta:'சிவப்பு', te:'ఎరుపు', ml:'ചുവപ്പ്', mr:'लाल', gu:'લાલ', bn:'লাল', pa:'ਲਾਲ', ur:'سرخ', en:'Red', fr:'Rouge', de:'Rot', es:'Rojo', ar:'أحمر', zh:'红色', ja:'赤', ko:'빨강', ru:'Красный', pt:'Vermelho', id:'Merah' } },
      { id: 'blue',   kanKn: 'ನೀಲಿ',   kanEn: 'Blue',   translit: 'Neeli',    translations: { hi:'नीला', ta:'நீலம்', te:'నీలం', ml:'നീലം', mr:'निळा', gu:'વાદળી', bn:'নীল', pa:'ਨੀਲਾ', ur:'نیلا', en:'Blue', fr:'Bleu', de:'Blau', es:'Azul', ar:'أزرق', zh:'蓝色', ja:'青', ko:'파랑', ru:'Синий', pt:'Azul', id:'Biru' } },
      { id: 'green',  kanKn: 'ಹಸಿರು',  kanEn: 'Green',  translit: 'Hasiru',   translations: { hi:'हरा', ta:'பச்சை', te:'ఆకుపచ్చ', ml:'പച്ച', mr:'हिरवा', gu:'લીલો', bn:'সবুজ', pa:'ਹਰਾ', ur:'سبز', en:'Green', fr:'Vert', de:'Grün', es:'Verde', ar:'أخضر', zh:'绿色', ja:'緑', ko:'초록', ru:'Зелёный', pt:'Verde', id:'Hijau' } },
      { id: 'yellow', kanKn: 'ಹಳದಿ',  kanEn: 'Yellow', translit: 'Haladi',   translations: { hi:'पीला', ta:'மஞ்சள்', te:'పసుపు', ml:'മഞ്ഞ', mr:'पिवळा', gu:'પીળો', bn:'হলুদ', pa:'ਪੀਲਾ', ur:'پیلا', en:'Yellow', fr:'Jaune', de:'Gelb', es:'Amarillo', ar:'أصفر', zh:'黄色', ja:'黄色', ko:'노랑', ru:'Жёлтый', pt:'Amarelo', id:'Kuning' } },
      { id: 'black',  kanKn: 'ಕಪ್ಪು',  kanEn: 'Black',  translit: 'Kappu',    translations: { hi:'काला', ta:'கறுப்பு', te:'నలుపు', ml:'കറുപ്പ്', mr:'काळा', gu:'કાળો', bn:'কালো', pa:'ਕਾਲਾ', ur:'کالا', en:'Black', fr:'Noir', de:'Schwarz', es:'Negro', ar:'أسود', zh:'黑色', ja:'黒', ko:'검정', ru:'Чёрный', pt:'Preto', id:'Hitam' } },
      { id: 'white',  kanKn: 'ಬಿಳಿ',   kanEn: 'White',  translit: 'Bili',     translations: { hi:'सफेद', ta:'வெள்ளை', te:'తెలుపు', ml:'വെള്ള', mr:'पांढरा', gu:'સફેદ', bn:'সাদা', pa:'ਚਿੱਟਾ', ur:'سفید', en:'White', fr:'Blanc', de:'Weiß', es:'Blanco', ar:'أبيض', zh:'白色', ja:'白', ko:'하양', ru:'Белый', pt:'Branco', id:'Putih' } },
    ]
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Speak in a given language's TTS voice
// ─────────────────────────────────────────────────────────────────────────────
function speakInLanguage(text, ttsLang) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = ttsLang;
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function NativeLanguageBridge({ onXP, onToast }) {
  const [nativeLang, setNativeLang] = useState('hi');
  const [activeCategory, setActiveCategory] = useState('greetings');
  const [quizMode, setQuizMode] = useState(false);
  const [quizPhrase, setQuizPhrase] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const currentLang = NATIVE_LANGUAGES.find(l => l.code === nativeLang) || NATIVE_LANGUAGES[0];
  const curCategory = PHRASE_CATEGORIES.find(c => c.id === activeCategory) || PHRASE_CATEGORIES[0];

  // Filtered phrases by search
  const filteredPhrases = curCategory.phrases.filter(p => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      p.kanEn.toLowerCase().includes(s) ||
      p.kanKn.toLowerCase().includes(s) ||
      p.translit.toLowerCase().includes(s) ||
      (p.translations[nativeLang] || '').toLowerCase().includes(s)
    );
  });

  const handleSelectLang = useCallback((code) => {
    playClick();
    setNativeLang(code);
    setQuizMode(false);
    setQuizAnswered(null);
    setQuizPhrase(null);
  }, []);

  const handlePhraseAudio = (phrase, which) => {
    playClick();
    if (which === 'kannada') {
      speakKannada(phrase.kanKn);
    } else {
      speakInLanguage(
        phrase.translations[nativeLang] || phrase.kanEn,
        currentLang.ttsLang
      );
    }
    onXP && onXP(5);
  };

  const startQuiz = () => {
    playClick();
    const allPhrases = PHRASE_CATEGORIES.flatMap(c => c.phrases);
    const idx = Math.floor(Math.random() * allPhrases.length);
    setQuizPhrase(allPhrases[idx]);
    setQuizAnswered(null);
    setQuizMode(true);
  };

  const handleQuizAnswer = (chosen) => {
    playClick();
    setQuizAnswered(chosen);
    if (chosen === quizPhrase.translations[nativeLang]) {
      playFanfare();
      onXP && onXP(30);
      onToast && onToast(`🌐 Correct in ${currentLang.name}! +30 XP`, 'xp');
    } else {
      playSuccess();
      onXP && onXP(10);
      onToast && onToast(`Keep practicing! +10 XP`, 'info');
    }
  };

  // Build quiz options (1 correct + 3 distractors from other phrases)
  const buildQuizOptions = () => {
    if (!quizPhrase) return [];
    const allPhrases = PHRASE_CATEGORIES.flatMap(c => c.phrases);
    const correct = quizPhrase.translations[nativeLang];
    const distractors = allPhrases
      .filter(p => p.id !== quizPhrase.id && p.translations[nativeLang])
      .map(p => p.translations[nativeLang])
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [correct, ...distractors].sort(() => Math.random() - 0.5);
  };
  const quizOptions = quizMode && quizPhrase ? buildQuizOptions() : [];

  return (
    <div className="learning-screen" style={{ maxWidth: 920, margin: '0 auto', padding: '1rem' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0, fontSize: '1.6rem' }}>
            🌐 ನಿಮ್ಮ ಮಾತೃ ಭಾಷೆಯಲ್ಲಿ ಕನ್ನಡ ಕಲಿಯಿರಿ
          </h1>
          <p style={{ margin: '0.2rem 0 0', opacity: 0.8, fontSize: '0.9rem' }}>
            Learn Kannada From Your Native Language · Multilingual Bridge for 20 World Languages
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            onClick={() => { setQuizMode(false); setSearchTerm(''); }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: !quizMode ? 'linear-gradient(135deg, #ff6b35, #ffa366)' : 'rgba(255,255,255,0.08)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            📖 Phrasebook
          </button>
          <button
            onClick={startQuiz}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: quizMode ? 'linear-gradient(135deg, #4ade80, #22c55e)' : 'rgba(255,255,255,0.08)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🎯 Quiz Me
          </button>
        </div>
      </div>

      {/* ── Native Language Selector ── */}
      <div className="glass-card" style={{ padding: '1.2rem', borderRadius: '16px', marginBottom: '1.4rem', border: '1px solid rgba(255, 163, 102, 0.25)' }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffa366', marginBottom: '0.8rem' }}>
          🌍 Select Your Native Language (ನಿಮ್ಮ ಮಾತೃ ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ):
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {NATIVE_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleSelectLang(lang.code)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '10px',
                border: nativeLang === lang.code ? '2px solid #ffa366' : '1px solid rgba(255,255,255,0.1)',
                background: nativeLang === lang.code ? 'rgba(255, 107, 53, 0.25)' : 'rgba(255,255,255,0.04)',
                color: '#fff',
                fontWeight: nativeLang === lang.code ? 800 : 600,
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.18s ease'
              }}
            >
              <span>{lang.flag}</span>
              <span>{lang.nameNative}</span>
            </button>
          ))}
        </div>

        {/* Selected Language Banner */}
        <div style={{
          marginTop: '0.9rem',
          padding: '0.7rem 1rem',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.18), rgba(255, 163, 102, 0.08))',
          border: '1px solid rgba(255, 163, 102, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem'
        }}>
          <span style={{ fontSize: '1.8rem' }}>{currentLang.flag}</span>
          <div>
            <div style={{ fontWeight: 800, color: '#ffa366', fontSize: '1rem' }}>
              {currentLang.name} → ಕನ್ನಡ (Kannada)
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
              Native Script: {currentLang.nameNative} · Phrases shown in your language + Kannada
            </div>
          </div>
        </div>
      </div>

      {/* ── QUIZ MODE ── */}
      {quizMode && quizPhrase && (
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid rgba(74, 222, 128, 0.3)', marginBottom: '1.4rem', background: 'rgba(74, 222, 128, 0.06)' }}>
          <div style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            🎯 What does this Kannada phrase mean in {currentLang.name}?
          </div>
          <div style={{ fontFamily: 'Noto Sans Kannada', fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '0.3rem' }}>
            {quizPhrase.kanKn}
          </div>
          <div style={{ fontSize: '1rem', color: '#fda4af', marginBottom: '0.3rem', fontStyle: 'italic' }}>
            {quizPhrase.translit}
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '1.5rem' }}>
            (English: {quizPhrase.kanEn})
          </div>
          <button
            onClick={() => speakKannada(quizPhrase.kanKn)}
            style={{ background: 'rgba(74, 222, 128, 0.2)', border: '1px solid rgba(74, 222, 128, 0.4)', color: '#4ade80', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, marginBottom: '1.2rem' }}
          >
            🔊 Hear Pronunciation
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {quizOptions.map((opt, i) => {
              const isCorrect = opt === quizPhrase.translations[nativeLang];
              const isSelected = quizAnswered === opt;
              return (
                <button
                  key={i}
                  onClick={() => !quizAnswered && handleQuizAnswer(opt)}
                  style={{
                    padding: '0.9rem 1.2rem',
                    borderRadius: '12px',
                    border: isSelected
                      ? isCorrect ? '2px solid #4ade80' : '2px solid #ef4444'
                      : quizAnswered && isCorrect ? '2px solid #4ade80' : '1px solid rgba(255,255,255,0.1)',
                    background: isSelected
                      ? isCorrect ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                      : quizAnswered && isCorrect ? 'rgba(74, 222, 128, 0.12)' : 'rgba(255,255,255,0.04)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: quizAnswered ? 'default' : 'pointer',
                    textAlign: 'left'
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {quizAnswered && (
            <div style={{ marginTop: '1.2rem', textAlign: 'right' }}>
              <button
                onClick={startQuiz}
                style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)', border: 'none', color: '#fff', padding: '0.6rem 1.4rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
              >
                Next Quiz →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── PHRASEBOOK MODE ── */}
      {!quizMode && (
        <div>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.2rem' }}>
            {PHRASE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => { playClick(); setActiveCategory(cat.id); }}
                style={{
                  padding: '0.6rem 1.1rem',
                  borderRadius: '12px',
                  border: activeCategory === cat.id ? '2px solid #ffa366' : '1px solid rgba(255,255,255,0.1)',
                  background: activeCategory === cat.id ? 'rgba(255, 107, 53, 0.22)' : 'rgba(255,255,255,0.04)',
                  color: activeCategory === cat.id ? '#ffa366' : '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  flexShrink: 0
                }}
              >
                {cat.icon} {cat.title.split('(')[0].trim()}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder={`🔍 Search phrases in ${currentLang.nameNative} or Kannada...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.06)',
                color: '#fff',
                fontSize: '0.92rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Phrase Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {filteredPhrases.map(phrase => (
              <div
                key={phrase.id}
                className="glass-card"
                style={{
                  padding: '1.2rem',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  alignItems: 'center'
                }}
              >
                {/* Native Language Side */}
                <div style={{ borderRight: '1px solid rgba(255,255,255,0.08)', paddingRight: '1rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                    {currentLang.flag} {currentLang.name} ({currentLang.nameNative}):
                  </div>
                  <div
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#fff',
                      marginBottom: '0.4rem',
                      direction: ['ar', 'ur'].includes(nativeLang) ? 'rtl' : 'ltr',
                      lineHeight: 1.4
                    }}
                  >
                    {phrase.translations[nativeLang] || phrase.kanEn}
                  </div>
                  <button
                    onClick={() => handlePhraseAudio(phrase, 'native')}
                    style={{ background: 'rgba(74, 222, 128, 0.2)', border: '1px solid rgba(74, 222, 128, 0.4)', color: '#4ade80', padding: '0.3rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                  >
                    🔊 Listen
                  </button>
                </div>

                {/* Kannada Side */}
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#ffa366', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                    🌸 ಕನ್ನಡ (Kannada):
                  </div>
                  <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.35rem', fontWeight: 900, color: '#ffa366', marginBottom: '0.2rem' }}>
                    {phrase.kanKn}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#fda4af', marginBottom: '0.4rem', fontStyle: 'italic' }}>
                    {phrase.translit}
                  </div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.75, marginBottom: '0.4rem' }}>
                    {phrase.kanEn}
                  </div>
                  <button
                    onClick={() => handlePhraseAudio(phrase, 'kannada')}
                    style={{ background: 'rgba(255, 107, 53, 0.2)', border: '1px solid rgba(255, 107, 53, 0.4)', color: '#ffa366', padding: '0.3rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                  >
                    🔊 ಕನ್ನಡ ಉಚ್ಚಾರ
                  </button>
                </div>
              </div>
            ))}
            {filteredPhrases.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.7 }}>
                No phrases found for "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

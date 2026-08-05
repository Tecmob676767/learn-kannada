// Comprehensive Conversation Scenarios Data for Sobagu

export const conversations = [
  {
    id: 'auto',
    title: 'Bargaining with Auto Raja',
    titleKannada: 'ಆಟೋ ರಾಜನೊಂದಿಗೆ',
    icon: '🛺',
    difficulty: 'Beginner',
    category: 'Travel',
    script: [
      {
        speaker: 'npc',
        npcName: 'Auto Raja',
        kannada: 'ಹೋಗ್ಬೇಕಾ ಸಾರ್?',
        transliteration: 'Hog-bekaa saar?',
        translation: 'You want to go, sir?',
        choices: [
          { kannada: 'ಹೌದು, ಕೋರಮಂಗಲ ಹೋಗ್ಬೇಕು', transliteration: 'Haudu, Koramangala hog-beku', translation: 'Yes, I need to go to Koramangala', next: 1 },
          { kannada: 'ಬೇಡ, ಧನ್ಯವಾದ', transliteration: 'Beda, dhanyavaada', translation: 'No, thank you', next: 'end_polite' },
        ]
      },
      {
        speaker: 'npc',
        npcName: 'Auto Raja',
        kannada: 'ಮೂನ್ನೂರು ರೂಪಾಯಿ ಕೊಡಿ ಸಾರ್',
        transliteration: 'Moonnooru roopaayi kodi saar',
        translation: 'Give 300 rupees, sir',
        choices: [
          { kannada: 'ಏನ್ ಸಾರ್, ಮೀಟರ್ ಹಾಕಿ', transliteration: 'En saar, meeter haaki', translation: 'What sir, run the meter', next: 2 },
          { kannada: 'ಸರಿ, ಬನ್ನಿ', transliteration: 'Sari, banni', translation: 'Okay, let\'s go', next: 'end_ok' },
        ]
      },
      {
        speaker: 'npc',
        npcName: 'Auto Raja',
        kannada: 'ಮೀಟರ್ ಕೆಟ್ಟು ಹೋಗಿದೆ ಸಾರ್, ಇನ್ನೂರ ಐವತ್ತು ಕೊಡಿ',
        transliteration: 'Meeter kettu hogide saar, innoor aivatu kodi',
        translation: 'The meter is broken sir, give 250',
        choices: [
          { kannada: 'ಇನ್ನೂರು ಆದ್ರೆ ಬನ್ನಿ, ಇಲ್ಲಾಂದ್ರೆ ಬೇಡ', transliteration: 'Innooru aadre banni, illaandre beda', translation: 'If 200, come; otherwise no', next: 3 },
          { kannada: 'ಸರಿ, ಇನ್ನೂರ ಐವತ್ತು ಕೊಡ್ತೇನೆ', transliteration: 'Sari, innoor aivatu kodtene', translation: 'Okay, I\'ll give 250', next: 'end_ok' },
        ]
      },
      {
        speaker: 'npc',
        npcName: 'Auto Raja',
        kannada: 'ಸರಿ ಸಾರ್, ಬನ್ನಿ! ನೀವು ಚೆನ್ನಾಗಿ ಕನ್ನಡ ಮಾತಾಡ್ತೀರಿ!',
        transliteration: 'Sari saar, banni! Neevu chennagi Kannada maataadteeri!',
        translation: 'Okay sir, let\'s go! You speak Kannada well!',
        choices: [],
        isEnd: true,
        endMessage: '🎉 Excellent! You successfully bargained in Kannada! +50 XP'
      },
    ]
  },
  {
    id: 'darshini',
    title: 'Ordering at Darshini',
    titleKannada: 'ದರ್ಶಿನಿಯಲ್ಲಿ ಆರ್ಡರ್',
    icon: '🍛',
    difficulty: 'Beginner',
    category: 'Dining',
    script: [
      {
        speaker: 'npc',
        npcName: 'Darshini Uncle',
        kannada: 'ಏನು ಬೇಕು ಸಾರ್?',
        transliteration: 'Enu beku saar?',
        translation: 'What do you want, sir?',
        choices: [
          { kannada: 'ಒಂದು ಮಸಾಲ ದೋಸೆ ಮತ್ತು ಒಂದು ಕಾಫಿ', transliteration: 'Ondu masaala dose mattu ondu kaafi', translation: 'One masala dosa and one coffee', next: 1 },
          { kannada: 'ಏನು ಸಿಗ್ತೆ ಇವತ್ತು?', transliteration: 'Enu sigte ivvattu?', translation: 'What is available today?', next: 1 },
        ]
      },
      {
        speaker: 'npc',
        npcName: 'Darshini Uncle',
        kannada: 'ದೋಸೆ ಖಾರ ಬೇಕಾ ಅಥವಾ ಕಮ್ಮಿ ಖಾರ?',
        transliteration: 'Dose khaara bekaa athavaa kammi khaara?',
        translation: 'Spicy dosa or less spicy?',
        choices: [
          { kannada: 'ಕಮ್ಮಿ ಖಾರ ಮಾಡಿ', transliteration: 'Kammi khaara maadi', translation: 'Make it less spicy', next: 2 },
          { kannada: 'ಖಾರ ಇರಲಿ, ಪರವಾಗಿಲ್ಲ', transliteration: 'Khaara irali, parawaagilla', translation: 'Keep it spicy, it\'s okay', next: 2 },
        ]
      },
      {
        speaker: 'npc',
        npcName: 'Darshini Uncle',
        kannada: 'ಸರಿ! ಐವತ್ತು ರೂಪಾಯಿ ಆಗ್ತೆ',
        transliteration: 'Sari! Aivatu roopaayi aagte',
        translation: 'Okay! That will be 50 rupees',
        choices: [],
        isEnd: true,
        endMessage: '🍛 Superb! You ordered like a true Bengalurean! +40 XP'
      },
    ]
  },
  {
    id: 'vegetables',
    title: 'Vegetable Market Shopping',
    titleKannada: 'ತರಕಾರಿ ಮಾರುಕಟ್ಟೆ',
    icon: '🥦',
    difficulty: 'Beginner',
    category: 'Shopping',
    script: [
      {
        speaker: 'npc',
        npcName: 'Vendor Amma',
        kannada: 'ತಾಜಾ ತರಕಾರಿ ತಗೋಳಿ ಸಾರ್! ಈರುಳ್ಳಿ, ಟೊಮೆಟೊ ಬೇಕಾ?',
        transliteration: 'Taajaa tarakaari tagoli saar! Eerulli, tomato bekaa?',
        translation: 'Take fresh vegetables sir! Want onions, tomatoes?',
        choices: [
          { kannada: 'ಟೊಮೆಟೊ ಕೆಜಿ ಎಷ್ಟು ಅಮ್ಮಾ?', transliteration: 'Tomato kg eshtu ammaa?', translation: 'How much for a kg of tomatoes, Amma?', next: 1 },
          { kannada: 'ಸೊಪ್ಪು ತಾಜಾ ಇದೆಯಾ?', transliteration: 'Soppu taajaa ideyaa?', translation: 'Are the greens fresh?', next: 1 },
        ]
      },
      {
        speaker: 'npc',
        npcName: 'Vendor Amma',
        kannada: 'ಟೊಮೆಟೊ ಕೆಜಿಗೆ ನಾಲ್ವತ್ತು ರೂಪಾಯಿ. ತುಂಬಾ ತಾಜಾ ಇದೆ!',
        transliteration: 'Tomato kejige naalvattu roopaayi. Tumba taajaa ide!',
        translation: 'Tomatoes are 40 rupees per kg. Very fresh!',
        choices: [
          { kannada: 'ಎರಡು ಕೆಜಿ ಕೊಡಿ, ಜೊತೆಗೆ ಸ್ವಲ್ಪ ಕೊತ್ತಂಬರಿ ಹಾಕಿ', transliteration: 'Eradu kg kodi, jotege swalpa kottambari haaki', translation: 'Give 2 kg, plus throw in some coriander', next: 2 },
          { kannada: 'ಮೂವತ್ತು ರೂಪಾಯಿಗೆ ಕೊಡ್ತೀರಾ?', transliteration: 'Moovattu roopaayige kodteeraa?', translation: 'Will you give for 30 rupees?', next: 2 },
        ]
      },
      {
        speaker: 'npc',
        npcName: 'Vendor Amma',
        kannada: 'ಸರಿ ತಗೋಳಿ, ಎಂಭತ್ತು ರೂಪಾಯಿ ಆಯ್ತು. ಧನ್ಯವಾದ!',
        transliteration: 'Sari tagoli, embhatu roopaayi aaytu. Dhanyavaada!',
        translation: 'Okay take it, total 80 rupees. Thank you!',
        choices: [],
        isEnd: true,
        endMessage: '🥦 Great job buying fresh veggies in Kannada! +45 XP'
      }
    ]
  },
  {
    id: 'metro',
    title: 'Namma Metro Station',
    titleKannada: 'ನಮ್ಮ ಮೆಟ್ರೋ ನಿಲ್ದಾಣ',
    icon: '🚇',
    difficulty: 'Intermediate',
    category: 'Travel',
    script: [
      {
        speaker: 'npc',
        npcName: 'Metro Executive',
        kannada: 'ಎಲ್ಲಿಗೆ ಟಿಕೆಟ್ ಬೇಕು ಸಾರ್?',
        transliteration: 'Ellige ticket beku saar?',
        translation: 'Where do you need a ticket to, sir?',
        choices: [
          { kannada: 'ಮೆಜೆಸ್ಟಿಕ್ ಗೆ ಒಂದು ಟೋಕನ್ ಕೊಡಿ', transliteration: 'Majestic ge ondu token kodi', translation: 'Give one token to Majestic', next: 1 },
          { kannada: 'ಸ್ಮಾರ್ಟ್ ಕಾರ್ಡ್ ರೀಚಾರ್ಜ್ ಮಾಡಬೇಕು', transliteration: 'Smart card recharge maadabeku', translation: 'I need to recharge my Smart Card', next: 1 },
        ]
      },
      {
        speaker: 'npc',
        npcName: 'Metro Executive',
        kannada: 'ಇಪ್ಪತ್ತೈದು ರೂಪಾಯಿ ಆಗ್ತೆ. ಒಂದನೇ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ಗೆ ಹೋಗಿ.',
        transliteration: 'Ippattaidu roopaayi aagte. Ondanee platform ge hogi.',
        translation: 'That will be 25 rupees. Go to Platform 1.',
        choices: [
          { kannada: 'ಮುಂದಿನ ರೈಲು ಎಷ್ಟು ಹೊತ್ತಿಗೆ ಬರುತ್ತೆ?', transliteration: 'Mundina railu eshtu hottige barutte?', translation: 'What time does the next train arrive?', next: 2 },
          { kannada: 'ಧನ್ಯವಾದ ಸಾರ್, ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಎಲ್ಲಿದೆ?', transliteration: 'Dhanyavada saar, platform ellide?', translation: 'Thank you sir, where is the platform?', next: 2 },
        ]
      },
      {
        speaker: 'npc',
        npcName: 'Metro Executive',
        kannada: 'ಇನ್ನು ಐದು ನಿಮಿಷದಲ್ಲಿ ಬರುತ್ತೆ. ಶುಭ ಪ್ರಯಾಣ!',
        transliteration: 'Innu aidu nimishadalli barutte. Shubha prayaana!',
        translation: 'It arrives in 5 minutes. Happy journey!',
        choices: [],
        isEnd: true,
        endMessage: '🚇 You navigated Namma Metro seamlessly! +45 XP'
      }
    ]
  },
  {
    id: 'house_rent',
    title: 'House Hunting & Landlord',
    titleKannada: 'ಮನೆ ಬಾಡಿಗೆ ಮಾತುಕತೆ',
    icon: '🏠',
    difficulty: 'Intermediate',
    category: 'Living',
    script: [
      {
        speaker: 'npc',
        npcName: 'Owner Uncle',
        kannada: 'ಮನೆ ನೋಡೋಕೆ ಬಂದಿರಾ? ಎಷ್ಟು ಜನ ಇರ್ತೀರಾ?',
        transliteration: 'Mane nodoke bandiraa? Eshtu jana irteeraa?',
        translation: 'Did you come to see the house? How many people will stay?',
        choices: [
          { kannada: 'ನಾವು ಇಬ್ಬರು ಇರ್ತೀವಿ ಸಾರ್. ಬಾಡಿಗೆ ಎಷ್ಟು?', transliteration: 'Naavu ibbaru irteevi saar. Baadige eshtu?', translation: 'Two of us will stay sir. What is the rent?', next: 1 },
          { kannada: 'ಒಂದು BHK ಮನೆ ಖಾಲಿ ಇದೆಯಾ?', transliteration: 'Ondu BHK mane khaali ideyaa?', translation: 'Is 1 BHK house vacant?', next: 1 },
        ]
      },
      {
        speaker: 'npc',
        npcName: 'Owner Uncle',
        kannada: 'ತಿಂಗಳಿಗೆ ಹದಿನೈದು ಸಾವಿರ ಬಾಡಿಗೆ, ಹತ್ತು ತಿಂಗಳ ಮುಂಗಡ (Advance).',
        transliteration: 'Tingalige hadinaaidu saavira baadige, hattu tingala mungada.',
        translation: '15,000 rent per month, 10 months advance.',
        choices: [
          { kannada: 'ಅಡ್ವಾನ್ಸ್ ಸ್ವಲ್ಪ ಕಮ್ಮಿ ಮಾಡಿ ಸಾರ್', transliteration: 'Advance swalpa kammi maadi saar', translation: 'Please reduce the advance a bit sir', next: 2 },
          { kannada: 'ಬೀದಿ ದೀಪ ಮತ್ತು ನೀರು ಸರಬರಾಜು ಹೇಗಿದೆ?', transliteration: 'Beedi deepa mattu neeru sarabaraaju hegide?', translation: 'How is the street light and water supply?', next: 2 },
        ]
      },
      {
        speaker: 'npc',
        npcName: 'Owner Uncle',
        kannada: 'ನೀರು 24 ಗಂಟೆ ಬರುತ್ತೆ. ಅಡ್ವಾನ್ಸ್ 5 ತಿಂಗಳಿಗೆ ಮಾಡಿಕೊಡ್ತೇನೆ.',
        transliteration: 'Neeru 24 gante barutte. Advance 5 tingalige maadikodtene.',
        translation: 'Water comes 24 hours. I will make advance 5 months.',
        choices: [],
        isEnd: true,
        endMessage: '🏠 You negotiated like a Bengaluru local! +50 XP'
      }
    ]
  },
  {
    id: 'directions',
    title: 'Asking Road Directions',
    titleKannada: 'ದಾರಿ ಕೇಳುವುದು',
    icon: '🗺️',
    difficulty: 'Beginner',
    category: 'Travel',
    script: [
      {
        speaker: 'npc',
        npcName: 'Passerby Bro',
        kannada: 'ಏನು ಬೇಕು ಬ್ರೋ?',
        transliteration: 'Enu beku bro?',
        translation: 'What do you need bro?',
        choices: [
          { kannada: 'ಸ್ವಲ್ಪ ದಾರಿ ಹೇಳ್ತೀರಾ? ಪೋಸ್ಟ್ ಆಫೀಸ್ ಎಲ್ಲಿದೆ?', transliteration: 'Swalpa daari helteeraa? Post office ellide?', translation: 'Can you tell the way? Where is the post office?', next: 1 },
          { kannada: 'ಬಸ್ ಸ್ಟಾಪ್ ಎಷ್ಟು ದೂರ ಇದೆ?', transliteration: 'Bus stop eshtu doora ide?', translation: 'How far is the bus stop?', next: 1 },
        ]
      },
      {
        speaker: 'npc',
        npcName: 'Passerby Bro',
        kannada: 'ನೇರ ಹೋಗಿ, ಮುಂದೆ ಸಿಗ್ನಲ್ ಹತ್ತಿರ ಎಡಕ್ಕೆ ತಿರುಗಿ. ಅಲ್ಲೇ ಇದೆ!',
        transliteration: 'Nera hogi, munde signal hattira edakke tirugi. Alle ide!',
        translation: 'Go straight, turn left near the signal ahead. It\'s right there!',
        choices: [
          { kannada: 'ತುಂಬಾ ಧನ್ಯವಾದ ಬ್ರೋ!', transliteration: 'Tumba dhanyavaada bro!', translation: 'Thanks a lot bro!', next: 2 },
          { kannada: 'ಕಾಲ್ನಡಿಗೆಯಲ್ಲಿ ಎಷ್ಟು ನಿಮಿಷ?', transliteration: 'Kaalnadigeyalli eshtu nimisha?', translation: 'How many minutes by walk?', next: 2 },
        ]
      },
      {
        speaker: 'npc',
        npcName: 'Passerby Bro',
        kannada: 'ಐದೇ ನಿಮಿಷ ನಡಿಗೆ! ಶುಭ ದಿನ!',
        transliteration: 'Aidee nimisha nadige! Shubha dina!',
        translation: 'Just 5 minutes walk! Have a good day!',
        choices: [],
        isEnd: true,
        endMessage: '🗺️ Perfect! You can navigate any street in Karnataka! +40 XP'
      }
    ]
  }
];

export type FarmerLanguage = 'en' | 'hi' | 'pa';

export interface FarmerCopy {
  brand: string;
  chooseLanguage: string;
  chooseLanguageHelp: string;
  welcomeTitle: string;
  welcomeBody: string;
  continueAsFarmer: string;
  support: string;
  home: string;
  findMandi: string;
  sellCrop: string;
  myToken: string;
  payments: string;
  help: string;
  hello: string;
  updatedNow: string;
  waitAtHome: string;
  leaveNow: string;
  goToGate: string;
  waitMessage: (minutes: number, time: string) => string;
  leaveMessage: string;
  arrivedMessage: string;
  viewToken: string;
  mainActions: string;
  sellCropHelp: string;
  findMandiHelp: string;
  tokenHelp: string;
  paymentPending: string;
  moneyReceived: string;
  bankMessage: string;
  viewPayments: string;
}

export const farmerCopy: Record<FarmerLanguage, FarmerCopy> = {
  en: {
    brand: 'AgriMandi',
    chooseLanguage: 'Choose your language',
    chooseLanguageHelp: 'You can change this later in Help.',
    welcomeTitle: 'Sell your crop with confidence',
    welcomeBody: 'Check prices, choose a mandi, get a token, and track your payment in one place.',
    continueAsFarmer: 'Continue as Farmer',
    support: 'Call for help',
    home: 'Home',
    findMandi: 'Find Mandi',
    sellCrop: 'Sell Crop',
    myToken: 'My Token',
    payments: 'Payments',
    help: 'Help',
    hello: 'Hello',
    updatedNow: 'Updated just now',
    waitAtHome: 'WAIT AT HOME',
    leaveNow: 'LEAVE NOW',
    goToGate: 'GO TO GATE 2',
    waitMessage: (minutes, time) => `The mandi is delayed by ${minutes} minutes. Leave at ${time}.`,
    leaveMessage: 'The gate is ready. Leave for Taraori Mandi now.',
    arrivedMessage: 'Show your token at Gate 2 for weighing.',
    viewToken: 'View my token',
    mainActions: 'What do you want to do?',
    sellCropHelp: 'Add crop details and photos',
    findMandiHelp: 'Compare the money you will receive',
    tokenHelp: 'See gate time and queue',
    paymentPending: 'Payment pending',
    moneyReceived: 'Money received',
    bankMessage: 'To State Bank of India •••• 8492',
    viewPayments: 'View payment details',
  },
  hi: {
    brand: 'एग्रीमंडी',
    chooseLanguage: 'अपनी भाषा चुनें',
    chooseLanguageHelp: 'इसे बाद में सहायता में बदल सकते हैं।',
    welcomeTitle: 'अपनी फसल भरोसे के साथ बेचें',
    welcomeBody: 'भाव देखें, मंडी चुनें, टोकन लें और भुगतान की जानकारी एक ही जगह पाएं।',
    continueAsFarmer: 'किसान के रूप में आगे बढ़ें',
    support: 'मदद के लिए कॉल करें',
    home: 'होम',
    findMandi: 'मंडी खोजें',
    sellCrop: 'फसल बेचें',
    myToken: 'मेरा टोकन',
    payments: 'भुगतान',
    help: 'सहायता',
    hello: 'नमस्ते',
    updatedNow: 'अभी अपडेट हुआ',
    waitAtHome: 'अभी घर पर रुकें',
    leaveNow: 'अभी निकलें',
    goToGate: 'गेट 2 पर जाएं',
    waitMessage: (minutes, time) => `मंडी में ${minutes} मिनट की देरी है। ${time} बजे निकलें।`,
    leaveMessage: 'गेट तैयार है। अभी तरावड़ी मंडी के लिए निकलें।',
    arrivedMessage: 'तुलाई के लिए गेट 2 पर अपना टोकन दिखाएं।',
    viewToken: 'मेरा टोकन देखें',
    mainActions: 'आप क्या करना चाहते हैं?',
    sellCropHelp: 'फसल की जानकारी और फोटो जोड़ें',
    findMandiHelp: 'कितना पैसा मिलेगा, तुलना करें',
    tokenHelp: 'गेट का समय और कतार देखें',
    paymentPending: 'भुगतान बाकी है',
    moneyReceived: 'पैसे मिल गए',
    bankMessage: 'स्टेट बैंक ऑफ इंडिया •••• 8492 में',
    viewPayments: 'भुगतान की जानकारी देखें',
  },
  pa: {
    brand: 'ਐਗਰੀਮੰਡੀ',
    chooseLanguage: 'ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ',
    chooseLanguageHelp: 'ਇਸਨੂੰ ਬਾਅਦ ਵਿੱਚ ਮਦਦ ਵਿੱਚ ਬਦਲ ਸਕਦੇ ਹੋ।',
    welcomeTitle: 'ਆਪਣੀ ਫਸਲ ਭਰੋਸੇ ਨਾਲ ਵੇਚੋ',
    welcomeBody: 'ਭਾਅ ਵੇਖੋ, ਮੰਡੀ ਚੁਣੋ, ਟੋਕਨ ਲਵੋ ਅਤੇ ਭੁਗਤਾਨ ਦੀ ਜਾਣਕਾਰੀ ਇੱਕੋ ਥਾਂ ਪਾਓ।',
    continueAsFarmer: 'ਕਿਸਾਨ ਵਜੋਂ ਅੱਗੇ ਵਧੋ',
    support: 'ਮਦਦ ਲਈ ਕਾਲ ਕਰੋ',
    home: 'ਘਰ',
    findMandi: 'ਮੰਡੀ ਲੱਭੋ',
    sellCrop: 'ਫਸਲ ਵੇਚੋ',
    myToken: 'ਮੇਰਾ ਟੋਕਨ',
    payments: 'ਭੁਗਤਾਨ',
    help: 'ਮਦਦ',
    hello: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
    updatedNow: 'ਹੁਣੇ ਅਪਡੇਟ ਹੋਇਆ',
    waitAtHome: 'ਹਾਲੇ ਘਰ ਰੁਕੋ',
    leaveNow: 'ਹੁਣੇ ਚੱਲੋ',
    goToGate: 'ਗੇਟ 2 ਤੇ ਜਾਓ',
    waitMessage: (minutes, time) => `ਮੰਡੀ ਵਿੱਚ ${minutes} ਮਿੰਟ ਦੀ ਦੇਰੀ ਹੈ। ${time} ਵਜੇ ਚੱਲੋ।`,
    leaveMessage: 'ਗੇਟ ਤਿਆਰ ਹੈ। ਹੁਣੇ ਤਰਾਵੜੀ ਮੰਡੀ ਲਈ ਚੱਲੋ।',
    arrivedMessage: 'ਤੋਲ ਲਈ ਗੇਟ 2 ਤੇ ਆਪਣਾ ਟੋਕਨ ਦਿਖਾਓ।',
    viewToken: 'ਮੇਰਾ ਟੋਕਨ ਵੇਖੋ',
    mainActions: 'ਤੁਸੀਂ ਕੀ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?',
    sellCropHelp: 'ਫਸਲ ਦੀ ਜਾਣਕਾਰੀ ਅਤੇ ਫੋਟੋ ਜੋੜੋ',
    findMandiHelp: 'ਕਿੰਨੇ ਪੈਸੇ ਮਿਲਣਗੇ, ਤੁਲਨਾ ਕਰੋ',
    tokenHelp: 'ਗੇਟ ਦਾ ਸਮਾਂ ਅਤੇ ਕਤਾਰ ਵੇਖੋ',
    paymentPending: 'ਭੁਗਤਾਨ ਬਾਕੀ ਹੈ',
    moneyReceived: 'ਪੈਸੇ ਮਿਲ ਗਏ',
    bankMessage: 'ਸਟੇਟ ਬੈਂਕ ਆਫ ਇੰਡੀਆ •••• 8492 ਵਿੱਚ',
    viewPayments: 'ਭੁਗਤਾਨ ਦੀ ਜਾਣਕਾਰੀ ਵੇਖੋ',
  },
};

export const getFarmerCopy = (language: FarmerLanguage): FarmerCopy => farmerCopy[language];

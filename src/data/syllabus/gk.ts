import { buildSubjectSyllabus, type ChapterSeed } from './helpers';

const seeds: ChapterSeed[] = [
  {
    titleEn: 'Current Affairs',
    titleHi: 'सामयिकी',
    topics: [
      { en: 'Current Affairs', hi: 'सामयिकी' },
      { en: 'Awards and Honours', hi: 'पुरस्कार एवं सम्मान' },
      { en: 'Sports', hi: 'खेल जगत' },
      { en: 'Important Days', hi: 'महत्वपूर्ण दिवस' }
    ]
  },
  {
    titleEn: 'History and Culture',
    titleHi: 'इतिहास एवं संस्कृति',
    topics: [
      { en: 'Indian History', hi: 'भारतीय इतिहास' },
      { en: 'Freedom Movement', hi: 'स्वतंत्रता आंदोलन' },
      { en: 'Indian Culture', hi: 'भारतीय संस्कृति' },
      { en: 'Art and Heritage', hi: 'कला एवं विरासत' }
    ]
  },
  {
    titleEn: 'Geography',
    titleHi: 'भूगोल',
    topics: [
      { en: 'Indian Geography', hi: 'भारतीय भूगोल' },
      { en: 'World Geography', hi: 'विश्व भूगोल' },
      { en: 'Rivers and Mountains', hi: 'नदियाँ एवं पर्वत' },
      { en: 'Environment', hi: 'पर्यावरण' }
    ]
  },
  {
    titleEn: 'Polity and Economy',
    titleHi: 'राजव्यवस्था एवं अर्थव्यवस्था',
    topics: [
      { en: 'Indian Constitution', hi: 'भारतीय संविधान' },
      { en: 'Indian Polity', hi: 'भारतीय राजव्यवस्था' },
      { en: 'Indian Economy', hi: 'भारतीय अर्थव्यवस्था' }
    ]
  },
  {
    titleEn: 'Science and Technology',
    titleHi: 'विज्ञान एवं प्रौद्योगिकी',
    topics: [
      { en: 'General Science', hi: 'सामान्य विज्ञान' },
      { en: 'Discoveries and Inventions', hi: 'खोजें एवं आविष्कार' },
      { en: 'Computer Awareness', hi: 'कंप्यूटर सामान्य ज्ञान' }
    ]
  },
  {
    titleEn: 'Defence and General Awareness',
    titleHi: 'रक्षा एवं सामान्य जागरूकता',
    topics: [
      { en: 'Defence and Security', hi: 'रक्षा एवं सुरक्षा' },
      { en: 'BSF-related General Awareness', hi: 'BSF संबंधित सामान्य जागरूकता' },
      { en: 'Books and Authors', hi: 'पुस्तकें एवं लेखक' },
      { en: 'Important Personalities', hi: 'महत्वपूर्ण व्यक्तित्व' },
      { en: 'Countries and Capitals', hi: 'देश एवं राजधानियाँ' },
      { en: 'Currencies', hi: 'मुद्राएँ' },
      { en: 'National Symbols', hi: 'राष्ट्रीय प्रतीक' },
      { en: 'Important Abbreviations', hi: 'महत्वपूर्ण संक्षिप्ताक्षर' }
    ]
  }
];

export const gkSyllabus = buildSubjectSyllabus('gk', seeds);

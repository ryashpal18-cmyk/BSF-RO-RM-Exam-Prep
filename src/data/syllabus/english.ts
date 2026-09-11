import { buildSubjectSyllabus, type ChapterSeed } from './helpers';

const seeds: ChapterSeed[] = [
  {
    titleEn: 'Grammar Fundamentals',
    titleHi: 'व्याकरण की मूल बातें',
    topics: [
      { en: 'Parts of Speech', hi: 'शब्द भेद' },
      { en: 'Tenses', hi: 'काल (Tenses)' },
      { en: 'Subject-Verb Agreement', hi: 'कर्ता-क्रिया सामंजस्य' },
      { en: 'Articles', hi: 'आर्टिकल्स' },
      { en: 'Prepositions', hi: 'प्रीपोज़िशन' },
      { en: 'Conjunctions', hi: 'संयोजक' }
    ]
  },
  {
    titleEn: 'Vocabulary',
    titleHi: 'शब्दावली',
    topics: [
      { en: 'Vocabulary', hi: 'शब्दावली' },
      { en: 'Synonyms', hi: 'समानार्थी शब्द' },
      { en: 'Antonyms', hi: 'विलोम शब्द' },
      { en: 'Homonyms', hi: 'समरूपी शब्द' },
      { en: 'One-word Substitution', hi: 'वन-वर्ड सब्स्टिट्यूशन' },
      { en: 'Idioms and Phrases', hi: 'मुहावरे एवं वाक्यांश' }
    ]
  },
  {
    titleEn: 'Language Usage',
    titleHi: 'भाषा प्रयोग',
    topics: [
      { en: 'Spelling Correction', hi: 'वर्तनी सुधार' },
      { en: 'Error Spotting', hi: 'त्रुटि पहचान' },
      { en: 'Fill in the Blanks', hi: 'रिक्त स्थान भरें' },
      { en: 'Sentence Improvement', hi: 'वाक्य सुधार' },
      { en: 'Sentence Rearrangement', hi: 'वाक्य पुनर्व्यवस्थापन' },
      { en: 'Active and Passive Voice', hi: 'कर्तृवाच्य एवं कर्मवाच्य' },
      { en: 'Direct and Indirect Speech', hi: 'प्रत्यक्ष एवं अप्रत्यक्ष कथन' }
    ]
  },
  {
    titleEn: 'Comprehension',
    titleHi: 'अवबोधन',
    topics: [
      { en: 'Cloze Test', hi: 'क्लोज़ टेस्ट' },
      { en: 'Reading Comprehension', hi: 'गद्यांश अवबोधन' }
    ]
  }
];

export const englishSyllabus = buildSubjectSyllabus('english', seeds);

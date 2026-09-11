import { buildSubjectSyllabus, type ChapterSeed } from './helpers';

const seeds: ChapterSeed[] = [
  {
    titleEn: 'Arithmetic',
    titleHi: 'अंकगणित',
    topics: [
      { en: 'Number System', hi: 'संख्या पद्धति' },
      { en: 'Percentage', hi: 'प्रतिशत' },
      { en: 'Ratio and Proportion', hi: 'अनुपात एवं समानुपात' },
      { en: 'Average', hi: 'औसत' },
      { en: 'Profit and Loss', hi: 'लाभ एवं हानि' },
      { en: 'Discount', hi: 'बट्टा' },
      { en: 'Simple and Compound Interest', hi: 'साधारण एवं चक्रवृद्धि ब्याज' },
      { en: 'Time and Work', hi: 'समय एवं कार्य' },
      { en: 'Time, Speed and Distance', hi: 'समय, चाल एवं दूरी' },
      { en: 'Partnership', hi: 'साझेदारी' }
    ]
  },
  {
    titleEn: 'Algebra',
    titleHi: 'बीजगणित',
    topics: [
      { en: 'Algebra', hi: 'बीजगणित के मूल सिद्धांत' },
      { en: 'Polynomials', hi: 'बहुपद' },
      { en: 'Linear and Quadratic Equations', hi: 'रैखिक एवं द्विघात समीकरण' },
      { en: 'Sequence and Series', hi: 'अनुक्रम एवं श्रेणी' },
      { en: 'Sets, Relations and Functions', hi: 'समुच्चय, संबंध एवं फलन' },
      { en: 'Logarithms', hi: 'लघुगणक' },
      { en: 'Matrices and Determinants', hi: 'आव्यूह एवं सारणिक' }
    ]
  },
  {
    titleEn: 'Combinatorics and Statistics',
    titleHi: 'संयोजिकी एवं सांख्यिकी',
    topics: [
      { en: 'Permutation and Combination', hi: 'क्रमचय एवं संचय' },
      { en: 'Binomial Theorem', hi: 'द्विपद प्रमेय' },
      { en: 'Probability', hi: 'प्रायिकता' },
      { en: 'Statistics', hi: 'सांख्यिकी' }
    ]
  },
  {
    titleEn: 'Coordinate Geometry',
    titleHi: 'निर्देशांक ज्यामिति',
    topics: [
      { en: 'Coordinate Geometry', hi: 'निर्देशांक ज्यामिति के मूल सिद्धांत' },
      { en: 'Straight Lines', hi: 'सरल रेखाएँ' },
      { en: 'Circles', hi: 'वृत्त' },
      { en: 'Conic Sections', hi: 'शंकु परिच्छेद' }
    ]
  },
  {
    titleEn: 'Trigonometry',
    titleHi: 'त्रिकोणमिति',
    topics: [
      { en: 'Trigonometric Ratios', hi: 'त्रिकोणमितीय अनुपात' },
      { en: 'Trigonometric Identities', hi: 'त्रिकोणमितीय सर्वसमिकाएँ' },
      { en: 'Heights and Distances', hi: 'ऊँचाई एवं दूरी' }
    ]
  },
  {
    titleEn: 'Geometry and Mensuration',
    titleHi: 'ज्यामिति एवं क्षेत्रमिति',
    topics: [
      { en: 'Triangles', hi: 'त्रिभुज' },
      { en: 'Quadrilaterals', hi: 'चतुर्भुज' },
      { en: 'Polygons', hi: 'बहुभुज' },
      { en: 'Mensuration 2D', hi: 'क्षेत्रमिति (द्वि-विमीय)' },
      { en: 'Mensuration 3D', hi: 'क्षेत्रमिति (त्रि-विमीय)' }
    ]
  },
  {
    titleEn: 'Calculus',
    titleHi: 'कलन',
    topics: [
      { en: 'Limits', hi: 'सीमा' },
      { en: 'Continuity', hi: 'सांतत्य' },
      { en: 'Differentiation', hi: 'अवकलन' },
      { en: 'Applications of Derivatives', hi: 'अवकलज के अनुप्रयोग' },
      { en: 'Integration', hi: 'समाकलन' },
      { en: 'Differential Equations', hi: 'अवकल समीकरण' }
    ]
  },
  {
    titleEn: 'Vectors and 3D Geometry',
    titleHi: 'सदिश एवं त्रि-विमीय ज्यामिति',
    topics: [
      { en: 'Vectors', hi: 'सदिश' },
      { en: 'Three-Dimensional Geometry', hi: 'त्रि-विमीय ज्यामिति' }
    ]
  }
];

export const mathematicsSyllabus = buildSubjectSyllabus('mathematics', seeds);

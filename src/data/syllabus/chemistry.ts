import { buildSubjectSyllabus, type ChapterSeed } from './helpers';

const seeds: ChapterSeed[] = [
  {
    titleEn: 'Physical Chemistry Basics',
    titleHi: 'भौतिक रसायन के मूल सिद्धांत',
    topics: [
      { en: 'Basic Concepts of Chemistry', hi: 'रसायन विज्ञान की मूल अवधारणाएँ' },
      { en: 'Structure of Atom', hi: 'परमाणु की संरचना' },
      { en: 'Periodic Classification', hi: 'आवर्त वर्गीकरण' },
      { en: 'Chemical Bonding', hi: 'रासायनिक आबंधन' },
      { en: 'States of Matter', hi: 'द्रव्य की अवस्थाएँ' },
      { en: 'Thermodynamics', hi: 'ऊष्मागतिकी' },
      { en: 'Equilibrium', hi: 'साम्यावस्था' },
      { en: 'Redox Reactions', hi: 'रेडॉक्स अभिक्रियाएँ' }
    ]
  },
  {
    titleEn: 'Inorganic Chemistry',
    titleHi: 'अकार्बनिक रसायन',
    topics: [
      { en: 'Hydrogen', hi: 'हाइड्रोजन' },
      { en: 'S-Block Elements', hi: 'S-ब्लॉक तत्व' },
      { en: 'P-Block Elements', hi: 'P-ब्लॉक तत्व' },
      { en: 'D and F Block Elements', hi: 'D एवं F ब्लॉक तत्व' },
      { en: 'Coordination Compounds', hi: 'उपसहसंयोजन यौगिक' },
      { en: 'Isolation of Elements', hi: 'तत्वों का निष्कर्षण' }
    ]
  },
  {
    titleEn: 'Physical Chemistry Advanced',
    titleHi: 'भौतिक रसायन (उच्च स्तर)',
    topics: [
      { en: 'Solid State', hi: 'ठोस अवस्था' },
      { en: 'Solutions', hi: 'विलयन' },
      { en: 'Electrochemistry', hi: 'वैद्युतरसायन' },
      { en: 'Chemical Kinetics', hi: 'रासायनिक बलगतिकी' },
      { en: 'Surface Chemistry', hi: 'पृष्ठ रसायन' }
    ]
  },
  {
    titleEn: 'Organic Chemistry',
    titleHi: 'कार्बनिक रसायन',
    topics: [
      { en: 'General Organic Chemistry', hi: 'सामान्य कार्बनिक रसायन' },
      { en: 'Hydrocarbons', hi: 'हाइड्रोकार्बन' },
      { en: 'Haloalkanes and Haloarenes', hi: 'हैलोऐल्केन एवं हैलोऐरीन' },
      { en: 'Alcohols, Phenols and Ethers', hi: 'ऐल्कोहॉल, फीनॉल एवं ईथर' },
      { en: 'Aldehydes and Ketones', hi: 'ऐल्डिहाइड एवं कीटोन' },
      { en: 'Carboxylic Acids', hi: 'कार्बोक्सिलिक अम्ल' },
      { en: 'Amines', hi: 'ऐमीन' },
      { en: 'Biomolecules', hi: 'जैव अणु' },
      { en: 'Polymers', hi: 'बहुलक' }
    ]
  },
  {
    titleEn: 'Applied Chemistry',
    titleHi: 'व्यावहारिक रसायन',
    topics: [
      { en: 'Chemistry in Everyday Life', hi: 'दैनिक जीवन में रसायन' },
      { en: 'Environmental Chemistry', hi: 'पर्यावरणीय रसायन' }
    ]
  }
];

export const chemistrySyllabus = buildSubjectSyllabus('chemistry', seeds);

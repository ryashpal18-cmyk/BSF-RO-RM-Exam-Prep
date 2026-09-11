import { buildSubjectSyllabus, type ChapterSeed } from './helpers';

const seeds: ChapterSeed[] = [
  {
    titleEn: 'Units and Measurements',
    titleHi: 'मात्रक एवं मापन',
    topics: [
      { en: 'Physical quantities', hi: 'भौतिक राशियाँ' },
      { en: 'SI units', hi: 'SI मात्रक' },
      { en: 'Dimensions', hi: 'विमाएँ' },
      { en: 'Dimensional analysis', hi: 'विमीय विश्लेषण' },
      { en: 'Significant figures', hi: 'सार्थक अंक' },
      { en: 'Measurement errors', hi: 'मापन त्रुटियाँ' },
      { en: 'Vernier caliper', hi: 'वर्नियर कैलिपर' },
      { en: 'Screw gauge', hi: 'पेंच गेज' }
    ]
  },
  {
    titleEn: 'Motion and Kinematics',
    titleHi: 'गति एवं गतिकी',
    topics: [
      { en: 'Distance and displacement', hi: 'दूरी एवं विस्थापन' },
      { en: 'Speed and velocity', hi: 'चाल एवं वेग' },
      { en: 'Acceleration', hi: 'त्वरण' },
      { en: 'Equations of motion', hi: 'गति के समीकरण' },
      { en: 'Motion graphs', hi: 'गति के आलेख' },
      { en: 'Projectile motion', hi: 'प्रक्षेप्य गति' },
      { en: 'Circular motion', hi: 'वृत्तीय गति' }
    ]
  },
  {
    titleEn: 'Laws of Motion',
    titleHi: 'गति के नियम',
    topics: [
      { en: "Newton's laws", hi: 'न्यूटन के नियम' },
      { en: 'Momentum', hi: 'संवेग' },
      { en: 'Impulse', hi: 'आवेग' },
      { en: 'Conservation of momentum', hi: 'संवेग संरक्षण' },
      { en: 'Friction', hi: 'घर्षण' },
      { en: 'Centripetal force', hi: 'अभिकेन्द्रीय बल' }
    ]
  },
  {
    titleEn: 'Work, Energy and Power',
    titleHi: 'कार्य, ऊर्जा एवं शक्ति',
    topics: [
      { en: 'Work', hi: 'कार्य' },
      { en: 'Kinetic energy', hi: 'गतिज ऊर्जा' },
      { en: 'Potential energy', hi: 'स्थितिज ऊर्जा' },
      { en: 'Work-energy theorem', hi: 'कार्य-ऊर्जा प्रमेय' },
      { en: 'Conservation of energy', hi: 'ऊर्जा संरक्षण' },
      { en: 'Power', hi: 'शक्ति' },
      { en: 'Collisions', hi: 'संघट्ट' }
    ]
  },
  {
    titleEn: 'Gravitation',
    titleHi: 'गुरुत्वाकर्षण',
    topics: [
      { en: 'Universal law of gravitation', hi: 'गुरुत्वाकर्षण का सार्वत्रिक नियम' },
      { en: 'Acceleration due to gravity', hi: 'गुरुत्वीय त्वरण' },
      { en: 'Gravitational potential', hi: 'गुरुत्वीय विभव' },
      { en: 'Escape velocity', hi: 'पलायन वेग' },
      { en: 'Satellites', hi: 'उपग्रह' }
    ]
  },
  {
    titleEn: 'Properties of Matter',
    titleHi: 'पदार्थ के गुण',
    topics: [
      { en: 'Elasticity', hi: 'प्रत्यास्थता' },
      { en: 'Pressure', hi: 'दाब' },
      { en: 'Surface tension', hi: 'पृष्ठ तनाव' },
      { en: 'Viscosity', hi: 'श्यानता' },
      { en: 'Fluid mechanics', hi: 'तरल यांत्रिकी' },
      { en: "Bernoulli's principle", hi: 'बर्नूली का सिद्धांत' }
    ]
  },
  {
    titleEn: 'Heat and Thermodynamics',
    titleHi: 'ऊष्मा एवं ऊष्मागतिकी',
    topics: [
      { en: 'Temperature', hi: 'ताप' },
      { en: 'Thermal expansion', hi: 'ऊष्मीय प्रसार' },
      { en: 'Calorimetry', hi: 'ऊष्मामिति' },
      { en: 'Heat transfer', hi: 'ऊष्मा स्थानांतरण' },
      { en: 'Gas laws', hi: 'गैस के नियम' },
      { en: 'Laws of thermodynamics', hi: 'ऊष्मागतिकी के नियम' },
      { en: 'Kinetic theory of gases', hi: 'गैसों का गतिज सिद्धांत' }
    ]
  },
  {
    titleEn: 'Oscillations and Waves',
    titleHi: 'दोलन एवं तरंगें',
    topics: [
      { en: 'Simple harmonic motion', hi: 'सरल आवर्त गति' },
      { en: 'Time period', hi: 'आवर्तकाल' },
      { en: 'Wave motion', hi: 'तरंग गति' },
      { en: 'Sound waves', hi: 'ध्वनि तरंगें' },
      { en: 'Resonance', hi: 'अनुनाद' },
      { en: 'Doppler effect', hi: 'डॉप्लर प्रभाव' }
    ]
  },
  {
    titleEn: 'Electrostatics',
    titleHi: 'स्थिर वैद्युत',
    topics: [
      { en: 'Electric charge', hi: 'विद्युत आवेश' },
      { en: "Coulomb's law", hi: 'कूलॉम का नियम' },
      { en: 'Electric field', hi: 'विद्युत क्षेत्र' },
      { en: 'Electric potential', hi: 'विद्युत विभव' },
      { en: 'Capacitance', hi: 'धारिता' },
      { en: 'Capacitors', hi: 'संधारित्र' }
    ]
  },
  {
    titleEn: 'Current Electricity',
    titleHi: 'विद्युत धारा',
    topics: [
      { en: 'Current and voltage', hi: 'धारा एवं वोल्टता' },
      { en: 'Resistance', hi: 'प्रतिरोध' },
      { en: "Ohm's law", hi: 'ओम का नियम' },
      { en: 'Series and parallel circuits', hi: 'श्रेणी एवं समांतर परिपथ' },
      { en: "Kirchhoff's laws", hi: 'किरचॉफ के नियम' },
      { en: 'Electrical power', hi: 'विद्युत शक्ति' },
      { en: 'Wheatstone bridge', hi: 'व्हीटस्टोन सेतु' },
      { en: 'Meter bridge', hi: 'मीटर सेतु' }
    ]
  },
  {
    titleEn: 'Magnetism',
    titleHi: 'चुंबकत्व',
    topics: [
      { en: 'Magnetic field', hi: 'चुंबकीय क्षेत्र' },
      { en: 'Magnetic force', hi: 'चुंबकीय बल' },
      { en: 'Bar magnet', hi: 'छड़ चुंबक' },
      { en: "Earth's magnetism", hi: 'पृथ्वी का चुंबकत्व' },
      { en: 'Moving coil galvanometer', hi: 'चल कुंडली धारामापी' },
      { en: 'Conversion to ammeter and voltmeter', hi: 'अमीटर एवं वोल्टमीटर में रूपांतरण' }
    ]
  },
  {
    titleEn: 'Electromagnetic Induction',
    titleHi: 'विद्युत चुंबकीय प्रेरण',
    topics: [
      { en: "Faraday's law", hi: 'फैराडे का नियम' },
      { en: "Lenz's law", hi: 'लेंज का नियम' },
      { en: 'Self and mutual induction', hi: 'स्वप्रेरण एवं अन्योन्य प्रेरण' },
      { en: 'Alternating current', hi: 'प्रत्यावर्ती धारा' },
      { en: 'Transformer', hi: 'ट्रांसफार्मर' },
      { en: 'Generator', hi: 'जनित्र' },
      { en: 'Motor', hi: 'मोटर' }
    ]
  },
  {
    titleEn: 'Optics',
    titleHi: 'प्रकाशिकी',
    topics: [
      { en: 'Reflection', hi: 'परावर्तन' },
      { en: 'Refraction', hi: 'अपवर्तन' },
      { en: 'Mirrors', hi: 'दर्पण' },
      { en: 'Lenses', hi: 'लेंस' },
      { en: 'Optical instruments', hi: 'प्रकाशिक यंत्र' },
      { en: 'Wave optics', hi: 'तरंग प्रकाशिकी' },
      { en: 'Interference', hi: 'व्यतिकरण' },
      { en: 'Diffraction', hi: 'विवर्तन' },
      { en: 'Polarisation', hi: 'ध्रुवण' }
    ]
  },
  {
    titleEn: 'Modern Physics',
    titleHi: 'आधुनिक भौतिकी',
    topics: [
      { en: 'Photoelectric effect', hi: 'प्रकाश विद्युत प्रभाव' },
      { en: 'Atomic structure', hi: 'परमाणु संरचना' },
      { en: 'Bohr model', hi: 'बोर मॉडल' },
      { en: 'Radioactivity', hi: 'रेडियोधर्मिता' },
      { en: 'Nuclear fission and fusion', hi: 'नाभिकीय विखंडन एवं संलयन' },
      { en: 'Semiconductor', hi: 'अर्धचालक' },
      { en: 'Diode', hi: 'डायोड' },
      { en: 'Transistor', hi: 'ट्रांजिस्टर' },
      { en: 'Logic gates', hi: 'लॉजिक गेट' },
      { en: 'Basic electronics', hi: 'मूल इलेक्ट्रॉनिकी' }
    ]
  }
];

export const physicsSyllabus = buildSubjectSyllabus('physics', seeds);

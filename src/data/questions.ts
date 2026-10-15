// ============================================================
// KANNADA MCQ QUESTION BANK
// Source: 1st Internal Test Samskrutika Kannada MCQs Question Bank.pdf
// Processed: Deduplicated, categorized, verified.
// Questions 12 and 47 are absent from the source PDF and are NOT included.
// ============================================================

export type VerificationStatus = 'verified' | 'unverified' | 'needs-review';

export interface Option {
  id: string;   // e.g. "q1_a", "q1_b" -- stable across shuffles
  label: string; // "A", "B", "C", "D"
  text: string;  // Kannada text of the option
}

export interface Question {
  id: string;                   // stable unique ID, e.g. "q001"
  sourceNums: number[];         // original PDF question numbers
  category: Category;
  question: string;             // Kannada question text
  options: Option[];
  correctOptionId: string;      // stable option ID of the correct answer
  verificationStatus: VerificationStatus;
  verificationNote?: string;
  tags?: string[];
}

export type Category =
  | 'vocabulary'
  | 'vachanakaras'
  | 'authors'
  | 'history'
  | 'quick-facts'
  | 'language';

export interface CategoryMeta {
  id: Category;
  label: string;
  labelKn: string;
  description: string;
  color: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'vocabulary',
    label: 'Vocabulary & Definitions',
    labelKn: 'ಶಬ್ದಕೋಶ',
    description: 'Word meanings and Kannada definitions',
    color: '#E6FF3F',
  },
  {
    id: 'vachanakaras',
    label: 'Vachanakaras & Pen-Names',
    labelKn: 'ವಚನಕಾರರು & ಅಂಕಿತ ನಾಮ',
    description: 'Vachana literature, authors, and ankita names',
    color: '#00D9FF',
  },
  {
    id: 'authors',
    label: 'Authors & Works',
    labelKn: 'ಲೇಖಕರು & ಕೃತಿಗಳು',
    description: 'Kannada authors, literary works, and compositions',
    color: '#FF9D2E',
  },
  {
    id: 'history',
    label: 'History & Organizations',
    labelKn: 'ಇತಿಹಾಸ & ಸಂಸ್ಥೆಗಳು',
    description: 'Karnataka history, cultural organizations, and dates',
    color: '#39FF14',
  },
  {
    id: 'quick-facts',
    label: 'Cultural Concepts & Metaphors',
    labelKn: 'ಸಾಂಸ್ಕೃತಿಕ ಪರಿಕಲ್ಪನೆಗಳು',
    description: 'Proverbs, metaphors, cultural philosophy, and traditions',
    color: '#00D9FF',
  },
  {
    id: 'language',
    label: 'Language & Grammar',
    labelKn: 'ಭಾಷೆ & ವ್ಯಾಕರಣ',
    description: 'Kannada language, grammar, and usage',
    color: '#FF9D2E',
  },
];

function opt(qid: string, label: string, text: string): Option {
  return { id: `${qid}_${label.toLowerCase()}`, label, text };
}

export const QUESTIONS: Question[] = [
  // HISTORY & ORGANIZATIONS
  {
    id: 'q001', sourceNums: [1, 23, 85, 88], category: 'history',
    question: 'ವಿದ್ಯಾವರ್ಧಕ ಸಂಘ ಎಷ್ಟರಲ್ಲಿ ಸ್ಥಾಪನೆಯಾಯಿತು?',
    options: [opt('q001','A','1900'), opt('q001','B','1800'), opt('q001','C','1990'), opt('q001','D','1890')],
    correctOptionId: 'q001_d', verificationStatus: 'verified', tags: ['vidyavardhaka sangha'],
  },
  {
    id: 'q002', sourceNums: [2, 89], category: 'history',
    question: '1800 ರಲ್ಲಿ ಬಳ್ಳಾರಿ ಜಿಲ್ಲೆಯ ಕಲೆಕ್ಟರ್ ಆಗಿದ್ದವರು ಯಾರು?',
    options: [opt('q002','A','ಸರ್ ಥಾಮಸ್ ಮನ್ರೊ'), opt('q002','B','ವಿಶ್ವೇಶ್ವರಯ್ಯ'), opt('q002','C','ಮಿರ್ಜಾ ಇಸ್ಮಾಯಿಲ್'), opt('q002','D','ಪೂರ್ಣಯ್ಯ')],
    correctOptionId: 'q002_a', verificationStatus: 'verified', tags: ['bellary', 'thomas munro'],
  },
  {
    id: 'q003', sourceNums: [3], category: 'history',
    question: '1955 ರಲ್ಲಿ ರಾಯಚೂರಿನಲ್ಲಿ ನಡೆದ ಸಾಹಿತ್ಯ ಸಮ್ಮೇಳನದ ಅಧ್ಯಕ್ಷರು ಯಾರಾಗಿದ್ದರು?',
    options: [opt('q003','A','ಬಿ ಎಂ ಶ್ರೀ'), opt('q003','B','ಕುವೆಂಪು'), opt('q003','C','ಶ್ರೀರಂಗ'), opt('q003','D','ಮಾಸ್ತಿ')],
    correctOptionId: 'q003_c', verificationStatus: 'verified', tags: ['raichur', '1955'],
  },
  {
    id: 'q004', sourceNums: [5, 70], category: 'history',
    question: 'ಕನ್ನಡ ಸಾಹಿತ್ಯ ಪರಿಷತ್ ಎಷ್ಟರಲ್ಲಿ ಸ್ಥಾಪನೆ ಆಯಿತು?',
    options: [opt('q004','A','1900'), opt('q004','B','1996'), opt('q004','C','1925'), opt('q004','D','1915')],
    correctOptionId: 'q004_d', verificationStatus: 'verified', tags: ['kannada sahitya parishat', '1915'],
  },
  {
    id: 'q005', sourceNums: [6], category: 'history',
    question: 'ಬೀದರ್ ನಲ್ಲಿ ನಡೆದ ಕನ್ನಡ ಸಾಹಿತ್ಯ ಸಮ್ಮೇಳನದ ಅಧ್ಯಕ್ಷರು ಯಾರಾಗಿದ್ದರು?',
    options: [opt('q005','A','ಡಿಎಲ್ ನರಸಿಂಹಾಚಾರ್'), opt('q005','B','ಶ್ರೀರಂಗ'), opt('q005','C','ಬೇಂದ್ರೆ'), opt('q005','D','ಮಾಸ್ತಿ')],
    correctOptionId: 'q005_a', verificationStatus: 'verified', tags: ['bidar', 'DLN'],
  },
  {
    id: 'q006', sourceNums: [7, 67], category: 'history',
    question: 'ಸಂವಿಧಾನ ಎಷ್ಟರಲ್ಲಿ ಜಾರಿಗೆ ಬಂದಿತು?',
    options: [opt('q006','A','1960'), opt('q006','B','1980'), opt('q006','C','1950'), opt('q006','D','1947')],
    correctOptionId: 'q006_c', verificationStatus: 'verified', tags: ['constitution', '1950'],
  },
  {
    id: 'q007', sourceNums: [9], category: 'history',
    question: 'ರಾಜ್ಯಗಳಲ್ಲಿ ಬಳಕೆಯಾಗುವ ಭಾಷೆಯೇ ಆಡಳಿತ ಭಾಷೆ ಎಂದು ತೀರ್ಮಾನಿಸುವ ಸಂವಿಧಾನದ ಅನುಚ್ಛೇದ ಯಾವುದು?',
    options: [opt('q007','A','400'), opt('q007','B','343'), opt('q007','C','500'), opt('q007','D','333')],
    correctOptionId: 'q007_b', verificationStatus: 'verified', tags: ['article 343', 'constitution'],
  },
  {
    id: 'q008', sourceNums: [10], category: 'language',
    question: 'ಆಡಳಿತ ಭಾಷೆಯ ಪ್ರಮುಖ ಲಕ್ಷಣವೆಂದರೆ?',
    options: [opt('q008','A','ಸರಳ ಮತ್ತು ಸ್ಪಷ್ಟವಾಗಿರಬೇಕು'), opt('q008','B','ಕ್ಲಿಷ್ಟಕರವಾಗಿರಬೇಕು'), opt('q008','C','ವ್ಯಾಕರಣಗಳಿಂದ ಕೂಡಿರಬೇಕು'), opt('q008','D','ದ್ವಂದ್ವಾರ್ಥಗಳು ಇರಬೇಕು')],
    correctOptionId: 'q008_a', verificationStatus: 'verified',
  },
  {
    id: 'q009', sourceNums: [24], category: 'history',
    question: 'ಯಾರ ಪ್ರಯತ್ನದಿಂದ ವಿದ್ಯಾವರ್ಧಕ ಸಂಘ ಸ್ಥಾಪನೆ ಆಯಿತು?',
    options: [opt('q009','A','ರಾ ಹ ದೇಶಪಾಂಡೆ'), opt('q009','B','ಶ್ರೀರಂಗ'), opt('q009','C','ಡಿಎಲ್ಎನ್'), opt('q009','D','ಅನಂತಮೂರ್ತಿ')],
    correctOptionId: 'q009_a', verificationStatus: 'verified', tags: ['ra ha deshapande'],
  },
  {
    id: 'q010', sourceNums: [29], category: 'language',
    question: 'ಆಡಳಿತವು ಜನರ ಭಾಷೆಯಲ್ಲಿ ನಡೆದಾಗ ಅಂತಹ ಆಡಳಿತವು ಏನಾಗಿರುತ್ತದೆ?',
    options: [opt('q010','A','ಪಾರದರ್ಶಕವಾಗಿರುತ್ತದೆ'), opt('q010','B','ವಿಭಿನ್ನವಾಗಿರುತ್ತದೆ'), opt('q010','C','ಕೇಂದ್ರೀಕರಣವಾಗಿರುತ್ತದೆ'), opt('q010','D','ಸುದೀರ್ಘವಾಗಿರುತ್ತದೆ')],
    correctOptionId: 'q010_a', verificationStatus: 'verified',
  },
  {
    id: 'q011', sourceNums: [40], category: 'history',
    question: 'ಮೈಸೂರು ರಾಜ್ಯದ ನಿರ್ಣಯ ಎಷ್ಟರಲ್ಲಾಯಿತು?',
    options: [opt('q011','A','1900'), opt('q011','B','1959'), opt('q011','C','1999'), opt('q011','D','1956')],
    correctOptionId: 'q011_d', verificationStatus: 'verified', tags: ['1956', 'mysore'],
  },
  {
    id: 'q012', sourceNums: [54], category: 'history',
    question: 'ವಿಜಯನಗರದ ಅರಸ ಯಾರು?',
    options: [opt('q012','A','ವಿಜಯ'), opt('q012','B','ಹರಿಹರ'), opt('q012','C','ಕೃಷ್ಣದೇವರಾಯ'), opt('q012','D','ಚಾಮರಾಜೇಂದ್ರ ಒಡೆಯರ್')],
    correctOptionId: 'q012_c', verificationStatus: 'verified', tags: ['vijayanagara'],
  },
  {
    id: 'q013', sourceNums: [74], category: 'history',
    question: 'ಕರ್ನಾಟಕದ ಆಡಳಿತ ಭಾಷೆ ಯಾವುದು?',
    options: [opt('q013','A','ಮಲಯಾಳಂ'), opt('q013','B','ತಮಿಳು'), opt('q013','C','ತೆಲುಗು'), opt('q013','D','ಕನ್ನಡ')],
    correctOptionId: 'q013_d', verificationStatus: 'verified',
  },
  {
    id: 'q014', sourceNums: [75], category: 'history',
    question: 'ವೈಷ್ಣವ ಮತ್ತು ಜೈನರ ಸಮನ್ವಯ ಸಾರುವ ಶಾಸನ ಎಲ್ಲಿದೆ?',
    options: [opt('q014','A','ಶ್ರವಣಬೆಳಗೊಳ'), opt('q014','B','ಚಿತ್ರದುರ್ಗ'), opt('q014','C','ಹಾಸನ'), opt('q014','D','ಮೈಸೂರು')],
    correctOptionId: 'q014_a', verificationStatus: 'verified', tags: ['shravanabelagola'],
  },
  {
    id: 'q015', sourceNums: [82], category: 'history',
    question: 'ಜೋಗ ಜಲಪಾತ ಎಲ್ಲಿದೆ?',
    options: [opt('q015','A','ಬೆಂಗಳೂರು'), opt('q015','B','ಧಾರವಾಡ'), opt('q015','C','ಹಾವೇರಿ'), opt('q015','D','ಶಿವಮೊಗ್ಗ')],
    correctOptionId: 'q015_d', verificationStatus: 'verified', tags: ['jog falls'],
  },
  {
    id: 'q016', sourceNums: [87], category: 'history',
    question: 'ಕನ್ನಡ ಭಾಷೆಗೆ ಎಷ್ಟು ಸಾವಿರ ವರ್ಷಗಳ ಇತಿಹಾಸವಿದೆ?',
    options: [opt('q016','A','2800'), opt('q016','B','3500'), opt('q016','C','2000'), opt('q016','D','1500')],
    correctOptionId: 'q016_c', verificationStatus: 'verified', tags: ['2000 years'],
  },

  // AUTHORS & WORKS
  {
    id: 'q017', sourceNums: [4, 97], category: 'authors',
    question: 'ಕರ್ನಾಟಕ ಗತವೈಭವ ಕೃತಿ ರಚಿಸಿದವರು ಯಾರು?',
    options: [opt('q017','A','ಶಿವರಾಮ ಕಾರಂತ'), opt('q017','B','ಬೇಂದ್ರೆ'), opt('q017','C','ಆಲೂರು ವೆಂಕಟರಾಯ'), opt('q017','D','ಕುವೆಂಪು')],
    correctOptionId: 'q017_c', verificationStatus: 'verified', tags: ['karnataka gata vaibhava'],
  },
  {
    id: 'q018', sourceNums: [8], category: 'authors',
    question: 'ಕನ್ನಡ ಭಾಷೆಯನ್ನು ಲಿಪಿಗಳ ರಾಣಿ ಎಂದು ಕರೆದವರು ಯಾರು?',
    options: [opt('q018','A','ದಾದಾಬಾಯಿ ನವರೋಜಿ'), opt('q018','B','ವಿನೋಬಾ ಭಾವೆ'), opt('q018','C','ಜವಾಹರ್ ಲಾಲ್ ನೆಹರು'), opt('q018','D','ಲಾಲ್ ಬಹದ್ದೂರ್ ಶಾಸ್ತ್ರಿ')],
    correctOptionId: 'q018_b', verificationStatus: 'verified',
    verificationNote: 'Explicitly confirmed correct in source document.',
    tags: ['vinoba bhave', 'lipi'],
  },
  {
    id: 'q019', sourceNums: [11], category: 'authors',
    question: 'ಜಿ ವೆಂಕಟಸುಬ್ಬಯ್ಯನವರು ಯಾವ ಜಿಲ್ಲೆಯವರು?',
    options: [opt('q019','A','ಮೈಸೂರು'), opt('q019','B','ಮಂಡ್ಯ'), opt('q019','C','ಬೆಂಗಳೂರು'), opt('q019','D','ದಾವಣಗೆರೆ')],
    correctOptionId: 'q019_b', verificationStatus: 'verified', tags: ['G Venkatasubbaiah', 'mandya'],
  },
  {
    id: 'q020', sourceNums: [13], category: 'authors',
    question: 'ಸಾವಿರ ಕೊಡಗಳ ಸುಟ್ಟು ತತ್ವಪದದ ಕರ್ತೃ ಯಾರು?',
    options: [opt('q020','A','ಸಂತ ಶಿಶುನಾಳ ಶರೀಫ'), opt('q020','B','ಬಾಲಲೀಲ ಮಹಾಂತ ಶಿವಯೋಗಿ'), opt('q020','C','ಕನಕದಾಸ'), opt('q020','D','ಕೇಶವಮೂರ್ತಿ')],
    correctOptionId: 'q020_a', verificationStatus: 'verified', tags: ['shishunala sharifa', 'tatvapada'],
  },
  {
    id: 'q021', sourceNums: [25, 84, 98], category: 'authors',
    question: 'ಕರ್ನಾಟಕ ಏಕೀಕರಣ ಲೇಖನ ಬರೆದವರು ಯಾರು?',
    options: [opt('q021','A','ಹಂಪ ನಾಗರಾಜಯ್ಯ'), opt('q021','B','ಜಿ ವೆಂಕಟಸುಬ್ಬಯ್ಯ'), opt('q021','C','ಬೇಂದ್ರೆ'), opt('q021','D','ಕುವೆಂಪು')],
    correctOptionId: 'q021_b', verificationStatus: 'verified', tags: ['karnataka ekikarana'],
  },
  {
    id: 'q022', sourceNums: [26, 100], category: 'language',
    question: 'ಜಗತ್ತಿನಲ್ಲಿ ಹೆಚ್ಚು ಮಂದಿ ಮಾತನಾಡುವ ಭಾಷೆ ಎಂಬ ನೆಲೆಯಲ್ಲಿ ಕನ್ನಡಕ್ಕೆ ಎಷ್ಟನೇ ಸ್ಥಾನವಿದೆ?',
    options: [opt('q022','A','18'), opt('q022','B','20'), opt('q022','C','29'), opt('q022','D','12')],
    correctOptionId: 'q022_c', verificationStatus: 'verified', tags: ['speakers rank', '29'],
  },
  {
    id: 'q023', sourceNums: [27], category: 'language',
    question: 'ತಂತ್ರಜ್ಞಾನದ ಬೆಳವಣಿಗೆಯ ಫಲದಿಂದ ಕನ್ನಡ ಭಾಷೆಗೆ ಯಾವ ಪದಗಳು ಸೇರಿಕೊಂಡಿವೆ?',
    options: [opt('q023','A','ತಾಂತ್ರಿಕ ಪದಗಳು'), opt('q023','B','ಇಂಗ್ಲಿಷ್'), opt('q023','C','ಮರಾಠಿ'), opt('q023','D','ಉರ್ದು')],
    correctOptionId: 'q023_a', verificationStatus: 'verified', tags: ['technology', 'technical words'],
  },
  {
    id: 'q024', sourceNums: [28, 93], category: 'language',
    question: 'ಭಾಷೆಯ ಬಳಕೆಯ ನೆಲೆಯಲ್ಲಿ ಮುಖ್ಯವಾದ ಕೌಶಲಗಳು ಎಷ್ಟು?',
    options: [opt('q024','A','5'), opt('q024','B','6'), opt('q024','C','4'), opt('q024','D','8')],
    correctOptionId: 'q024_c', verificationStatus: 'verified', tags: ['language skills', '4'],
  },
  {
    id: 'q025', sourceNums: [30], category: 'authors',
    question: 'ವಚನ ಮತ್ತು ಕೀರ್ತನೆಗಳ ನಂತರ ಉದಯಿಸಿದ ಮತ್ತೊಂದು ಪ್ರಮುಖ ಪ್ರಕಾರ ಯಾವುದು?',
    options: [opt('q025','A','ಸೂಫಿ'), opt('q025','B','ತತ್ವಪದ'), opt('q025','C','ದಾಸ ಪರಂಪರೆ'), opt('q025','D','ಜೈನ ಪರಂಪರೆ')],
    correctOptionId: 'q025_b', verificationStatus: 'verified', tags: ['tatvapada', 'literature'],
  },
  {
    id: 'q026', sourceNums: [35], category: 'authors',
    question: 'ಹಂಪನಾ ಅವರು ಯಾವ ಜಿಲ್ಲೆಯವರು?',
    options: [opt('q026','A','ಬೆಂಗಳೂರು'), opt('q026','B','ಕೋಲಾರ'), opt('q026','C','ತುಮಕೂರು'), opt('q026','D','ಮಂಡ್ಯ')],
    correctOptionId: 'q026_b', verificationStatus: 'verified', tags: ['hampana', 'kolar'],
  },
  {
    id: 'q027', sourceNums: [36], category: 'authors',
    question: 'ಹಂಪನಾ ಅವರು ಯಾವ ಸಾಹಿತ್ಯದಲ್ಲಿ ಅನುಪಮ ಸೇವೆ ಸಲ್ಲಿಸಿದ್ದಾರೆ?',
    options: [opt('q027','A','ಬೌದ್ಧ'), opt('q027','B','ಜೈನ'), opt('q027','C','ಸಿಖ್'), opt('q027','D','ಪಾರ್ಸಿ')],
    correctOptionId: 'q027_b', verificationStatus: 'verified', tags: ['hampana', 'jain'],
  },
  {
    id: 'q028', sourceNums: [39], category: 'authors',
    question: 'ಹಂಪನಾ ಅವರು ಎಷ್ಟು ಕೃತಿಗಳನ್ನು ರಚಿಸಿದ್ದಾರೆ?',
    options: [opt('q028','A','50 ಕ್ಕೂ ಹೆಚ್ಚು'), opt('q028','B','70 ಕ್ಕೂ ಹೆಚ್ಚು'), opt('q028','C','60 ಕ್ಕೂ ಹೆಚ್ಚು'), opt('q028','D','80 ಕ್ಕೂ ಹೆಚ್ಚು')],
    correctOptionId: 'q028_d', verificationStatus: 'verified', tags: ['hampana', '80+'],
  },
  {
    id: 'q029', sourceNums: [46, 66], category: 'authors',
    question: "'ತಳ್ಳಣಿಸದಿರು ಕಂಡ್ಯ ತಾಳು ಮನವೇ' ಎಂಬ ಕೀರ್ತನೆಯನ್ನು ಬರೆದವರು ಯಾರು?",
    options: [opt('q029','A','ಪುರಂದರದಾಸ'), opt('q029','B','ಬಸವಣ್ಣ'), opt('q029','C','ಕನಕದಾಸ'), opt('q029','D','ಅಕ್ಕಮಹಾದೇವಿ')],
    correctOptionId: 'q029_c', verificationStatus: 'verified', tags: ['kanakadasa', 'tallanisadiru'],
  },
  {
    id: 'q030', sourceNums: [57], category: 'authors',
    question: "'ಕುಂಬಾರಕಿ ಇತಿ ಕುಂಬಾರಕಿ' ತತ್ವಪದದ ರಚನೆಕಾರರು ಯಾರು?",
    options: [opt('q030','A','ತ ರಾ ಸು'), opt('q030','B','ಶಿಶುನಾಳ ಶರೀಫ'), opt('q030','C','ಬೇಂದ್ರೆ'), opt('q030','D','ಮಾಸ್ತಿ')],
    correctOptionId: 'q030_b', verificationStatus: 'verified', tags: ['kumbaraki', 'shishunala sharifa'],
  },
  {
    id: 'q031', sourceNums: [60], category: 'authors',
    question: 'ಕರ್ನಾಟಕ ಸಂಗೀತ ಪಿತಾಮಹ ಯಾರು?',
    options: [opt('q031','A','ಕನಕದಾಸ'), opt('q031','B','ಮಲ್ಲಿನಾಥ'), opt('q031','C','ಪುರಂದರ ದಾಸ'), opt('q031','D','ಶಿವದಾಸ')],
    correctOptionId: 'q031_c', verificationStatus: 'verified', tags: ['purandardas', 'pitamaha'],
  },
  {
    id: 'q032', sourceNums: [63], category: 'authors',
    question: 'ಹಂಪಾ ನಾಗರಾಜಯ್ಯ ಎಷ್ಟರಲ್ಲಿ ಜನಿಸಿದರು?',
    options: [opt('q032','A','1935'), opt('q032','B','1936'), opt('q032','C','1900'), opt('q032','D','1975')],
    correctOptionId: 'q032_b', verificationStatus: 'verified', tags: ['hampa nagarajaiah', '1936'],
  },
  {
    id: 'q033', sourceNums: [64], category: 'authors',
    question: 'ಶಿವಯೋಗಿ ತತ್ವಪದವನ್ನು ರಚಿಸಿದವರು ಯಾರು?',
    options: [opt('q033','A','ಶಿಶುನಾಳ ಶರೀಫ'), opt('q033','B','ದಾಸಿಮಯ್ಯ'), opt('q033','C','ಬಾಲ ಲೀಲಾ ಮಹಾಂತ ಶಿವಯೋಗಿ'), opt('q033','D','ಮಾರಯ್ಯ')],
    correctOptionId: 'q033_c', verificationStatus: 'verified', tags: ['bala leela mahanta shivayogi'],
  },
  {
    id: 'q034', sourceNums: [69], category: 'authors',
    question: "'ಅದರಿಂದೇನು ಫಲ ಇದರಿಂದೇನು ಫಲ' ಕೀರ್ತನೆಯ ರಚನೆಕಾರರು ಯಾರು?",
    options: [opt('q034','A','ಕನಕದಾಸ'), opt('q034','B','ಪುರಂದರ ದಾಸ'), opt('q034','C','ರಾಮದಾಸ'), opt('q034','D','ಶಿವದಾಸ')],
    correctOptionId: 'q034_b', verificationStatus: 'verified', tags: ['purandardas', 'adarindenu'],
  },
  {
    id: 'q035', sourceNums: [71], category: 'authors',
    question: 'ಜಿ ವೆಂಕಟಸುಬ್ಬಯ್ಯನವರು ಎಷ್ಟರಲ್ಲಿ ಜನಿಸಿದರು?',
    options: [opt('q035','A','1913'), opt('q035','B','1925'), opt('q035','C','1920'), opt('q035','D','1947')],
    correctOptionId: 'q035_a', verificationStatus: 'verified', tags: ['G Venkatasubbaiah', '1913'],
  },
  {
    id: 'q036', sourceNums: [72], category: 'authors',
    question: "'ಫಲವಂ ನಾಲಿಗೆಯುಳ್ಳವಂ' ಇದು ಯಾರ ವಾಕ್ಯ?",
    options: [opt('q036','A','ಪಂಪ'), opt('q036','B','ರಾಘವಾಂಕ'), opt('q036','C','ಆಂಡಯ್ಯ'), opt('q036','D','ಪೊನ್ನ')],
    correctOptionId: 'q036_a', verificationStatus: 'verified', tags: ['pampa', 'nalige'],
  },

  // VOCABULARY & DEFINITIONS
  {
    id: 'q037', sourceNums: [14], category: 'vocabulary',
    question: 'ಹುದಲು ಎಂದರೆ?',
    options: [opt('q037','A','ಬೆಂಕಿ'), opt('q037','B','ಮಣ್ಣು'), opt('q037','C','ಕಲ್ಲು'), opt('q037','D','ನೀರು')],
    correctOptionId: 'q037_b', verificationStatus: 'verified', tags: ['hudalu', 'soil'],
  },
  {
    id: 'q038', sourceNums: [15], category: 'vocabulary',
    question: 'ವಸುಧೆ ಎಂದರೆ?',
    options: [opt('q038','A','ಆಕಾಶ'), opt('q038','B','ಭೂಮಿ'), opt('q038','C','ಮಣ್ಣು'), opt('q038','D','ನೀರು')],
    correctOptionId: 'q038_b', verificationStatus: 'verified', tags: ['vasudhe', 'earth'],
  },
  {
    id: 'q039', sourceNums: [21], category: 'vocabulary',
    question: 'ತನು ಎಂದರೆ?',
    options: [opt('q039','A','ದೇಹ'), opt('q039','B','ಮನಸ್ಸು'), opt('q039','C','ಕಣ್ಣು'), opt('q039','D','ಮುಖ')],
    correctOptionId: 'q039_a', verificationStatus: 'verified', tags: ['tanu', 'body'],
  },
  {
    id: 'q040', sourceNums: [33], category: 'vocabulary',
    question: 'ನೆನ್ನಿ ಎಂದರೆ?',
    options: [opt('q040','A','ಬಾಯಾರಿಕೆ'), opt('q040','B','ಹಸಿವು'), opt('q040','C','ನಿದ್ರೆ'), opt('q040','D','ರೋಗ')],
    correctOptionId: 'q040_c', verificationStatus: 'verified', tags: ['nenni', 'sleep'],
  },
  {
    id: 'q041', sourceNums: [37], category: 'vocabulary',
    question: 'ಕಾಳಗ ಎಂದರೆ?',
    options: [opt('q041','A','ಯುದ್ಧ'), opt('q041','B','ಬೇಟೆ'), opt('q041','C','ಕಾಲ'), opt('q041','D','ಕಾರ್ಯ')],
    correctOptionId: 'q041_a', verificationStatus: 'verified', tags: ['kalaga', 'war'],
  },
  {
    id: 'q042', sourceNums: [48, 94], category: 'vocabulary',
    question: 'ಅಡವಿ ಎಂದರೆ?',
    options: [opt('q042','A','ಮರ'), opt('q042','B','ಕಾಡು / ಅರಣ್ಯ'), opt('q042','C','ನೀರು'), opt('q042','D','ಜಲಪಾತ')],
    correctOptionId: 'q042_b', verificationStatus: 'verified', tags: ['adavi', 'forest'],
  },
  {
    id: 'q043', sourceNums: [49], category: 'vocabulary',
    question: 'ಪವಳ ಎಂದರೆ?',
    options: [opt('q043','A','ಚಿನ್ನ'), opt('q043','B','ಬೆಳ್ಳಿ'), opt('q043','C','ಹವಳ'), opt('q043','D','ತಾಮ್ರ')],
    correctOptionId: 'q043_c', verificationStatus: 'verified', tags: ['pavala', 'coral'],
  },
  {
    id: 'q044', sourceNums: [51, 90], category: 'vocabulary',
    question: 'ಕರಿ ಎಂದರೆ?',
    options: [opt('q044','A','ತೋಳ'), opt('q044','B','ಆನೆ'), opt('q044','C','ಹುಲಿ'), opt('q044','D','ಮೊಲ')],
    correctOptionId: 'q044_b', verificationStatus: 'verified', tags: ['kari', 'elephant'],
  },
  {
    id: 'q045', sourceNums: [55], category: 'vocabulary',
    question: 'ಪೆಣ್ ಬುಯ್ಯಲ್ ಎಂದರೆ?',
    options: [opt('q045','A','ಮಕ್ಕಳನ್ನು ಅಪಹರಿಸುವುದು'), opt('q045','B','ಸ್ತ್ರೀಯರನ್ನು ಅಪಹರಿಸುವುದು'), opt('q045','C','ವೃದ್ಧರನ್ನು ಅಪಹರಿಸುವುದು'), opt('q045','D','ಪುರುಷರನ್ನು ಅಪಹರಿಸುವುದು')],
    correctOptionId: 'q045_b', verificationStatus: 'verified', tags: ['pen buyyal', 'abduction'],
  },
  {
    id: 'q046', sourceNums: [68], category: 'vocabulary',
    question: 'ಚಿತ್ತ ಎಂದರೆ?',
    options: [opt('q046','A','ಮನಸ್ಸು'), opt('q046','B','ಚರ್ಮ'), opt('q046','C','ದೇಹ'), opt('q046','D','ಹೃದಯ')],
    correctOptionId: 'q046_a', verificationStatus: 'verified', tags: ['chitta', 'mind'],
  },
  {
    id: 'q047', sourceNums: [83], category: 'vocabulary',
    question: 'ತಿಗರಿ ಎಂದರೆ?',
    options: [opt('q047','A','ಚಕ್ರ'), opt('q047','B','ಜೀವನ'), opt('q047','C','ದೇಹ'), opt('q047','D','ಬದುಕು')],
    correctOptionId: 'q047_a', verificationStatus: 'verified', tags: ['tigari', 'wheel'],
  },
  {
    id: 'q048', sourceNums: [95], category: 'vocabulary',
    question: 'ಸನಾತನ ಪದದ ಅರ್ಥವೇನು?',
    options: [opt('q048','A','ಶಾಶ್ವತ'), opt('q048','B','ಹಳೆಯ'), opt('q048','C','ಹೊಸ'), opt('q048','D','ಕೊನೆಯ')],
    correctOptionId: 'q048_a', verificationStatus: 'verified', tags: ['sanatana', 'eternal'],
  },

  // VACHANAKARAS & PEN-NAMES
  {
    id: 'q049', sourceNums: [32, 62], category: 'vachanakaras',
    question: 'ಶೈವರು ಯಾರ ಆರಾಧನೆಯನ್ನು ಮಾಡುತ್ತಾರೆ?',
    options: [opt('q049','A','ವಿಷ್ಣು'), opt('q049','B','ಬ್ರಹ್ಮ'), opt('q049','C','ಶಿವ'), opt('q049','D','ಜೈನ')],
    correctOptionId: 'q049_c', verificationStatus: 'verified', tags: ['shaiva', 'shiva'],
  },
  {
    id: 'q050', sourceNums: [41], category: 'vachanakaras',
    question: 'ಸತ್ಯವಂತರಿಗೆ ಯಾವುದು ಬಾಧಿಸುವುದಿಲ್ಲ?',
    options: [opt('q050','A','ಹಣ'), opt('q050','B','ದುಷ್ಕರ್ಮ'), opt('q050','C','ಸುಳ್ಳು'), opt('q050','D','ಕರ್ಮ')],
    correctOptionId: 'q050_d', verificationStatus: 'verified', tags: ['satyavantaru', 'karma'],
  },
  {
    id: 'q051', sourceNums: [42], category: 'vachanakaras',
    question: 'ಅಯ್ದಕ್ಕಿ ಮಾರಯ್ಯನ ಕಸುಬು ಯಾವುದು?',
    options: [opt('q051','A','ಕಸ ಗುಡಿಸುವುದು'), opt('q051','B','ಬಟ್ಟೆ ಹೊಲೆಯುವುದು'), opt('q051','C','ಅಕ್ಕಿ ಆಯುವುದು'), opt('q051','D','ಅಡುಗೆ ಮಾಡುವುದು')],
    correctOptionId: 'q051_c', verificationStatus: 'verified', tags: ['aydakki marayya', 'rice picking'],
  },
  {
    id: 'q052', sourceNums: [43], category: 'vachanakaras',
    question: 'ಅಯ್ದಕ್ಕಿ ಮಾರಯ್ಯನ ವಚನದಲ್ಲಿ ಯಾವುದಕ್ಕೆ ಅತ್ಯಂತ ಹೆಚ್ಚು ಮಹತ್ವವನ್ನು ನೀಡಲಾಗಿದೆ?',
    options: [opt('q052','A','ಕಾಯಕ'), opt('q052','B','ಸಿರಿತನ'), opt('q052','C','ಬಂಗಾರ'), opt('q052','D','ವಜ್ರ')],
    correctOptionId: 'q052_a', verificationStatus: 'verified', tags: ['kayaka', 'importance'],
  },
  {
    id: 'q053', sourceNums: [44], category: 'vachanakaras',
    question: 'ಅನ್ಯರನ್ನು ದೂಷಿಸಿದರೆ ಅಂತಹವರನ್ನು ಚನ್ನಮಲ್ಲಿಕಾರ್ಜುನ ಎಲ್ಲಿಗೆ ತಳ್ಳುತ್ತಾನೆ?',
    options: [opt('q053','A','ಸ್ವರ್ಗಕ್ಕೆ'), opt('q053','B','ಶ್ರಮಕ್ಕೆ'), opt('q053','C','ನರಕಕ್ಕೆ'), opt('q053','D','ಬಡತನಕ್ಕೆ')],
    correctOptionId: 'q053_c', verificationStatus: 'verified', tags: ['channamallikarjuna', 'hell'],
  },
  {
    id: 'q054', sourceNums: [45], category: 'vachanakaras',
    question: 'ಭಕ್ತರು ಯಾರ ದಾಸರಾಗಿರುತ್ತಾರೆ?',
    options: [opt('q054','A','ಶಿವನ'), opt('q054','B','ವಿಷ್ಣುವಿನ'), opt('q054','C','ಸರಸ್ವತಿಯ'), opt('q054','D','ಹರಿಯ')],
    correctOptionId: 'q054_a', verificationStatus: 'verified', tags: ['bhakta', 'shiva'],
  },
  {
    id: 'q055', sourceNums: [52], category: 'vachanakaras',
    question: 'ಅಲ್ಲಮಪ್ರಭುವಿನ ವಚನಗಳ ಅಂಕಿತ ಯಾವುದು?',
    options: [opt('q055','A','ಮಲ್ಲಿಕಾರ್ಜುನ'), opt('q055','B','ರಮಾನಾಥ'), opt('q055','C','ಗುಹೇಶ್ವರ'), opt('q055','D','ಮಾರಯ್ಯ ಲಿಂಗ')],
    correctOptionId: 'q055_c', verificationStatus: 'verified', tags: ['allama prabhu', 'guheshwara'],
  },
  {
    id: 'q056', sourceNums: [53], category: 'vachanakaras',
    question: 'ಅಳಿಮನದವನ ಭಕ್ತಿ ಎಂತಾಗುತ್ತದೆ?',
    options: [opt('q056','A','ಬರಿ ಗೋಣಿಯಂತೆ'), opt('q056','B','ಭತ್ತದಂತೆ'), opt('q056','C','ತುಂಬಿದ ಕೊಡದಂತೆ'), opt('q056','D','ಹಡಗಿನಂತೆ')],
    correctOptionId: 'q056_a', verificationStatus: 'verified', tags: ['alimana', 'empty sack'],
  },
  {
    id: 'q057', sourceNums: [59], category: 'vachanakaras',
    question: 'ಆಯ್ದಕ್ಕಿ ಲಕ್ಕಮ್ಮನ ಅಂಕಿತನಾಮ ಯಾವುದು?',
    options: [opt('q057','A','ಮಾರಯ್ಯಪ್ರಿಯ ಅಮರೇಶ್ವರ ಲಿಂಗ'), opt('q057','B','ಮಾರಯ್ಯ ಲಿಂಗ'), opt('q057','C','ರಾಮೇಶ್ವರ'), opt('q057','D','ಕೂಡಲಸಂಗಮ ದೇವ')],
    correctOptionId: 'q057_a', verificationStatus: 'verified', tags: ['aydakki lakkamma', 'ankita'],
  },
  {
    id: 'q058', sourceNums: [61, 76], category: 'vachanakaras',
    question: 'ಜೇಡರ ದಾಸಿಮಯ್ಯನ ವಚನಗಳ ಅಂಕಿತ ಯಾವುದು?',
    options: [opt('q058','A','ಕೂಡಲಸಂಗಮದೇವ'), opt('q058','B','ರಾಮನಾಥ'), opt('q058','C','ಚೆನ್ನ ಮಲ್ಲಿಕಾರ್ಜುನ'), opt('q058','D','ಅಮರೇಶ್ವರ ಲಿಂಗ')],
    correctOptionId: 'q058_b', verificationStatus: 'verified', tags: ['jedara dasimayya', 'ramanatha'],
  },
  {
    id: 'q059', sourceNums: [77], category: 'vachanakaras',
    question: 'ಕೆಳಗಿನವರಲ್ಲಿ ವಚನಕಾರರ ಹೆಸರನ್ನು ಗುರುತಿಸಿ?',
    options: [opt('q059','A','ಕುವೆಂಪು'), opt('q059','B','ದ. ರಾ. ಬೇಂದ್ರೆ'), opt('q059','C','ರನ್ನ'), opt('q059','D','ಬಸವಣ್ಣ')],
    correctOptionId: 'q059_d', verificationStatus: 'verified', tags: ['vachanakaras', 'basavanna'],
  },
  {
    id: 'q060', sourceNums: [79], category: 'vachanakaras',
    question: 'ಕರ್ನಾಟಕದಲ್ಲಿ ವಚನ ಚಳುವಳಿ ಎಷ್ಟನೇ ಶತಮಾನದಲ್ಲಿ ನಡೆಯಿತು?',
    options: [opt('q060','A','13'), opt('q060','B','22'), opt('q060','C','12'), opt('q060','D','14')],
    correctOptionId: 'q060_c', verificationStatus: 'verified', tags: ['vachana movement', '12th century'],
  },
  {
    id: 'q061', sourceNums: [80], category: 'vachanakaras',
    question: 'ಆಯ್ದಕ್ಕಿ ಮಾರಯ್ಯನ ವಚನಗಳ ಅಂಕಿತ ಯಾವುದು?',
    options: [opt('q061','A','ರಾಮನಾಥ'), opt('q061','B','ಅಮರೇಶ್ವರ ಲಿಂಗ'), opt('q061','C','ಗುಹೇಶ್ವರ'), opt('q061','D','ಚೆನ್ನ ಮಲ್ಲಿಕಾರ್ಜುನ')],
    correctOptionId: 'q061_b', verificationStatus: 'verified', tags: ['aydakki marayya', 'amareshwara linga'],
  },
  {
    id: 'q062', sourceNums: [86], category: 'vachanakaras',
    question: 'ಅವರವರ ಭಕುತಿಗೆ ಅವರವರ...?',
    options: [opt('q062','A','ಭಾವಕ್ಕೆ'), opt('q062','B','ಮನಸ್ಸಿಗೆ'), opt('q062','C','ಚಿಂತನೆಗೆ'), opt('q062','D','ದುಃಖಕ್ಕೆ')],
    correctOptionId: 'q062_a', verificationStatus: 'verified', tags: ['bhaktige bhavakke', 'vachana'],
  },
  {
    id: 'q063', sourceNums: [99], category: 'vachanakaras',
    question: 'ಬಸವಣ್ಣನ ವಚನಗಳ ಅಂಕಿತ ನಾಮ ಯಾವುದು?',
    options: [opt('q063','A','ರಾಮನಾಥ'), opt('q063','B','ಚೆನ್ನ ಮಲ್ಲಿಕಾರ್ಜುನ'), opt('q063','C','ಕೂಡಲಸಂಗಮದೇವ'), opt('q063','D','ಗುಹೇಶ್ವರ')],
    correctOptionId: 'q063_c', verificationStatus: 'verified', tags: ['basavanna', 'kudalasangamadeva'],
  },

  // CULTURAL CONCEPTS & METAPHORS
  {
    id: 'q064', sourceNums: [16], category: 'quick-facts',
    question: 'ಕುಂಬಾರಕಿ ಕೊಡಗಳನ್ನು ಎಲ್ಲಿ ಮಾರುತ್ತಾಳೆ?',
    options: [opt('q064','A','ಸಂತೆಯಲ್ಲಿ'), opt('q064','B','ಮರುಭೂಮಿಯಲ್ಲಿ'), opt('q064','C','ರಸ್ತೆಯಲ್ಲಿ'), opt('q064','D','ಹಳ್ಳಿಗಳಲ್ಲಿ')],
    correctOptionId: 'q064_a', verificationStatus: 'verified', tags: ['kumbaraki', 'market'],
  },
  {
    id: 'q065', sourceNums: [17], category: 'quick-facts',
    question: 'ಕೊಡಗಳನ್ನು ಸುಡಲು ಯಾವ ಬೆಂಕಿಯನ್ನು ಹಚ್ಚಬೇಕು?',
    options: [opt('q065','A','ಆಚಾರ'), opt('q065','B','ಅರಿವು'), opt('q065','C','ಜ್ಞಾನ'), opt('q065','D','ತಿಳುವಳಿಕೆ')],
    correctOptionId: 'q065_b', verificationStatus: 'verified', tags: ['arivu', 'metaphor'],
  },
  {
    id: 'q066', sourceNums: [18], category: 'quick-facts',
    question: 'ಭಕ್ತಿ ಚಕ್ರವನ್ನು ತಿರುಗಿಸಲು ಯಾವ ಬಡಗಿಯನ್ನು ಊರಬೇಕು?',
    options: [opt('q066','A','ಧ್ಯಾನ'), opt('q066','B','ಭಕ್ತಿ'), opt('q066','C','ಆಚಾರ'), opt('q066','D','ವಿಚಾರ')],
    correctOptionId: 'q066_a', verificationStatus: 'verified', tags: ['bhakti chakra', 'dhyana'],
  },
  {
    id: 'q067', sourceNums: [19], category: 'quick-facts',
    question: 'ಕುಂಬಾರಕಿ ಯಾವುದನ್ನು ತುಂಬಿಕೊಂಡಿರುವಿಕಿ?',
    options: [opt('q067','A','ಜಗತ್ತನ್ನು'), opt('q067','B','ಬ್ರಹ್ಮಾಂಡವನ್ನು'), opt('q067','C','ಸಮುದ್ರವನ್ನು'), opt('q067','D','ವಿಶ್ವವನ್ನು')],
    correctOptionId: 'q067_b', verificationStatus: 'verified', tags: ['kumbaraki', 'brahmanda'],
  },
  {
    id: 'q068', sourceNums: [20], category: 'quick-facts',
    question: 'ಕುಂಬಾರಕಿ ಕುಡಿಕೆ ಮತ್ತು ಗಡಿಗೆಗಳನ್ನು ಎಷ್ಟು ಕಾಸಿಗೆ ಮಾರುತ್ತಾಳೆ?',
    options: [opt('q068','A','ಏಳು ಮತ್ತು ಎಂಟು'), opt('q068','B','ಹತ್ತು ಮತ್ತು ಹದಿನೈದು'), opt('q068','C','ಮೂರು ಮತ್ತು ಆರು'), opt('q068','D','ಒಂದು ಮತ್ತು ಎರಡು')],
    correctOptionId: 'q068_d', verificationStatus: 'verified', tags: ['kumbaraki', 'kudike', 'price'],
  },
  {
    id: 'q069', sourceNums: [22, 65], category: 'quick-facts',
    question: 'ಕುಂಬಾರರ ಕಸಬು ಯಾವುದು?',
    options: [opt('q069','A','ಬಟ್ಟೆ ಹೊಲಿಯುವುದು'), opt('q069','B','ಮಡಿಕೆ ಮಾಡುವುದು'), opt('q069','C','ಮರ ಕಡಿಯುವುದು'), opt('q069','D','ಕೆತ್ತನೆ ಕೆಲಸ')],
    correctOptionId: 'q069_b', verificationStatus: 'verified', tags: ['kumbaara', 'pottery'],
  },
  {
    id: 'q070', sourceNums: [31, 91], category: 'quick-facts',
    question: 'ಎಲ್ಲಾ ಕಲೆಗಳ ಮೂಲ ಪ್ರೇರಣೆ ಯಾವುದು?',
    options: [opt('q070','A','ಧರ್ಮ'), opt('q070','B','ನ್ಯಾಯ'), opt('q070','C','ನೀತಿ'), opt('q070','D','ವಿಚಾರ')],
    correctOptionId: 'q070_a', verificationStatus: 'verified', tags: ['dharma', 'art'],
  },
  {
    id: 'q071', sourceNums: [34], category: 'quick-facts',
    question: 'ರಾಜ ಮಹಾರಾಜರು ಏನನ್ನು ಕಟ್ಟಿಸಿದರು?',
    options: [opt('q071','A','ದೇವಸ್ಥಾನ'), opt('q071','B','ಕಟ್ಟಡ'), opt('q071','C','ಶಾಲೆ'), opt('q071','D','ಮಹಲು')],
    correctOptionId: 'q071_a', verificationStatus: 'verified', tags: ['raja', 'temple'],
  },
  {
    id: 'q072', sourceNums: [38], category: 'quick-facts',
    question: 'ಸನಾತನವಾದವು ಯಾವುದರಂತೆ ಸ್ಥಿರವಾಗಿ ನಿಂತಿದೆ?',
    options: [opt('q072','A','ಕಟ್ಟಡದಂತೆ'), opt('q072','B','ಮಹಾವೃಕ್ಷದಂತೆ'), opt('q072','C','ಸಮುದ್ರದಂತೆ'), opt('q072','D','ಬೆಟ್ಟದಂತೆ')],
    correctOptionId: 'q072_b', verificationStatus: 'verified', tags: ['sanatanavaada', 'tree'],
  },
  {
    id: 'q073', sourceNums: [50], category: 'quick-facts',
    question: 'ಹರಿದ ಗೋಣಿಯಲ್ಲಿ ಏನನ್ನು ತುಂಬಿದರು ಫಲವಿಲ್ಲ?',
    options: [opt('q073','A','ಕಳವೆ (ಧಾನ್ಯ)'), opt('q073','B','ಮಣ್ಣು'), opt('q073','C','ನೀರು'), opt('q073','D','ಬೇಳೆ')],
    correctOptionId: 'q073_a', verificationStatus: 'verified', tags: ['torn sack', 'metaphor'],
  },
  {
    id: 'q074', sourceNums: [56], category: 'quick-facts',
    question: 'ಸಹಗಮನ ಮಾಡುವ ಸ್ತ್ರೀಯರು ಏನೆಂದು ಪ್ರಸಿದ್ಧರಾಗಿದ್ದರು?',
    options: [opt('q074','A','ಮಹಾಸತಿ'), opt('q074','B','ಒಳ್ಳೆಯ ಹೆಂಗಸು'), opt('q074','C','ಮಹಾಸ್ತ್ರಿ'), opt('q074','D','ಸತಿ')],
    correctOptionId: 'q074_a', verificationStatus: 'verified', tags: ['sahagamana', 'mahasati'],
  },
  {
    id: 'q075', sourceNums: [58], category: 'quick-facts',
    question: 'ಕರ್ನಾಟಕ ಸಂಸ್ಕೃತಿ ಅಳವಡಿಸಿಕೊಂಡಿರುವ ತತ್ವ ಯಾವುದು?',
    options: [opt('q075','A','ಸನಾತನ ತತ್ವ'), opt('q075','B','ಆಧುನಿಕತತ್ವ'), opt('q075','C','ಪರಂಪರೆ'), opt('q075','D','ಸಂಸ್ಕೃತಿ ತತ್ವ')],
    correctOptionId: 'q075_a', verificationStatus: 'verified', tags: ['karnataka culture', 'sanatana'],
  },
  {
    id: 'q076', sourceNums: [73], category: 'quick-facts',
    question: 'ಸಂಸ್ಕೃತಿ ವ್ಯಕ್ತಿ ವಾಚಕವಾದಂತೆ ಇನ್ನೇನಾಗಿದೆ?',
    options: [opt('q076','A','ಗುಣವಾಚಕ'), opt('q076','B','ದೇಶವಾಚಕ'), opt('q076','C','ಸಂಖ್ಯಾಬಾಚಕ'), opt('q076','D','ದಿಗ್ವಾಚಕ')],
    correctOptionId: 'q076_b', verificationStatus: 'verified', tags: ['sanskriti', 'deshavachaka'],
  },
  {
    id: 'q077', sourceNums: [78, 81], category: 'quick-facts',
    question: 'ಗೂಗೆ (ಗೂಬೆ) ಕಣ್ಣು ಕಾಣಲರಿಯದೆ ಯಾರನ್ನು ಬಯ್ಯುವುದು?',
    options: [opt('q077','A','ಸಮಾಜಕ್ಕೆ'), opt('q077','B','ಮನೆಗೆ'), opt('q077','C','ಸ್ನೇಹಿತರಿಗೆ'), opt('q077','D','ರವಿಯ (ಸೂರ್ಯನಿಗೆ)')],
    correctOptionId: 'q077_d', verificationStatus: 'verified', tags: ['owl', 'sun', 'proverb'],
  },
  {
    id: 'q078', sourceNums: [92], category: 'quick-facts',
    question: 'ಅಂಗಕ್ಕೆ ಬಡತನವಲ್ಲದೆ... ಬಡತನವುಂಟೆ?',
    options: [opt('q078','A','ಮನಕ್ಕೆ'), opt('q078','B','ದೇಹಕ್ಕೆ'), opt('q078','C','ಜೀವಕ್ಕೆ'), opt('q078','D','ಜ್ಞಾನಕ್ಕೆ')],
    correctOptionId: 'q078_a', verificationStatus: 'verified', tags: ['badatana', 'vachana'],
  },
  {
    id: 'q079', sourceNums: [96], category: 'quick-facts',
    question: 'ಸಂಸ್ಕೃತಿ ಎಂದರೆ ಏನು?',
    options: [
      opt('q079','A','ಪರಿಸರ ಪರಂಪರೆ ಪ್ರತ್ಯಕ್ಷ ಜೀವನದ ಮೂಲಕ ಪಡೆಯುವುದು'),
      opt('q079','B','ಪರಿಸರ ಪ್ರಕೃತಿ ಕಥೆಗಳನ್ನು ಓದಿ ಕಲಿಯುವುದು'),
      opt('q079','C','ಪ್ರತ್ಯಕ್ಷ ಜೀವನದ ಮೂಲಕ ಕಲಿಯುವುದು'),
      opt('q079','D','ಪರಂಪರೆಯಿಂದ ಪಡೆಯುವುದು'),
    ],
    correctOptionId: 'q079_a', verificationStatus: 'verified', tags: ['sanskriti', 'culture'],
  },
];

export function getQuestionById(id: string): Question | undefined {
  return QUESTIONS.find(q => q.id === id);
}

export function getQuestionsByCategory(category: Category): Question[] {
  return QUESTIONS.filter(q => q.category === category);
}

export function getCategoryMeta(id: Category): CategoryMeta {
  return CATEGORIES.find(c => c.id === id)!;
}

export function groupQuestionsIntoChunks(questions: Question[], chunkSize = 10): Question[][] {
  const chunks: Question[][] = [];
  for (let i = 0; i < questions.length; i += chunkSize) {
    chunks.push(questions.slice(i, i + chunkSize));
  }
  return chunks;
}

export const TOTAL_QUESTIONS = QUESTIONS.length;
export const UNVERIFIED_QUESTIONS = QUESTIONS.filter(q => q.verificationStatus !== 'verified').length;

export function getCategorySummary() {
  return CATEGORIES.map(cat => ({
    ...cat,
    count: QUESTIONS.filter(q => q.category === cat.id).length,
  }));
}

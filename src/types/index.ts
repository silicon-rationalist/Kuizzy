// ============================================================
// TYPE DEFINITIONS FOR ALL APP STATE
// ============================================================

export interface AttemptRecord {
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  attemptType: 'first' | 'revisit';
  timestamp: number;
  sessionId: string;
}

export type SessionMode = 'guess' | 'actual-test';
export type SessionStatus = 'in-progress' | 'completed' | 'abandoned';

export interface GuessSessionQuestion {
  questionId: string;
  firstAttemptOptionId: string | null;
  firstAttemptCorrect: boolean | null;
  revisitAttempts: Array<{
    optionId: string | null;
    isCorrect: boolean;
    attemptIndex: number; // 0-based count of revisit
  }>;
  revisitScheduledAfter: number | null; // index of question attempt after which to re-show
  revisitCount: number;
  status: 'pending' | 'answered' | 'revisit-pending' | 'mastered' | 'failed-revisit';
}

export interface GuessSession {
  id: string;
  mode: 'guess';
  startedAt: number;
  completedAt?: number;
  status: SessionStatus;
  questionPool: string[]; // ordered list of question IDs
  currentIndex: number;
  totalAttempts: number; // counts all answer submissions (including revisits)
  questions: Record<string, GuessSessionQuestion>;
  revisitQueue: string[]; // queue of questionIds scheduled for revisit
  timerEnabled?: boolean; // optional per-question countdown timer (default: false)
  timerDurationSec?: number; // 0 for off, or 10, 20, 30 seconds
}

export interface ActualTestQuestion {
  questionId: string;
  selectedOptionId: string | null;
}

export interface ActualTestSession {
  id: string;
  mode: 'actual-test';
  startedAt: number;
  completedAt?: number;
  status: SessionStatus;
  questionPool: string[]; // ordered list of question IDs for this test
  currentIndex: number;
  questions: Record<string, ActualTestQuestion>;
  shuffleOptions: boolean;
  optionOrders: Record<string, string[]>; // questionId -> shuffled option ID order
  submitted: boolean;
  timerSeconds: number; // elapsed seconds
  timerEnabled?: boolean; // optional per-question countdown timer (default: false)
  timerDurationSec?: number; // 0 for off, or 10, 20, 30 seconds
}

export interface TestResult {
  sessionId: string;
  mode: SessionMode;
  completedAt: number;
  totalQuestions: number;
  correctFirst: number; // first-attempt correct (guess) or correct (test)
  incorrect: number;
  unanswered: number;
  revisitCorrect?: number; // guess only
  revisitTotal?: number; // guess only
  accuracy: number; // percentage based on first attempt
  durationSeconds: number;
  categoryBreakdown: Record<string, { correct: number; total: number }>;
}

export interface ReviseItem {
  questionId: string;
  addedAt: number;
  source: 'guess' | 'actual-test';
  sessionId: string;
  mistakeCount: number;
  lastAttemptAt: number | null;
  lastAttemptCorrect: boolean | null;
  mastered: boolean;
  masteredAt?: number;
}

export interface AppPreferences {
  defaultSessionSize: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  lastCategoryFilter: string | null;
}

export interface StudyProgress {
  viewedQuestionIds: Set<string>; // We serialize this as array
}

export interface AppState {
  version: number;
  preferences: AppPreferences;
  reviseQueue: Record<string, ReviseItem>;
  testResults: TestResult[];
  activeGuessSession: GuessSession | null;
  activeTestSession: ActualTestSession | null;
  studyProgress: { viewedQuestionIds: string[] };
}

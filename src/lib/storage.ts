// ============================================================
// LOCAL STORAGE PERSISTENCE LAYER
// Version-aware, safe, and structured.
// ============================================================

import type {
  AppState,
  GuessSession,
  ActualTestSession,
  ReviseItem,
  TestResult,
  AppPreferences,
} from '../types';

const STORAGE_KEY = 'kuizzy_v1';
const CURRENT_VERSION = 1;

function defaultState(): AppState {
  return {
    version: CURRENT_VERSION,
    preferences: {
      defaultSessionSize: 20,
      shuffleQuestions: true,
      shuffleOptions: false,
      lastCategoryFilter: null,
    },
    reviseQueue: {},
    testResults: [],
    activeGuessSession: null,
    activeTestSession: null,
    studyProgress: { viewedQuestionIds: [] },
  };
}

function loadRaw(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.version || parsed.version !== CURRENT_VERSION) {
      // Future: migrate. For now, reset on version mismatch.
      console.warn('[Kuizzy] Data version mismatch, resetting storage.');
      return defaultState();
    }
    return parsed;
  } catch (e) {
    console.error('[Kuizzy] Failed to parse stored data, resetting.', e);
    return defaultState();
  }
}

function saveRaw(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('[Kuizzy] Failed to save state.', e);
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

export function loadState(): AppState {
  return loadRaw();
}

export function saveState(state: AppState): void {
  saveRaw(state);
}

export function getPreferences(): AppPreferences {
  return loadRaw().preferences;
}

export function savePreferences(prefs: Partial<AppPreferences>): void {
  const state = loadRaw();
  state.preferences = { ...state.preferences, ...prefs };
  saveRaw(state);
}

export function getReviseQueue(): Record<string, ReviseItem> {
  return loadRaw().reviseQueue;
}

export function saveReviseQueue(queue: Record<string, ReviseItem>): void {
  const state = loadRaw();
  state.reviseQueue = queue;
  saveRaw(state);
}

export function addToReviseQueue(
  questionId: string,
  source: 'guess' | 'actual-test',
  sessionId: string
): void {
  const state = loadRaw();
  const existing = state.reviseQueue[questionId];
  if (existing && !existing.mastered) {
    // Already in queue, increment mistake count
    state.reviseQueue[questionId] = {
      ...existing,
      mistakeCount: existing.mistakeCount + 1,
      lastAttemptAt: Date.now(),
    };
  } else if (!existing || existing.mastered) {
    state.reviseQueue[questionId] = {
      questionId,
      addedAt: Date.now(),
      source,
      sessionId,
      mistakeCount: 1,
      lastAttemptAt: null,
      lastAttemptCorrect: null,
      mastered: false,
    };
  }
  saveRaw(state);
}

export function markReviseAttempt(
  questionId: string,
  isCorrect: boolean
): void {
  const state = loadRaw();
  if (state.reviseQueue[questionId]) {
    state.reviseQueue[questionId] = {
      ...state.reviseQueue[questionId],
      lastAttemptAt: Date.now(),
      lastAttemptCorrect: isCorrect,
      mistakeCount: isCorrect
        ? state.reviseQueue[questionId].mistakeCount
        : state.reviseQueue[questionId].mistakeCount + 1,
    };
    saveRaw(state);
  }
}

export function markReviseMastered(questionId: string): void {
  const state = loadRaw();
  if (state.reviseQueue[questionId]) {
    state.reviseQueue[questionId] = {
      ...state.reviseQueue[questionId],
      mastered: true,
      masteredAt: Date.now(),
    };
    saveRaw(state);
  }
}

export function removeFromReviseQueue(questionId: string): void {
  const state = loadRaw();
  delete state.reviseQueue[questionId];
  saveRaw(state);
}

export function getActiveGuessSession(): GuessSession | null {
  return loadRaw().activeGuessSession;
}

export function saveGuessSession(session: GuessSession | null): void {
  const state = loadRaw();
  state.activeGuessSession = session;
  saveRaw(state);
}

export function getActiveTestSession(): ActualTestSession | null {
  return loadRaw().activeTestSession;
}

export function saveTestSession(session: ActualTestSession | null): void {
  const state = loadRaw();
  state.activeTestSession = session;
  saveRaw(state);
}

export function addTestResult(result: TestResult): void {
  const state = loadRaw();
  state.testResults = [result, ...state.testResults].slice(0, 50); // keep last 50
  saveRaw(state);
}

export function getTestResults(): TestResult[] {
  return loadRaw().testResults;
}

export function markStudyViewed(questionId: string): void {
  const state = loadRaw();
  if (!state.studyProgress.viewedQuestionIds.includes(questionId)) {
    state.studyProgress.viewedQuestionIds.push(questionId);
    saveRaw(state);
  }
}

export function getStudyProgress(): { viewedQuestionIds: string[] } {
  return loadRaw().studyProgress;
}

export function exportData(): string {
  return JSON.stringify(loadRaw(), null, 2);
}

export function importData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr) as AppState;
    if (!data.version) throw new Error('Invalid data');
    saveRaw(data);
    return true;
  } catch {
    return false;
  }
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

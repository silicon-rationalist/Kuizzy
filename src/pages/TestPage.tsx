import { useState, useEffect, useRef, useCallback } from 'react';
import {
  QUESTIONS,
  CATEGORIES,
  getQuestionsByCategory,
} from '../data/questions';
import type { Category } from '../data/questions';
import type {
  GuessSession,
  ActualTestSession,
  TestResult,
  GuessSessionQuestion,
} from '../types';
import { shuffle, uid, formatTime } from '../lib/utils';
import {
  saveGuessSession, getActiveGuessSession,
  saveTestSession, getActiveTestSession,
  addTestResult, addToReviseQueue,
} from '../lib/storage';
import { QuestionTimer } from '../components/QuestionTimer';

// ── CONFIGURABLE TIMING CONSTANTS (Section 2 & 3) ─────────────────────────
const FEEDBACK_DELAY_CORRECT_MS = 800;
const FEEDBACK_DELAY_INCORRECT_MS = 1500;
const TEST_AUTO_ADVANCE_DELAY_MS = 300;
const REVISIT_MAX_COUNT = 2;

// ── SESSION BUILDERS (Randomized by default, Section 5) ───────────────────
function createGuessSession(selectedQuestionIds: string[], timerDurationSec: number = 0): GuessSession {
  // Canonical questions are shuffled automatically at session start
  const shuffledIds = shuffle([...selectedQuestionIds]);
  const questions: Record<string, GuessSessionQuestion> = {};

  for (const id of shuffledIds) {
    questions[id] = {
      questionId: id,
      firstAttemptOptionId: null,
      firstAttemptCorrect: null,
      revisitAttempts: [],
      revisitScheduledAfter: null,
      revisitCount: 0,
      status: 'pending',
    };
  }

  return {
    id: uid(),
    mode: 'guess',
    startedAt: Date.now(),
    status: 'in-progress',
    questionPool: shuffledIds,
    currentIndex: 0,
    totalAttempts: 0,
    questions,
    revisitQueue: [],
    timerEnabled: timerDurationSec > 0,
    timerDurationSec,
  };
}

function createTestSession(selectedQuestionIds: string[], timerDurationSec: number = 0): ActualTestSession {
  // Canonical questions are shuffled automatically at session start
  const shuffledIds = shuffle([...selectedQuestionIds]);
  const questions: Record<string, { questionId: string; selectedOptionId: string | null }> = {};
  const optionOrders: Record<string, string[]> = {};

  for (const id of shuffledIds) {
    questions[id] = { questionId: id, selectedOptionId: null };
    const q = QUESTIONS.find(x => x.id === id);
    if (q) {
      optionOrders[id] = q.options.map(o => o.id);
    }
  }

  return {
    id: uid(),
    mode: 'actual-test',
    startedAt: Date.now(),
    status: 'in-progress',
    questionPool: shuffledIds,
    currentIndex: 0,
    questions,
    shuffleOptions: false,
    optionOrders,
    submitted: false,
    timerSeconds: 0,
    timerEnabled: timerDurationSec > 0,
    timerDurationSec,
  };
}

// ── SETUP SCREEN (Section 8) ──────────────────────────────────────────────
interface SetupScreenProps {
  onStartGuess: (s: GuessSession) => void;
  onStartTest: (s: ActualTestSession) => void;
  onResume: () => void;
  onDiscardSession: () => void;
  activeGuess: GuessSession | null;
  activeTest: ActualTestSession | null;
}

function SetupScreen({
  onStartGuess,
  onStartTest,
  onResume,
  onDiscardSession,
  activeGuess,
  activeTest,
}: SetupScreenProps) {
  const [mode, setMode] = useState<'guess' | 'actual-test'>('guess');
  const [sourceCategory, setSourceCategory] = useState<'all' | Category>('all');
  const [countPreset, setCountPreset] = useState<'5' | '10' | 'all' | 'custom'>('5');
  const [customCount, setCustomCount] = useState<number>(5);
  const [timerOption, setTimerOption] = useState<'off' | '10' | '20' | '30'>('off');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    }
    if (categoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [categoryDropdownOpen]);

  const pool = sourceCategory === 'all'
    ? QUESTIONS.map(q => q.id)
    : getQuestionsByCategory(sourceCategory as Category).map(q => q.id);

  const availableCount = pool.length;

  const handleSelectSource = (cat: 'all' | Category) => {
    setSourceCategory(cat);
    setCategoryDropdownOpen(false);
    const newPool = cat === 'all'
      ? QUESTIONS.map(q => q.id)
      : getQuestionsByCategory(cat as Category).map(q => q.id);
    const avail = newPool.length;

    // Automatically redirect to the best option (5, 10, all, custom)
    if (avail < 5) {
      setCountPreset('all');
    } else if (countPreset === '10' && avail < 10) {
      setCountPreset('5');
    } else if (countPreset === 'custom' && customCount > avail) {
      setCustomCount(Math.min(5, avail));
    }
  };

  const requestedCount = countPreset === '5'
    ? 5
    : countPreset === '10'
    ? 10
    : countPreset === 'all'
    ? availableCount
    : Math.max(1, customCount);

  // Ensure effective count never exceeds available unique questions
  const effectiveCount = Math.min(requestedCount, availableCount);
  const isCapped = availableCount < requestedCount && countPreset !== 'all';

  function handleStart() {
    // Pick unique randomized questions from pool
    const shuffledPool = shuffle([...pool]);
    const chosen = shuffledPool.slice(0, effectiveCount);
    const timerDurationSec = timerOption === 'off' ? 0 : parseInt(timerOption, 10);

    if (mode === 'guess') {
      const session = createGuessSession(chosen, timerDurationSec);
      saveGuessSession(session);
      onStartGuess(session);
    } else {
      const session = createTestSession(chosen, timerDurationSec);
      saveTestSession(session);
      onStartTest(session);
    }
  }

  const unfinishedSession = activeGuess || activeTest;
  const unfinishedMode = activeGuess ? 'Smart Play' : 'Actual Test';
  const unfinishedProgress = activeGuess
    ? `${Object.values(activeGuess.questions).filter(q => q.status !== 'pending').length} of ${activeGuess.questionPool.length}`
    : activeTest
    ? `${Object.values(activeTest.questions).filter(q => q.selectedOptionId !== null).length} of ${activeTest.questionPool.length}`
    : '';

  const currentSourceLabel = sourceCategory === 'all'
    ? `All Questions (${QUESTIONS.length})`
    : `${CATEGORIES.find(c => c.id === sourceCategory)?.labelKn || 'Category'} (${availableCount})`;

  return (
    <div className="page setup-container animate-fade">
      <div className="page-header">
        <h1 className="page-title">Practice Setup</h1>
        <p className="page-subtitle">Configure your Kannada exam practice session</p>
      </div>

      {/* Compact Dismissible Resume Banner (Section 8) */}
      {unfinishedSession && (
        <div className="resume-banner animate-slide" role="alert">
          <div className="resume-banner-info">
            <span className="resume-banner-tag">Unfinished Session</span>
            <span className="resume-banner-details">
              {unfinishedMode} · {unfinishedProgress} answered
            </span>
          </div>
          <div className="resume-banner-actions">
            <button
              id="btn-resume-session"
              type="button"
              className="btn btn-sm btn-primary"
              onClick={onResume}
            >
              Resume
            </button>
            <button
              id="btn-discard-session"
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={onDiscardSession}
              title="Discard unfinished session"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Mode Selection */}
      <div className="section-label mb-2">Step 01 · Select Mode</div>
      <div className="grid-2 gap-3 mb-4">
        <button
          id="mode-card-guess"
          type="button"
          className={`mode-card${mode === 'guess' ? ' selected' : ''}`}
          onClick={() => setMode('guess')}
        >
          <div className="mode-card-label">Mode 01 · Recommended</div>
          <div className="mode-card-title">Smart Play</div>
          <div className="mode-card-desc">Practice with immediate answers and automatic delayed retry.</div>
        </button>

        <button
          id="mode-card-actual-test"
          type="button"
          className={`mode-card${mode === 'actual-test' ? ' selected' : ''}`}
          onClick={() => setMode('actual-test')}
        >
          <div className="mode-card-label">Mode 02 · Exam Simulation</div>
          <div className="mode-card-title">Actual Test</div>
          <div className="mode-card-desc">Exam mode where answers are revealed only after submission.</div>
        </button>
      </div>

      {/* Step 2: Configure Session */}
      <div className="section-label mb-2">Step 02 · Session Settings</div>
      <div className="card mb-4" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Question Source Dropdown */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-secondary" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Question Source</span>
            <span className="font-mono text-xs text-muted">{availableCount} Available</span>
          </div>
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              id="btn-select-source"
              type="button"
              className="study-category-picker-btn w-full"
              style={{ justifyContent: 'space-between' }}
              onClick={() => setCategoryDropdownOpen(o => !o)}
              aria-expanded={categoryDropdownOpen}
            >
              <span className="font-mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {currentSourceLabel}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {categoryDropdownOpen ? '▲' : '▼'}
              </span>
            </button>

            {categoryDropdownOpen && (
              <div className="study-category-dropdown w-full" style={{ width: '100%' }}>
                <button
                  type="button"
                  id="source-all"
                  className={`study-category-option${sourceCategory === 'all' ? ' selected' : ''}`}
                  onClick={() => handleSelectSource('all')}
                >
                  <span>All Questions</span>
                  <span className="font-mono text-muted">{QUESTIONS.length}</span>
                </button>
                <div className="divider" style={{ margin: '4px 0' }} />
                {CATEGORIES.map(cat => {
                  const count = getQuestionsByCategory(cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      id={`source-${cat.id}`}
                      className={`study-category-option${sourceCategory === cat.id ? ' selected' : ''}`}
                      onClick={() => handleSelectSource(cat.id)}
                    >
                      <span className="kn" style={{ fontSize: '0.85rem' }}>{cat.labelKn}</span>
                      <span className="font-mono text-muted">{count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Number of Questions: 5, 10, ALL, CUSTOM */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-secondary" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Number of Questions</span>
            <span className="font-mono text-xs" style={{ color: 'var(--accent)' }}>{effectiveCount} Questions Selected</span>
          </div>
          <div className="segmented-control" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <button
              id="segmented-count-5"
              type="button"
              className={`segmented-btn${countPreset === '5' ? ' active' : ''}`}
              onClick={() => setCountPreset('5')}
              disabled={availableCount < 5}
            >
              5
            </button>
            <button
              id="segmented-count-10"
              type="button"
              className={`segmented-btn${countPreset === '10' ? ' active' : ''}`}
              onClick={() => setCountPreset('10')}
              disabled={availableCount < 10}
            >
              10
            </button>
            <button
              id="segmented-count-all"
              type="button"
              className={`segmented-btn${countPreset === 'all' ? ' active' : ''}`}
              onClick={() => setCountPreset('all')}
            >
              ALL ({availableCount})
            </button>
            <button
              id="segmented-count-custom"
              type="button"
              className={`segmented-btn${countPreset === 'custom' ? ' active' : ''}`}
              onClick={() => setCountPreset('custom')}
            >
              CUSTOM
            </button>
          </div>

          {countPreset === 'custom' && (
            <div className="flex items-center justify-between gap-3 mt-3 animate-fade" style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <span className="font-mono text-xs text-secondary">Custom count (1 - {availableCount}):</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  style={{ width: 28, height: 28, padding: 0 }}
                  onClick={() => setCustomCount(c => Math.max(1, c - 5))}
                  disabled={customCount <= 1}
                >
                  -5
                </button>
                <input
                  id="custom-count-input"
                  type="number"
                  min={1}
                  max={availableCount}
                  value={customCount}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10);
                    setCustomCount(isNaN(val) ? 1 : Math.max(1, Math.min(availableCount, val)));
                  }}
                  className="search-input"
                  style={{ width: 68, textAlign: 'center', fontFamily: 'var(--font-mono)', padding: '4px 6px', minHeight: 30 }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  style={{ width: 28, height: 28, padding: 0 }}
                  onClick={() => setCustomCount(c => Math.min(availableCount, c + 5))}
                  disabled={customCount >= availableCount}
                >
                  +5
                </button>
              </div>
            </div>
          )}

          {isCapped && (
            <div className="mt-2 text-xs font-mono animate-fade" style={{ color: 'var(--warning)', padding: '6px 10px', background: 'rgba(255, 157, 46, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 157, 46, 0.25)' }}>
              Notice: Category contains {availableCount} questions. All {effectiveCount} available unique questions will be used.
            </div>
          )}
        </div>

        {/* Step 2b: Question Timer Setting (Configurable: Off, 10s, 20s, 30s) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-secondary" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Question Timer (Configurable)
            </span>
            <span className="font-mono text-xs" style={{ color: timerOption === 'off' ? 'var(--text-muted)' : 'var(--accent)' }}>
              {timerOption === 'off' ? 'Off (No Timer - Default)' : `${timerOption}s Per Question`}
            </span>
          </div>
          <div className="segmented-control" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <button
              id="segmented-timer-off"
              type="button"
              className={`segmented-btn${timerOption === 'off' ? ' active' : ''}`}
              onClick={() => setTimerOption('off')}
            >
              OFF
            </button>
            <button
              id="segmented-timer-10"
              type="button"
              className={`segmented-btn${timerOption === '10' ? ' active' : ''}`}
              onClick={() => setTimerOption('10')}
            >
              10s
            </button>
            <button
              id="segmented-timer-20"
              type="button"
              className={`segmented-btn${timerOption === '20' ? ' active' : ''}`}
              onClick={() => setTimerOption('20')}
            >
              20s
            </button>
            <button
              id="segmented-timer-30"
              type="button"
              className={`segmented-btn${timerOption === '30' ? ' active' : ''}`}
              onClick={() => setTimerOption('30')}
            >
              30s
            </button>
          </div>
        </div>
      </div>

      {/* Step 3: Test Button & Configurable Timer Options */}
      <div className="flex flex-col gap-2">
        <div
          className="timer-prefixed-bar"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            padding: '12px 14px',
            background: 'var(--bg-card)',
            border: `1px solid ${timerOption === 'off' ? 'var(--border)' : 'var(--accent-border)'}`,
            borderRadius: 'var(--radius)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold flex items-center gap-2" style={{ color: timerOption === 'off' ? 'var(--text-primary)' : 'var(--accent)' }}>
              <span>{timerOption === 'off' ? '⏳' : '⏱️'}</span>
              <span>TIMER: {timerOption === 'off' ? 'OFF (NO TIMER)' : `${timerOption} SECONDS PER QUESTION`}</span>
            </span>
            <span className="font-mono text-xs text-muted" style={{ fontSize: '0.72rem' }}>
              {timerOption === 'off' ? 'Default · Untimed' : 'Fixed during test'}
            </span>
          </div>

          <div className="segmented-control" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <button
              id="btn-timer-opt-off"
              type="button"
              className={`segmented-btn${timerOption === 'off' ? ' active' : ''}`}
              onClick={() => setTimerOption('off')}
            >
              OFF
            </button>
            <button
              id="btn-timer-opt-10"
              type="button"
              className={`segmented-btn${timerOption === '10' ? ' active' : ''}`}
              onClick={() => setTimerOption('10')}
            >
              10s
            </button>
            <button
              id="btn-timer-opt-20"
              type="button"
              className={`segmented-btn${timerOption === '20' ? ' active' : ''}`}
              onClick={() => setTimerOption('20')}
            >
              20s
            </button>
            <button
              id="btn-timer-opt-30"
              type="button"
              className={`segmented-btn${timerOption === '30' ? ' active' : ''}`}
              onClick={() => setTimerOption('30')}
            >
              30s
            </button>
          </div>
        </div>

        <button
          id="btn-start-session"
          type="button"
          className="btn btn-primary btn-full btn-lg"
          onClick={handleStart}
          disabled={effectiveCount === 0}
        >
          {mode === 'guess' ? 'START SMART PLAY' : 'START TEST'} · {effectiveCount} QUESTIONS · {timerOption === 'off' ? 'NO TIMER' : `⏱ ${timerOption}S`}
        </button>
      </div>
    </div>
  );
}

// ── GUESS MODE (Section 2, 3, 4) ──────────────────────────────────────────
interface GuessModeProps {
  session: GuessSession;
  onSessionUpdate: (s: GuessSession) => void;
  onFinish: (results: SessionResults) => void;
  onExit: () => void;
}

interface SessionResults {
  mode: 'guess' | 'actual-test';
  session: GuessSession | ActualTestSession;
}

function GuessMode({ session, onSessionUpdate, onFinish, onExit }: GuessModeProps) {
  const sessionRef = useRef<GuessSession>(session);
  const timerDurationSec = session.timerDurationSec || 0;
  const [currentQId, setCurrentQId] = useState<string>(() => {
    return session.questionPool[session.currentIndex] || session.questionPool[0];
  });
  const currentQIdRef = useRef<string>(currentQId);
  useEffect(() => {
    currentQIdRef.current = currentQId;
  }, [currentQId]);

  // Interaction feedback state
  const [selectedOptId, setSelectedOptId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const isLockedRef = useRef(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'correct' | 'incorrect' | 'timeout'>('idle');
  const [calmNote, setCalmNote] = useState<string | null>(null);
  const lastAttemptWasRevisitRef = useRef<boolean>(false);

  function getQuestion(qid: string) {
    return QUESTIONS.find(q => q.id === qid)!;
  }

  // Determine next question using intelligent delayed revisit interleaving (Section 4)
  const pickNextQuestion = useCallback((sess: GuessSession): string | 'done' => {
    // 1. Check for due revisits: scheduledAfter <= totalAttempts
    const dueRevisits = sess.revisitQueue.filter(qid => {
      const qState = sess.questions[qid];
      return qState && qState.revisitScheduledAfter !== null && sess.totalAttempts >= qState.revisitScheduledAfter;
    });

    const hasUnseenOriginals = sess.currentIndex < sess.questionPool.length;

    // Intelligent mixing (Section 4):
    // Interleave revisits with unseen questions wherever possible
    if (dueRevisits.length > 0) {
      if (lastAttemptWasRevisitRef.current && hasUnseenOriginals) {
        // Switch to unseen original to prevent consecutive repeats
        return sess.questionPool[sess.currentIndex];
      }
      return dueRevisits[0];
    }

    // 2. Otherwise present next unseen original question
    if (hasUnseenOriginals) {
      return sess.questionPool[sess.currentIndex];
    }

    // 3. Sensible end-of-session fallback: resolve any remaining revisits without infinite loop
    if (sess.revisitQueue.length > 0) {
      return sess.revisitQueue[0];
    }

    return 'done';
  }, []);

  // Answer handler
  const processAnswer = useCallback((chosenOptionId: string | null, isTimeout: boolean) => {
    const qid = currentQIdRef.current;
    const question = getQuestion(qid);
    if (!question) return;

    const isCorrect = !isTimeout && chosenOptionId === question.correctOptionId;
    setSelectedOptId(chosenOptionId);

    const qState = sessionRef.current.questions[qid] || {
      questionId: qid,
      firstAttemptOptionId: null,
      firstAttemptCorrect: null,
      revisitAttempts: [],
      revisitScheduledAfter: null,
      revisitCount: 0,
      status: 'pending',
    };

    const isRevisit = qState.status === 'revisit-pending' || qState.revisitAttempts.length > 0;
    lastAttemptWasRevisitRef.current = isRevisit;

    let updatedSess: GuessSession = { ...sessionRef.current };
    let updatedQ = { ...qState };
    updatedSess.totalAttempts++;

    let showCalmMsg = false;

    if (!isRevisit) {
      // First attempt on this question
      updatedQ.firstAttemptOptionId = chosenOptionId;
      updatedQ.firstAttemptCorrect = isCorrect;

      if (isCorrect) {
        updatedQ.status = 'mastered';
        updatedSess.revisitQueue = updatedSess.revisitQueue.filter(x => x !== qid);
      } else {
        // Missed first attempt: schedule delayed revisit (4-5 intervening attempts)
        const delay = 4 + (Math.random() < 0.5 ? 0 : 1);
        updatedQ.revisitCount = 1;
        updatedQ.revisitScheduledAfter = updatedSess.totalAttempts + delay;
        updatedQ.status = 'revisit-pending';
        updatedSess.revisitQueue = [...updatedSess.revisitQueue.filter(x => x !== qid), qid];
      }

      // Progress canonical question pool index if this was the current pool item
      if (updatedSess.questionPool[updatedSess.currentIndex] === qid) {
        updatedSess.currentIndex = Math.min(
          updatedSess.questionPool.length,
          updatedSess.currentIndex + 1
        );
      }
    } else {
      // Revisit attempt
      const attemptIdx = updatedQ.revisitAttempts.length;
      updatedQ.revisitAttempts = [
        ...updatedQ.revisitAttempts,
        { optionId: chosenOptionId, isCorrect, attemptIndex: attemptIdx }
      ];

      if (isCorrect) {
        updatedQ.status = 'mastered';
        updatedSess.revisitQueue = updatedSess.revisitQueue.filter(x => x !== qid);
      } else if (updatedQ.revisitCount < REVISIT_MAX_COUNT) {
        // Missed revisit 1: schedule another delayed revisit
        const delay = 4 + (Math.random() < 0.5 ? 0 : 1);
        updatedQ.revisitCount++;
        updatedQ.revisitScheduledAfter = updatedSess.totalAttempts + delay;
        updatedSess.revisitQueue = [
          ...updatedSess.revisitQueue.filter(x => x !== qid),
          qid,
        ];
      } else {
        // Missed 2 revisits: temporarily stop repeating within current session (Section 4)
        updatedQ.status = 'failed-revisit';
        updatedSess.revisitQueue = updatedSess.revisitQueue.filter(x => x !== qid);
        addToReviseQueue(qid, 'guess', updatedSess.id);
        showCalmMsg = true;
      }
    }

    updatedSess.questions = { ...updatedSess.questions, [qid]: updatedQ };
    sessionRef.current = updatedSess;
    saveGuessSession(updatedSess);
    onSessionUpdate(updatedSess);

    if (isTimeout) {
      setFeedbackStatus('timeout');
    } else if (isCorrect) {
      setFeedbackStatus('correct');
    } else {
      setFeedbackStatus('incorrect');
    }

    if (showCalmMsg) {
      setCalmNote("We'll revisit this one later.");
    } else {
      setCalmNote(null);
    }

    // Configurable transition timing (Section 2)
    const delayMs = isCorrect ? FEEDBACK_DELAY_CORRECT_MS : FEEDBACK_DELAY_INCORRECT_MS;

    setTimeout(() => {
      // Guard against stale callback if question shifted
      if (currentQIdRef.current !== qid) return;

      const next = pickNextQuestion(sessionRef.current);
      if (next === 'done') {
        const completed: GuessSession = {
          ...sessionRef.current,
          status: 'completed',
          completedAt: Date.now(),
        };
        saveGuessSession(null); // Clear active session on finish
        // Save any unresolved missed questions to persistent Revise queue
        Object.values(completed.questions).forEach(q => {
          if (q.status === 'failed-revisit' || (!q.firstAttemptCorrect && q.status !== 'mastered')) {
            addToReviseQueue(q.questionId, 'guess', completed.id);
          }
        });
        onFinish({ mode: 'guess', session: completed });
      } else {
        setCurrentQId(next);
        currentQIdRef.current = next;
        setSelectedOptId(null);
        isLockedRef.current = false;
        setIsLocked(false);
        setFeedbackStatus('idle');
        setCalmNote(null);
      }
    }, delayMs);
  }, [onFinish, onSessionUpdate, pickNextQuestion]);

  const handleSelectOption = useCallback((optId: string) => {
    if (isLockedRef.current) return;
    isLockedRef.current = true;
    setIsLocked(true);
    processAnswer(optId, false);
  }, [processAnswer]);

  const handleTimeout = useCallback(() => {
    if (isLockedRef.current) return;
    isLockedRef.current = true;
    setIsLocked(true);
    processAnswer(null, true);
  }, [processAnswer]);

  // Keyboard navigation for A, B, C, D and 1, 2, 3, 4
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isLockedRef.current) return;
      const key = e.key.toUpperCase();
      const currentQ = getQuestion(currentQIdRef.current);
      if (!currentQ) return;
      let targetIdx = -1;
      if (key === '1' || key === 'A') targetIdx = 0;
      else if (key === '2' || key === 'B') targetIdx = 1;
      else if (key === '3' || key === 'C') targetIdx = 2;
      else if (key === '4' || key === 'D') targetIdx = 3;

      if (targetIdx >= 0 && targetIdx < currentQ.options.length) {
        e.preventDefault();
        handleSelectOption(currentQ.options[targetIdx].id);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectOption]);

  const currentQ = getQuestion(currentQId);
  const totalOriginal = session.questionPool.length;
  // Progress counter: number of original questions completed or in progress
  const displayNum = Math.min(
    totalOriginal,
    Object.values(session.questions).filter(q => q.firstAttemptOptionId !== null).length + (isLocked ? 0 : 1)
  );

  return (
    <div className="guess-container animate-fade">
      {/* Top Bar: Wordmark and Exit (Section 2) */}
      <div className="guess-top-bar">
        <div className="guess-wordmark">
          <span>KANNADA</span> QUEST
        </div>
        <button
          id="btn-guess-exit"
          type="button"
          className="guess-exit-btn"
          onClick={onExit}
        >
          EXIT
        </button>
      </div>

      {/* Meta Row: SMART MODE and 07 / 20 */}
      <div className="guess-meta-row">
        <div className="guess-mode-label">
          <span>SMART PLAY</span>
        </div>
        <div className="guess-counter font-mono">
          <span className="current-num">{String(displayNum).padStart(2, '0')}</span> / {String(totalOriginal).padStart(2, '0')}
        </div>
      </div>

      {/* Per-Question Countdown Timer (prefixed before starting exam) */}
      {timerDurationSec > 0 && (
        <QuestionTimer
          durationSec={timerDurationSec}
          questionKey={currentQId}
          isRunning={!isLocked}
          onTimeout={handleTimeout}
        />
      )}

      {/* Kannada Question Text (Section 2) */}
      <div className="guess-question-area question-anim-enter" key={currentQId}>
        <p className="guess-question-text">{currentQ.question}</p>

        {/* 4 Options Grid with Monospace Badges */}
        <div className="guess-options-grid">
          {currentQ.options.map(opt => {
            const isCorrectAnswer = opt.id === currentQ.correctOptionId;
            const isUserSelection = opt.id === selectedOptId;

            let optClass = '';
            if (isLocked) {
              if (isCorrectAnswer) {
                optClass = ' is-correct';
              } else if (isUserSelection && !isCorrectAnswer) {
                optClass = ' is-incorrect';
              } else {
                optClass = ' is-dimmed';
              }
            } else if (isUserSelection) {
              optClass = ' is-selected';
            }

            return (
              <button
                key={opt.id}
                id={`guess-opt-${opt.id}`}
                type="button"
                className={`guess-option-btn${optClass}`}
                onClick={() => handleSelectOption(opt.id)}
                disabled={isLocked}
              >
                <span className="guess-opt-badge">{opt.label}</span>
                <span className="guess-opt-text">{opt.text}</span>
                {isLocked && isCorrectAnswer && (
                  <span className="guess-opt-indicator is-correct" aria-hidden="true">✓</span>
                )}
                {isLocked && isUserSelection && !isCorrectAnswer && (
                  <span className="guess-opt-indicator is-incorrect" aria-hidden="true">✗</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Minimal Feedback Status (Section 2 & 4) */}
        <div className="guess-feedback-status">
          {feedbackStatus === 'correct' && (
            <span className="status-correct">✓ CORRECT</span>
          )}
          {feedbackStatus === 'incorrect' && (
            <span className="status-incorrect">✗ INCORRECT</span>
          )}
          {feedbackStatus === 'timeout' && (
            <span className="status-incorrect">⏱ TIME EXPIRED</span>
          )}
          {calmNote && (
            <span className="status-calm-note">{calmNote}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── ACTUAL TEST MODE (Section 6) ──────────────────────────────────────────
interface TestModeProps {
  session: ActualTestSession;
  onSessionUpdate: (s: ActualTestSession) => void;
  onFinish: (results: SessionResults) => void;
  onExit: () => void;
}

function TestMode({ session, onSessionUpdate, onFinish, onExit }: TestModeProps) {
  const sessionRef = useRef<ActualTestSession>(session);
  const [localSession, setLocalSession] = useState<ActualTestSession>(session);
  const timerDurationSec = session.timerDurationSec || 0;
  const [showOverview, setShowOverview] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(session.timerSeconds || 0);

  // Atomic lock for answer capture and timer timeout
  const [isLocked, setIsLocked] = useState(false);
  const isLockedRef = useRef(false);

  // Overall test timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds(s => {
        const next = s + 1;
        sessionRef.current = { ...sessionRef.current, timerSeconds: next };
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const saveLocal = useCallback((s: ActualTestSession) => {
    sessionRef.current = s;
    setLocalSession(s);
    saveTestSession(s);
    onSessionUpdate(s);
  }, [onSessionUpdate]);

  const currentQId = localSession.questionPool[localSession.currentIndex];
  const currentQ = QUESTIONS.find(q => q.id === currentQId)!;
  const currentOptionOrder = localSession.optionOrders[currentQId] || currentQ.options.map(o => o.id);
  const currentSelected = localSession.questions[currentQId]?.selectedOptionId ?? null;

  const answeredCount = Object.values(localSession.questions).filter(q => q.selectedOptionId !== null).length;
  const totalCount = localSession.questionPool.length;
  const unansweredCount = totalCount - answeredCount;
  const progressPct = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;
  const isLastQuestion = localSession.currentIndex === totalCount - 1;

  // Answer selection in Test Mode (Section 3 & 5)
  const handleSelectOption = useCallback((questionId: string, optionId: string) => {
    if (isLockedRef.current) return;
    isLockedRef.current = true;
    setIsLocked(true);

    const updated = {
      ...sessionRef.current,
      questions: {
        ...sessionRef.current.questions,
        [questionId]: { questionId, selectedOptionId: optionId },
      },
    };
    saveLocal(updated);

    // Auto-advance after 300ms
    setTimeout(() => {
      if (sessionRef.current.currentIndex < sessionRef.current.questionPool.length - 1) {
        const nextIdx = sessionRef.current.currentIndex + 1;
        saveLocal({ ...sessionRef.current, currentIndex: nextIdx });
      }
      isLockedRef.current = false;
      setIsLocked(false);
    }, TEST_AUTO_ADVANCE_DELAY_MS);
  }, [saveLocal]);

  // Per-question 20s timeout in Test Mode (Section 5)
  const handleTestTimeout = useCallback(() => {
    if (isLockedRef.current) return;
    isLockedRef.current = true;
    setIsLocked(true);

    const qid = sessionRef.current.questionPool[sessionRef.current.currentIndex];
    // Record as unanswered if not already selected
    if (!sessionRef.current.questions[qid] || sessionRef.current.questions[qid].selectedOptionId === null) {
      const updated = {
        ...sessionRef.current,
        questions: {
          ...sessionRef.current.questions,
          [qid]: { questionId: qid, selectedOptionId: null },
        },
      };
      saveLocal(updated);
    }

    setTimeout(() => {
      if (sessionRef.current.currentIndex < sessionRef.current.questionPool.length - 1) {
        const nextIdx = sessionRef.current.currentIndex + 1;
        saveLocal({ ...sessionRef.current, currentIndex: nextIdx });
      }
      isLockedRef.current = false;
      setIsLocked(false);
    }, TEST_AUTO_ADVANCE_DELAY_MS);
  }, [saveLocal]);

  const handleNav = useCallback((delta: number) => {
    isLockedRef.current = false;
    setIsLocked(false);
    const next = Math.max(0, Math.min(localSession.questionPool.length - 1, localSession.currentIndex + delta));
    saveLocal({ ...sessionRef.current, currentIndex: next });
  }, [localSession.currentIndex, localSession.questionPool.length, saveLocal]);

  function handleJumpTo(idx: number) {
    isLockedRef.current = false;
    setIsLocked(false);
    saveLocal({ ...sessionRef.current, currentIndex: idx });
    setShowOverview(false);
  }

  // Keyboard navigation for Test Mode
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isLockedRef.current || showOverview || showSubmitConfirm) return;
      const key = e.key.toUpperCase();
      const currentQItem = QUESTIONS.find(q => q.id === localSession.questionPool[localSession.currentIndex]);
      if (!currentQItem) return;
      const optionOrder = localSession.optionOrders[currentQItem.id] || currentQItem.options.map(o => o.id);

      let targetIdx = -1;
      if (key === '1' || key === 'A') targetIdx = 0;
      else if (key === '2' || key === 'B') targetIdx = 1;
      else if (key === '3' || key === 'C') targetIdx = 2;
      else if (key === '4' || key === 'D') targetIdx = 3;

      if (targetIdx >= 0 && targetIdx < optionOrder.length) {
        e.preventDefault();
        handleSelectOption(currentQItem.id, optionOrder[targetIdx]);
      } else if (e.key === 'ArrowLeft' && localSession.currentIndex > 0) {
        e.preventDefault();
        handleNav(-1);
      } else if (e.key === 'ArrowRight' && localSession.currentIndex < localSession.questionPool.length - 1) {
        e.preventDefault();
        handleNav(1);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNav, handleSelectOption, localSession.currentIndex, localSession.optionOrders, localSession.questionPool, showOverview, showSubmitConfirm]);

  function handleConfirmSubmit() {
    const submitted: ActualTestSession = {
      ...sessionRef.current,
      submitted: true,
      status: 'completed',
      completedAt: Date.now(),
      timerSeconds,
    };
    saveTestSession(null); // Clear active session on finish
    saveLocal(submitted);

    // Save missed/unanswered questions to persistent Revise queue
    submitted.questionPool.forEach(qid => {
      const q = QUESTIONS.find(x => x.id === qid);
      const ans = submitted.questions[qid]?.selectedOptionId;
      if (!ans || (q && ans !== q.correctOptionId)) {
        addToReviseQueue(qid, 'actual-test', submitted.id);
      }
    });

    setShowSubmitConfirm(false);
    onFinish({ mode: 'actual-test', session: submitted });
  }

  return (
    <div className="guess-container animate-fade">
      {/* Top Bar: Wordmark, Total Timer and Exit */}
      <div className="guess-top-bar">
        <div className="guess-wordmark">
          <span>KANNADA</span> QUEST
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted" style={{ background: 'var(--bg-card)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            TOTAL {formatTime(timerSeconds)}
          </span>
          <button
            id="btn-test-exit"
            type="button"
            className="guess-exit-btn"
            onClick={onExit}
          >
            EXIT
          </button>
        </div>
      </div>

      {/* Meta Row: ACTUAL TEST and 14 / 20 */}
      <div className="guess-meta-row">
        <div className="guess-mode-label" style={{ color: 'var(--cyan)' }}>
          <span>ACTUAL TEST</span>
        </div>
        <div className="guess-counter font-mono">
          <span className="current-num">{String(localSession.currentIndex + 1).padStart(2, '0')}</span> / {String(totalCount).padStart(2, '0')}
        </div>
      </div>

      {/* Per-Question Timer (prefixed before starting exam) */}
      {timerDurationSec > 0 && (
        <QuestionTimer
          durationSec={timerDurationSec}
          questionKey={currentQId}
          isRunning={!isLocked && !showOverview && !showSubmitConfirm}
          onTimeout={handleTestTimeout}
        />
      )}

      {/* Overall Session Progress Indicator */}
      <div className="progress-track" style={{ marginBottom: 24, height: 2 }}>
        <div className="progress-fill" style={{ width: `${progressPct}%`, background: 'var(--cyan)' }} />
      </div>

      {/* Kannada Question Text & Options (Section 5 & 6) */}
      <div className="guess-question-area question-anim-enter" key={currentQId}>
        <p className="guess-question-text">{currentQ.question}</p>

        <div className="guess-options-grid">
          {currentOptionOrder.map(optId => {
            const opt = currentQ.options.find(o => o.id === optId)!;
            const isSelected = currentSelected === optId;
            return (
              <button
                key={optId}
                id={`test-opt-${optId}`}
                type="button"
                className={`guess-option-btn${isSelected ? ' is-selected' : ''}`}
                onClick={() => handleSelectOption(currentQId, optId)}
                disabled={isLocked}
              >
                <span className="guess-opt-badge">{opt.label}</span>
                <span className="guess-opt-text">{opt.text}</span>
                {isSelected && (
                  <span className="guess-opt-indicator is-selected" aria-hidden="true">●</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls (Section 5) */}
      <div className="flex items-center gap-3 mt-4">
        <button
          id="btn-prev-question"
          type="button"
          className="btn btn-secondary"
          onClick={() => handleNav(-1)}
          disabled={localSession.currentIndex === 0}
        >
          ‹ PREV
        </button>

        <button
          id="btn-open-overview"
          type="button"
          className="btn btn-ghost flex-1 font-mono text-xs"
          onClick={() => setShowOverview(true)}
        >
          GRID ({answeredCount}/{totalCount})
        </button>

        {!isLastQuestion ? (
          <button
            id="btn-next-question"
            type="button"
            className="btn btn-secondary"
            onClick={() => handleNav(1)}
          >
            NEXT ›
          </button>
        ) : (
          <button
            id="btn-finish-test"
            type="button"
            className="btn btn-primary"
            onClick={() => setShowSubmitConfirm(true)}
          >
            FINISH TEST
          </button>
        )}
      </div>

      {/* Question Grid Overview Modal */}
      {showOverview && (
        <div className="modal-overlay animate-fade" onClick={() => setShowOverview(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="modal-title">Question Grid</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm font-mono"
                onClick={() => setShowOverview(false)}
              >
                ✕
              </button>
            </div>

            <div className="flex gap-4 font-mono text-xs text-secondary" style={{ fontSize: '0.7rem' }}>
              <span><span style={{ color: 'var(--accent)' }}>■</span> Answered ({answeredCount})</span>
              <span><span style={{ color: 'var(--text-muted)' }}>■</span> Remaining ({unansweredCount})</span>
            </div>

            <div className="test-overview-grid">
              {localSession.questionPool.map((qid, idx) => {
                const isAnswered = localSession.questions[qid]?.selectedOptionId !== null;
                const isCurrent = idx === localSession.currentIndex;
                return (
                  <button
                    key={qid}
                    id={`grid-dot-q${idx + 1}`}
                    type="button"
                    className={`test-question-dot${isCurrent ? ' current' : isAnswered ? ' answered' : ''}`}
                    onClick={() => handleJumpTo(idx)}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              id="btn-submit-from-grid"
              type="button"
              className="btn btn-primary btn-full"
              onClick={() => {
                setShowOverview(false);
                setShowSubmitConfirm(true);
              }}
            >
              Ready to Submit?
            </button>
          </div>
        </div>
      )}

      {/* Custom Submission Confirmation Interface (Section 6) */}
      {showSubmitConfirm && (
        <div className="modal-overlay animate-fade" onClick={() => setShowSubmitConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title font-mono" style={{ color: 'var(--text-primary)', fontSize: '1rem', letterSpacing: '0.08em' }}>
              READY TO SUBMIT?
            </div>

            <div className="font-mono" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', padding: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
              {totalCount} QUESTIONS · {answeredCount} ANSWERED · {unansweredCount} UNANSWERED
            </div>

            {unansweredCount > 0 && (
              <p className="text-xs font-mono" style={{ color: 'var(--warning)', lineHeight: 1.5 }}>
                Notice: Unanswered questions will receive 0 marks. You can continue reviewing or confirm submission.
              </p>
            )}

            <div className="flex gap-3 mt-2">
              <button
                id="btn-cancel-submit"
                type="button"
                className="btn btn-secondary flex-1"
                onClick={() => setShowSubmitConfirm(false)}
              >
                CONTINUE REVIEWING
              </button>
              <button
                id="btn-confirm-submit"
                type="button"
                className="btn btn-primary flex-1"
                onClick={handleConfirmSubmit}
              >
                SUBMIT TEST
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── RESULTS SCREEN (Section 6 & Results) ──────────────────────────────────
interface ResultsProps {
  results: SessionResults;
  onRetry: () => void;
  onClose: () => void;
}

function ResultsScreen({ results, onRetry, onClose }: ResultsProps) {
  const { mode, session } = results;
  const [reviewOpen, setReviewOpen] = useState<string | null>(null);

  let totalQ = 0;
  let correctFirst = 0;
  let incorrect = 0;
  let unanswered = 0;
  let duration = 0;

  if (mode === 'guess') {
    const s = session as GuessSession;
    totalQ = s.questionPool.length;
    duration = Math.floor((Date.now() - s.startedAt) / 1000);
    Object.values(s.questions).forEach(q => {
      if (q.firstAttemptCorrect === true) correctFirst++;
      else if (q.firstAttemptCorrect === false) incorrect++;
      else unanswered++;
    });
  } else {
    const s = session as ActualTestSession;
    totalQ = s.questionPool.length;
    duration = s.timerSeconds || 0;
    s.questionPool.forEach(qid => {
      const q = QUESTIONS.find(x => x.id === qid);
      const ans = s.questions[qid]?.selectedOptionId;
      if (!ans) unanswered++;
      else if (q && ans === q.correctOptionId) correctFirst++;
      else incorrect++;
    });
  }

  const accuracy = totalQ > 0 ? Math.round((correctFirst / totalQ) * 100) : 0;
  const ringCircumference = 2 * Math.PI * 40;
  const ringOffset = (accuracy / 100) * ringCircumference;

  useEffect(() => {
    const categoryBreakdown: Record<string, { correct: number; total: number }> = {};
    if (mode === 'guess') {
      const s = session as GuessSession;
      Object.values(s.questions).forEach(sq => {
        const q = QUESTIONS.find(x => x.id === sq.questionId);
        if (q) {
          if (!categoryBreakdown[q.category]) {
            categoryBreakdown[q.category] = { correct: 0, total: 0 };
          }
          categoryBreakdown[q.category].total++;
          if (sq.firstAttemptCorrect) categoryBreakdown[q.category].correct++;
        }
      });
    } else {
      const s = session as ActualTestSession;
      s.questionPool.forEach(qid => {
        const q = QUESTIONS.find(x => x.id === qid);
        if (q) {
          if (!categoryBreakdown[q.category]) {
            categoryBreakdown[q.category] = { correct: 0, total: 0 };
          }
          categoryBreakdown[q.category].total++;
          const ans = s.questions[qid]?.selectedOptionId;
          if (ans === q.correctOptionId) {
            categoryBreakdown[q.category].correct++;
          }
        }
      });
    }

    const result: TestResult = {
      sessionId: session.id,
      mode,
      completedAt: Date.now(),
      totalQuestions: totalQ,
      correctFirst,
      incorrect,
      unanswered,
      accuracy,
      durationSeconds: duration,
      categoryBreakdown,
    };
    addTestResult(result);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page animate-fade" style={{ maxWidth: 680 }}>
      <div className="page-header">
        <h1 className="page-title">Performance Summary</h1>
        <p className="page-subtitle">{mode === 'guess' ? 'Smart Play' : 'Actual Test'} · {formatTime(duration)}</p>
      </div>

      {/* Score Summary Card */}
      <div className="card mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Ring */}
          <div className="score-ring">
            <svg width="96" height="96" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg-hover)" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={accuracy >= 70 ? 'var(--correct)' : accuracy >= 40 ? 'var(--warning)' : 'var(--incorrect)'}
                strokeWidth="8"
                strokeDasharray={`${ringOffset} ${ringCircumference}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="score-ring-label">
              {accuracy}%
              <span className="score-ring-sublabel">ACCURACY</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stat-grid flex-1">
            <div className="stat-card stat-correct">
              <div className="stat-value">{correctFirst}</div>
              <div className="stat-label">Correct</div>
            </div>
            <div className="stat-card stat-incorrect">
              <div className="stat-value">{incorrect}</div>
              <div className="stat-label">Incorrect</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--warning)' }}>{unanswered}</div>
              <div className="stat-label">Unanswered</div>
            </div>
            <div className="stat-card stat-accent">
              <div className="stat-value">{totalQ}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Question by Question Review */}
      <div className="section-label mb-2">Question Review</div>
      <div className="flex flex-col gap-2 mb-4">
        {(mode === 'guess' ? (session as GuessSession).questionPool : (session as ActualTestSession).questionPool).map((qid, idx) => {
          const q = QUESTIONS.find(x => x.id === qid)!;
          let selectedId: string | null = null;
          let isCorrect = false;

          if (mode === 'guess') {
            const qState = (session as GuessSession).questions[qid];
            selectedId = qState?.firstAttemptOptionId ?? null;
            isCorrect = qState?.firstAttemptCorrect ?? false;
          } else {
            selectedId = (session as ActualTestSession).questions[qid]?.selectedOptionId ?? null;
            isCorrect = selectedId !== null && selectedId === q.correctOptionId;
          }

          const isUnanswered = !selectedId;
          const statusIcon = isUnanswered ? '—' : isCorrect ? '✓' : '✗';
          const statusColor = isUnanswered ? 'var(--warning)' : isCorrect ? 'var(--correct)' : 'var(--incorrect)';
          const isOpen = reviewOpen === qid;

          return (
            <div
              key={qid}
              className="card card-sm"
              style={{
                borderColor: isCorrect ? 'transparent' : isUnanswered ? 'rgba(255,157,46,0.2)' : 'rgba(255,49,88,0.2)'
              }}
            >
              <button
                id={`review-q-${idx + 1}`}
                type="button"
                className="flex items-center gap-3 w-full"
                style={{ cursor: 'pointer', textAlign: 'left' }}
                onClick={() => setReviewOpen(isOpen ? null : qid)}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color: statusColor, width: 20, flexShrink: 0 }}>
                  {statusIcon}
                </span>
                <span className="kn flex-1 min-w-0 truncate" style={{ fontSize: '0.9rem' }}>
                  {q.question}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                  {isOpen ? '▲' : '▼'}
                </span>
              </button>

              {isOpen && (
                <div className="animate-fade mt-3">
                  <div className="flex flex-col gap-2">
                    {q.options.map(opt => {
                      const isSelectedOpt = opt.id === selectedId;
                      const isCorrectOpt = opt.id === q.correctOptionId;

                      let stateClass = '';
                      if (isCorrectOpt) {
                        stateClass = ' is-correct';
                      } else if (isSelectedOpt) {
                        stateClass = ' is-incorrect';
                      } else {
                        stateClass = ' is-dimmed';
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`guess-option-btn${stateClass}`}
                          style={{ minHeight: 46, padding: '10px 14px', cursor: 'default' }}
                        >
                          <span className="guess-opt-badge">{opt.label}</span>
                          <span className="guess-opt-text" style={{ fontSize: '0.925rem' }}>{opt.text}</span>
                          {isCorrectOpt && (
                            <span className="guess-opt-indicator is-correct" aria-hidden="true">✓</span>
                          )}
                          {isSelectedOpt && !isCorrectOpt && (
                            <span className="guess-opt-indicator is-incorrect" aria-hidden="true">✗</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          id="btn-results-done"
          type="button"
          className="btn btn-secondary flex-1"
          onClick={onClose}
        >
          DONE
        </button>
        <button
          id="btn-results-retry"
          type="button"
          className="btn btn-primary flex-1"
          onClick={onRetry}
        >
          NEW SESSION
        </button>
      </div>

      <div style={{ height: 32 }} />
    </div>
  );
}

// ── MAIN TEST PAGE COORDINATOR ────────────────────────────────────────────
type TestView = 'setup' | 'guess' | 'actual-test' | 'results';

export function TestPage() {
  const [view, setView] = useState<TestView>('setup');
  const [guessSession, setGuessSession] = useState<GuessSession | null>(() => getActiveGuessSession());
  const [testSession, setTestSession] = useState<ActualTestSession | null>(() => getActiveTestSession());
  const [results, setResults] = useState<SessionResults | null>(null);

  const hasActiveGuess = guessSession !== null && guessSession.status === 'in-progress';
  const hasActiveTest = testSession !== null && !testSession.submitted && testSession.status === 'in-progress';

  function handleStartGuess(s: GuessSession) {
    setGuessSession(s);
    setView('guess');
  }

  function handleStartTest(s: ActualTestSession) {
    setTestSession(s);
    setView('actual-test');
  }

  function handleResume() {
    if (hasActiveGuess) setView('guess');
    else if (hasActiveTest) setView('actual-test');
  }

  function handleDiscardSession() {
    saveGuessSession(null);
    saveTestSession(null);
    setGuessSession(null);
    setTestSession(null);
  }

  function handleFinish(r: SessionResults) {
    setResults(r);
    setView('results');
  }

  function handleExit() {
    setView('setup');
  }

  if (view === 'guess' && guessSession) {
    return (
      <GuessMode
        session={guessSession}
        onSessionUpdate={setGuessSession}
        onFinish={handleFinish}
        onExit={handleExit}
      />
    );
  }

  if (view === 'actual-test' && testSession) {
    return (
      <TestMode
        session={testSession}
        onSessionUpdate={setTestSession}
        onFinish={handleFinish}
        onExit={handleExit}
      />
    );
  }

  if (view === 'results' && results) {
    return (
      <ResultsScreen
        results={results}
        onRetry={() => {
          setGuessSession(null);
          setTestSession(null);
          setView('setup');
        }}
        onClose={() => {
          setGuessSession(null);
          setTestSession(null);
          setView('setup');
        }}
      />
    );
  }

  return (
    <SetupScreen
      onStartGuess={handleStartGuess}
      onStartTest={handleStartTest}
      onResume={handleResume}
      onDiscardSession={handleDiscardSession}
      activeGuess={hasActiveGuess ? guessSession : null}
      activeTest={hasActiveTest ? testSession : null}
    />
  );
}

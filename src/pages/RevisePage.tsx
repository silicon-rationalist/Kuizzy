import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  getReviseQueue,
  markReviseAttempt,
  markReviseMastered,
} from '../lib/storage';
import { QUESTIONS, getCategoryMeta } from '../data/questions';
import type { Question } from '../data/questions';
import type { ReviseItem } from '../types';
import { OptionButton } from '../components/OptionButton';
import { QuestionTimer } from '../components/QuestionTimer';
import { formatDate, shuffle } from '../lib/utils';

type ReviseItemState = 'idle' | 'answering' | 'revealed';

// ── REVISION SESSION (Timed recall mode) ───────────────────────────────────
interface ReviseSessionProps {
  queueItems: ReviseItem[];
  timerDurationSec?: number;
  onComplete: () => void;
  onExit: () => void;
}

function ReviseSession({ queueItems, timerDurationSec = 0, onComplete, onExit }: ReviseSessionProps) {
  // Interleave queue items: group by mistakeCount descending, shuffle within groups, then interleave
  const [sessionQueue] = useState<string[]>(() => {
    const high = queueItems.filter(i => i.mistakeCount >= 2);
    const normal = queueItems.filter(i => i.mistakeCount < 2);

    const shuffledHigh = shuffle(high.map(i => i.questionId));
    const shuffledNormal = shuffle(normal.map(i => i.questionId));

    // Interleave so difficult questions are prioritized without dominating consecutively
    const interleaved: string[] = [];
    let hIdx = 0;
    let nIdx = 0;

    while (hIdx < shuffledHigh.length || nIdx < shuffledNormal.length) {
      if (hIdx < shuffledHigh.length) {
        interleaved.push(shuffledHigh[hIdx++]);
      }
      if (nIdx < shuffledNormal.length) {
        interleaved.push(shuffledNormal[nIdx++]);
      }
    }

    return interleaved.length > 0 ? interleaved : queueItems.map(i => i.questionId);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptId, setSelectedOptId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const isLockedRef = useRef(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'correct' | 'incorrect' | 'timeout'>('idle');
  const [masteredCount, setMasteredCount] = useState(0);
  const [keptCount, setKeptCount] = useState(0);
  const [sessionFinished, setSessionFinished] = useState(false);

  const currentQId = sessionQueue[currentIndex] || '';
  const currentQIdRef = useRef(currentQId);
  useEffect(() => {
    currentQIdRef.current = currentQId;
  }, [currentQId]);

  const currentQ: Question | undefined = QUESTIONS.find(q => q.id === currentQId);

  const processAnswer = useCallback((chosenOptionId: string | null, isTimeout: boolean) => {
    const qid = currentQIdRef.current;
    const q = QUESTIONS.find(x => x.id === qid);
    if (!q) return;

    const isCorrect = !isTimeout && chosenOptionId === q.correctOptionId;
    setSelectedOptId(chosenOptionId);

    if (isCorrect) {
      markReviseMastered(qid);
      setMasteredCount(c => c + 1);
      setFeedbackStatus('correct');
    } else {
      markReviseAttempt(qid, false);
      setKeptCount(c => c + 1);
      setFeedbackStatus(isTimeout ? 'timeout' : 'incorrect');
    }

    const delayMs = isCorrect ? 1000 : 1600;

    setTimeout(() => {
      if (currentQIdRef.current !== qid) return;

      if (currentIndex + 1 < sessionQueue.length) {
        setCurrentIndex(i => i + 1);
        setSelectedOptId(null);
        isLockedRef.current = false;
        setIsLocked(false);
        setFeedbackStatus('idle');
      } else {
        setSessionFinished(true);
      }
    }, delayMs);
  }, [currentIndex, sessionQueue.length]);

  const handleSelectOption = useCallback((optId: string) => {
    if (isLockedRef.current || !currentQ) return;
    isLockedRef.current = true;
    setIsLocked(true);
    processAnswer(optId, false);
  }, [currentQ, processAnswer]);

  const handleTimeout = useCallback(() => {
    if (isLockedRef.current || !currentQ) return;
    isLockedRef.current = true;
    setIsLocked(true);
    processAnswer(null, true);
  }, [currentQ, processAnswer]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isLockedRef.current || sessionFinished || !currentQ) return;
      const key = e.key.toUpperCase();
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
  }, [currentQ, handleSelectOption, sessionFinished]);

  if (sessionFinished) {
    return (
      <div className="guess-container animate-fade">
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <div className="section-label mb-2" style={{ color: 'var(--accent)' }}>Revision Session Completed</div>
          <h2 className="text-xl font-bold mb-4 font-mono">REVISION SUMMARY</h2>
          <div className="grid-2 gap-3 mb-4">
            <div className="card card-sm">
              <div className="stat-value text-accent" style={{ color: 'var(--correct)' }}>{masteredCount}</div>
              <div className="stat-label">Mastered & Removed</div>
            </div>
            <div className="card card-sm">
              <div className="stat-value text-muted" style={{ color: 'var(--orange)' }}>{keptCount}</div>
              <div className="stat-label">Kept in Queue</div>
            </div>
          </div>
          <button
            id="btn-finish-revision-session"
            type="button"
            className="btn btn-primary btn-full"
            onClick={onComplete}
          >
            RETURN TO REVISE LIST
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div className="guess-container animate-fade">
      {/* Top Bar: Wordmark and Exit */}
      <div className="guess-top-bar">
        <div className="guess-wordmark">
          <span>KANNADA</span> QUEST
        </div>
        <button
          id="btn-revise-exit"
          type="button"
          className="guess-exit-btn"
          onClick={onExit}
        >
          EXIT
        </button>
      </div>

      {/* Meta Row: REVISE MODE and 01 / N */}
      <div className="guess-meta-row">
        <div className="guess-mode-label" style={{ color: 'var(--orange)' }}>
          <span>REVISE MODE</span>
        </div>
        <div className="guess-counter font-mono">
          <span className="current-num">{String(currentIndex + 1).padStart(2, '0')}</span> / {String(sessionQueue.length).padStart(2, '0')}
        </div>
      </div>

      {/* Per-Question Countdown Timer (prefixed before starting revision) */}
      {timerDurationSec > 0 && (
        <QuestionTimer
          durationSec={timerDurationSec}
          questionKey={currentQId}
          isRunning={!isLocked}
          onTimeout={handleTimeout}
        />
      )}

      {/* Kannada Question Text & Options */}
      <div className="guess-question-area question-anim-enter" key={currentQId}>
        <p className="guess-question-text">{currentQ.question}</p>

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
                id={`revise-opt-${opt.id}`}
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

        {/* Minimal Feedback Status */}
        <div className="guess-feedback-status">
          {feedbackStatus === 'correct' && (
            <span className="status-correct">✓ CORRECT · MASTERED</span>
          )}
          {feedbackStatus === 'incorrect' && (
            <span className="status-calm-note">WE'LL REVISIT THIS ONE LATER.</span>
          )}
          {feedbackStatus === 'timeout' && (
            <span className="status-calm-note">⏱ TIME EXPIRED · WE'LL REVISIT THIS ONE LATER.</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── REVISE CARD (List View) ────────────────────────────────────────────────
interface ReviseCardProps {
  item: ReviseItem;
  onMastered: (qid: string) => void;
  onWrong: (qid: string) => void;
}

function ReviseCard({ item, onMastered, onWrong }: ReviseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [cardState, setCardState] = useState<ReviseItemState>('idle');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const q = QUESTIONS.find(x => x.id === item.questionId);
  if (!q) return null;

  const catMeta = getCategoryMeta(q.category);
  const correctOpt = q.options.find(o => o.id === q.correctOptionId)!;
  const isCorrect = selectedId === q.correctOptionId;

  function handleAttempt() {
    if (!q || !selectedId) return;
    setAnswered(true);
    markReviseAttempt(item.questionId, selectedId === q.correctOptionId);
  }

  function handleMastered() {
    markReviseMastered(item.questionId);
    onMastered(item.questionId);
  }

  function handleWrong() {
    setSelectedId(null);
    setAnswered(false);
    setCardState('answering');
    onWrong(item.questionId);
  }

  function handleReveal() {
    setCardState('revealed');
    setAnswered(true);
  }

  return (
    <div className="revise-item">
      {/* Header */}
      <button
        id={`revise-q-${item.questionId}`}
        className="revise-item-header w-full"
        onClick={() => {
          setExpanded(e => !e);
          if (!expanded && cardState === 'idle') setCardState('answering');
        }}
      >
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="chip chip-color"
              style={{ '--chip-color': catMeta.color, fontSize: '0.6rem', padding: '2px 6px' } as React.CSSProperties}
            >
              {catMeta.labelKn}
            </span>
            {item.mistakeCount > 1 && (
              <span className="badge badge-incorrect">×{item.mistakeCount}</span>
            )}
            <span className="badge badge-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {item.source === 'guess' ? 'Guess' : 'Test'}
            </span>
          </div>
          <p className="kn" style={{ fontSize: '0.9rem', lineHeight: 1.65, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: expanded ? 'unset' : 2, WebkitBoxOrient: 'vertical' }}>
            {q.question}
          </p>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 8, fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {/* Body */}
      {expanded && (
        <div className="revise-item-body animate-fade">
          {cardState === 'answering' && (
            <>
              <div className="question-options">
                {q.options.map(opt => (
                  <OptionButton
                    key={opt.id}
                    option={opt}
                    state={selectedId === opt.id ? 'selected' : 'default'}
                    onClick={() => !answered && setSelectedId(opt.id)}
                    disabled={answered}
                  />
                ))}
              </div>

              {!answered && (
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary flex-1"
                    onClick={handleAttempt}
                    disabled={!selectedId}
                    id={`revise-submit-${item.questionId}`}
                  >
                    Check
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={handleReveal}
                    id={`revise-reveal-${item.questionId}`}
                  >
                    Reveal
                  </button>
                </div>
              )}

              {answered && (
                <>
                  <div className={`feedback-banner feedback-${isCorrect ? 'correct' : 'incorrect'}`}>
                    <span className="feedback-icon">{isCorrect ? '✓' : '✗'}</span>
                    <div>
                      <div className="feedback-title">{isCorrect ? 'Correct' : 'Incorrect'}</div>
                      <div className="feedback-answer kn">
                        Correct: {correctOpt.text}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isCorrect ? (
                      <>
                        <button className="btn btn-secondary flex-1" onClick={handleWrong} id={`revise-keep-${item.questionId}`}>
                          Keep in queue
                        </button>
                        <button className="btn btn-primary flex-1" onClick={handleMastered} id={`revise-mastered-${item.questionId}`}>
                          Mark mastered
                        </button>
                      </>
                    ) : (
                      <button className="btn btn-secondary btn-full" onClick={handleWrong} id={`revise-retry-${item.questionId}`}>
                        Try again
                      </button>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {cardState === 'revealed' && (
            <>
              <div className="question-options">
                {q.options.map(opt => (
                  <OptionButton
                    key={opt.id}
                    option={opt}
                    state={opt.id === q.correctOptionId ? 'correct' : 'dimmed'}
                    disabled
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button className="btn btn-secondary flex-1" onClick={() => { setCardState('answering'); setAnswered(false); setSelectedId(null); }}>
                  Try again
                </button>
                <button className="btn btn-primary flex-1" onClick={handleMastered} id={`revise-mastered-reveal-${item.questionId}`}>
                  Mark mastered
                </button>
              </div>
            </>
          )}

          <div className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
            Added: {formatDate(item.addedAt)}
            {item.lastAttemptAt && ` · Last: ${formatDate(item.lastAttemptAt)}`}
          </div>
        </div>
      )}
    </div>
  );
}

// ── REVISE PAGE ────────────────────────────────────────────────────────────
export function RevisePage({ onNav }: { onNav?: (tab: 'study' | 'test') => void }) {
  const [queue, setQueue] = useState<Record<string, ReviseItem>>(getReviseQueue);
  const [showMastered, setShowMastered] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [timerOption, setTimerOption] = useState<'off' | '10' | '20' | '30'>('off');
  const timerDurationSec = timerOption === 'off' ? 0 : parseInt(timerOption, 10);

  const activeItems = Object.values(queue).filter(i => !i.mastered);
  const masteredItems = Object.values(queue).filter(i => i.mastered);

  function handleMastered(qid: string) {
    setQueue(q => ({ ...q, [qid]: { ...q[qid], mastered: true, masteredAt: Date.now() } }));
  }

  function handleWrong(_qid: string) {
    setQueue(getReviseQueue);
  }

  const handleNavigate = (tab: 'study' | 'test') => {
    if (onNav) {
      onNav(tab);
    } else {
      window.dispatchEvent(new CustomEvent('app-nav', { detail: tab }));
    }
  };

  if (isSessionActive && activeItems.length > 0) {
    return (
      <ReviseSession
        queueItems={activeItems}
        timerDurationSec={timerDurationSec}
        onComplete={() => {
          setQueue(getReviseQueue());
          setIsSessionActive(false);
        }}
        onExit={() => {
          setQueue(getReviseQueue());
          setIsSessionActive(false);
        }}
      />
    );
  }

  return (
    <div className="page animate-fade">
      <div className="page-header">
        <h1 className="page-title">Revise</h1>
        <p className="page-subtitle">Questions you have missed — practice until mastered (optional timer available)</p>
      </div>

      {/* Stats bar */}
      <div className="flex gap-3 mb-4" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="card card-sm flex-1" style={{ minWidth: 100 }}>
          <div className="stat-value" style={{ fontSize: '1.25rem', color: activeItems.length > 0 ? 'var(--orange)' : 'var(--text-muted)' }}>
            {activeItems.length}
          </div>
          <div className="stat-label">Waiting</div>
        </div>
        <div className="card card-sm flex-1" style={{ minWidth: 100 }}>
          <div className="stat-value" style={{ fontSize: '1.25rem', color: 'var(--correct)' }}>
            {masteredItems.length}
          </div>
          <div className="stat-label">Mastered</div>
        </div>
        <div className="card card-sm flex-1" style={{ minWidth: 100 }}>
          <div className="stat-value" style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>
            {Object.values(queue).filter(i => i.mistakeCount > 1).length}
          </div>
          <div className="stat-label">Repeated errors</div>
        </div>
      </div>

      {/* Prominent START REVISION button with Configurable Timer Options */}
      {activeItems.length > 0 && (
        <div className="flex flex-col gap-2 mb-4" style={{ marginBottom: 20 }}>
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
                {timerOption === 'off' ? 'Default · Untimed' : 'Fixed during revision'}
              </span>
            </div>

            <div className="segmented-control" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <button
                id="btn-revise-timer-opt-off"
                type="button"
                className={`segmented-btn${timerOption === 'off' ? ' active' : ''}`}
                onClick={() => setTimerOption('off')}
              >
                OFF
              </button>
              <button
                id="btn-revise-timer-opt-10"
                type="button"
                className={`segmented-btn${timerOption === '10' ? ' active' : ''}`}
                onClick={() => setTimerOption('10')}
              >
                10s
              </button>
              <button
                id="btn-revise-timer-opt-20"
                type="button"
                className={`segmented-btn${timerOption === '20' ? ' active' : ''}`}
                onClick={() => setTimerOption('20')}
              >
                20s
              </button>
              <button
                id="btn-revise-timer-opt-30"
                type="button"
                className={`segmented-btn${timerOption === '30' ? ' active' : ''}`}
                onClick={() => setTimerOption('30')}
              >
                30s
              </button>
            </div>
          </div>

          <button
            id="btn-start-revision"
            type="button"
            className="btn btn-primary btn-full btn-lg"
            onClick={() => setIsSessionActive(true)}
          >
            ⚡ START REVISION · {activeItems.length} {activeItems.length === 1 ? 'QUESTION' : 'QUESTIONS'} WAITING · {timerOption === 'off' ? 'NO TIMER' : `⏱ ${timerOption}S`}
          </button>
        </div>
      )}

      {/* Active queue list or clean empty state */}
      {activeItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-title">Revision queue empty</div>
          <div className="empty-desc" style={{ marginBottom: 16 }}>
            No questions are currently waiting for revision. Study the material or complete tests to flag difficult questions.
          </div>
          <div className="flex gap-3 justify-center">
            <button
              id="btn-empty-to-study"
              type="button"
              className="btn btn-secondary"
              onClick={() => handleNavigate('study')}
            >
              Browse QnA Bank
            </button>
            <button
              id="btn-empty-to-test"
              type="button"
              className="btn btn-primary"
              onClick={() => handleNavigate('test')}
            >
              Start Smart Play
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="section-label mb-1" style={{ color: 'var(--text-secondary)' }}>Questions Waiting ({activeItems.length})</div>
          {activeItems.map(item => (
            <ReviseCard
              key={item.questionId}
              item={item}
              onMastered={handleMastered}
              onWrong={handleWrong}
            />
          ))}
        </div>
      )}

      {/* Mastered section */}
      {masteredItems.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <button
            className="flex items-center gap-2 w-full"
            style={{ cursor: 'pointer', padding: '8px 0', color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}
            onClick={() => setShowMastered(v => !v)}
            id="toggle-mastered"
          >
            <span className="section-label">Mastered ({masteredItems.length})</span>
            <span>{showMastered ? '▲' : '▼'}</span>
          </button>
          {showMastered && (
            <div className="flex flex-col gap-2 mt-2 animate-fade">
              {masteredItems.map(item => {
                const q = QUESTIONS.find(x => x.id === item.questionId);
                if (!q) return null;
                const catMeta = getCategoryMeta(q.category);
                return (
                  <div key={item.questionId} className="card card-sm" style={{ opacity: 0.65 }}>
                    <div className="flex items-center gap-2">
                      <span style={{ color: 'var(--correct)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>✓</span>
                      <span
                        className="chip chip-color"
                        style={{ '--chip-color': catMeta.color, fontSize: '0.6rem' } as React.CSSProperties}
                      >
                        {catMeta.labelKn}
                      </span>
                      <span className="kn flex-1 min-w-0 truncate text-sm text-secondary">{q.question}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

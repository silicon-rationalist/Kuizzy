import React, { useMemo, useState } from 'react';
import {
  getTestResults,
  getReviseQueue,
  getStudyProgress,
  exportData,
  importData,
  clearAllData,
} from '../lib/storage';
import {
  CATEGORIES,
  TOTAL_QUESTIONS,
} from '../data/questions';
import type { TestResult } from '../types';
import { formatDate, formatTime } from '../lib/utils';

// ── CHART A: ACCURACY OVER TIME ─────────────────────────────────────────────
function AccuracyOverTimeChart({ results }: { results: TestResult[] }) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const chartData = useMemo(() => {
    // Chronological order, last 14 sessions
    return [...results].reverse().slice(-14);
  }, [results]);

  if (chartData.length === 0) {
    return (
      <div className="card" style={{ padding: '24px 16px', textAlign: 'center' }}>
        <div className="text-xs font-mono text-muted">No completed sessions yet</div>
        <div className="text-xs text-secondary mt-1">Complete a Guess or Actual Test session to view score trends.</div>
      </div>
    );
  }

  const width = 420;
  const height = 180;
  const padding = { top: 32, right: 20, bottom: 32, left: 38 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const points = chartData.map((d, i) => {
    const x = padding.left + (chartData.length === 1 ? graphWidth / 2 : (i / (chartData.length - 1)) * graphWidth);
    const y = padding.top + (1 - d.accuracy / 100) * graphHeight;
    return { ...d, x, y };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPoints = points.length > 0
    ? `${points[0].x},${padding.top + graphHeight} ${polylinePoints} ${points[points.length - 1].x},${padding.top + graphHeight}`
    : '';

  const activeIdx = hoveredIdx !== null ? hoveredIdx : selectedIdx;
  const activePoint = activeIdx !== null ? points[activeIdx] : null;

  return (
    <div className="card" style={{ padding: '16px 14px' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs text-secondary" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Accuracy Over Time
        </span>
        <div className="flex items-center gap-3 font-mono text-xs text-muted" style={{ fontSize: '0.65rem' }}>
          <span><span style={{ color: 'var(--accent)' }}>●</span> Smart Play</span>
          <span><span style={{ color: 'var(--cyan)' }}>●</span> Actual Test</span>
        </div>
      </div>

      <svg width="100%" height="auto" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible', display: 'block' }}>
        <defs>
          <linearGradient id="accuracyAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
          <filter id="tooltipShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.7" />
          </filter>
        </defs>

        {/* Grid lines */}
        {[0, 50, 100].map(val => {
          const y = padding.top + (1 - val / 100) * graphHeight;
          return (
            <g key={val}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + graphWidth}
                y2={y}
                stroke="var(--border)"
                strokeDasharray={val === 50 ? '3 3' : undefined}
                strokeWidth="1"
              />
              <text
                x={padding.left - 6}
                y={y + 3.5}
                fill="var(--text-muted)"
                fontSize="10"
                fontFamily="var(--font-mono)"
                textAnchor="end"
              >
                {val}%
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        {points.length > 1 && (
          <polygon points={areaPoints} fill="url(#accuracyAreaGrad)" />
        )}

        {/* Line */}
        {points.length > 1 && (
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points — markings only; hover or click reveals accuracy */}
        {points.map((p, i) => {
          const isActive = i === activeIdx;
          const color = p.mode === 'guess' ? 'var(--accent)' : 'var(--cyan)';

          return (
            <g
              key={p.sessionId + i}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => setSelectedIdx(prev => (prev === i ? null : i))}
              role="button"
              tabIndex={0}
              aria-label={`Session ${i + 1}: ${p.accuracy}% accuracy`}
            >
              {/* Generous invisible hit target for easy touch / mouse interaction */}
              <circle cx={p.x} cy={p.y} r="18" fill="transparent" />

              {/* Active glow pulse ring */}
              {isActive && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="11"
                  fill={color}
                  fillOpacity="0.2"
                  stroke={color}
                  strokeWidth="1.5"
                />
              )}

              {/* Just the marking dot */}
              <circle
                cx={p.x}
                cy={p.y}
                r={isActive ? '7' : '5'}
                fill={color}
                stroke="var(--bg-base)"
                strokeWidth="2"
                style={{ transition: 'r 0.15s ease' }}
              />

              {/* Session index on x-axis */}
              <text
                x={p.x}
                y={padding.top + graphHeight + 18}
                fill={isActive ? 'var(--text-primary)' : 'var(--text-muted)'}
                fontSize="10"
                fontFamily="var(--font-mono)"
                fontWeight={isActive ? '700' : '400'}
                textAnchor="middle"
              >
                #{i + 1}
              </text>
            </g>
          );
        })}

        {/* Floating Tooltip Callout on Hover or Click */}
        {activePoint && (
          (() => {
            const tipWidth = 116;
            const tipHeight = 36;
            const clampedX = Math.max(
              padding.left + tipWidth / 2,
              Math.min(width - padding.right - tipWidth / 2, activePoint.x)
            );
            const tipY = activePoint.y < padding.top + 34
              ? activePoint.y + 12
              : activePoint.y - tipHeight - 10;
            const strokeColor = activePoint.mode === 'guess' ? 'var(--accent)' : 'var(--cyan)';

            return (
              <g pointerEvents="none" className="animate-fade">
                {/* Tooltip background pill */}
                <rect
                  x={clampedX - tipWidth / 2}
                  y={tipY}
                  width={tipWidth}
                  height={tipHeight}
                  rx="6"
                  fill="#141414"
                  stroke={strokeColor}
                  strokeWidth="1.5"
                  filter="url(#tooltipShadow)"
                />
                {/* Accuracy percentage */}
                <text
                  x={clampedX}
                  y={tipY + 15}
                  fill="var(--text-primary)"
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {activePoint.accuracy}% ACCURACY
                </text>
                {/* Meta details */}
                <text
                  x={clampedX}
                  y={tipY + 28}
                  fill="var(--text-secondary)"
                  fontSize="8.5"
                  fontFamily="var(--font-mono)"
                  textAnchor="middle"
                >
                  #{activeIdx! + 1} · {activePoint.correctFirst}/{activePoint.totalQuestions} correct
                </text>
              </g>
            );
          })()
        )}
      </svg>

      {/* Interactive feedback bar */}
      <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
        {activePoint ? (
          <div className="flex items-center gap-2 font-mono text-xs animate-fade" style={{ color: 'var(--text-primary)', flexWrap: 'wrap' }}>
            <span style={{ color: activePoint.mode === 'guess' ? 'var(--accent)' : 'var(--cyan)' }}>
              ● Session #{activeIdx! + 1} ({activePoint.mode === 'guess' ? 'Smart Play' : 'Actual Test'})
            </span>
            <span>· <strong>{activePoint.accuracy}% Accuracy</strong></span>
            <span className="text-muted">({activePoint.correctFirst} of {activePoint.totalQuestions} correct · {formatDate(activePoint.completedAt)})</span>
          </div>
        ) : (
          <span className="text-xs font-mono text-muted" style={{ fontSize: '0.72rem' }}>
            💡 Hover or click any marking point to view accuracy
          </span>
        )}
        {activeIdx !== null && (
          <button
            type="button"
            onClick={() => { setSelectedIdx(null); setHoveredIdx(null); }}
            className="text-xs font-mono text-muted"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', textDecoration: 'underline' }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

// ── CHART B: QUESTIONS ATTEMPTED ───────────────────────────────────────────
function QuestionsAttemptedChart({ results }: { results: TestResult[] }) {
  const chartData = useMemo(() => {
    return [...results].reverse().slice(-12);
  }, [results]);

  if (chartData.length === 0) {
    return (
      <div className="card" style={{ padding: '24px 16px', textAlign: 'center' }}>
        <div className="text-xs font-mono text-muted">No session activity yet</div>
        <div className="text-xs text-secondary mt-1">Questions answered will appear here after your first test.</div>
      </div>
    );
  }

  const width = 420;
  const height = 180;
  const padding = { top: 28, right: 16, bottom: 32, left: 34 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const maxCount = Math.max(20, ...chartData.map(d => d.totalQuestions));
  const barWidth = Math.min(28, Math.max(14, (graphWidth / chartData.length) - 8));

  return (
    <div className="card" style={{ padding: '16px 14px' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs text-secondary" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Questions Attempted Per Session
        </span>
        <span className="font-mono text-xs text-muted" style={{ fontSize: '0.65rem' }}>
          Recent {chartData.length} Sessions
        </span>
      </div>

      <svg width="100%" height="auto" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        {/* Baseline */}
        <line
          x1={padding.left}
          y1={padding.top + graphHeight}
          x2={padding.left + graphWidth}
          y2={padding.top + graphHeight}
          stroke="var(--border)"
          strokeWidth="1"
        />

        {/* Midline */}
        <line
          x1={padding.left}
          y1={padding.top + graphHeight / 2}
          x2={padding.left + graphWidth}
          y2={padding.top + graphHeight / 2}
          stroke="var(--border)"
          strokeDasharray="2 3"
          strokeWidth="1"
        />
        <text
          x={padding.left - 6}
          y={padding.top + graphHeight / 2 + 3.5}
          fill="var(--text-muted)"
          fontSize="10"
          fontFamily="var(--font-mono)"
          textAnchor="end"
        >
          {Math.round(maxCount / 2)}
        </text>

        {chartData.map((d, i) => {
          const x = padding.left + (i * (graphWidth / chartData.length)) + ((graphWidth / chartData.length) - barWidth) / 2;
          const barHeight = Math.max(4, (d.totalQuestions / maxCount) * graphHeight);
          const y = padding.top + graphHeight - barHeight;
          const color = d.mode === 'guess' ? 'var(--accent)' : 'var(--cyan)';

          return (
            <g key={d.sessionId + i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx="2"
                opacity="0.9"
              />
              <text
                x={x + barWidth / 2}
                y={y - 5}
                fill="var(--text-primary)"
                fontSize="11"
                fontFamily="var(--font-mono)"
                fontWeight="700"
                textAnchor="middle"
              >
                {d.totalQuestions}
              </text>
              <text
                x={x + barWidth / 2}
                y={padding.top + graphHeight + 16}
                fill="var(--text-muted)"
                fontSize="10"
                fontFamily="var(--font-mono)"
                textAnchor="middle"
              >
                S{i + 1}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── CHART C: CATEGORY PERFORMANCE ──────────────────────────────────────────
function CategoryPerformanceChart({ results }: { results: TestResult[] }) {
  const categoryStats = useMemo(() => {
    const map: Record<string, { correct: number; total: number }> = {};
    CATEGORIES.forEach(c => {
      map[c.id] = { correct: 0, total: 0 };
    });

    results.forEach(r => {
      if (r.categoryBreakdown) {
        Object.entries(r.categoryBreakdown).forEach(([catId, data]) => {
          if (map[catId]) {
            map[catId].correct += data.correct;
            map[catId].total += data.total;
          }
        });
      }
    });

    return CATEGORIES.map(c => {
      const st = map[c.id] || { correct: 0, total: 0 };
      const accuracy = st.total > 0 ? Math.round((st.correct / st.total) * 100) : null;
      return {
        ...c,
        correct: st.correct,
        total: st.total,
        accuracy,
      };
    });
  }, [results]);

  const hasAnyData = categoryStats.some(c => c.total > 0);

  return (
    <div className="card" style={{ padding: '16px 14px' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs text-secondary" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Category Accuracy
        </span>
        <span className="font-mono text-xs text-muted" style={{ fontSize: '0.65rem' }}>
          6 Core Categories
        </span>
      </div>

      {!hasAnyData ? (
        <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          Complete test sessions to build category performance data.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {categoryStats.map(cat => {
            const pct = cat.accuracy !== null ? cat.accuracy : 0;
            const barColor = cat.accuracy === null
              ? 'var(--border)'
              : cat.accuracy >= 70
              ? 'var(--correct)'
              : cat.accuracy >= 45
              ? 'var(--orange)'
              : 'var(--incorrect)';

            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="chip chip-color"
                      style={{ '--chip-color': cat.color, fontSize: '0.6rem', padding: '2px 6px' } as React.CSSProperties}
                    >
                      {cat.labelKn}
                    </span>
                    <span className="text-xs text-secondary truncate" style={{ maxWidth: 160 }}>
                      {cat.label}
                    </span>
                  </div>
                  <div className="font-mono text-xs flex items-center gap-2">
                    {cat.accuracy !== null ? (
                      <>
                        <span style={{ color: barColor, fontWeight: 700 }}>{cat.accuracy}%</span>
                        <span className="text-muted" style={{ fontSize: '0.65rem' }}>({cat.correct}/{cat.total})</span>
                      </>
                    ) : (
                      <span className="text-muted">Unattempted</span>
                    )}
                  </div>
                </div>

                <div className="mini-bar-track" style={{ height: 4, background: 'var(--bg-surface)' }}>
                  <div
                    className="mini-bar-fill"
                    style={{
                      width: `${pct}%`,
                      background: barColor,
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── CHART D: ANSWER OUTCOMES ───────────────────────────────────────────────
function AnswerOutcomesChart({ results }: { results: TestResult[] }) {
  const totals = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    results.forEach(r => {
      correct += r.correctFirst;
      incorrect += r.incorrect;
      unanswered += r.unanswered;
    });

    const sum = correct + incorrect + unanswered;
    return { correct, incorrect, unanswered, sum };
  }, [results]);

  if (totals.sum === 0) {
    return (
      <div className="card" style={{ padding: '24px 16px', textAlign: 'center' }}>
        <div className="text-xs font-mono text-muted">No outcome distribution yet</div>
        <div className="text-xs text-secondary mt-1">Answer questions to see your correct vs incorrect distribution.</div>
      </div>
    );
  }

  const correctPct = Math.round((totals.correct / totals.sum) * 100);
  const incorrectPct = Math.round((totals.incorrect / totals.sum) * 100);
  const unansweredPct = 100 - correctPct - incorrectPct;

  // Donut geometry
  const size = 110;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const correctOffset = (totals.correct / totals.sum) * circumference;
  const incorrectOffset = (totals.incorrect / totals.sum) * circumference;
  const unansweredOffset = (totals.unanswered / totals.sum) * circumference;

  return (
    <div className="card" style={{ padding: '16px 14px' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs text-secondary" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Answer Outcomes
        </span>
        <span className="font-mono text-xs text-muted" style={{ fontSize: '0.65rem' }}>
          {totals.sum} Total Attempts
        </span>
      </div>

      <div className="flex items-center gap-6 justify-center" style={{ flexWrap: 'wrap', padding: '6px 0' }}>
        {/* SVG Donut */}
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--bg-surface)"
              strokeWidth={strokeWidth}
            />
            {/* Correct ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--correct)"
              strokeWidth={strokeWidth}
              strokeDasharray={`${correctOffset} ${circumference}`}
              strokeDashoffset="0"
            />
            {/* Incorrect ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--incorrect)"
              strokeWidth={strokeWidth}
              strokeDasharray={`${incorrectOffset} ${circumference}`}
              strokeDashoffset={`-${correctOffset}`}
            />
            {/* Unanswered ring */}
            {totals.unanswered > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="var(--border-strong)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${unansweredOffset} ${circumference}`}
                strokeDashoffset={`-${correctOffset + incorrectOffset}`}
              />
            )}
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span className="font-mono font-bold" style={{ fontSize: '1.05rem', color: 'var(--correct)' }}>{correctPct}%</span>
            <span className="font-mono text-muted" style={{ fontSize: '0.6rem' }}>ACCURACY</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 font-mono" style={{ fontSize: '0.75rem', minWidth: 160 }}>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span style={{ color: 'var(--correct)' }}>■</span> Correct
            </span>
            <span className="font-bold">{totals.correct} <span className="text-muted" style={{ fontWeight: 400 }}>({correctPct}%)</span></span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span style={{ color: 'var(--incorrect)' }}>■</span> Incorrect
            </span>
            <span className="font-bold">{totals.incorrect} <span className="text-muted" style={{ fontWeight: 400 }}>({incorrectPct}%)</span></span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span style={{ color: 'var(--text-muted)' }}>■</span> Unanswered
            </span>
            <span className="font-bold">{totals.unanswered} <span className="text-muted" style={{ fontWeight: 400 }}>({unansweredPct}%)</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CHART E: REVISION PROGRESS ─────────────────────────────────────────────
function RevisionProgressChart({ reviseQueue }: { reviseQueue: ReturnType<typeof getReviseQueue> }) {
  const items = Object.values(reviseQueue);
  const waiting = items.filter(i => !i.mastered).length;
  const mastered = items.filter(i => i.mastered).length;
  const totalFlagged = waiting + mastered;
  const masteryRate = totalFlagged > 0 ? Math.round((mastered / totalFlagged) * 100) : 0;
  const repeatedErrors = items.filter(i => i.mistakeCount > 1 && !i.mastered).length;

  return (
    <div className="card" style={{ padding: '16px 14px' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs text-secondary" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Revision Retention Progress
        </span>
        <span className="font-mono text-xs" style={{ color: 'var(--correct)' }}>
          {masteryRate}% Mastered
        </span>
      </div>

      {totalFlagged === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          No questions have been flagged for revision yet.
        </div>
      ) : (
        <div>
          {/* Segmented bar */}
          <div className="progress-track" style={{ height: 6, display: 'flex', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${(mastered / totalFlagged) * 100}%`, background: 'var(--correct)', transition: 'width 0.4s ease' }} title="Mastered" />
            <div style={{ width: `${(waiting / totalFlagged) * 100}%`, background: 'var(--orange)', transition: 'width 0.4s ease' }} title="Waiting" />
          </div>

          <div className="grid-2 gap-3 mt-3 font-mono text-xs">
            <div className="flex items-center justify-between p-2 rounded" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <span className="text-muted">Mastered & Cleared:</span>
              <span style={{ color: 'var(--correct)', fontWeight: 700 }}>{mastered}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <span className="text-muted">Active in Queue:</span>
              <span style={{ color: 'var(--orange)', fontWeight: 700 }}>{waiting}</span>
            </div>
          </div>

          {repeatedErrors > 0 && (
            <div className="mt-2 text-xs font-mono" style={{ color: 'var(--incorrect)', padding: '6px 10px', background: 'rgba(255, 49, 88, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 49, 88, 0.25)' }}>
              ⚠ {repeatedErrors} {repeatedErrors === 1 ? 'question has' : 'questions have'} been missed repeatedly (×2 or more).
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── MAIN ANALYTICS PAGE ─────────────────────────────────────────────────────
export function AnalyticsPage() {
  const results = getTestResults();
  const reviseQueue = getReviseQueue();
  const studyProgress = getStudyProgress();

  const guessResults = results.filter(r => r.mode === 'guess');
  const testResults = results.filter(r => r.mode === 'actual-test');

  const reviseItems = Object.values(reviseQueue);
  const activeRevise = reviseItems.filter(i => !i.mastered).length;
  const masteredRevise = reviseItems.filter(i => i.mastered).length;

  const avgGuessAccuracy = guessResults.length > 0
    ? Math.round(guessResults.reduce((s, r) => s + r.accuracy, 0) / guessResults.length)
    : null;

  const avgTestAccuracy = testResults.length > 0
    ? Math.round(testResults.reduce((s, r) => s + r.accuracy, 0) / testResults.length)
    : null;

  function handleExport() {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kuizzy-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const ok = importData(text);
        if (ok) { alert('Data imported successfully. Refreshing page.'); window.location.reload(); }
        else { alert('Failed to import — invalid JSON backup format.'); }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function handleClear() {
    if (confirm('Clear ALL progress and session history? This cannot be undone.')) {
      clearAllData();
      window.location.reload();
    }
  }

  return (
    <div className="page animate-fade">
      <div className="page-header">
        <h1 className="page-title">Progress & Analytics</h1>
        <p className="page-subtitle">Your study history — verified performance metrics</p>
      </div>

      {/* Overview Stat Cards (Preserved Numeric Metrics) */}
      <div className="section-label mb-2" style={{ marginBottom: 8 }}>Summary Overview</div>
      <div className="stat-grid mb-4" style={{ marginBottom: 16, gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="stat-card stat-accent">
          <div className="stat-value">{TOTAL_QUESTIONS}</div>
          <div className="stat-label">Total Unique Qs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--cyan)' }}>
            {studyProgress.viewedQuestionIds.length} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ {TOTAL_QUESTIONS}</span>
          </div>
          <div className="stat-label">QnA Cards Viewed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: activeRevise > 0 ? 'var(--orange)' : 'var(--text-muted)' }}>
            {activeRevise}
          </div>
          <div className="stat-label">Waiting In Revise</div>
        </div>
        <div className="stat-card stat-correct">
          <div className="stat-value">{masteredRevise}</div>
          <div className="stat-label">Mastered Recall</div>
        </div>
      </div>

      {/* Mode Summaries */}
      <div className="grid-2 mb-4" style={{ marginBottom: 20, gap: 10 }}>
        <div className="card">
          <div className="section-label mb-2" style={{ marginBottom: 6 }}>Smart Play</div>
          <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
            {avgGuessAccuracy !== null ? `${avgGuessAccuracy}%` : '—'}
          </div>
          <div className="text-xs text-muted mt-1">avg first-attempt accuracy</div>
          <div className="text-xs text-muted font-mono">{guessResults.length} sessions completed</div>
        </div>
        <div className="card">
          <div className="section-label mb-2" style={{ marginBottom: 6 }}>Actual Test Mode</div>
          <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--cyan)' }}>
            {avgTestAccuracy !== null ? `${avgTestAccuracy}%` : '—'}
          </div>
          <div className="text-xs text-muted mt-1">avg test accuracy</div>
          <div className="text-xs text-muted font-mono">{testResults.length} tests completed</div>
        </div>
      </div>

      {/* Visual Analytics Section (Visualizations A, B, C, D, E) */}
      <div className="section-label mb-3" style={{ marginBottom: 12 }}>Visual Analytics</div>
      <div className="flex flex-col gap-4 mb-4">
        {/* Visualization A: Accuracy Over Time */}
        <AccuracyOverTimeChart results={results} />

        {/* Visualization B: Questions Attempted */}
        <QuestionsAttemptedChart results={results} />

        {/* Visualization C: Category Performance */}
        <CategoryPerformanceChart results={results} />

        {/* Visualization D: Answer Outcomes */}
        <AnswerOutcomesChart results={results} />

        {/* Visualization E: Revision Progress */}
        <RevisionProgressChart reviseQueue={reviseQueue} />
      </div>

      {/* Recent Sessions List */}
      {results.length > 0 && (
        <>
          <div className="section-label mb-2" style={{ marginTop: 24, marginBottom: 8 }}>Recent Sessions</div>
          <div className="flex flex-col gap-2 mb-4" style={{ marginBottom: 16 }}>
            {results.slice(0, 8).map((r, i) => (
              <div key={r.sessionId + i} className="card card-sm">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      <span style={{ color: r.mode === 'guess' ? 'var(--accent)' : 'var(--cyan)' }}>
                        {r.mode === 'guess' ? 'Smart Play' : 'Actual Test'}
                      </span>
                      <span className="text-muted" style={{ marginLeft: 8, fontWeight: 400 }}>· {r.totalQuestions} Qs</span>
                    </div>
                    <div className="text-xs text-muted" style={{ marginTop: 2 }}>{formatDate(r.completedAt)} · {formatTime(r.durationSeconds)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold" style={{ color: r.accuracy >= 70 ? 'var(--correct)' : r.accuracy >= 40 ? 'var(--orange)' : 'var(--incorrect)' }}>
                      {r.accuracy}%
                    </div>
                    <div className="text-xs text-muted font-mono">{r.correctFirst}/{r.totalQuestions} correct</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Data Management Section */}
      <div className="section-label mb-2" style={{ marginTop: 24, marginBottom: 8 }}>Data & Backup</div>
      <div className="card">
        <div className="text-xs text-muted mb-3" style={{ lineHeight: 1.6 }}>
          All metrics reflect actual local session records stored in your browser without telemetry.
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-secondary btn-sm" onClick={handleExport} id="btn-export">
            Export Backup (.json)
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleImport} id="btn-import">
            Import Backup
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleClear} id="btn-clear-data">
            Clear All Data
          </button>
        </div>
      </div>

      <div style={{ height: 28 }} />
    </div>
  );
}

import React from 'react';
import './index.css';
import { StudyPage } from './pages/StudyPage';
import { TestPage } from './pages/TestPage';
import { RevisePage } from './pages/RevisePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TOTAL_QUESTIONS } from './data/questions';
import { getReviseQueue } from './lib/storage';

type Tab = 'home' | 'study' | 'test' | 'revise' | 'analytics';

const NAV_ITEMS: { id: Tab; label: string }[] = [
  { id: 'study',     label: 'QnA'        },
  { id: 'test',      label: 'Smart Play' },
  { id: 'revise',    label: 'Revise'     },
  { id: 'analytics', label: 'Progress'   },
];

// ── Landing page ────────────────────────────────────────────────────────────
function LandingPage({ onNav }: { onNav: (tab: Tab) => void }) {
  const reviseQueue = getReviseQueue();
  const reviseCount = Object.values(reviseQueue).filter(i => !i.mastered).length;

  return (
    <div className="landing animate-fade">
      <div className="landing-hero">
        <h1 className="landing-title">
          <span className="accent">KANNADA</span> QUEST
        </h1>
        <div className="landing-subtitle">Internal Exam Preparation</div>
        <p className="landing-desc">
          Interactive MCQ preparation with instant feedback, optional timers, and targeted mistake revision.
        </p>

        <div className="mt-4 flex gap-3 flex-wrap items-center">
          <button
            id="hero-start-smart-play"
            className="btn btn-primary btn-lg"
            onClick={() => onNav('test')}
          >
            START SMART PLAY →
          </button>
          <button
            id="hero-browse-qna"
            className="btn btn-secondary btn-lg"
            onClick={() => onNav('study')}
          >
            BROWSE QNA
          </button>
        </div>

        <div className="landing-status">
          <div className="landing-status-item">
            <span>{TOTAL_QUESTIONS}</span>UNIQUE QUESTIONS
          </div>
          {reviseCount > 0 && (
            <div className="landing-status-item">
              <span>{reviseCount}</span>IN REVISION QUEUE
            </div>
          )}
        </div>
      </div>

      <div className="landing-actions">
        <button
          id="landing-study"
          className="landing-action-card"
          onClick={() => onNav('study')}
        >
          <div className="lac-label">01 — Reference</div>
          <div className="lac-title">QnA</div>
          <div className="lac-desc">Browse the full question bank with verified correct answers highlighted.</div>
        </button>
        <button
          id="landing-test"
          className="landing-action-card highlighted"
          onClick={() => onNav('test')}
        >
          <div className="lac-label">02 — Recommended</div>
          <div className="lac-title" style={{ color: 'var(--accent)' }}>Smart Play</div>
          <div className="lac-desc">Primary practice mode: instant answers, optional timer, and automatic mistake retry.</div>
        </button>
        <button
          id="landing-revise"
          className="landing-action-card"
          onClick={() => onNav('revise')}
        >
          <div className="lac-label">03 — Retention</div>
          <div className="lac-title">Revise</div>
          <div className="lac-desc">Questions you have missed — practice until fully mastered.</div>
        </button>
      </div>
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = React.useState<Tab>('test');

  function renderPage() {
    switch (tab) {
      case 'home':      return <LandingPage onNav={setTab} />;
      case 'study':     return <StudyPage />;
      case 'test':      return <TestPage />;
      case 'revise':    return <RevisePage onNav={setTab} />;
      case 'analytics': return <AnalyticsPage />;
    }
  }

  return (
    <div className="app-layout">
      {/* Top navigation bar */}
      <nav className="top-nav" aria-label="Main navigation">
        <button
          className="top-nav-wordmark"
          id="nav-home"
          onClick={() => setTab('home')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
        >
          <span className="wm-k">KANNADA</span>
          <span className="wm-sep">/</span>
          QUEST
        </button>

        <div className="top-nav-links" role="list">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              role="listitem"
              className={`top-nav-link${tab === item.id ? ' active' : ''}`}
              onClick={() => setTab(item.id)}
              aria-current={tab === item.id ? 'page' : undefined}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main className="main-content" id="main-content">
        {renderPage()}
      </main>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav" aria-label="Main navigation">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            id={`bottom-nav-${item.id}`}
            className={`bottom-nav-item${tab === item.id ? ' active' : ''}`}
            onClick={() => setTab(item.id)}
            aria-current={tab === item.id ? 'page' : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

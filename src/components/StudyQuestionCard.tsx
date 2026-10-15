import React from 'react';
import type { Question } from '../data/questions';
import { getCategoryMeta } from '../data/questions';

interface StudyQuestionCardProps {
  question: Question;
  showSourceNum?: boolean;
}

export function StudyQuestionCard({ question, showSourceNum = true }: StudyQuestionCardProps) {
  const catMeta = getCategoryMeta(question.category);

  return (
    <div className="question-card animate-fade">
      {/* Meta row */}
      <div className="question-meta">
        <span
          className="chip chip-color"
          style={{ '--chip-color': catMeta.color } as React.CSSProperties}
        >
          {catMeta.labelKn}
        </span>
        {showSourceNum && (
          <span className="question-num">
            Q{question.sourceNums.join('/')}
          </span>
        )}
        {question.verificationStatus !== 'verified' && (
          <span className="unverified-badge">! unverified</span>
        )}
      </div>

      {/* Question text */}
      <p className="question-text">{question.question}</p>

      {/* All options — correct one highlighted via option-correct class */}
      <div className="question-options">
        {question.options.map(opt => {
          const isCorrect = opt.id === question.correctOptionId;
          return (
            <div
              key={opt.id}
              className={`option-btn${isCorrect ? ' option-correct' : ' option-dimmed'}`}
              style={{ cursor: 'default' }}
            >
              <span className="option-label">{opt.label}</span>
              <span className="option-text kn">{opt.text}</span>
              {isCorrect && (
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', flexShrink: 0, color: 'var(--correct)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>✓</span>
              )}
            </div>
          );
        })}
      </div>
      {/* NOTE: No redundant "correct answer" text block below options */}
    </div>
  );
}

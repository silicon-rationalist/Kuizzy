import { useState, useMemo, useRef, useEffect } from 'react';
import {
  QUESTIONS,
  CATEGORIES,
  getQuestionsByCategory,
  groupQuestionsIntoChunks,
} from '../data/questions';
import type { Category } from '../data/questions';
import { StudyQuestionCard } from '../components/StudyQuestionCard';
import { markStudyViewed, getStudyProgress } from '../lib/storage';

type Filter = 'all' | Category;

export function StudyPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [groupIdx, setGroupIdx] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const studyProgress = getStudyProgress();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    }
    if (categoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [categoryDropdownOpen]);

  const filteredQuestions = useMemo(() => {
    let qs = filter === 'all'
      ? QUESTIONS
      : getQuestionsByCategory(filter as Category);

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      qs = qs.filter(q =>
        q.question.toLowerCase().includes(term) ||
        q.options.some(o => o.text.toLowerCase().includes(term))
      );
    }
    return qs;
  }, [filter, search]);

  const groups = useMemo(() => groupQuestionsIntoChunks(filteredQuestions), [filteredQuestions]);

  // When category changes, reset group index to null (All)
  const handleCategoryChange = (cat: Filter) => {
    setFilter(cat);
    setGroupIdx(null);
    setCategoryDropdownOpen(false);
  };

  // Safe display questions
  const displayQuestions = useMemo(() => {
    if (groupIdx !== null && groups[groupIdx]) {
      return groups[groupIdx];
    }
    return filteredQuestions;
  }, [filteredQuestions, groups, groupIdx]);

  function handleView(qid: string) {
    markStudyViewed(qid);
  }

  const viewedCount = studyProgress.viewedQuestionIds.filter(id =>
    displayQuestions.some(q => q.id === id)
  ).length;

  const currentCategoryLabel = useMemo(() => {
    if (filter === 'all') return `All Questions (${QUESTIONS.length})`;
    const cat = CATEGORIES.find(c => c.id === filter);
    if (!cat) return 'Category';
    const count = getQuestionsByCategory(cat.id).length;
    return `${cat.labelKn} (${count})`;
  }, [filter]);

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">QnA Reference</h1>
        <p className="page-subtitle">Browse the question bank — verified answers are highlighted</p>
      </div>

      {/* Search */}
      <input
        id="study-search"
        type="search"
        className="search-input"
        placeholder="Search questions or answers..."
        value={search}
        onChange={e => {
          setSearch(e.target.value);
          setGroupIdx(null);
        }}
        aria-label="Search questions"
      />

      {/* Compact Controls Bar */}
      <div className="study-controls-bar">
        {/* Category Selector Popover */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            id="study-category-btn"
            type="button"
            className="study-category-picker-btn"
            onClick={() => setCategoryDropdownOpen(o => !o)}
            aria-expanded={categoryDropdownOpen}
            aria-label="Select Category"
          >
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Category:</span>
            <span style={{ fontWeight: 600, color: filter === 'all' ? 'var(--accent)' : 'var(--text-primary)' }}>
              {currentCategoryLabel}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 4 }}>
              {categoryDropdownOpen ? '▲' : '▼'}
            </span>
          </button>

          {categoryDropdownOpen && (
            <div className="study-category-dropdown animate-fade" role="menu">
              <button
                type="button"
                className={`study-category-option${filter === 'all' ? ' selected' : ''}`}
                onClick={() => handleCategoryChange('all')}
                role="menuitem"
                id="cat-option-all"
              >
                <span>All Questions</span>
                <span className="font-mono text-muted">{QUESTIONS.length}</span>
              </button>
              <div className="divider" style={{ margin: '4px 0' }} />
              {CATEGORIES.map(cat => {
                const count = getQuestionsByCategory(cat.id).length;
                const isSelected = filter === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    id={`cat-option-${cat.id}`}
                    className={`study-category-option${isSelected ? ' selected' : ''}`}
                    onClick={() => handleCategoryChange(cat.id)}
                    role="menuitem"
                  >
                    <span className="kn" style={{ fontSize: '0.85rem' }}>{cat.labelKn}</span>
                    <span className="font-mono text-muted">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Group Stepper (Only when multiple groups exist and not in search mode) */}
        {!search && groups.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              id="group-btn-all"
              type="button"
              className={`btn btn-sm${groupIdx === null ? ' btn-primary' : ' btn-secondary'}`}
              onClick={() => setGroupIdx(null)}
              style={{ minHeight: 32, padding: '4px 10px' }}
            >
              All
            </button>
            <div className="study-group-stepper">
              <button
                id="group-btn-prev"
                type="button"
                className="study-group-nav-btn"
                onClick={() => setGroupIdx(prev => (prev === null || prev === 0 ? groups.length - 1 : prev - 1))}
                aria-label="Previous Group"
              >
                ‹
              </button>
              <span className="study-group-label">
                GROUP {String((groupIdx !== null ? groupIdx : 0) + 1).padStart(2, '0')} / {String(groups.length).padStart(2, '0')}
              </span>
              <button
                id="group-btn-next"
                type="button"
                className="study-group-nav-btn"
                onClick={() => setGroupIdx(prev => (prev === null || prev === groups.length - 1 ? 0 : prev + 1))}
                aria-label="Next Group"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginBottom: 14 }}>
        <span>{displayQuestions.length} QUESTIONS DISPLAYED</span>
        {viewedCount > 0 && (
          <span style={{ color: 'var(--accent)' }}>{viewedCount} VIEWED</span>
        )}
      </div>

      {/* Responsive Question Grid */}
      <div className="study-grid">
        {displayQuestions.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-title">No questions found</div>
            <div className="empty-desc">Try a different search term or category filter.</div>
          </div>
        ) : (
          displayQuestions.map(q => (
            <div
              key={q.id}
              className="study-card-item"
              onMouseEnter={() => handleView(q.id)}
              onFocus={() => handleView(q.id)}
              onClick={() => handleView(q.id)}
            >
              <StudyQuestionCard question={q} />
            </div>
          ))
        )}
      </div>

      <div style={{ height: 32 }} />
    </div>
  );
}

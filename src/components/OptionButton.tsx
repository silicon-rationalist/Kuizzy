
interface OptionButtonProps {
  option: { id: string; label: string; text: string };
  state: 'default' | 'selected' | 'correct' | 'incorrect' | 'correct-unselected' | 'dimmed';
  onClick?: () => void;
  disabled?: boolean;
}

export function OptionButton({ option, state, onClick, disabled }: OptionButtonProps) {
  const cls = {
    default: '',
    selected: ' option-selected',
    correct: ' option-correct',
    incorrect: ' option-incorrect',
    'correct-unselected': ' option-correct',
    dimmed: ' option-dimmed',
  }[state];

  return (
    <button
      className={`option-btn${cls}`}
      onClick={onClick}
      disabled={disabled}
      id={`option-${option.id}`}
      aria-pressed={state === 'selected' || state === 'correct' || state === 'incorrect'}
    >
      <span className="option-label">{option.label}</span>
      <span className="option-text kn">{option.text}</span>
      {state === 'correct' && <span style={{ marginLeft: 'auto', fontSize: '1rem', color: 'var(--correct)' }}>✓</span>}
      {state === 'correct-unselected' && <span style={{ marginLeft: 'auto', fontSize: '1rem', color: 'var(--correct)' }}>✓</span>}
      {state === 'incorrect' && <span style={{ marginLeft: 'auto', fontSize: '1rem', color: 'var(--incorrect)' }}>✗</span>}
    </button>
  );
}

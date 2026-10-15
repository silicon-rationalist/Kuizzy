import { formatTime } from '../lib/utils';

interface SessionHeaderProps {
  current: number;
  total: number;
  mode: string;
  timerSeconds?: number;
  onExit?: () => void;
}

export function SessionHeader({ current, total, mode, timerSeconds, onExit }: SessionHeaderProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="session-header">
      <div className="session-progress-info">
        <div className="flex items-center gap-2">
          <span className="badge badge-accent">{mode}</span>
          <span className="progress-text">{current} / {total}</span>
        </div>
        <div className="progress-track" style={{ marginTop: 4 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      {timerSeconds !== undefined && (
        <div className="session-timer">{formatTime(timerSeconds)}</div>
      )}
      {onExit && (
        <button className="btn btn-ghost btn-sm" onClick={onExit} title="Exit session" id="btn-exit-session">
          Exit
        </button>
      )}
    </div>
  );
}

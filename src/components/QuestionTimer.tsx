import { useEffect, useRef, useState, useCallback } from 'react';

interface QuestionTimerProps {
  durationSec?: number;
  questionKey: string | number; // resets timer when this changes
  isRunning: boolean;
  onTimeout: () => void;
}

export function QuestionTimer({
  durationSec = 20,
  questionKey,
  isRunning,
  onTimeout,
}: QuestionTimerProps) {
  const [prevKey, setPrevKey] = useState(questionKey);
  const [remainingTime, setRemainingTime] = useState<number>(durationSec);

  if (prevKey !== questionKey) {
    setPrevKey(questionKey);
    setRemainingTime(durationSec);
  }

  const animFrameRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(isRunning);
  const timedOutRef = useRef<boolean>(false);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  const handleTimeoutCallback = useCallback(() => {
    if (timedOutRef.current) return;
    timedOutRef.current = true;
    onTimeout();
  }, [onTimeout]);

  useEffect(() => {
    // Reset timer clock when questionKey changes
    timedOutRef.current = false;
    startRef.current = performance.now();

    if (!isRunning) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    const tick = (now: number) => {
      if (!isRunningRef.current) return;
      const elapsed = (now - startRef.current) / 1000;
      const rem = Math.max(0, durationSec - elapsed);
      setRemainingTime(rem);

      if (rem <= 0) {
        isRunningRef.current = false;
        handleTimeoutCallback();
      } else {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);

    const onVisibilityChange = () => {
      if (document.hidden) {
        // Tab backgrounded; clock keeps running via monotonic performance.now()
      } else if (isRunningRef.current && !timedOutRef.current) {
        const now = performance.now();
        const elapsed = (now - startRef.current) / 1000;
        const rem = Math.max(0, durationSec - elapsed);
        setRemainingTime(rem);
        if (rem <= 0) {
          isRunningRef.current = false;
          handleTimeoutCallback();
        } else {
          if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = requestAnimationFrame(tick);
        }
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [questionKey, isRunning, durationSec, handleTimeoutCallback]);

  // Phase calculation per spec:
  // > 7s: neon lime (phase-normal)
  // <= 7s to > 3s: orange (phase-warn)
  // <= 3s: red (phase-danger)
  let timerPhase = 'phase-normal';
  if (remainingTime <= 3) {
    timerPhase = 'phase-danger';
  } else if (remainingTime <= 7) {
    timerPhase = 'phase-warn';
  }

  const timerPct = Math.max(0, Math.min(100, (remainingTime / durationSec) * 100));
  const roundedSec = Math.ceil(remainingTime);

  return (
    <div className="guess-timer-wrapper" aria-label="Question countdown timer">
      <div className="guess-timer-header">
        <span className={`guess-timer-digits ${timerPhase}`} aria-live="polite">
          00:{String(roundedSec).padStart(2, '0')}
        </span>
      </div>
      <div className="guess-timer-bar-track">
        <div
          className={`guess-timer-bar-fill ${timerPhase}`}
          style={{ width: `${timerPct}%` }}
          role="progressbar"
          aria-valuenow={roundedSec}
          aria-valuemin={0}
          aria-valuemax={durationSec}
        />
      </div>
    </div>
  );
}

import { useEffect, useRef, useState, useCallback } from "react";

const IDLE_TIMEOUT_KEY = "lumio-idle-timeout";
const DEFAULT_TIMEOUT_MINUTES = 5;
const WARNING_SECONDS = 30;

export function getIdleTimeoutMinutes(): number {
  if (typeof window === "undefined") return DEFAULT_TIMEOUT_MINUTES;
  const stored = localStorage.getItem(IDLE_TIMEOUT_KEY);
  if (stored === "0") return 0; // disabled
  const parsed = Number(stored);
  return parsed > 0 ? parsed : DEFAULT_TIMEOUT_MINUTES;
}

export function setIdleTimeoutMinutes(minutes: number) {
  localStorage.setItem(IDLE_TIMEOUT_KEY, String(minutes));
}

interface IdleTimerState {
  showWarning: boolean;
  secondsLeft: number;
  dismiss: () => void;
}

export function useIdleTimer(onLock: () => void): IdleTimerState {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WARNING_SECONDS);

  const warningTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const countdownRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const onLockRef = useRef(onLock);
  onLockRef.current = onLock;

  const clearAllTimers = useCallback(() => {
    clearTimeout(warningTimerRef.current);
    clearTimeout(lockTimerRef.current);
    clearInterval(countdownRef.current);
  }, []);

  const startTimers = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    setSecondsLeft(WARNING_SECONDS);

    const minutes = getIdleTimeoutMinutes();
    if (minutes === 0) return; // disabled

    const warningMs = (minutes * 60 - WARNING_SECONDS) * 1000;

    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setSecondsLeft(WARNING_SECONDS);

      countdownRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      lockTimerRef.current = setTimeout(() => {
        clearInterval(countdownRef.current);
        setShowWarning(false);
        onLockRef.current();
      }, WARNING_SECONDS * 1000);
    }, Math.max(warningMs, 0));
  }, [clearAllTimers]);

  const dismiss = useCallback(() => {
    startTimers();
  }, [startTimers]);

  useEffect(() => {
    const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];

    const resetOnActivity = () => {
      // Only reset if warning is not showing
      if (!warningTimerRef.current && !lockTimerRef.current) return;
      // If warning is visible, don't reset on activity (user must click button)
      // But we do reset idle timer when no warning is shown
      const minutes = getIdleTimeoutMinutes();
      if (minutes === 0) return;

      // Reset only if warning is not displayed
      setShowWarning((current) => {
        if (!current) {
          startTimers();
        }
        return current;
      });
    };

    events.forEach((e) => document.addEventListener(e, resetOnActivity, { passive: true }));
    startTimers();

    return () => {
      events.forEach((e) => document.removeEventListener(e, resetOnActivity));
      clearAllTimers();
    };
  }, [startTimers, clearAllTimers]);

  return { showWarning, secondsLeft, dismiss };
}

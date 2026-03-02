/**
 * SP-12-002: Session timeout — auto-lock na periode van inactiviteit.
 *
 * Design:
 *  - Polls system idle time every `pollIntervalMs` (default 60 s)
 *  - Uses an injectable `getSystemIdleTimeMs` so the logic is unit-testable
 *    without Electron being present
 *  - Fires `onTimeout` callback when idle time exceeds `timeoutMs`
 *  - Resets automatically once the user becomes active again
 *
 * Usage in main process:
 *   const mgr = new SessionTimeoutManager({ onTimeout: () => mainWin.webContents.send("session-lock") });
 *   mgr.start();
 */

export interface SessionTimeoutOptions {
  /** Inactivity threshold before locking. Default: 15 minutes. */
  timeoutMs?: number;
  /** Minimum allowed timeout. Default: 5 minutes. */
  minTimeoutMs?: number;
  /** Maximum allowed timeout. Default: 60 minutes. */
  maxTimeoutMs?: number;
  /** Injectable idle-time provider. In production: Electron powerMonitor. */
  getSystemIdleTimeMs?: () => number;
  /** Called when the idle threshold is crossed. */
  onTimeout?: () => void;
  /** How often to check idle time, in ms. Default: 60 000 (1 min). */
  pollIntervalMs?: number;
}

export class SessionTimeoutManager {
  private _timeoutMs: number;
  private readonly _minTimeoutMs: number;
  private readonly _maxTimeoutMs: number;
  private readonly _pollIntervalMs: number;
  private readonly _getSystemIdleTimeMs: () => number;
  private readonly _onTimeout: () => void;
  private _timer: ReturnType<typeof setInterval> | null = null;
  private _locked = false;

  constructor(opts: SessionTimeoutOptions = {}) {
    this._minTimeoutMs = opts.minTimeoutMs ?? 5 * 60 * 1000;
    this._maxTimeoutMs = opts.maxTimeoutMs ?? 60 * 60 * 1000;
    this._timeoutMs = opts.timeoutMs ?? 15 * 60 * 1000;
    this._pollIntervalMs = opts.pollIntervalMs ?? 60_000;
    this._getSystemIdleTimeMs = opts.getSystemIdleTimeMs ?? (() => 0);
    this._onTimeout = opts.onTimeout ?? (() => { /* no-op */ });
  }

  /** Start polling. Idempotent — safe to call multiple times. */
  start(): void {
    if (this._timer !== null) return;
    this._locked = false;
    this._timer = setInterval(() => this._poll(), this._pollIntervalMs);
  }

  /** Stop polling. */
  stop(): void {
    if (this._timer !== null) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  /** Reset the lock state (call after user unlocks). */
  resetLock(): void {
    this._locked = false;
  }

  /**
   * Update timeout duration at runtime (e.g. from settings panel).
   * Clamps to [minTimeoutMs, maxTimeoutMs].
   */
  setTimeoutMs(ms: number): void {
    this._timeoutMs = Math.max(this._minTimeoutMs, Math.min(this._maxTimeoutMs, ms));
  }

  getTimeoutMs(): number {
    return this._timeoutMs;
  }

  getTimeoutMinutes(): number {
    return Math.round(this._timeoutMs / 60_000);
  }

  private _poll(): void {
    if (this._locked) return;
    const idleMs = this._getSystemIdleTimeMs();
    if (idleMs >= this._timeoutMs) {
      this._locked = true;
      this._onTimeout();
    }
  }
}

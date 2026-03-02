import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SessionTimeoutManager } from "./session-timeout";

describe("SessionTimeoutManager", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires onTimeout when idle time exceeds threshold", () => {
    const onTimeout = vi.fn();
    let idleMs = 0;

    const mgr = new SessionTimeoutManager({
      timeoutMs: 5 * 60 * 1000,       // 5 min
      pollIntervalMs: 1000,             // poll every 1 s for test speed
      getSystemIdleTimeMs: () => idleMs,
      onTimeout,
    });

    mgr.start();

    // Simulate 4 min idle — should NOT fire yet
    idleMs = 4 * 60 * 1000;
    vi.advanceTimersByTime(1000);
    expect(onTimeout).not.toHaveBeenCalled();

    // Simulate 5 min idle — should fire
    idleMs = 5 * 60 * 1000;
    vi.advanceTimersByTime(1000);
    expect(onTimeout).toHaveBeenCalledTimes(1);

    mgr.stop();
  });

  it("does NOT fire onTimeout again after already locked", () => {
    const onTimeout = vi.fn();
    let idleMs = 10 * 60 * 1000; // already over threshold

    const mgr = new SessionTimeoutManager({
      timeoutMs: 5 * 60 * 1000,
      pollIntervalMs: 1000,
      getSystemIdleTimeMs: () => idleMs,
      onTimeout,
    });

    mgr.start();
    vi.advanceTimersByTime(1000);
    expect(onTimeout).toHaveBeenCalledTimes(1);

    // Poll again — locked, should NOT call again
    vi.advanceTimersByTime(1000);
    expect(onTimeout).toHaveBeenCalledTimes(1);

    mgr.stop();
  });

  it("resets lock after resetLock() — fires again on next timeout", () => {
    const onTimeout = vi.fn();
    let idleMs = 10 * 60 * 1000;

    const mgr = new SessionTimeoutManager({
      timeoutMs: 5 * 60 * 1000,
      pollIntervalMs: 1000,
      getSystemIdleTimeMs: () => idleMs,
      onTimeout,
    });

    mgr.start();
    vi.advanceTimersByTime(1000);
    expect(onTimeout).toHaveBeenCalledTimes(1);

    mgr.resetLock();
    vi.advanceTimersByTime(1000);
    expect(onTimeout).toHaveBeenCalledTimes(2); // fires again

    mgr.stop();
  });

  it("clamps timeout to min/max bounds", () => {
    const mgr = new SessionTimeoutManager({
      minTimeoutMs: 5 * 60 * 1000,
      maxTimeoutMs: 60 * 60 * 1000,
    });

    mgr.setTimeoutMs(1000); // below min
    expect(mgr.getTimeoutMs()).toBe(5 * 60 * 1000);

    mgr.setTimeoutMs(999 * 60 * 1000); // above max
    expect(mgr.getTimeoutMs()).toBe(60 * 60 * 1000);

    mgr.setTimeoutMs(15 * 60 * 1000); // in range
    expect(mgr.getTimeoutMinutes()).toBe(15);
  });

  it("stop() prevents further callbacks", () => {
    const onTimeout = vi.fn();
    let idleMs = 0;

    const mgr = new SessionTimeoutManager({
      timeoutMs: 5 * 60 * 1000,
      pollIntervalMs: 1000,
      getSystemIdleTimeMs: () => idleMs,
      onTimeout,
    });

    mgr.start();
    mgr.stop();

    idleMs = 10 * 60 * 1000;
    vi.advanceTimersByTime(5000);
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it("defaults to 15-minute timeout", () => {
    const mgr = new SessionTimeoutManager();
    expect(mgr.getTimeoutMinutes()).toBe(15);
  });
});

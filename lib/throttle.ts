/**
 * Creates a throttled function that only invokes `fn` at most once per `delayMs`.
 * The last call's arguments are always used when the throttled function fires,
 * so the final state is always correct.
 */
export function throttle<T extends (...args: any[]) => void>(fn: T, delayMs: number): T {
  let lastRun = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let latestArgs: Parameters<T> | null = null;

  const throttled = (...args: Parameters<T>) => {
    latestArgs = args;
    const now = Date.now();
    const elapsed = now - lastRun;

    if (elapsed >= delayMs) {
      lastRun = now;
      fn(...args);
    } else if (!timer) {
      timer = setTimeout(() => {
        lastRun = Date.now();
        timer = null;
        if (latestArgs) fn(...latestArgs);
      }, delayMs - elapsed);
    }
  };

  return throttled as T;
}

/**
 * Creates a debounced function that delays invoking `fn` until `delayMs`
 * have elapsed since the last call. Useful for batching rapid-fire events.
 */
export function debounce<T extends (...args: any[]) => void>(fn: T, delayMs: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, delayMs);
  };

  return debounced as T;
}

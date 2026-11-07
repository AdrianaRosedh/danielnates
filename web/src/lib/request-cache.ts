/**
 * Request-scoped memoization.
 *
 * One SSR render calls the same reads from several places (layout,
 * menu, page). The middleware wraps each request in `runWithRequestCache`
 * so `memo(key, load)` returns the in-flight/settled promise for the
 * rest of that request only — no cross-request staleness, so an inline
 * edit is visible on the very next load.
 *
 * Outside a request (build, scripts) `memo` simply calls `load`.
 */
import { AsyncLocalStorage } from "node:async_hooks";

const store = new AsyncLocalStorage<Map<string, Promise<unknown>>>();

export function runWithRequestCache<T>(fn: () => T): T {
  return store.run(new Map(), fn);
}

export function memo<T>(key: string, load: () => Promise<T>): Promise<T> {
  const cache = store.getStore();
  if (!cache) return load();
  const hit = cache.get(key) as Promise<T> | undefined;
  if (hit) return hit;
  const pending = load();
  cache.set(key, pending);
  return pending;
}

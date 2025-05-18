"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

// @ts-nocheck
// ref: https://github.com/xnimorz/use-debounce/blob/master/src/useDebouncedCallback.ts
import { useEffect, useMemo, useRef } from "react";

export type CallOptions = {
  leading?: boolean;
  trailing?: boolean;
};

export type Options = {
  maxWait?: number;
} & CallOptions;

export type ControlFunctions = {
  cancel: () => void;
  flush: () => void;
  isPending: () => boolean;
};

export type DebouncedState<T extends (...args: any) => ReturnType<T>> = ((
  ...args: Parameters<T>
) => ReturnType<T> | undefined) &
  ControlFunctions;

export function useDebouncedCallback<T extends (...args: any) => ReturnType<T>>(
  func: T,
  wait?: number,
  options?: Options,
): DebouncedState<T> {
  const lastCallTime = useRef(null);
  const lastInvokeTime = useRef(0);
  const timerId = useRef(null);
  const lastArgs = useRef<unknown[]>([]);
  // @ts-expect-error - types
  const lastThis = useRef<unknown>();
  // @ts-expect-error - types
  const result = useRef<ReturnType<T>>();
  const funcRef = useRef(func);
  const mounted = useRef(true);

  useEffect(() => {
    funcRef.current = func;
  }, [func]);

  const isRaf = !wait && wait !== 0 && typeof window !== "undefined";

  if (typeof func !== "function") {
    throw new TypeError("Expected a function");
  }

  // @ts-expect-error - types
  wait = +wait || 0;
  options = options ?? {};

  const leading = !!options.leading;
  const trailing = "trailing" in options ? !!options.trailing : true; // `true` by default
  const maxing = "maxWait" in options;
  // @ts-expect-error - types
  const maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : null;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const debounced = useMemo(() => {
    const invokeFunc = (time: number) => {
      const args = lastArgs.current;
      const thisArg = lastThis.current;

      // @ts-expect-error - types
      lastArgs.current = lastThis.current = null;
      lastInvokeTime.current = time;
      return (result.current = funcRef.current.apply(thisArg, args));
    };

    const startTimer = (pendingFunc: () => void, wait: number) => {
      // @ts-expect-error - types
      if (isRaf) cancelAnimationFrame(timerId.current);
      // @ts-expect-error - types
      timerId.current = isRaf
        ? requestAnimationFrame(pendingFunc)
        : setTimeout(pendingFunc, wait);
    };

    const shouldInvoke = (time: number) => {
      if (!mounted.current) return false;

      // @ts-expect-error - types
      const timeSinceLastCall = time - lastCallTime.current;
      const timeSinceLastInvoke = time - lastInvokeTime.current;

      return (
        !lastCallTime.current ||
        timeSinceLastCall >= wait ||
        timeSinceLastCall < 0 ||
        // @ts-expect-error - types
        (maxing && timeSinceLastInvoke >= maxWait)
      );
    };

    const trailingEdge = (time: number) => {
      timerId.current = null;

      if (trailing && lastArgs.current) {
        return invokeFunc(time);
      }
      // @ts-expect-error - types
      lastArgs.current = lastThis.current = null;
      return result.current;
    };

    const timerExpired = () => {
      const time = Date.now();
      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }
      // https://github.com/xnimorz/use-debounce/issues/97
      if (!mounted.current) {
        return;
      }

      // @ts-expect-error - types
      const timeSinceLastCall = time - lastCallTime.current;
      const timeSinceLastInvoke = time - lastInvokeTime.current;
      const timeWaiting = wait - timeSinceLastCall;
      const remainingWait = maxing
        ? // @ts-expect-error - types
          Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
        : timeWaiting;

      startTimer(timerExpired, remainingWait);
    };

    const func: DebouncedState<T> = (...args: Parameters<T>): ReturnType<T> => {
      const time = Date.now();
      const isInvoking = shouldInvoke(time);

      lastArgs.current = args;
      // @ts-expect-error - types
      lastThis.current = this;
      // @ts-expect-error - types
      lastCallTime.current = time;

      if (isInvoking) {
        if (!timerId.current && mounted.current) {
          // Reset any `maxWait` timer.
          // @ts-expect-error - types
          lastInvokeTime.current = lastCallTime.current;
          // Start the timer for the trailing edge.
          startTimer(timerExpired, wait);
          // Invoke the leading edge.
          // @ts-expect-error - types
          return leading ? invokeFunc(lastCallTime.current) : result.current;
        }
        if (maxing) {
          // Handle invocations in a tight loop.
          startTimer(timerExpired, wait);
          // @ts-expect-error - types
          return invokeFunc(lastCallTime.current);
        }
      }
      if (!timerId.current) {
        startTimer(timerExpired, wait);
      }
      return result.current;
    };

    func.cancel = () => {
      if (timerId.current) {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        isRaf
          ? cancelAnimationFrame(timerId.current)
          : clearTimeout(timerId.current);
      }
      lastInvokeTime.current = 0;
      // @ts-expect-error - types
      lastArgs.current =
        lastCallTime.current =
        lastThis.current =
        timerId.current =
          null;
    };

    func.isPending = () => {
      return !!timerId.current;
    };

    func.flush = () => {
      return !timerId.current ? result.current : trailingEdge(Date.now());
    };

    return func;
  }, [leading, maxing, wait, maxWait, trailing, isRaf]);

  return debounced;
}

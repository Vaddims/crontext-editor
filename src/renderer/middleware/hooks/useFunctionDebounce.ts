import { useRef } from "react";

const useFunctionDebounce = <T extends (...args: any[]) => void>(callback: T, timeout?: number) => {
  const timeoutRef = useRef<null | NodeJS.Timeout>(null);

  return (...args: Parameters<T>) => {
    if (!timeout) {
      callback.apply({}, args);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      callback(...args);
    }, timeout);
  }
}

export default useFunctionDebounce;
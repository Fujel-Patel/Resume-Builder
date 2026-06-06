import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of the given value.
 * The returned value only updates after the specified delay has passed without further changes.
 */
export default function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

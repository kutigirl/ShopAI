// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

/**
 * Custom Hook useDebounce: Trì hoãn cập nhật giá trị sau một khoảng delay (ms)
 * Giúp chống spam tìm kiếm và giảm tải các hàm lọc/gọi API
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;

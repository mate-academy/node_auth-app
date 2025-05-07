import { useState } from 'react';

function useLocalStorage(key: string, initialValue: string | null | boolean) {
  const storedValue = localStorage.getItem(key);
  const [value, setValue] = useState(storedValue ? JSON.parse(storedValue) : initialValue);

  const setStoredValue = (newValue: string | null | boolean) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, setStoredValue];
}

export default useLocalStorage;

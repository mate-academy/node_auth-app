import { useCallback, useState } from "react";

export const useLoading = (interval, text = '') => {
  const [message, set] = useState(text);

  const setMessage = useCallback((str) => {
    if (str === '...') {
      let count = 1;
      
      set('.');

      interval.current = setInterval(() => {
        count++;
    
        count > 3 && (count = 1);

        set(str.slice(0, count));
      }, 500);
    } else {
      set(str);
    }
  }, [interval])

  return [message, setMessage];
};

'use strict';

import { useEffect, useState } from 'react';

export const usePageError = (
  initial: boolean
): [boolean, (b: boolean) => void] => {
  const [error, setError] = useState(initial);

  useEffect(() => {
    if (!error) {
      return;
    }

    const timerId = setTimeout(() => {
      setError(false);
    }, 3000);

    return () => {
      clearTimeout(timerId);
    };
  }, [error]);

  return [error, setError];
};

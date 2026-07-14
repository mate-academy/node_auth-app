import { useEffect, useState } from 'react';

export const useNotification = (
  initialNotification: { error: string; success: string } = { error: '', success: '' },
) => {
  const [notification, setNotification] = useState(initialNotification);

  const toggleNotification = (value: { error?: string; success?: string }) => {
    setNotification((prev) => ({ ...prev, ...value }));
  };

  useEffect(() => {
    if (!notification) {
      return;
    }

    const timerId = setTimeout(() => {
      setNotification({ error: '', success: '' });
    }, 5000);

    return () => {
      clearTimeout(timerId);
    };
  }, [notification]);

  return [notification, toggleNotification] as const;
};

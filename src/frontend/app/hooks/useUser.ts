'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/app/lib/api';
import axios from 'axios';

const fetchUser = async () => {
  try {
    const { data } = await api.get('/api/user');

    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null;
    }
    throw error;
  }
};

export const useUser = () => {
  const query = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

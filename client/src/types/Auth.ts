export type ActivationStatus = 'idle' | 'loading' | 'success' | 'error';

export type ApiResponse<T> = {
  data: T;
  error?: string;
  isLoading?: boolean
};

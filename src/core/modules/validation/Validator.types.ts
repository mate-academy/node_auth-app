export interface FilterKey<T> {
  key: keyof T;
  isValid: (value: unknown) => boolean;
  errMessage: string;
}

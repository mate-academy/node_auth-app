export type InputType = 'password' | 'email' | 'name';

export type FieldConfig = {
  type: InputType;
  initialValue?: string;
  label: string;
};

export type Fields = Record<string, FieldConfig>;

import React, { useState } from 'react';
import { FormErros, SubmitCallback, User } from '../types/allTypes';

export const useFormData = (
  callback: SubmitCallback,
  initialPassword?: string,
) => {
  const [formData, setFormData] = useState<User & { confirmation: string }>({
    name: '',
    email: '',
    password: initialPassword || '',
    confirmation: '',
  });
  const [errors, setErrors] = useState<FormErros>({});

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    callback(formData).catch((error) => {
      setErrors(error.errors);
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return {
    formData,
    errors,
    handleChange,
    handleSubmit,
  };
};

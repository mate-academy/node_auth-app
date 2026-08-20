import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  profileEmailSchema,
  type ProfileEmailFormData,
} from '../schemas/profileEmailSchema';
import { Card } from '../../shared/components/Card';
import { Input, Loader } from '../../shared/components';
import { api } from '../../shared/api/api';
import { useState } from 'react';
import { useAuthState } from '../../shared/store/AuthContext';

export const ProfileEmailForm = () => {
  const { user } = useAuthState();
  const [isSent, setIsSent] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileEmailFormData>({
    resolver: zodResolver(profileEmailSchema),
    defaultValues: { newEmail: user?.email || '', password: '' },
  });

  const onSubmit = async (data: ProfileEmailFormData) => {
    try {
      await api.patch('/users/email-change', data);
      setIsSent(true);
    } catch (error: any) {
      setError('root', {
        type: 'server',
        message: error.response?.data?.message || 'Operation failed',
      });
    }
  };

  if (isSent) {
    return (
      <Card className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
        <h2 className="text-xl font-bold text-slate-100 mb-2">
          Please check your new email
        </h2>
        <p className="text-sm text-slate-400">
          We send activation link to your new email account. Please confirm your
          email.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <form
        onSubmit={handleSubmit(onSubmit)}
        method="post"
        className="flex flex-col gap-4 border px-4 py-4 rounded-xl border-slate-800"
      >
        <Input
          label="New email"
          type="email"
          error={errors.newEmail?.message}
          placeholder="john@example.com"
          {...register('newEmail')}
        />

        <Input
          label="Password"
          error={errors.password?.message}
          type="password"
          placeholder="*********"
          {...register('password')}
        />

        <button
          type="submit"
          className="w-full bg-slate-800 py-3 rounded-2xl cursor-pointer hover:bg-slate-700 active:bg-slate-900"
        >
          {!isSubmitting ? 'Sent' : <Loader fullScreen={false} />}
        </button>
      </form>

      {errors.root && (
        <div className="p-3 text-rose-400 text-sm">{errors.root?.message}</div>
      )}
    </Card>
  );
};

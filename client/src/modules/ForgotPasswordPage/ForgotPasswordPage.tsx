import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { Loader } from '../shared/components';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from './forgotPassword.schema';
import { api } from '../shared/api/api';
import { Input } from '../shared/components/Input';
import { Card } from '../shared/components/Card';

export const ForgotPasswordPage = () => {
  const [isSent, setIsSent] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = useCallback(
    async (data: ForgotPasswordFormData) => {
      try {
        await api.post('/auth/password-resets', data);
        setIsSent(true);
      } catch (error: any) {
        setError('root', {
          type: 'server',
          message: error.response?.data?.message || 'Password reset failed',
        });
      }
    },
    [setError],
  );

  if (isSent) {
    return (
      <Card className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
        <h2 className="text-xl font-bold text-slate-100 mb-2">
          Please check your email
        </h2>
        <p className="text-sm text-slate-400">
          We send reset password link to your email account.
        </p>
      </Card>
    );
  }

  return (
    <Card className=" flex flex-col gap-4 ">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 border px-4 py-4 rounded-xl border-slate-800"
      >
        <h1 className="border-b w-full border-slate-700 pb-4">
          Reset Password
        </h1>

        <Input
          label="Email"
          error={errors.email?.message}
          placeholder="john@example.com"
          {...register('email')}
          type="email"
        />

        <button
          type="submit"
          className="w-full bg-slate-800 py-3 rounded-2xl cursor-pointer hover:bg-slate-700 active:bg-slate-900 mt-3"
        >
          {!isSubmitting ? 'Send' : <Loader fullScreen={false} />}
        </button>
      </form>

      {errors.root && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
          {errors.root?.message}
        </div>
      )}
    </Card>
  );
};

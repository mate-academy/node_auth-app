'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ResetSchema } from '../lib/shema';
import { api } from '../lib/api';
import { getApiErrorMessage } from '../lib/api-errors';
import { formInputClass } from '../lib/form-styles';
import { FieldError } from '../components/field-error';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type ResetInput = z.infer<typeof ResetSchema>;

export default function ResetForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetInput>({
    resolver: zodResolver(ResetSchema),
  });

  const router = useRouter();

  async function onSubmit(data: ResetInput) {
    try {
      const res = await api.post('/api/auth/reset-password', data);

      if (res.status === 200) {
        router.push('/reset-password/sent');
        return;
      }

      toast.error('Could not send reset email. Please try again.');
    } catch (error: unknown) {
      toast.error(
        getApiErrorMessage(
          error,
          'Could not send reset email. Please try again.',
        ),
      );
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <h2 className="mb-1 text-2xl font-semibold text-rose-50">Reset password</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Enter your email"
            className={formInputClass}
            autoComplete="email"
            {...register('email')}
          />
          <FieldError message={errors.email?.message} />
        </div>

        <button
          disabled={isSubmitting}
          type="submit"
          className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-rose-600 to-fuchsia-600 px-4 py-3 font-semibold text-white shadow-[0_0_18px_rgba(244,63,94,0.35)] transition hover:from-rose-500 hover:to-fuchsia-500 disabled:opacity-60"
        >
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
    </div>
  );
}

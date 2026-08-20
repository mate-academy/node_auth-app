import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../shared/api/api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader } from '../shared/components/Loader';
import { Input } from '../shared/components/Input';
import { useForm } from 'react-hook-form';
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from './resetPassword.schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '../shared/components/Card';

export const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = useCallback(
    async (data: ResetPasswordFormData) => {
      if (!token) {
        setError('root', {
          type: 'server',
          message: 'Password token is missing',
        });
        return;
      }

      try {
        const { confirmPassword, ...rest } = data;
        await api.post(`/auth/password-resets/confirmation/${token}`, rest);
        setIsSent(true);
      } catch (error: any) {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        if (
          status === 404 ||
          status === 410 ||
          message?.toLowerCase().includes('token')
        ) {
          setIsTokenExpired(true);
          return;
        }

        setError('root', {
          type: 'server',
          message:
            error.response?.data?.message ||
            'Failed to activate account. The link may be expired.',
        });
      }
    },
    [token, setError],
  );

  useEffect(() => {
    if (!isSent) return;
    const timer = setTimeout(() => navigate('/login'), 5000);

    return () => clearTimeout(timer);
  }, [isSent]);

  if (isTokenExpired || !token) {
    return (
      <Card className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
        <h2 className="text-xl font-bold text-red-500 mb-2">
          Password activation failed
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          The time of the link has expired or it has already been used.
        </p>
        <Link
          to="/forgot-password"
          className="w-full inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl transition text-sm"
        >
          Request new link
        </Link>
      </Card>
    );
  }

  if (isSent) {
    return (
      <Card className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
        <h2 className="text-xl font-bold text-slate-100 mb-2">
          Password has been changed successfully
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Redirecting to login page in 5 seconds...
        </p>
        <Link
          to="/login"
          className="w-full inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl transition-colors text-sm"
        >
          Go to Login
        </Link>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4 ">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 border px-4 py-4 rounded-xl border-slate-800"
      >
        <h2 className="border-b w-full border-slate-700 pb-4">
          Change your password
        </h2>

        <p className="text-xs text-slate-400">
          Password must be at least 8 characters long and contain at least one
          letter and one number.
        </p>

        <Input
          label="Password"
          error={errors.password?.message}
          placeholder="**********"
          {...register('password')}
          type="password"
        />

        <Input
          label="Confirm password"
          error={errors.confirmPassword?.message}
          placeholder="**********"
          {...register('confirmPassword')}
          type="password"
        />

        <button
          type="submit"
          className="w-full bg-slate-800 py-3 rounded-2xl cursor-pointer hover:bg-slate-700 active:bg-slate-900 mt-3"
        >
          {!isSubmitting ? 'Save' : <Loader fullScreen={false} />}
        </button>

        <Link to="/login" className="self-start hover:underline">
          Go to Login
        </Link>
      </form>

      {errors.root && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-xl">
          {errors.root?.message}
        </div>
      )}
    </Card>
  );
};

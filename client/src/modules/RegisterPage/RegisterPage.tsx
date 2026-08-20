import { useCallback, useState } from 'react';
import { api } from '../shared/api/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from './register.schema';
import { Loader } from '../shared/components/Loader';
import { Input } from '../shared/components/Input';
import { Card } from '../shared/components/Card';

export const RegisterPage = () => {
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = useCallback(
    async (data: RegisterFormData) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...payload } = data;

      try {
        await api.post('/auth/registration', payload);
        setIsSent(true);
      } catch (error: any) {
        if (error.response.status === 409) {
          setError('email', {
            type: 'server',
            message:
              error.response?.data?.message ||
              'User with this email already exists',
          });
        } else {
          setError('root', {
            type: 'server',
            message: error.response?.data?.message || 'Registration failed',
          });
        }
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
          We send activation link to your email account. Please confirm your
          email.
        </p>
      </Card>
    );
  }

  return (
    <Card className="w-full flex flex-col gap-4 ">
      <form
        onSubmit={handleSubmit(onSubmit)}
        method="post"
        className="flex flex-col gap-4 border px-4 py-4 rounded-xl border-slate-800"
      >
        <h1 className="border-b w-full border-slate-700 pb-4">Register</h1>

        <Input
          label="Name"
          error={errors.name?.message}
          placeholder="John"
          {...register('name')}
        />

        <Input
          label="Email"
          error={errors.email?.message}
          placeholder="john@example.com"
          {...register('email')}
          type="email"
        />

        <Input
          label="Password"
          error={errors.password?.message}
          placeholder="**********"
          {...register('password')}
          type="password"
        />
        <p className="text-xs text-slate-400">
          Password must be at least 8 characters long and contain at least one
          letter and one number.
        </p>

        <Input
          label="Confirm password"
          error={errors.confirmPassword?.message}
          placeholder="**********"
          {...register('confirmPassword')}
          type="password"
        />

        <button
          type="submit"
          className="w-full bg-slate-800 py-3 rounded-2xl cursor-pointer hover:bg-slate-700 active:bg-slate-900"
        >
          {!isSubmitting ? 'Apply' : <Loader fullScreen={false} />}
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

import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema, type LoginFormData } from './login.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthDispatch } from '../shared/store/AuthContext';
import { useCallback } from 'react';
import { Loader } from '../shared/components';
import { Input } from '../shared/components';
import { Card } from '../shared/components/Card';

export const LoginPage = () => {
  const { login } = useAuthDispatch();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const navigate = useNavigate();

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      try {
        await login(data);
        navigate('/profile');
      } catch (error: any) {
        setError('root', {
          type: 'server',
          message: error.response?.data?.message || 'Login failed',
        });
      }
    },
    [setError, login],
  );

  return (
    <Card className="flex flex-col gap-4 ">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 border px-4 py-4 rounded-xl border-slate-800"
      >
        <h1 className="border-b w-full border-slate-700 pb-4">Login</h1>

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

        <button
          type="submit"
          className="w-full bg-slate-800 py-3 rounded-2xl cursor-pointer hover:bg-slate-700 active:bg-slate-900 mt-3"
        >
          {!isSubmitting ? 'Login' : <Loader fullScreen={false} />}
        </button>

        <div className="flex justify-between ">
          <Link to={'/forgot-password'} className="hover:underline">
            Forgot password
          </Link>
          <Link to={'/register'} className="hover:underline">
            Don't have account
          </Link>
        </div>
      </form>

      {errors.root && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
          {errors.root?.message}
        </div>
      )}
    </Card>
  );
};

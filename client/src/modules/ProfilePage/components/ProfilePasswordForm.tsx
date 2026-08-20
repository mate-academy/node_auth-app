import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Card } from '../../shared/components/Card';
import { Input, Loader } from '../../shared/components';
import { api } from '../../shared/api/api';
import { useState } from 'react';
import {
  profilePasswordSchema,
  type ProfilePasswordFormData,
} from '../schemas/profilePasswordSchema';

export const ProfilePasswordForm = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfilePasswordFormData>({
    resolver: zodResolver(profilePasswordSchema),
    defaultValues: {
      previousPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ProfilePasswordFormData) => {
    setIsSuccess(false);

    const { confirmPassword, ...rest } = data;
    try {
      await api.patch('/users/password', rest);
      setIsSuccess(true);
      reset();
    } catch (error: any) {
      setError('root', {
        type: 'server',
        message: error.response?.data?.message || 'Operation failed',
      });
    }
  };

  return (
    <Card>
      <form
        onSubmit={handleSubmit(onSubmit)}
        method="post"
        className="flex flex-col gap-4 border px-4 py-4 rounded-xl border-slate-800"
      >
        <Input
          label="Previous password"
          error={errors.previousPassword?.message}
          placeholder="**********"
          {...register('previousPassword')}
          type="password"
        />
        <Input
          label="New password"
          error={errors.newPassword?.message}
          placeholder="**********"
          {...register('newPassword')}
          type="password"
        />

        <Input
          label="Confirm password"
          error={errors.confirmPassword?.message}
          placeholder="**********"
          {...register('confirmPassword')}
          type="password"
        />

        {errors.root && (
          <div className="p-3 text-rose-400 text-sm">
            {errors.root?.message}
          </div>
        )}

        {isSuccess && (
          <div className="p-3 text-emerald-400 text-sm">
            Profile password updated successfully.
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-slate-800 py-3 rounded-2xl cursor-pointer hover:bg-slate-700 active:bg-slate-900"
        >
          {!isSubmitting ? 'Save' : <Loader fullScreen={false} />}
        </button>
      </form>
    </Card>
  );
};

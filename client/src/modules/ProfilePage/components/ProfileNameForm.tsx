import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Card } from '../../shared/components/Card';
import { Input, Loader } from '../../shared/components';
import { api } from '../../shared/api/api';
import { useState } from 'react';
import {
  profileNameSchema,
  type ProfileNameFormData,
} from '../schemas/profileNameSchema';
import { useAuthDispatch, useAuthState } from '../../shared/store/AuthContext';

export const ProfileNameForm = () => {
  const { updateUser } = useAuthDispatch();
  const { user } = useAuthState();
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileNameFormData>({
    resolver: zodResolver(profileNameSchema),
    defaultValues: { newName: user?.name },
  });

  const onSubmit = async (data: ProfileNameFormData) => {
    setIsSuccess(false);
    try {
      await api.patch('/users/name', data);
      updateUser({ name: data.newName });
      setIsSuccess(true);
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
          label="Name"
          error={errors.newName?.message}
          placeholder="John"
          {...register('newName')}
        />

        {errors.root && (
          <div className="p-3 text-rose-400 text-sm">
            {errors.root?.message}
          </div>
        )}

        {isSuccess && (
          <div className="p-3 text-emerald-400 text-sm">
            Profile name updated successfully.
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

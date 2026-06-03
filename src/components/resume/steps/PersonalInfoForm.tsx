"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import { useResume } from '@/components/resume/BuilderWizard';
import type { ContactInfo } from '@/types/resume';

type Props = {
  onNext: () => void;
  onBack?: () => void;
};

export default function PersonalInfoForm({ onNext }: Props) {
  const { data, saveStep } = useResume();
  const defaultValues: ContactInfo = data.contact ?? { name: '', email: '' };

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ContactInfo>({ defaultValues, mode: 'onBlur' });

  const onSubmit = async (values: ContactInfo) => {
    await saveStep({ contact: values });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Full Name</label>
        <input
          type="text"
          {...register('name', { required: 'Name is required' })}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          {...register('email', { required: 'Email is required' })}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>
      <div className="flex justify-end space-x-2">
        <button type="submit" disabled={!isValid}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </form>
  );
}

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
        <label className="block text-sm font-medium text-[--text-secondary]">Full Name</label>
        <input
          type="text"
          {...register('name', { required: 'Name is required' })}
          className="mt-1 block w-full rounded border-[--border] bg-[--bg-elevated] text-[--text-primary] focus:ring-2 focus:ring-[--color-primary] focus:border-[--color-primary]"
        />
        {errors.name && <p className="mt-1 text-sm text-[--color-danger]">{errors.name.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-[--text-secondary]">Email</label>
        <input
          type="email"
          {...register('email', { required: 'Email is required' })}
          className="mt-1 block w-full rounded border-[--border] bg-[--bg-elevated] text-[--text-primary] focus:ring-2 focus:ring-[--color-primary] focus:border-[--color-primary]"
        />
        {errors.email && <p className="mt-1 text-sm text-[--color-danger]">{errors.email.message}</p>}
      </div>
      <div className="flex justify-end space-x-2">
        <button type="submit" disabled={!isValid}
          className="px-5 py-2.5 btn-primary"
        >
          Next
        </button>
      </div>
    </form>
  );
}

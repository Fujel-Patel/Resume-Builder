"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useResume } from '@/components/resume/BuilderWizard';
import type { ContactInfo } from '@/types/resume';
import { personalInfoFormSchema } from '@/lib/validation/schemas';
import FormField from '@/components/ui/FormField';
import { useToast } from '@/components/ui/ToastProvider';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

type Props = {
  onNext: () => void;
  onBack?: () => void;
};

export default function PersonalInfoForm({ onNext }: Props) {
  const { data, saveStep } = useResume();
  const { addToast } = useToast();
  const defaultValues: ContactInfo = data.contact ?? { name: '', email: '' };

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ContactInfo>({
    resolver: zodResolver(personalInfoFormSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const onSubmit = async (values: ContactInfo) => {
    await saveStep({ contact: values });
    addToast({ message: '✅ Saved', variant: 'success', duration: 2000 });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField
        label="Full Name"
        helpText="Your full legal name"
        error={errors.name?.message ?? ''}
        required
      >
        <Input
          id="name"
          type="text"
          placeholder="Enter your full name"
          {...register('name')}
        />
      </FormField>

      <FormField
        label="Email"
        helpText="We'll use this to contact you"
        error={errors.email?.message ?? ''}
        required
      >
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          {...register('email')}
        />
      </FormField>

      <div className="flex justify-end space-x-2">
        <Button
          type="submit"
          disabled={!isValid}
          variant="primary"
        >
          Next
        </Button>
      </div>
    </form>
  );
}
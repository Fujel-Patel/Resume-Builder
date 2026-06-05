"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useResume } from '@/components/resume/BuilderWizard';
import type { ResumeData } from '@/types/resume';
import { skillsFormSchema } from '@/lib/validation/schemas';
import FormField from '@/components/ui/FormField';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';

type Props = {
  onNext: () => void;
  onBack: () => void;
};

export default function SkillsForm({ onNext, onBack }: Props) {
  const { data, saveStep } = useResume();
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<string>({
    resolver: zodResolver(skillsFormSchema),
    defaultValue: (data.skills || []).join(', '),
  });

  const onSubmit = async (value: string) => {
    const skillArray = value.split(',').map(s => s.trim()).filter(Boolean);
    await saveStep({ skills: skillArray } as Partial<ResumeData>);
    addToast({ message: '✅ Saved', variant: 'success', duration: 2000 });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField
        label="Skills"
        helpText="Comma-separated list of your skills (e.g., JavaScript, React, Node.js)"
        error={errors?.message ?? ''}
        required
      >
        <Textarea
          {...register('value')}
          placeholder="Comma separated skills, e.g., JavaScript, React, Node.js"
          rows={4}
        />
      </FormField>

      <div className="flex justify-end space-x-2">
        <Button
          onClick={onBack}
          variant="secondary"
        >
          Back
        </Button>
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
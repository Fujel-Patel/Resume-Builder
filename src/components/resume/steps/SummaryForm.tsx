"use client";
import React from 'react';
import useDebounce from '@/hooks/useDebounce';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useResume } from '@/components/resume/BuilderWizard';
import type { ResumeData } from '@/types/resume';
import { summaryFormSchema } from '@/lib/validation/schemas';
import FormField from '@/components/ui/FormField';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';

type Props = {
  onNext: () => void;
  onBack: () => void;
};

export default function SummaryForm({ onNext, onBack }: Props) {
  const { data, saveStep } = useResume();
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<{ summary: string }>({
    resolver: zodResolver(summaryFormSchema),
    defaultValues: { summary: data.summary || '' },
  });

  const summary = watch('summary');
  const debouncedSummary = useDebounce(summary, 300);
  const charCount = debouncedSummary.length;

  const onSubmit = async (data: { summary: string }) => {
    await saveStep({ summary: data.summary } as Partial<ResumeData>);
    addToast({ message: '✅ Saved', variant: 'success', duration: 2000 });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField
        label="Professional Summary"
        helpText="Brief overview of your professional background and goals"
        error={errors.summary?.message ?? ''}
        required
      >
        <Textarea
          {...register('summary')}
          placeholder="Brief professional summary"
          rows={4} maxLength={2000}
        />
        <div className="mt-2 flex justify-end text-[--text-muted] text-xs">
          {charCount} / 500 characters
        </div>
      </FormField>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          onClick={onBack}
          variant="secondary"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={Object.keys(errors).length > 0}
          variant="primary"
        >
          Next
        </Button>
      </div>
    </form>
  );
}
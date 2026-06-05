"use client";
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useResume } from '@/components/resume/BuilderWizard';
import type { Education } from '@/types/resume';

type Props = {
  onNext: () => void;
  onBack: () => void;
};

export default function EducationForm({ onNext, onBack }: Props) {
  const { data, saveStep } = useResume();
  const defaultValues = {
    education: data.education?.length ? data.education : [{ institution: '', degree: '', year: '', location: '' }],
  };

  const { control, register, handleSubmit, formState: { isValid } } = useForm<{ education: Education[] }>({
    defaultValues,
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'education' });

  const onSubmit = async (values: { education: Education[] }) => {
    await saveStep({ education: values.education });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((field, idx) => (
        <div key={field.id} className="border border-[--border] p-4 rounded-md space-y-2 bg-[--bg-surface]">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-[--text-primary]">Education #{idx + 1}</h3>
            {fields.length > 1 && (
              <button type="button" onClick={() => remove(idx)} className="text-[--color-danger] hover:underline">
                Remove
              </button>
            )}
          </div>
          <input
            {...register(`education.${idx}.institution` as const, { required: true })}
            placeholder="Institution"
            className="mt-1 block w-full rounded border-[--border] bg-[--bg-elevated] text-[--text-primary] focus:ring-2 focus:ring-[--color-primary] focus:border-[--color-primary]"
          />
          <input
            {...register(`education.${idx}.degree` as const, { required: true })}
            placeholder="Degree"
            className="mt-1 block w-full rounded border-[--border] bg-[--bg-elevated] text-[--text-primary] focus:ring-2 focus:ring-[--color-primary] focus:border-[--color-primary]"
          />
          <input
            {...register(`education.${idx}.year` as const, { required: true })}
            placeholder="Year (e.g., 2018 - 2022)"
            className="mt-1 block w-full rounded border-[--border] bg-[--bg-elevated] text-[--text-primary] focus:ring-2 focus:ring-[--color-primary] focus:border-[--color-primary]"
          />
          <input
            {...register(`education.${idx}.location` as const)}
            placeholder="Location (optional)"
            className="mt-1 block w-full rounded border-[--border] bg-[--bg-elevated] text-[--text-primary] focus:ring-2 focus:ring-[--color-primary] focus:border-[--color-primary]"
          />
        </div>
      ))}
      <button type="button" onClick={() => append({ institution: '', degree: '', year: '', location: '' })}
        className="px-3 py-1 btn-secondary"
      >
        Add Education
      </button>
      <div className="flex justify-between mt-4">
        <button type="button" onClick={onBack} className="px-4 py-2 btn-secondary">
          Back
        </button>
        <button type="submit" disabled={!isValid} className="px-5 py-2.5 btn-primary">
          Next
        </button>
      </div>
    </form>
  );
}

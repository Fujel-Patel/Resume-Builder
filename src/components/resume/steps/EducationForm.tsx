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
        <div key={field.id} className="border p-4 rounded-md space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Education #{idx + 1}</h3>
            {fields.length > 1 && (
              <button type="button" onClick={() => remove(idx)} className="text-red-600 hover:underline">
                Remove
              </button>
            )}
          </div>
          <input
            {...register(`education.${idx}.institution` as const, { required: true })}
            placeholder="Institution"
            className="mt-1 block w-full rounded border-gray-300"
          />
          <input
            {...register(`education.${idx}.degree` as const, { required: true })}
            placeholder="Degree"
            className="mt-1 block w-full rounded border-gray-300"
          />
          <input
            {...register(`education.${idx}.year` as const, { required: true })}
            placeholder="Year (e.g., 2018 - 2022)"
            className="mt-1 block w-full rounded border-gray-300"
          />
          <input
            {...register(`education.${idx}.location` as const)}
            placeholder="Location (optional)"
            className="mt-1 block w-full rounded border-gray-300"
          />
        </div>
      ))}
      <button type="button" onClick={() => append({ institution: '', degree: '', year: '', location: '' })}
        className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
      >
        Add Education
      </button>
      <div className="flex justify-between mt-4">
        <button type="button" onClick={onBack} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
          Back
        </button>
        <button type="submit" disabled={!isValid} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
          Next
        </button>
      </div>
    </form>
  );
}

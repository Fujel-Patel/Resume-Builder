"use client";
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useResume } from '@/components/resume/BuilderWizard';
import type { Experience } from '@/types/resume';

type Props = {
  onNext: () => void;
  onBack: () => void;
};

export default function WorkExperienceForm({ onNext, onBack }: Props) {
  const { data, saveStep } = useResume();
  const defaultValues: { experience: Experience[] } = {
    experience: data.experience?.length ? data.experience : [{ company: '', role: '', duration: '', bullets: [''] }],
  };

  const { control, register, handleSubmit, formState: { isValid } } = useForm<{ experience: Experience[] }>({
    defaultValues,
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'experience' });

  const onSubmit = async (values: { experience: Experience[] }) => {
    await saveStep({ experience: values.experience });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="border p-4 rounded-md space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Experience #{index + 1}</h3>
            {fields.length > 1 && (
              <button type="button" onClick={() => remove(index)} className="text-red-600 hover:underline">
                Remove
              </button>
            )}
          </div>
          <input
            {...register(`experience.${index}.company` as const, { required: true })}
            placeholder="Company"
            className="mt-1 block w-full rounded border-gray-300"
          />
          <input
            {...register(`experience.${index}.role` as const, { required: true })}
            placeholder="Role"
            className="mt-1 block w-full rounded border-gray-300"
          />
          <input
            {...register(`experience.${index}.duration` as const, { required: true })}
            placeholder="Duration (e.g., Jan 2020 - Present)"
            className="mt-1 block w-full rounded border-gray-300"
          />
          {/* Bullets – simple textarea with newline separated list */}
          <textarea
            {...register(`experience.${index}.bullets` as const, { required: true })}
            placeholder="Bullet points, one per line"
            rows={3}
            className="mt-1 block w-full rounded border-gray-300"
          />
        </div>
      ))}
      <button type="button" onClick={() => append({ company: '', role: '', duration: '', bullets: [''] })}
        className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
      >
        Add Experience
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

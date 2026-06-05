"use client";
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useResume } from '@/components/resume/BuilderWizard';
import type { Education } from '@/types/resume';
import { educationFormSchema } from '@/lib/validation/schemas';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';

type Props = {
  onNext: () => void;
  onBack: () => void;
};

export default function EducationForm({ onNext, onBack }: Props) {
  const { data, saveStep } = useResume();
  const { addToast } = useToast();
  const defaultValues = {
    education: data.education?.length ? data.education : [{ institution: '', degree: '', year: '', location: '' }],
  };

  const { control, register, handleSubmit, formState: { errors, isValid } } = useForm<{ education: Education[] }>({
    resolver: zodResolver(educationFormSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'education' });

  const onSubmit = async (values: { education: Education[] }) => {
    await saveStep({ education: values.education });
    addToast({ message: '✅ Saved', variant: 'success', duration: 2000 });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {fields.map((field, idx) => (
        <div key={field.id} className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-[--text-primary]">Education #{idx + 1}</h3>
            {fields.length > 1 && (
              <Button
                onClick={() => remove(idx)}
                variant="link"
                className="p-0"
              >
                Remove
              </Button>
            )}
          </div>

          <FormField
            label="Institution"
            helpText="Name of school, college, or university"
            error={errors.education?.[idx]?.institution?.message ?? ''}
            required
          >
            <Input
              id={`institution-${field.id}`}
              placeholder="Enter institution name"
              {...register(`education.${idx}.institution`)}
            />
          </FormField>

          <FormField
            label="Degree"
            helpText="Your degree or field of study"
            error={errors.education?.[idx]?.degree?.message ?? ''}
            required
          >
            <Input
              id={`degree-${field.id}`}
              placeholder="Enter your degree"
              {...register(`education.${idx}.degree`)}
            />
          </FormField>

          <FormField
            label="Year"
            helpText="Years attended (e.g., 2018 - 2022)"
            error={errors.education?.[idx]?.year?.message ?? ''}
            required
          >
            <Input
              id={`year-${field.id}`}
              placeholder="Enter year range"
              {...register(`education.${idx}.year`)}
            />
          </FormField>

          <FormField
            label="Location"
            helpText="City, State (optional)"
            error={errors.education?.[idx]?.location?.message ?? ''}
            required={false}
          >
            <Input
              id={`location-${field.id}`}
              placeholder="Enter location (optional)"
              {...register(`education.${idx}.location`)}
            />
          </FormField>
        </div>
      ))}

      <Button
        onClick={() => append({ institution: '', degree: '', year: '', location: '' })}
        variant="secondary"
        className="w-full"
      >
        Add Education
      </Button>

      <div className="flex justify-between mt-6">
        <Button onClick={onBack} variant="secondary">
          Back
        </Button>
        <Button type="submit" disabled={!isValid} variant="primary">
          Next
        </Button>
      </div>
    </form>
  );
}
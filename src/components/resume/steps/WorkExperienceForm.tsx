"use client";
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useResume } from '@/components/resume/BuilderWizard';
import { useToast } from '@/components/ui/ToastProvider';
import type { Experience } from '@/types/resume';
import { workExperienceFormSchema } from '@/lib/validation/schemas';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

type Props = {
  onNext: () => void;
  onBack: () => void;
};

export default function WorkExperienceForm({ onNext, onBack }: Props) {
  const { data, saveStep } = useResume();
  const { addToast } = useToast();
  const defaultValues: { experience: Experience[] } = {
    experience: data.experience?.length ? data.experience : [{ company: '', role: '', duration: '', bullets: [''] }],
  };

  const { control, register, handleSubmit, formState: { errors, isValid } } = useForm<{ experience: Experience[] }>({
    resolver: zodResolver(workExperienceFormSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'experience' });

  const onSubmit = async (values: { experience: Experience[] }) => {
    await saveStep({ experience: values.experience });
    addToast({ message: '✅ Saved', variant: 'success', duration: 2000 });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-[--text-primary]">Experience #{index + 1}</h3>
            {fields.length > 1 && (
              <Button
                onClick={() => remove(index)}
                variant="link"
                className="p-0"
              >
                Remove
              </Button>
            )}
          </div>

          <FormField
            label="Company"
            helpText="Company name where you worked"
            error={errors.experience?.[index]?.company?.message ?? ''}
            required
          >
            <Input
              id={`company-${field.id}`}
              placeholder="Enter company name"
              {...register(`experience.${index}.company`)}
            />
          </FormField>

          <FormField
            label="Role"
            helpText="Your job title or position"
            error={errors.experience?.[index]?.role?.message ?? ''}
            required
          >
            <Input
              id={`role-${field.id}`}
              placeholder="Enter your job title"
              {...register(`experience.${index}.role`)}
            />
          </FormField>

          <FormField
            label="Duration"
            helpText="Employment period (e.g., Jan 2020 - Present)"
            error={errors.experience?.[index]?.duration?.message ?? ''}
            required
          >
            <Input
              id={`duration-${field.id}`}
              placeholder="Enter duration"
              {...register(`experience.${index}.duration`)}
            />
          </FormField>

          <FormField
            label="Bullet Points"
            helpText="Key responsibilities and achievements (one per line)"
            error={errors.experience?.[index]?.bullets?.message ?? ''}
            required
          >
            <Textarea
              id={`bullets-${field.id}`}
              placeholder="Enter bullet points, one per line"
              rows={3}
              {...register(`experience.${index}.bullets`)}
            />
          </FormField>
        </div>
      ))}

      <Button
        onClick={() => append({ company: '', role: '', duration: '', bullets: [''] })}
        variant="secondary"
        className="w-full"
      >
        Add Experience
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
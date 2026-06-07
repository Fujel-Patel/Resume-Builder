"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useResume } from '@/components/resume/BuilderWizard';
import FormField from '@/components/ui/FormField';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';

type Props = {
  onNext: () => void;
  onBack: () => void;
};

const skillsFormSchema = z.object({
  skills: z.string().refine(
    (val) => val.split(',').map((s) => s.trim()).filter(Boolean).length > 0,
    'Enter at least one skill'
  ),
});

type SkillsFormValues = z.infer<typeof skillsFormSchema>;

export default function SkillsForm({ onNext, onBack }: Props) {
  const { data, saveStep } = useResume();
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SkillsFormValues>({
    resolver: zodResolver(skillsFormSchema),
    defaultValues: {
      skills: (data.skills || []).map((s) => (typeof s === 'string' ? s : s.name)).join(', '),
    },
  });

  const onSubmit = async (values: SkillsFormValues) => {
    const skillArray = values.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name }));
    await saveStep({ skills: skillArray });
    addToast({ message: '✅ Saved', variant: 'success', duration: 2000 });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField
        label="Skills"
        helpText="Comma-separated list of your skills (e.g., JavaScript, React, Node.js)"
        error={errors.skills?.message ?? ''}
        required
      >
        <Textarea
          {...register('skills')}
          placeholder="Comma separated skills, e.g., JavaScript, React, Node.js"
          rows={4} maxLength={2000}
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
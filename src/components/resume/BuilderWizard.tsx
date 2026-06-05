"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import Stepper from './Stepper';
import PersonalInfoForm from './steps/PersonalInfoForm';
import WorkExperienceForm from './steps/WorkExperienceForm';
import EducationForm from './steps/EducationForm';
import SkillsForm from './steps/SkillsForm';
import SummaryForm from './steps/SummaryForm';
import GenerateResumeStep from './steps/GenerateResumeStep';
import ResumePreview from './ResumePreview';
import { getAllTemplates } from '@/components/templates';
import type { ResumeData } from '@/types/resume';

interface ResumeContextValue {
 draftId: string;
 data: ResumeData;
 setData: (partial: Partial<ResumeData>) => void;
 saveStep: (partial: Partial<ResumeData>) => Promise<void>;
}

const ResumeContext = createContext<ResumeContextValue | undefined>(undefined);

export const useResume = () => {
 const ctx = useContext(ResumeContext);
 if (!ctx) throw new Error('useResume must be used within BuilderWizard');
 return ctx;
};

interface BuilderWizardProps {
 initialDraft: { id: string; data: ResumeData } | null;
}

const steps = [
 { label: 'Personal Info', component: PersonalInfoForm },
 { label: 'Work Experience', component: WorkExperienceForm },
 { label: 'Education', component: EducationForm },
 { label: 'Skills', component: SkillsForm },
 { label: 'Summary', component: SummaryForm },
 { label: 'Generate', component: GenerateResumeStep },
] as const;

export default function BuilderWizard({ initialDraft }: BuilderWizardProps) {
 const [currentStep, setCurrentStep] = useState(0);
 const [draftId, setDraftId] = useState<string>('');
 const [selectedTemplateId, setSelectedTemplateId] = useState<string>('modern-professional');
 const [exporting, setExporting] = useState(false);
 const templates = getAllTemplates();
 const [resumeData, setResumeData] = useState<ResumeData>({ contact: { name: '', email: '' }, experience: [], education: [], skills: [] } as ResumeData);

 useEffect(() => {
 if (initialDraft) {
 setDraftId(initialDraft.id);
 setResumeData({ ...(initialDraft.data as ResumeData) });
 }
 }, [initialDraft]);

 const setData = (partial: Partial<ResumeData>) => {
 setResumeData(prev => ({ ...prev, ...partial }));
 };

 const saveStep = async (partial: Partial<ResumeData>) => {
 setData(partial);
 if (!draftId) return;
 try {
 const res = await fetch(`/api/resumes/draft?id=${draftId}`, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(partial),
 });
 if (!res.ok) {
 console.error('Failed to save draft', await res.text());
 }
 } catch (e) {
 console.error('Error saving draft', e);
 }
 };

 const handleExportPDF = async () => {
 setExporting(true);
 try {
 const res = await fetch('/api/resumes/export', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ data: resumeData, selectedTemplateId }),
 });
 if (!res.ok) throw new Error('Export failed');
 const blob = await res.blob();
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = 'resume.pdf';
 document.body.appendChild(a);
 a.click();
 a.remove();
 URL.revokeObjectURL(url);
 } catch (e) {
 console.error('Error exporting PDF', e);
 } finally {
 setExporting(false);
 }
 };

 const CurrentStepComponent = steps[currentStep].component;

 return (
 <ResumeContext.Provider value={{ draftId, data: resumeData, setData, saveStep }}>
 <div className="page-container max-w-6xl mx-auto bg-[--bg-surface]/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-[--border]">
 <Stepper steps={steps.map(s => s.label)} activeStep={currentStep} />
 <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
 <div className="flex-1">
 <label className="block text-sm font-medium text-[--text-secondary] mb-2">
 Template
 </label>
 <div className="flex flex-wrap gap-2">
 {templates.map(t => (
 <button
 key={t.id}
 onClick={() => setSelectedTemplateId(t.id)}
 className={`flex items-center gap-2 px-3 py-2 rounded-full text-[--text-primary] font-medium transition-all duration-200 border border-[--border]/50
  ${selectedTemplateId === t.id
    ? 'bg-gradient-to-r from-[--color-primary] to-[--color-accent] text-white border-[--color-primary]/20'
    : 'bg-[--bg-surface]/50 hover:bg-[--bg-elevated]/50 border-[--border]/30'}
 `}
 >
 {t.name}
 </button>
 ))}
 </div>
 </div>
 <button
 type="button"
 onClick={handleExportPDF}
 disabled={exporting}
 className="btn-primary w-full sm:w-auto"
 >
 {exporting ? 'Generating PDF…' : 'Download PDF'}
 </button>
 </div>
 <div className="mt-8 flex flex-col lg:flex-row gap-6">
 <div className="lg:w-1/2">
 <CurrentStepComponent
 onNext={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
 onBack={() => setCurrentStep(prev => Math.max(prev - 1, 0))}
 />
 </div>
 <div className="lg:w-1/2 border-l border-[--border]/50 lg:pl-6">
 <ResumePreview data={resumeData} selectedTemplateId={selectedTemplateId} />
 </div>
 </div>
 </div>
 </ResumeContext.Provider>
 );
}

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
 <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
 <Stepper steps={steps.map(s => s.label)} activeStep={currentStep} />
 <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
 <div className="flex-1">
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Template
 </label>
 <div className="flex flex-wrap gap-2">
 {templates.map(t => (
 <button
 key={t.id}
 onClick={() => setSelectedTemplateId(t.id)}
 className={
 'rounded-full border px-3 py-1 text-xs font-medium transition-colors ' +
 (selectedTemplateId === t.id
 ? 'border-indigo-600 bg-indigo-600 text-white'
 : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-400')
 }
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
 className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-50 sm:w-auto"
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
 <div className="lg:w-1/2 border-l border-gray-200 lg:pl-6">
 <ResumePreview data={resumeData} selectedTemplateId={selectedTemplateId} />
 </div>
 </div>
 </div>
 </ResumeContext.Provider>
 );
}

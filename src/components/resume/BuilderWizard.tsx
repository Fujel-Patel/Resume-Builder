"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import Stepper from './Stepper';
import PersonalInfoForm from './steps/PersonalInfoForm';
import WorkExperienceForm from './steps/WorkExperienceForm';
import EducationForm from './steps/EducationForm';
import SkillsForm from './steps/SkillsForm';
import SummaryForm from './steps/SummaryForm';
import GenerateResumeStep from './steps/GenerateResumeStep';
import LazyResumePreview from './LazyResumePreview';
import { getAllTemplates } from '@/components/templates';
import Button from '@/components/ui/Button';
import TemplateCard from '@/components/templates/TemplateCard';
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
  // Template customization – color (hex) and font (name)
  const [selectedColor, setSelectedColor] = useState<string>(localStorage.getItem('templateColor') || '#000000');
  const [selectedFont, setSelectedFont] = useState<string>(localStorage.getItem('templateFont') || 'sans-serif');
 const [exporting, setExporting] = useState(false);
 const templates = getAllTemplates();
 const [resumeData, setResumeData] = useState<ResumeData>({ contact: { name: '', email: '' }, experience: [], education: [], skills: [] } as ResumeData);
  // Undo/Redo stacks
  const [history, setHistory] = useState<ResumeData[]>([]);
  const [future, setFuture] = useState<ResumeData[]>([]);

 useEffect(() => {
 if (initialDraft) {
 setDraftId(initialDraft.id);
 setResumeData({ ...(initialDraft.data as ResumeData) });
 }
 }, [initialDraft]);

 // Persist template customization preferences
 useEffect(() => {
 localStorage.setItem('templateColor', selectedColor);
 localStorage.setItem('templateFont', selectedFont);
 }, [selectedColor, selectedFont]);

  // Warn user if they try to leave with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      const hasData = Object.values(resumeData).some(v => {
        if (Array.isArray(v)) return v.length > 0;
        if (v && typeof v === 'object') return Object.keys(v).length > 0;
        return !!v;
      });
      if (hasData) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [resumeData]);

 const setData = (partial: Partial<ResumeData>) => {
   setResumeData(prev => {
     // push current state to history
     setHistory(h => [...h, prev]);
     // clear future on new action
     setFuture([]);
     return { ...prev, ...partial };
   });
 };

 const undo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setFuture(f => [resumeData, ...f]);
    setResumeData(previous);
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture(f => f.slice(1));
    setHistory(h => [...h, resumeData]);
    setResumeData(next);
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
 <div data-testid="builder-wizard" className="page-container max-w-6xl mx-auto bg-[--bg-surface]/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-[--border]">
 <div className="flex items-center justify-between">
  <Stepper steps={steps.map(s => s.label)} activeStep={currentStep} />
  <div className="space-x-2">
    <button onClick={undo} disabled={history.length===0} className="btn-secondary btn-sm">Undo</button>
    <button onClick={redo} disabled={future.length===0} className="btn-secondary btn-sm">Redo</button>
  </div>
</div>
 <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
 <div className="flex-1">
 <label className="block text-sm font-medium text-[--text-secondary] mb-2">
 Template
 </label>
 <div className="flex flex-wrap gap-4">
   {templates.map(t => (
     <TemplateCard
       key={t.id}
       template={t}
       selected={selectedTemplateId === t.id}
       onSelect={() => setSelectedTemplateId(t.id)}
     />
   ))}
 </div>
 </div>
 <button
 type="button"
 onClick={handleExportPDF}
 disabled={exporting}
 className="btn-primary w-full sm:w-auto hidden"
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
 <LazyResumePreview data={resumeData} selectedTemplateId={selectedTemplateId} />
 </div>
{currentStep === steps.length - 1 && (
  <div className="mt-8 border-t border-[--border]/30 pt-6 flex flex-col items-center">
    <h2 className="text-lg font-semibold mb-4">Export Options</h2>
    <div className="flex space-x-4">
      <Button variant="primary" size="lg" onClick={handleExportPDF} disabled={exporting}>
        {exporting ? 'Generating PDF…' : 'Download PDF'}
      </Button>
      <Button variant="secondary" size="lg" onClick={() => alert('DOCX export not implemented yet')}>
        Export as DOCX
      </Button>
    </div>
  </div>
)}
 </div>
 </div>
 </ResumeContext.Provider>
 );
}

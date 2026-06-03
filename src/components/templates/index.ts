export { ModernProfessionalTemplate } from './ModernProfessionalTemplate';
export { ClassicConservativeTemplate } from './ClassicConservativeTemplate';
export { MinimalCleanTemplate } from './MinimalCleanTemplate';
export { CreativeBoldTemplate } from './CreativeBoldTemplate';
export { ExecutiveSeniorTemplate } from './ExecutiveSeniorTemplate';
export { TechnicalDeveloperTemplate } from './TechnicalDeveloperTemplate';
export { AcademicScholarTemplate } from './AcademicScholarTemplate';
export { FreshGraduateTemplate } from './FreshGraduateTemplate';

export const TEMPLATE_REGISTRY = [
 { id: 'modern-professional', name: 'Modern Professional', description: 'Clean blue header bar with structured layout', tags: ['professional', 'modern', 'clean'], Component: ModernProfessionalTemplate },
 { id: 'classic-conservative', name: 'Classic Conservative', description: 'Centered header, serif typography, traditional format', tags: ['conservative', 'formal', 'traditional'], Component: ClassicConservativeTemplate },
 { id: 'minimal-clean', name: 'Minimal Clean', description: 'Extra white space, muted accents, distraction-free', tags: ['minimal', 'light', 'modern'], Component: MinimalCleanTemplate },
 { id: 'creative-bold', name: 'Creative Bold', description: 'Diagonal accent header, expressive, design-forward', tags: ['creative', 'bold', 'modern'], Component: CreativeBoldTemplate },
 { id: 'executive-senior', name: 'Executive Senior', description: 'Dark navy and gold, discretion with gravitas', tags: ['executive', 'senior', 'formal'], Component: ExecutiveSeniorTemplate },
 { id: 'technical-developer', name: 'Technical Developer', description: 'Tech skills front and center, code-friendly layout', tags: ['tech', 'developer', 'modern'], Component: TechnicalDeveloperTemplate },
 { id: 'academic-scholar', name: 'Academic Scholar', description: 'Research-first CV with publications area', tags: ['academic', 'research', 'formal'], Component: AcademicScholarTemplate },
 { id: 'fresh-graduate', name: 'Fresh Graduate', description: 'Bright and forwarding-looking, emphasizes potential', tags: ['student', 'graduate', 'modern'], Component: FreshGraduateTemplate },
];

export function getTemplateComponent(id: string) {
 return TEMPLATE_REGISTRY.find(t => t.id === id) ?? null;
}

export function getAllTemplates() {
 return TEMPLATE_REGISTRY;
}

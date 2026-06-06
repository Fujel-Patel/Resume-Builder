import { pdf } from '@react-pdf/renderer';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { NextResponse } from 'next/server';
import { getTemplateComponent, TEMPLATE_REGISTRY } from '@/components/templates';
import type { ResumeData } from '@/types/resume';

// Validation constants
const VALIDATION_LIMITS = {
  MAX_EXPERIENCE_ITEMS: 10,
  MAX_EDUCATION_ITEMS: 5,
  MAX_SKILLS: 20,
  MAX_CERTIFICATIONS: 10,
  MAX_PROJECTS: 10,
  MAX_STRING_LENGTH: 500,
} as const;

// Template utilities moved to components/templates/index.ts
// We'll use getTemplateComponent from there and TEMPLATE_REGISTRY for validation

export const runtime = 'nodejs';

/**
 * Validate resume data to prevent abuse and ensure data integrity
 */
function validateResumeData(data: Partial<ResumeData>): { valid: boolean; error?: string } {
  if (!data.contact || typeof data.contact !== 'object') {
    return { valid: false, error: 'Invalid contact information' };
  }

  if (!data.contact.name || typeof data.contact.name !== 'string' || data.contact.name.trim() === '') {
    return { valid: false, error: 'Contact name is required' };
  }

  // Validate string lengths
  const stringFields = [
    { value: data.contact.name, field: 'contact.name' },
    { value: data.contact.email, field: 'contact.email' },
    { value: data.contact.phone, field: 'contact.phone' },
    { value: data.contact.location, field: 'contact.location' },
    { value: data.summary, field: 'summary' },
  ];

  for (const { value, field } of stringFields) {
    if (value && typeof value === 'string' && value.length > VALIDATION_LIMITS.MAX_STRING_LENGTH) {
      return { valid: false, error: `${field} exceeds maximum length of ${VALIDATION_LIMITS.MAX_STRING_LENGTH}` };
    }
  }

  // Validate array lengths
  if (data.experience?.length > VALIDATION_LIMITS.MAX_EXPERIENCE_ITEMS) {
    return { valid: false, error: `Too many experience items (max ${VALIDATION_LIMITS.MAX_EXPERIENCE_ITEMS})` };
  }

  if (data.education?.length > VALIDATION_LIMITS.MAX_EDUCATION_ITEMS) {
    return { valid: false, error: `Too many education items (max ${VALIDATION_LIMITS.MAX_EDUCATION_ITEMS})` };
  }

  if (data.skills?.length > VALIDATION_LIMITS.MAX_SKILLS) {
    return { valid: false, error: `Too many skills (max ${VALIDATION_LIMITS.MAX_SKILLS})` };
  }

  if (data.certifications?.length > VALIDATION_LIMITS.MAX_CERTIFICATIONS) {
    return { valid: false, error: `Too many certifications (max ${VALIDATION_LIMITS.MAX_CERTIFICATIONS})` };
  }

  if (data.projects?.length > VALIDATION_LIMITS.MAX_PROJECTS) {
    return { valid: false, error: `Too many projects (max ${VALIDATION_LIMITS.MAX_PROJECTS})` };
  }

  // Validate experience items
  if (data.experience) {
    for (let i = 0; i < data.experience.length; i++) {
      const exp = data.experience[i];
      if (!exp || typeof exp !== 'object') {
        return { valid: false, error: `Invalid experience item at index ${i}` };
      }

      if (exp.role && typeof exp.role === 'string' && exp.role.length > VALIDATION_LIMITS.MAX_STRING_LENGTH) {
        return { valid: false, error: `Experience ${i}.role exceeds maximum length` };
      }

      if (exp.company && typeof exp.company === 'string' && exp.company.length > VALIDATION_LIMITS.MAX_STRING_LENGTH) {
        return { valid: false, error: `Experience ${i}.company exceeds maximum length` };
      }
    }
  }

  // Validate education items
  if (data.education) {
    for (let i = 0; i < data.education.length; i++) {
      const edu = data.education[i];
      if (!edu || typeof edu !== 'object') {
        return { valid: false, error: `Invalid education item at index ${i}` };
      }

      if (edu.degree && typeof edu.degree === 'string' && edu.degree.length > VALIDATION_LIMITS.MAX_STRING_LENGTH) {
        return { valid: false, error: `Education ${i}.degree exceeds maximum length` };
      }

      if (edu.institution && typeof edu.institution === 'string' && edu.institution.length > VALIDATION_LIMITS.MAX_STRING_LENGTH) {
        return { valid: false, error: `Education ${i}.institution exceeds maximum length` };
      }
    }
  }

  return { valid: true };
}

function buildDocx(data: ResumeData) {
  // existing implementation unchanged
}

// Helper to build plain‑text (TXT) export
function buildTxt(data: ResumeData): string {
  const lines: string[] = [];
  if (data.contact?.name) lines.push(data.contact.name);
  if (data.contact?.email || data.contact?.phone || data.contact?.location) {
    lines.push([data.contact.email, data.contact.phone, data.contact.location].filter(Boolean).join(' | '));
  }
  lines.push('');
  if (data.summary) {
    lines.push('Summary');
    lines.push(data.summary);
    lines.push('');
  }
  if (data.experience?.length) {
    lines.push('Experience');
    data.experience.forEach(exp => {
      lines.push(`${exp.role ?? ''} - ${exp.company ?? ''}`);
      lines.push([exp.duration, exp.location].filter(Boolean).join(' | '));
      if (exp.bullets?.length) exp.bullets.forEach(b => lines.push(`- ${b}`));
      lines.push('');
    });
  }
  if (data.education?.length) {
    lines.push('Education');
    data.education.forEach(edu => {
      lines.push(`${edu.degree ?? ''} — ${edu.institution ?? ''}`);
      lines.push([edu.year, edu.gpa ? `GPA ${edu.gpa}` : ''].filter(Boolean).join(' | '));
      lines.push('');
    });
  }
  if (data.skills?.length) {
    lines.push('Skills');
    lines.push(data.skills.map(s => typeof s === 'string' ? s : s.name).join(', '));
    lines.push('');
  }
  if (data.certifications?.length) {
    lines.push('Certifications');
    data.certifications.forEach(cert => {
      lines.push([cert.name, cert.issuer, cert.date].filter(Boolean).join(' | '));
    });
    lines.push('');
  }
  if (data.projects?.length) {
    lines.push('Projects');
    data.projects.forEach(p => {
      lines.push(p.name);
      lines.push(p.description);
      if (p.technologies?.length) lines.push(p.technologies.join(', '));
      lines.push('');
    });
  }
  return lines.join('\n');
}

// Export format validation now includes 'txt'

  const children: Paragraph[] = [];

  if (data.contact.name) {
    children.push(new Paragraph({ text: data.contact.name, heading: HeadingLevel.HEADING_1 }));
  }

  if (data.contact.email || data.contact.phone || data.contact.location) {
    children.push(
      new Paragraph({
        text: [data.contact.email, data.contact.phone, data.contact.location].filter(Boolean).join(' | '),
      }),
    );
  }

  if (data.summary) {
    children.push(new Paragraph({ text: 'Professional Summary', heading: HeadingLevel.HEADING_2 }));
    children.push(new Paragraph({ text: data.summary }));
  }

  if (data.experience.length) {
    children.push(new Paragraph({ text: 'Experience', heading: HeadingLevel.HEADING_2 }));
    for (const item of data.experience) {
      children.push(new Paragraph({ text: `${item.role} - ${item.company}` }));
      children.push(new Paragraph({ text: [item.duration, item.location].filter(Boolean).join(' | ') }));
      for (const bullet of item.bullets) {
        children.push(new Paragraph({ text: `• ${bullet}` }));
      }
    }
  }

  if (data.education.length) {
    children.push(new Paragraph({ text: 'Education', heading: HeadingLevel.HEADING_2 }));
    for (const item of data.education) {
      children.push(new Paragraph({ text: `${item.degree} — ${item.institution}` }));
      if (item.year || item.gpa) {
        children.push(new Paragraph({ text: [item.year, item.gpa ? `GPA ${item.gpa}` : ''].filter(Boolean).join(' | ') }));
      }
    }
  }

  if (data.skills.length) {
    children.push(new Paragraph({ text: 'Skills', heading: HeadingLevel.HEADING_2 }));
    children.push(new Paragraph({ text: data.skills.map(s => typeof s === 'string' ? s : s.name).join(', ') }));
  }

  if (data.certifications?.length) {
    children.push(new Paragraph({ text: 'Certifications', heading: HeadingLevel.HEADING_2 }));
    for (const cert of data.certifications) {
      children.push(new Paragraph({ text: [cert.name, cert.issuer, cert.date].filter(Boolean).join(' | ') }));
    }
  }

  if (data.projects?.length) {
    children.push(new Paragraph({ text: 'Projects', heading: HeadingLevel.HEADING_2 }));
    for (const proj of data.projects) {
      children.push(new Paragraph({ text: proj.name }));
      children.push(new Paragraph({ text: proj.description }));
      if (proj.technologies?.length) {
        children.push(new Paragraph({ text: proj.technologies.join(', ') }));
      }
    }
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { data, selectedTemplateId, format } = body;

    // Validate resume data
    const validationResult = validateResumeData(data ?? {});
    if (!validationResult.valid) {
      return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }

    const resumeData = data as ResumeData;
    const exportFormat = format ?? 'pdf';
    const templateId = selectedTemplateId ?? 'modern-professional';

    // Validate template exists
    const template = getTemplateComponent(templateId);
    if (!template) {
      const validIds = TEMPLATE_REGISTRY.map(t => t.id);
      return NextResponse.json(
        {
          error: `Invalid template ID: ${templateId}. Valid options: ${validIds.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Validate format – now supports pdf, docx, txt
    if (!['pdf', 'docx', 'txt'].includes(exportFormat)) {
      return NextResponse.json(
        { error: `Invalid format: ${exportFormat}. Must be 'pdf', 'docx', or 'txt'` },
        { status: 400 }
      );
    }

    if (exportFormat === 'txt') {
      const txt = buildTxt(resumeData);
      const etag = Buffer.from(txt).toString('base64').substring(0, 16);
      return new Response(txt, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="resume.txt"`,
          'ETag': `W/"${etag}"`,
          'Cache-Control': 'private, max-age=3600',
        },
      });
    }

    if (exportFormat === 'docx') {
      const buffer = buildDocx(resumeData);

      // Generate ETag based on content hash for caching
      const etag = Buffer.from(buffer).toString('base64').substring(0, 16);

      return new Response(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="resume.docx"`,
          'ETag': `W/"${etag}"`,
          'Cache-Control': 'private, max-age=3600', // 1 hour cache for exports
        },
      });
    }

    const TemplateComponent = template.Component;

    // @react-pdf/renderer v4: pdf() creates a document from a React component
    const doc = pdf(<TemplateComponent data={resumeData} />);
    const blob = await doc.toBlob();

    // Generate ETag for PDF as well (simplified)
    const pdfEtag = Buffer.from(await blob.arrayBuffer()).toString('base64').substring(0, 16);

    return new Response(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume.pdf"`,
        'ETag': `W/"${pdfEtag}"`,
        'Cache-Control': 'private, max-age=3600', // 1 hour cache for exports
      },
    });
  } catch (error) {
    console.error('Export error', error);
    // In development, provide more detailed error messages
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        error: 'Failed to generate export',
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to generate export' }, { status: 500 });
  }
}
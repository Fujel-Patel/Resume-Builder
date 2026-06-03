import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { cookies } from 'next/headers';
import { createClient as createSupabase } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';

// Allowed MIME types for resume uploads
const ALLOWED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function POST(request: Request) {
  try {
    // Authentication removed – uploads are public.

    // Expect multipart/form-data with field name "file"
    const formData = await request.formData();
    const file = formData.get('file') as unknown as File;
    if (!file) {
      return new NextResponse(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!ALLOWED_MIME.includes(file.type)) {
      return new NextResponse(JSON.stringify({ error: 'Unsupported file type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client for server‑side storage (pass cookie store)
      const cookieStore = await cookies();
    const supabase = await createSupabase(cookieStore as any);
    const bucket = supabase.storage.from('resumes');

    // Generate a unique path for a public upload (no user folder)
    const uniqueName = `${uuidv4()}_${file.name}`;
    const path = uniqueName;

    const { data, error } = await bucket.upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      console.error('Supabase upload error:', error);
      return new NextResponse(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build a public URL (or signed URL if bucket is private)
    // `getPublicUrl` returns `{ data: { publicUrl } }` in supabase-js v2
    const publicUrl = bucket.getPublicUrl(path)?.data?.publicUrl ?? null;

// Parse the uploaded file to extract raw text content
let parsedText = '';
if (file.type === 'application/pdf') {
  const buffer = Buffer.from(await file.arrayBuffer());
  const data = await pdfParse(buffer);
  parsedText = data.text;
} else {
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await mammoth.extractRawText({ buffer });
  parsedText = result.value;
}

    return NextResponse.json({ url: publicUrl, path, fileName: file.name, text: parsedText }, { status: 201 });
  } catch (err) {
    console.error('Upload endpoint error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

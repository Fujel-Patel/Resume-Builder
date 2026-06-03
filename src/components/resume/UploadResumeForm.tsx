import { useState } from 'react';

export default function UploadResumeForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsedText, setParsedText] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setParsedText('');
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Upload failed');
      }
      setParsedText(data.text ?? '');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded p-4 mb-6">
      <h2 className="text-xl font-semibold mb-2">Upload Existing Resume</h2>
      <input type="file" accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileChange} className="mb-2" />
      <button type="button" onClick={handleUpload} disabled={!selectedFile || loading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
        {loading ? 'Uploading...' : 'Upload & Parse'}
      </button>
      {error && <p className="text-red-600 mt-2">{error}</p>}
      {parsedText && (
        <div className="mt-4 max-h-64 overflow-y-auto whitespace-pre-wrap border p-2 bg-gray-50">
          <h3 className="font-medium mb-1">Parsed Text</h3>
          <pre>{parsedText}</pre>
        </div>
      )}
    </div>
  );
}

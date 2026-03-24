'use client';

import { useState, useTransition } from 'react';
import { uploadPDF } from '@/app/actions';

interface PDFUploaderProps {
  aliyahId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function PDFUploader({ aliyahId, onComplete, onCancel }: PDFUploaderProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;

    if (!file || file.size === 0) {
      setError('Please select a file');
      return;
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    startTransition(async () => {
      try {
        await uploadPDF(aliyahId, formData);
        onComplete();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input
          type="file"
          name="file"
          accept=".pdf"
          disabled={isPending}
          className="block w-full text-sm text-ink-700
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-sage-100 file:text-sage-700
            hover:file:bg-sage-200
            file:cursor-pointer
            disabled:opacity-50"
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="btn btn-primary flex-1"
        >
          {isPending ? 'Uploading...' : 'Upload'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="btn btn-ghost"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

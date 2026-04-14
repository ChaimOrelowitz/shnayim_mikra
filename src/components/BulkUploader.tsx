'use client';

import { useState, useRef } from 'react';
import { uploadPDF } from '@/app/actions';

interface Aliyah {
  id: string;
  number: number;
  pdfPath: string | null;
}

interface Parsha {
  id: string;
  name: string;
  englishName: string | null;
  order: number;
  aliyos: Aliyah[];
}

interface ParsedFile {
  file: File;
  parsedName: string;
  parsedNumber: number | null;
  matchedParsha: Parsha | null;
  matchedAliyah: Aliyah | null;
  status: 'matched' | 'no-parsha' | 'no-aliyah' | 'bad-filename';
}

function normalize(s: string) {
  return s.toLowerCase()
    .replace(/['-]/g, '')
    .replace(/\s+/g, '')
    .replace(/ah$/, 'a') // metzorah → metzora
    .replace(/oh$/, 'o');
}

function matchParsha(name: string, parshiyos: Parsha[]): Parsha | null {
  const n = normalize(name);
  // Exact match first
  const exact = parshiyos.find(p => p.englishName && normalize(p.englishName) === n);
  if (exact) return exact;
  // Loose match: both must be at least 6 chars to avoid false positives
  return parshiyos.find(p => {
    const en = normalize(p.englishName ?? '');
    if (!en || en.length < 6 || n.length < 6) return false;
    return en === n;
  }) ?? null;
}

function parseFile(file: File, parshiyos: Parsha[]): ParsedFile {
  // Expected: "{Parsha Name} {number}.pdf"
  const nameWithoutExt = file.name.replace(/\.pdf$/i, '').trim();
  const match = nameWithoutExt.match(/^(.+?)\s+(\d+)$/);

  if (!match) {
    return { file, parsedName: nameWithoutExt, parsedNumber: null, matchedParsha: null, matchedAliyah: null, status: 'bad-filename' };
  }

  const parsedName = match[1].trim();
  const parsedNumber = parseInt(match[2], 10);
  const matchedParsha = matchParsha(parsedName, parshiyos);

  if (!matchedParsha) {
    return { file, parsedName, parsedNumber, matchedParsha: null, matchedAliyah: null, status: 'no-parsha' };
  }

  const matchedAliyah = matchedParsha.aliyos.find(a => a.number === parsedNumber) ?? null;

  if (!matchedAliyah) {
    return { file, parsedName, parsedNumber, matchedParsha, matchedAliyah: null, status: 'no-aliyah' };
  }

  return { file, parsedName, parsedNumber, matchedParsha, matchedAliyah, status: 'matched' };
}

export function BulkUploader({ parshiyos }: { parshiyos: Parsha[] }) {
  const [parsed, setParsed] = useState<ParsedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<Record<string, 'ok' | string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const pdfs = Array.from(files).filter(f => f.name.toLowerCase().endsWith('.pdf'));
    setParsed(pdfs.map(f => parseFile(f, parshiyos)));
    setResults({});
  }

  async function handleUpload() {
    const toUpload = parsed.filter(p => p.status === 'matched' && p.matchedAliyah);
    setUploading(true);
    const newResults: Record<string, string> = {};

    for (const item of toUpload) {
      try {
        const fd = new FormData();
        fd.append('file', item.file);
        await uploadPDF(item.matchedAliyah!.id, fd);
        newResults[item.file.name] = 'ok';
      } catch (e: unknown) {
        newResults[item.file.name] = e instanceof Error ? e.message : 'Unknown error';
      }
    }

    setResults(newResults);
    setUploading(false);
  }

  const matched = parsed.filter(p => p.status === 'matched');
  const unmatched = parsed.filter(p => p.status !== 'matched');

  return (
    <div className="min-h-screen bg-parchment-50">
      <header className="border-b border-parchment-300 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="page-container py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink-900">Bulk PDF Upload</h1>
            <p className="text-sm text-ink-500 mt-0.5">Files must be named: <code className="bg-parchment-100 px-1 rounded">Parsha Name 3.pdf</code></p>
          </div>
          <a href="/" className="text-sm text-sage-600 hover:text-sage-700">← Back</a>
        </div>
      </header>

      <main className="page-container py-8 space-y-6">
        {/* Drop zone */}
        <div
          className="border-2 border-dashed border-parchment-300 rounded-xl p-12 text-center hover:border-sage-400 transition-colors cursor-pointer bg-white"
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        >
          <div className="text-4xl mb-3">📄</div>
          <p className="text-ink-700 font-medium">Drop PDF files here or click to select</p>
          <p className="text-ink-400 text-sm mt-1">e.g. <em>Tazria-Metzorah 1.pdf</em>, <em>Bereishit 3.pdf</em></p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf"
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
        </div>

        {parsed.length > 0 && (
          <>
            {/* Matched files */}
            {matched.length > 0 && (
              <div className="card overflow-hidden">
                <div className="bg-sage-50 border-b border-sage-200 px-4 py-3 flex items-center justify-between">
                  <h2 className="font-semibold text-sage-900">
                    ✓ {matched.length} file{matched.length !== 1 ? 's' : ''} matched
                  </h2>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="bg-stone-800 text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-stone-700 disabled:opacity-50 transition-colors"
                  >
                    {uploading ? 'Uploading...' : `Upload ${matched.length} file${matched.length !== 1 ? 's' : ''}`}
                  </button>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-parchment-50 border-b border-parchment-200">
                    <tr>
                      <th className="text-left px-4 py-2 text-ink-500 font-medium">File</th>
                      <th className="text-left px-4 py-2 text-ink-500 font-medium">Parsha</th>
                      <th className="text-left px-4 py-2 text-ink-500 font-medium">Aliyah</th>
                      <th className="text-left px-4 py-2 text-ink-500 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-parchment-100">
                    {matched.map(item => (
                      <tr key={item.file.name} className="hover:bg-parchment-50">
                        <td className="px-4 py-2.5 text-ink-700 font-mono text-xs">{item.file.name}</td>
                        <td className="px-4 py-2.5 font-hebrew text-ink-900">
                          {item.matchedParsha!.englishName} <span className="text-ink-400">({item.matchedParsha!.name})</span>
                        </td>
                        <td className="px-4 py-2.5 text-ink-700">Aliyah {item.parsedNumber}</td>
                        <td className="px-4 py-2.5">
                          {results[item.file.name] === 'ok' && <span className="text-sage-600 font-medium">✓ Uploaded</span>}
                          {results[item.file.name] && results[item.file.name] !== 'ok' && (
                            <span className="text-red-500 font-medium" title={results[item.file.name]}>✗ {results[item.file.name]}</span>
                          )}
                          {!results[item.file.name] && (
                            item.matchedAliyah?.pdfPath
                              ? <span className="text-amber-600 text-xs">Will overwrite existing</span>
                              : <span className="text-ink-400 text-xs">Ready</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Unmatched files */}
            {unmatched.length > 0 && (
              <div className="card overflow-hidden">
                <div className="bg-red-50 border-b border-red-200 px-4 py-3">
                  <h2 className="font-semibold text-red-800">
                    ✗ {unmatched.length} file{unmatched.length !== 1 ? 's' : ''} could not be matched
                  </h2>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-parchment-50 border-b border-parchment-200">
                    <tr>
                      <th className="text-left px-4 py-2 text-ink-500 font-medium">File</th>
                      <th className="text-left px-4 py-2 text-ink-500 font-medium">Problem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-parchment-100">
                    {unmatched.map(item => (
                      <tr key={item.file.name}>
                        <td className="px-4 py-2.5 text-ink-700 font-mono text-xs">{item.file.name}</td>
                        <td className="px-4 py-2.5 text-red-600 text-xs">
                          {item.status === 'bad-filename' && 'Filename must end with a number (e.g. "Bereishit 1.pdf")'}
                          {item.status === 'no-parsha' && `Parsha "${item.parsedName}" not found in database`}
                          {item.status === 'no-aliyah' && `Aliyah ${item.parsedNumber} not found for ${item.matchedParsha?.englishName}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

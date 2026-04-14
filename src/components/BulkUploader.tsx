'use client';

import { useState, useRef } from 'react';
import { getSignedUploadUrl, savePdfPath } from '@/app/actions';

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

const SEFARIM = [
  { name: 'Bereishit', min: 1,  max: 12.9 },
  { name: 'Shemot',   min: 13, max: 23.9 },
  { name: 'Vayikra',  min: 24, max: 33.9 },
  { name: 'Bamidbar', min: 34, max: 43.9 },
  { name: 'Devarim',  min: 44, max: 54.9 },
];

function normalize(s: string) {
  return s.toLowerCase()
    .replace(/ah$/, 'a')
    .replace(/oh$/, 'o')
    .replace(/[^a-z]/g, '');
}

function matchParsha(name: string, parshiyos: Parsha[]): Parsha | null {
  const n = normalize(name);
  return parshiyos.find(p => p.englishName && normalize(p.englishName) === n) ?? null;
}

function parseFile(file: File, parshiyos: Parsha[]): ParsedFile {
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
  const [results, setResults] = useState<Record<string, string>>({});
  const [uploadedAliyahIds, setUploadedAliyahIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  // Library state
  const [expandedSefers, setExpandedSefers] = useState<Set<string>>(new Set());
  const [expandedParshiyos, setExpandedParshiyos] = useState<Set<string>>(new Set());
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function toggleSefer(name: string) {
    setExpandedSefers(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  function toggleParsha(id: string) {
    setExpandedParshiyos(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

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
        const { signedUrl, publicUrl } = await getSignedUploadUrl(item.matchedAliyah!.id, item.file.name);
        const res = await fetch(signedUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/pdf' },
          body: item.file,
        });
        if (!res.ok) throw new Error(`Storage upload failed: ${res.status}`);
        await savePdfPath(item.matchedAliyah!.id, publicUrl);
        newResults[item.file.name] = 'ok';
        setUploadedAliyahIds(prev => new Set([...prev, item.matchedAliyah!.id]));
      } catch (e: unknown) {
        newResults[item.file.name] = e instanceof Error ? e.message : 'Unknown error';
      }
      setResults({ ...newResults });
    }

    setUploading(false);
  }

  const matched = parsed.filter(p => p.status === 'matched');
  const unmatched = parsed.filter(p => p.status !== 'matched');

  return (
    <div className="min-h-screen bg-parchment-50">
      {/* PDF preview modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-parchment-200">
              <p className="text-sm text-ink-600 font-medium truncate">{previewUrl.split('/').pop()}</p>
              <button
                onClick={() => setPreviewUrl(null)}
                className="text-ink-400 hover:text-ink-700 transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>
            <iframe src={previewUrl} className="flex-1 w-full" title="PDF preview" />
          </div>
        </div>
      )}

      <header className="border-b border-parchment-300 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="page-container py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink-900">Bulk PDF Upload</h1>
            <p className="text-sm text-ink-500 mt-0.5">Files must be named: <code className="bg-parchment-100 px-1 rounded">Parsha Name 3.pdf</code></p>
          </div>
          <a href="/admin" className="text-sm text-sage-600 hover:text-sage-700">← Back</a>
        </div>
      </header>

      <main className="page-container py-8">
        <div className="space-y-6">
          {/* Drop zone */}
          <div
            className="border-2 border-dashed border-parchment-300 rounded-xl p-12 text-center hover:border-sage-400 transition-colors cursor-pointer bg-white"
            onClick={() => inputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          >
            <div className="text-4xl mb-3">📄</div>
            <p className="text-ink-700 font-medium">Drop PDF files here or click to select</p>
            <p className="text-ink-400 text-sm mt-1">e.g. <em>Tazria-Metzora 1.pdf</em>, <em>Bereishit 3.pdf</em></p>
            <input ref={inputRef} type="file" multiple accept=".pdf" className="hidden" onChange={e => handleFiles(e.target.files)} />
          </div>

          {/* Upload results */}
          {parsed.length > 0 && (
            <>
              {matched.length > 0 && (
                <div className="card overflow-hidden">
                  <div className="bg-sage-50 border-b border-sage-200 px-4 py-3 flex items-center justify-between">
                    <h2 className="font-semibold text-sage-900">✓ {matched.length} matched</h2>
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
                              <span className="text-red-500 text-xs">{results[item.file.name]}</span>
                            )}
                            {!results[item.file.name] && (
                              item.matchedAliyah?.pdfPath
                                ? <span className="text-amber-600 text-xs">Will overwrite</span>
                                : <span className="text-ink-400 text-xs">Ready</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {unmatched.length > 0 && (
                <div className="card overflow-hidden">
                  <div className="bg-red-50 border-b border-red-200 px-4 py-3">
                    <h2 className="font-semibold text-red-800">✗ {unmatched.length} unmatched</h2>
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
                            {item.status === 'bad-filename' && 'Must end with a number (e.g. "Bereishit 1.pdf")'}
                            {item.status === 'no-parsha' && `"${item.parsedName}" not found — check the name list below`}
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

          {/* ── Library: collapsible parsha list ── */}
          <div>
            <h2 className="text-base font-semibold text-ink-800 mb-3">PDF Library</h2>
            <div className="space-y-2">
              {SEFARIM.map(sefer => {
                const seferParshiyos = parshiyos.filter(
                  p => p.order >= sefer.min && p.order <= sefer.max
                );
                const isOpen = expandedSefers.has(sefer.name);
                const totalPdfs = seferParshiyos.reduce(
                  (sum, p) => sum + p.aliyos.filter(a => a.pdfPath || uploadedAliyahIds.has(a.id)).length, 0
                );
                const totalAliyos = seferParshiyos.reduce((sum, p) => sum + p.aliyos.length, 0);

                return (
                  <div key={sefer.name} className="card overflow-hidden">
                    <button
                      onClick={() => toggleSefer(sefer.name)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-parchment-50 transition-colors text-start"
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          className={`w-4 h-4 text-ink-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="font-semibold text-ink-800">{sefer.name}</span>
                      </div>
                      <span className="text-xs text-ink-400">{totalPdfs}/{totalAliyos} PDFs</span>
                    </button>

                    {isOpen && (
                      <div className="border-t border-parchment-200 divide-y divide-parchment-100">
                        {seferParshiyos.map(p => {
                          const isParshaOpen = expandedParshiyos.has(p.id);
                          const pdfCount = p.aliyos.filter(a => a.pdfPath || uploadedAliyahIds.has(a.id)).length;
                          const isDouble = !Number.isInteger(p.order);

                          return (
                            <div key={p.id}>
                              <button
                                onClick={() => toggleParsha(p.id)}
                                className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-parchment-50 transition-colors text-start pl-10"
                              >
                                <div className="flex items-center gap-2">
                                  <svg
                                    className={`w-3.5 h-3.5 text-ink-300 transition-transform ${isParshaOpen ? 'rotate-90' : ''}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                  <span className={`text-sm text-ink-800 ${isDouble ? 'text-amber-700' : ''}`}>
                                    {p.englishName}
                                  </span>
                                </div>
                                <span className="text-xs text-ink-400">{pdfCount}/{p.aliyos.length}</span>
                              </button>

                              {isParshaOpen && (
                                <div className="pl-14 pr-4 pb-3 flex gap-1.5 flex-wrap">
                                  {p.aliyos.map(a => {
                                    const hasPdf = !!(a.pdfPath || uploadedAliyahIds.has(a.id));
                                    const url = uploadedAliyahIds.has(a.id)
                                      ? null // URL not available in client after upload, just show green
                                      : a.pdfPath;
                                    return (
                                      <button
                                        key={a.id}
                                        title={hasPdf ? `Preview aliyah ${a.number}` : `No PDF for aliyah ${a.number}`}
                                        onClick={() => url && setPreviewUrl(url)}
                                        className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
                                          hasPdf
                                            ? url
                                              ? 'bg-sage-100 text-sage-700 hover:bg-sage-200 cursor-pointer'
                                              : 'bg-sage-100 text-sage-700 cursor-default'
                                            : 'bg-parchment-200 text-ink-400 cursor-default'
                                        }`}
                                      >
                                        {a.number}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

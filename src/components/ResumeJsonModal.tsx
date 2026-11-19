import {ArrowDownToLine, X} from 'lucide-react';
import {useEffect, useState} from 'react';

interface ResumeJsonModalProps {
  open: boolean;
  resumeUrl: string;
  onClose: () => void;
}

export function ResumeJsonModal({open, resumeUrl, onClose}: ResumeJsonModalProps) {
  const [jsonText, setJsonText] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);

    setLoading(true);
    fetch('/api/resume/json')
      .then((r) => r.json())
      .then((data) => setJsonText(JSON.stringify(data, null, 2)))
      .catch(() => setJsonText('{"error": "Unable to load resume JSON from Python backend."}'))
      .finally(() => setLoading(false));

    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="json-resume-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div>
            <h3 id="json-resume-title" className="font-display text-base font-semibold text-zinc-950">
              Python-Generated Structured Resume
            </h3>
            <p className="font-mono text-xs text-zinc-500">GET /api/resume/json</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={resumeUrl}
              download="Aravind_Dineshkumar_Resume.pdf"
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
            >
              <ArrowDownToLine className="h-3.5 w-3.5" aria-hidden="true" />
              <span>PDF</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close JSON resume modal"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-950"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-[#F8F8F6] p-6">
          {loading ? (
            <p className="font-mono text-xs text-zinc-500">Loading JSON from Python backend...</p>
          ) : (
            <pre className="font-mono text-xs leading-relaxed text-zinc-800 whitespace-pre-wrap break-words">
              {jsonText}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

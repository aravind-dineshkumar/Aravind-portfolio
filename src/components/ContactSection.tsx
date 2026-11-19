import {ArrowDownToLine, Check, Copy, FileCode2, Send} from 'lucide-react';
import {useState} from 'react';
import type {PortfolioProfile} from '../types/portfolio';

interface ContactSectionProps {
  profile: PortfolioProfile;
  onOpenJsonResume: () => void;
}

export function ContactSection({profile, onOpenJsonResume}: ContactSectionProps) {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error'; text: string} | null>(
    null,
  );

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, email, organization, message}),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Please check your form details and try again.',
        });
        return;
      }
      setStatusMessage({
        type: 'success',
        text: data.confirmation || 'Your message has been saved.',
      });
      setName('');
      setEmail('');
      setOrganization('');
      setMessage('');
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Unable to reach the Python backend right now. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="border-t border-zinc-200 bg-white py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-sm font-medium text-[#1D4ED8]">04. Direct Inquiry</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-zinc-950 [text-wrap:balance]">
              Open to internships, projects, and technical collaboration.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600">
              Looking for opportunities to apply Python, software fundamentals, and AI &amp; ML
              coursework to real engineering teams.
            </p>

            <div className="mt-8 space-y-4 border-t border-zinc-200 pt-6">
              <div>
                <p className="text-xs font-medium text-zinc-500">Direct Email</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <a
                    href={`mailto:${profile.email}`}
                    className="font-mono text-sm font-medium text-zinc-950 underline underline-offset-4 hover:text-[#1D4ED8]"
                  >
                    {profile.email}
                  </a>
                  <button
                    type="button"
                    onClick={() => void handleCopyEmail()}
                    className="inline-flex h-8 items-center gap-1.5 rounded border border-zinc-200 bg-[#F8F8F6] px-2.5 text-xs font-medium text-zinc-700 hover:border-zinc-950"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#1D4ED8]" aria-hidden="true" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={profile.resumeUrl}
                  download="Aravind_Dineshkumar_Resume.pdf"
                  className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1D4ED8] whitespace-nowrap shrink-0"
                >
                  <ArrowDownToLine className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Download Resume PDF</span>
                </a>

                <button
                  type="button"
                  onClick={onOpenJsonResume}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-900 transition-colors hover:border-zinc-950 whitespace-nowrap shrink-0"
                >
                  <FileCode2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Inspect Python JSON Resume</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-zinc-200 bg-[#F8F8F6] p-6 sm:p-8"
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-medium text-zinc-700">
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Priya Nair"
                    className="mt-1.5 h-11 w-full rounded-lg border border-zinc-300 bg-white px-3.5 text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-[#1D4ED8] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-medium text-zinc-700">
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="priya@company.com"
                    className="mt-1.5 h-11 w-full rounded-lg border border-zinc-300 bg-white px-3.5 text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-[#1D4ED8] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="contact-org" className="block text-xs font-medium text-zinc-700">
                  Organization or University (Optional)
                </label>
                <input
                  id="contact-org"
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Engineering Team / Startup / University"
                  className="mt-1.5 h-11 w-full rounded-lg border border-zinc-300 bg-white px-3.5 text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-[#1D4ED8] focus:outline-none"
                />
              </div>

              <div className="mt-5">
                <label htmlFor="contact-message" className="block text-xs font-medium text-zinc-700">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share internship details, project ideas, or collaboration notes..."
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white p-3.5 text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-[#1D4ED8] focus:outline-none"
                />
              </div>

              {statusMessage && (
                <p
                  role="status"
                  className={`mt-4 rounded-lg border px-4 py-3 text-xs font-medium ${
                    statusMessage.type === 'success'
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                      : 'border-red-300 bg-red-50 text-red-900'
                  }`}
                >
                  {statusMessage.text}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <span className="font-mono text-xs text-zinc-500">
                  Validated &amp; stored via POST /api/messages
                </span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1D4ED8] px-5 py-3 text-xs font-semibold text-white transition-colors hover:bg-[#1E40AF] disabled:opacity-60 whitespace-nowrap shrink-0"
                >
                  <Send className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

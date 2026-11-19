/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useCallback, useEffect, useState} from 'react';
import {ContactSection} from './components/ContactSection';
import {EducationSection} from './components/EducationSection';
import {Header} from './components/Header';
import {HeroSection} from './components/HeroSection';
import {MarqueeRibbon} from './components/MarqueeRibbon';
import {ResumeJsonModal} from './components/ResumeJsonModal';
import {SkillsSection} from './components/SkillsSection';
import {VoiceAssistantSection} from './components/VoiceAssistantSection';
import type {PortfolioPayload} from './types/portfolio';

export default function App() {
  const [data, setData] = useState<PortfolioPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [jsonModalOpen, setJsonModalOpen] = useState(false);

  const loadPortfolio = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/portfolio');
      if (!res.ok) {
        throw new Error(`Python backend responded with HTTP ${res.status}`);
      }
      const payload: PortfolioPayload = await res.json();
      setData(payload);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not load portfolio data from Python backend.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPortfolio();
  }, [loadPortfolio]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F8F6] px-6 text-center">
        <p className="font-display text-lg font-semibold text-zinc-950">Aravind Dineshkumar</p>
        <p className="mt-2 font-mono text-xs text-zinc-500">
          Loading portfolio from Python backend...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F8F6] px-6 text-center">
        <p className="font-display text-xl font-semibold text-zinc-950">
          Python Backend Unavailable
        </p>
        <p className="mt-2 max-w-md text-sm text-zinc-600">{error ?? 'No data received.'}</p>
        <button
          type="button"
          onClick={() => void loadPortfolio()}
          className="mt-5 rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const featuredProject = data.projects[0];

  return (
    <div id="top" className="min-h-screen bg-[#F8F8F6] text-[#09090B]">
      <Header name={data.profile.name} resumeUrl={data.profile.resumeUrl} />

      <main>
        <HeroSection
          profile={data.profile}
          metrics={data.metrics}
          pythonVersion={data.pythonRuntime}
        />

        <MarqueeRibbon />

        <EducationSection education={data.education} />

        {featuredProject && (
          <VoiceAssistantSection project={featuredProject} initialTasks={data.tasks} />
        )}

        <SkillsSection skills={data.skills} strengths={data.strengths} />

        <ContactSection
          profile={data.profile}
          onOpenJsonResume={() => setJsonModalOpen(true)}
        />
      </main>

      <footer className="border-t border-zinc-200 bg-[#F8F8F6] py-10">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-4 px-6 text-xs text-zinc-500 sm:flex-row sm:items-center">
          <p>
            © 2026 {data.profile.name} · {data.profile.role} · {data.profile.institution}
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <a href="#about" className="hover:text-zinc-950">
              About
            </a>
            <a href="#education" className="hover:text-zinc-950">
              Education
            </a>
            <a href="#projects" className="hover:text-zinc-950">
              Projects
            </a>
            <a href="#skills" className="hover:text-zinc-950">
              Skills
            </a>
            <a
              href={data.profile.resumeUrl}
              download="Aravind_Dineshkumar_Resume.pdf"
              className="font-medium text-zinc-900 hover:text-[#1D4ED8]"
            >
              Resume PDF
            </a>
          </div>
        </div>
      </footer>

      <ResumeJsonModal
        open={jsonModalOpen}
        resumeUrl={data.profile.resumeUrl}
        onClose={() => setJsonModalOpen(false)}
      />
    </div>
  );
}

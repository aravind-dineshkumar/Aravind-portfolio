import {ArrowDownRight, ArrowUpRight, User} from 'lucide-react';
import {useState} from 'react';
import type {PortfolioMetric, PortfolioProfile} from '../types/portfolio';

interface HeroSectionProps {
  profile: PortfolioProfile;
  metrics: PortfolioMetric[];
  pythonVersion: string;
}

export function HeroSection({profile, metrics, pythonVersion}: HeroSectionProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <section id="about" className="mx-auto max-w-[1200px] px-6 pt-12 pb-16 lg:pt-16 lg:pb-20">
      <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="flex flex-col justify-between lg:col-span-7">
          <div>
            <p className="text-sm font-medium text-[#1D4ED8]">
              {profile.role}
              <span className="mx-2 text-zinc-300" aria-hidden="true">
                ·
              </span>
              <span className="text-zinc-600">{profile.institution}</span>
              <span className="mx-2 text-zinc-300" aria-hidden="true">
                ·
              </span>
              <span className="text-zinc-600">{profile.year}</span>
            </p>

            <h1 className="mt-5 max-w-2xl font-display text-[clamp(2.25rem,4vw,3.65rem)] font-semibold leading-[1.08] tracking-tight text-zinc-950 [text-wrap:balance]">
              {profile.headline}
            </h1>

            <p className="mt-6 max-w-[65ch] text-base leading-[1.7] text-zinc-600">
              {profile.objective}
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-lg bg-[#1D4ED8] px-5 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#1E40AF] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
            >
              <span>Try Python Voice Assistant</span>
              <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
            </a>

            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition-colors duration-150 hover:border-zinc-950 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
            >
              <span>Get in Touch</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <div className="relative flex-1 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3">
            <div className="relative h-full min-h-[340px] w-full overflow-hidden rounded-xl bg-zinc-100">
              {!imageError ? (
                <img
                  src={profile.portraitUrl}
                  alt={`${profile.name} portrait`}
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 p-8 text-center">
                  <User className="h-12 w-12 text-zinc-400" aria-hidden="true" />
                  <p className="mt-3 font-display text-lg font-semibold text-zinc-800">
                    {profile.name}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">{profile.role}</p>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between px-1 pb-1 text-xs text-zinc-500">
              <span className="font-medium text-zinc-900">{profile.name}</span>
              <span className="font-mono tabular-nums">Python {pythonVersion} Backend</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-2 border-y border-zinc-200 bg-white lg:grid-cols-4">
        {metrics.map((metric, idx) => (
          <div
            key={metric.label}
            className={`px-6 py-6 ${
              idx % 2 === 1 ? 'border-l border-zinc-200' : ''
            } ${idx >= 2 ? 'border-t border-zinc-200 lg:border-t-0 lg:border-l' : ''}`}
          >
            <p className="text-xs font-medium text-zinc-500">{metric.label}</p>
            <p className="mt-2 font-mono text-2xl font-medium tracking-tight text-zinc-950 tabular-nums">
              {metric.value}
            </p>
            <p className="mt-1 text-xs text-zinc-500">{metric.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

import {useState} from 'react';
import type {SkillEntry, StrengthEntry} from '../types/portfolio';

interface SkillsSectionProps {
  skills: SkillEntry[];
  strengths: StrengthEntry[];
}

const FILTER_TABS = ['All', 'Languages', 'AI & Automation', 'Core Strengths'] as const;
type FilterTab = (typeof FILTER_TABS)[number];

export function SkillsSection({skills, strengths}: SkillsSectionProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('All');

  const visibleSkills =
    activeTab === 'All'
      ? skills
      : activeTab === 'Core Strengths'
        ? []
        : skills.filter((s) => s.category === activeTab);

  const visibleStrengths =
    activeTab === 'All' || activeTab === 'Core Strengths' ? strengths : [];

  return (
    <section id="skills" className="mx-auto max-w-[1200px] px-6 py-20">
      <div className="flex flex-col justify-between gap-6 border-b border-zinc-200 pb-8 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-[#1D4ED8]">03. Capabilities &amp; Mindset</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-zinc-950 [text-wrap:balance]">
            Technical Skills &amp; Core Strengths
          </h2>
        </div>

        <div
          role="tablist"
          aria-label="Filter capabilities"
          className="flex flex-wrap items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1"
        >
          {FILTER_TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] ${
                  active
                    ? 'bg-zinc-950 text-white'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {visibleSkills.length > 0 && (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleSkills.map((skill) => (
            <article
              key={skill.id}
              className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6"
            >
              <div>
                <p className="text-xs font-medium text-zinc-500">{skill.category}</p>
                <h3 className="mt-2 font-display text-xl font-semibold text-zinc-950">
                  {skill.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">{skill.summary}</p>
              </div>
              <p className="mt-5 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
                {skill.context}
              </p>
            </article>
          ))}
        </div>
      )}

      {visibleStrengths.length > 0 && (
        <div className="mt-10">
          <p className="text-xs font-medium text-zinc-500">Engineering Habits &amp; Strengths</p>
          <div className="mt-4 grid grid-cols-1 divide-y divide-zinc-200 border-y border-zinc-200 bg-white md:grid-cols-2 md:divide-y-0">
            {visibleStrengths.map((item, idx) => (
              <div
                key={item.id}
                className={`p-6 ${idx % 2 === 1 ? 'md:border-l md:border-zinc-200' : ''} ${
                  idx >= 2 ? 'md:border-t md:border-zinc-200' : ''
                }`}
              >
                <h3 className="font-display text-base font-semibold text-zinc-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

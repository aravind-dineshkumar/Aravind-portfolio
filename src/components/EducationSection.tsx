import type {EducationEntry} from '../types/portfolio';

interface EducationSectionProps {
  education: EducationEntry[];
}

export function EducationSection({education}: EducationSectionProps) {
  const jainEntry = education.find((e) => e.id === 'jain-btech');

  return (
    <section id="education" className="mx-auto max-w-[1200px] px-6 py-20">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="text-sm font-medium text-[#1D4ED8]">01. Academic Foundation</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-zinc-950 [text-wrap:balance]">
            Education &amp; Academic Record
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-600">
            Building core computer science fluency across Python, C, C++, and Java alongside
            specialized coursework in Artificial Intelligence and Machine Learning.
          </p>

          {jainEntry && jainEntry.sgpa.length > 0 && (
            <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium text-zinc-500">University SGPA Scale</span>
                <span className="font-mono text-xs text-zinc-500 tabular-nums">Out of 10.0</span>
              </div>

              <div className="mt-5 space-y-4">
                {jainEntry.sgpa.map((record) => {
                  const pct = Math.min(100, Math.round((record.value / 10) * 100));
                  return (
                    <div key={record.semester}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-zinc-800">{record.semester}</span>
                        <span className="font-mono font-medium text-zinc-950 tabular-nums">
                          {record.value.toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-sm bg-zinc-100">
                        <div
                          className="h-full bg-[#1D4ED8]"
                          style={{width: `${pct}%`}}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-8">
          <div className="divide-y divide-zinc-200 border-y border-zinc-200 bg-white">
            {education.map((item) => (
              <article key={item.id} className="p-6 sm:p-8">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
                  <h3 className="font-display text-xl font-semibold text-zinc-950">
                    {item.institution}
                  </h3>
                  <span className="font-mono text-xs text-zinc-500 tabular-nums whitespace-nowrap">
                    {item.period}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-600">
                  <span className="font-medium text-zinc-800">{item.degree}</span>
                  <span className="text-zinc-300" aria-hidden="true">
                    ·
                  </span>
                  <span className="font-mono text-xs text-[#1D4ED8] tabular-nums">
                    {item.scoreSummary}
                  </span>
                </div>

                <ul className="mt-4 space-y-1.5 text-sm text-zinc-600">
                  {item.focusAreas.map((area) => (
                    <li key={area} className="flex items-start gap-2.5">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-zinc-400" aria-hidden="true" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

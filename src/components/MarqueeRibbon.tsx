const MARQUEE_ITEMS = [
  'Python Automation',
  'Voice Assistant Engineering',
  'Speech Recognition',
  'REST API Integration',
  'C · C++ · Java',
  'Artificial Intelligence & Machine Learning',
  'Jain University · B.Tech CSE',
];

export function MarqueeRibbon() {
  const repeated = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-y border-zinc-200 bg-white py-3.5 text-sm text-zinc-500"
    >
      <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
        {repeated.map((item, idx) => (
          <span key={`${item}-${idx}`} className="inline-flex items-center gap-8">
            <span className="font-serif italic text-zinc-700">{item}</span>
            <span className="text-zinc-300">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

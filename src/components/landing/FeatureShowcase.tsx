import React from 'react';

interface FeatureShowcaseProps {
  visual: React.ReactNode;
  step?: string;
  title: string;
  description: string;
  reverse?: boolean;
  titleAs?: 'h2' | 'h3';
}

export function FeatureShowcase({
  visual,
  step,
  title,
  description,
  reverse = false,
  titleAs: TitleComponent = 'h3',
}: FeatureShowcaseProps) {
  return (
    <div
      className={`flex flex-col gap-8 md:gap-16 ${
        reverse ? 'md:flex-row-reverse' : 'md:flex-row'
      } items-center`}
    >
      <div className="w-full md:w-3/5">{visual}</div>
      <div className="w-full md:w-2/5 space-y-4">
        {step && (
          <span className="text-xs font-mono uppercase tracking-widest text-white/40">
            {step}
          </span>
        )}
        <TitleComponent className="text-2xl md:text-3xl font-black text-white tracking-tight">
          {title}
        </TitleComponent>
        <p className="text-base text-white/70 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

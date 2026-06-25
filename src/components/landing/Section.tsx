import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
  id?: string;
}

export function Section({ children, className = '', compact = false, id }: SectionProps) {
  return (
    <section
      id={id}
      className={`w-full px-6 ${compact ? 'py-16' : 'py-16 md:py-28'} ${className}`}
    >
      <div className="mx-auto max-w-5xl">{children}</div>
    </section>
  );
}

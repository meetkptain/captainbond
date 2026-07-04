import { forwardRef } from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
  id?: string;
}

export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  { children, className = '', compact = false, id },
  ref,
) {
  return (
    <section
      ref={ref}
      id={id}
      className={`w-full px-6 ${compact ? 'py-16' : 'py-16 md:py-28'} ${className}`}
    >
      <div className="mx-auto max-w-5xl">{children}</div>
    </section>
  );
});

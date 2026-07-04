'use client';

interface CalendlyBookingButtonProps {
  label?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
  name?: string;
  email?: string;
}

export function CalendlyBookingButton({
  label = 'Réserver une démo 15 min',
  variant = 'secondary',
  className = '',
  name,
  email,
}: CalendlyBookingButtonProps) {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL;

  if (!calendlyUrl) {
    return null;
  }

  const params = new URLSearchParams();
  if (name) params.set('first_name', name);
  if (email) params.set('email', email);
  const separator = calendlyUrl.includes('?') ? '&' : '?';
  const href = params.toString() ? `${calendlyUrl}${separator}${params.toString()}` : calendlyUrl;

  const baseStyles =
    variant === 'primary'
      ? 'px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-pink-500/20 text-center border-none'
      : 'px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-bold text-sm text-white tracking-wide transition-all text-center';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseStyles} ${className}`}
    >
      {label}
    </a>
  );
}

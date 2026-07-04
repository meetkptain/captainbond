'use client';

interface CoupleCrossSellCardProps {
  href?: string;
  onClick?: () => void;
  title?: string;
  description?: string;
  cta?: string;
}

export function CoupleCrossSellCard({
  href = '/couple',
  onClick,
  title = 'Vous jouez à deux ?',
  description = 'Prenez soin de votre dynamique de couple au quotidien. Essayez notre rituel de 5 minutes par jour.',
  cta = 'Découvrir le Rituel Couple',
}: CoupleCrossSellCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (typeof window !== 'undefined') {
      window.location.href = href;
    }
  };

  return (
    <div className="glass-panel p-5 border-rose-500/20 bg-gradient-to-r from-rose-950/20 to-amber-950/20 rounded-2xl text-center space-y-3 shadow-[0_0_30px_rgba(244,63,94,0.05)]">
      <div className="flex items-center justify-center gap-2 text-rose-400">
        <span className="text-xl">💖</span>
        <h3 className="font-bold text-sm uppercase tracking-wider font-mono">{title}</h3>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed">{description}</p>
      <button
        onClick={handleClick}
        className="w-full py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer border-none"
      >
        {cta}
      </button>
    </div>
  );
}

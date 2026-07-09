'use client';

export interface OverlaySelection {
  id: string;
  verbatimA: string;
  verbatimB: string;
  resonance: number;     // 0-1
  diff: string;          // complementary difference text (real, from data)
  themeName: string;     // COMPUTED name, never a generic word like "Amour"
}

export interface ConstellationOverlayProps {
  selection: OverlaySelection | null;
  monthLabel?: string;        // e.g. "Juillet 2026" — current reveal month (Approach C)
  starsThisMonth?: number;    // count of stars revealed this month
  totalStars?: number;        // cumulative
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

export default function ConstellationOverlay({
  selection, monthLabel, starsThisMonth, totalStars, canvasRef,
}: ConstellationOverlayProps) {
  const share = async () => {
    const canvas = canvasRef?.current;
    if (!canvas || typeof navigator === 'undefined' || !navigator.share) return;
    try {
      const url = canvas.toDataURL('image/png'); // 9:16 already (1080x1920)
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], 'notre-ciel.png', { type: 'image/png' });
      await navigator.share({ files: [file], title: 'Notre ciel commun', text: 'Notre constellation de résonance' });
    } catch {
      // user cancelled or unsupported — ignore
    }
  };

  return (
    <div className="w-full rounded-2xl bg-white/[0.03] p-5 text-slate-200">
      {/* Monthly reveal banner (Approach C) */}
      {monthLabel && (
        <div className="mb-4 rounded-xl bg-amber-400/10 px-4 py-3 text-sm">
          <span className="font-medium text-amber-200">{monthLabel}</span>
          {typeof starsThisMonth === 'number' && (
            <span className="ml-2 text-slate-400">
              · {starsThisMonth} nouvelle{starsThisMonth > 1 ? 's' : ''} étoile{starsThisMonth > 1 ? 's' : ''}
              {typeof totalStars === 'number' ? ` sur ${totalStars}` : ''}
            </span>
          )}
        </div>
      )}

      {!selection ? (
        <p className="py-8 text-center text-slate-400">
          Touchez une étoile pour découvrir ce que vous résonnez tous les deux.
          <br />
          Répondez à vos rituel pour illuminer de nouvelles connexions.
        </p>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Lui a écrit</p>
            <p className="mt-1 italic text-slate-100">“{selection.verbatimA}”</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Elle a écrit</p>
            <p className="mt-1 italic text-slate-100">“{selection.verbatimB}”</p>
          </div>
          <div className="rounded-xl bg-white/[0.04] p-3">
            <p className="text-sm text-slate-300">
              Résonance <span className="font-semibold text-amber-200">{Math.round(selection.resonance * 100)}%</span>
            </p>
            <p className="mt-1 text-sm text-slate-400">{selection.diff}</p>
            <p className="mt-2 text-xs text-slate-500">Constellation : {selection.themeName}</p>
          </div>
          <button
            type="button"
            onClick={share}
            className="w-full rounded-xl bg-amber-400 px-4 py-2 font-medium text-slate-900 hover:bg-amber-300"
          >
            Partager notre ciel (9:16)
          </button>
        </div>
      )}

      {/* Mandatory anti-Barnum disclaimer */}
      <p className="mt-5 text-center text-[11px] leading-snug text-slate-500">
        Ce profil est une fiction à visée divertissante (entertainment fiction). Il ne constitue pas un avis psychologique.
      </p>
    </div>
  );
}

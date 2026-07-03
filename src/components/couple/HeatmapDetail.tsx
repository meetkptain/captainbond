'use client';

import { Icon } from '@/components/Icon';

interface Props {
  axis: string;
  score: number;
  trend: string;
  onClose: () => void;
}

const AXIS_LABELS: Record<string, string> = {
  'vulnérabilité': 'Vulnérabilité',
  'communication': 'Communication',
  'conflit': 'Gestion du conflit',
  'désir': 'Désir & Intimité',
  'projets': 'Projets communs',
};

const AXIS_DESCRIPTIONS: Record<string, string> = {
  'vulnérabilité': 'Capacité à se montrer fragile et authentique l\'un envers l\'autre.',
  'communication': 'Fluidité de l\'échange et qualité de l\'écoute mutuelle.',
  'conflit': 'Capacité à traverser les désaccords sans se blesser.',
  'désir': 'Intensité de la connexion intime et du désir réciproque.',
  'projets': 'Alignement sur les objectifs et la vision commune du futur.',
};

const AXIS_COLORS: Record<string, string> = {
  'vulnérabilité': '#c084fc',
  'communication': '#60a5fa',
  'conflit': '#f87171',
  'désir': '#f472b6',
  'projets': '#34d399',
};

const TREND_LABELS: Record<string, string> = {
  up: 'En progression ↑',
  down: 'En baisse ↓',
  stable: 'Stable →',
};

const TREND_COLORS: Record<string, string> = {
  up: '#34d399',
  down: '#f87171',
  stable: '#9ca3af',
};

export function HeatmapDetail({ axis, score, trend, onClose }: Props) {
  const color = AXIS_COLORS[axis] || '#9ca3af';
  const trendColor = TREND_COLORS[trend] || '#9ca3af';
  const percentage = Math.round(score * 100);

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium text-lg">
          {AXIS_LABELS[axis] || axis}
        </h3>
        <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
          <Icon name="x" className="w-5 h-5" />
        </button>
      </div>

      <p className="text-white/60 text-sm leading-relaxed">
        {AXIS_DESCRIPTIONS[axis] || ''}
      </p>

      {/* Score visuel */}
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="white" strokeOpacity={0.1} strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.5"
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeDasharray={`${percentage} ${100 - percentage}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-lg">{percentage}%</span>
          </div>
        </div>
        <div>
          <div className="text-white/50 text-xs uppercase tracking-wider mb-1">Tendance</div>
          <div className="text-sm font-medium" style={{ color: trendColor }}>
            {TREND_LABELS[trend] || trend}
          </div>
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-4">
        <h4 className="text-white/50 text-xs uppercase tracking-wider mb-2">Conseil</h4>
        <p className="text-white/80 text-sm leading-relaxed">
          {getAdvice(axis, score, trend)}
        </p>
      </div>
    </div>
  );
}

function getAdvice(axis: string, score: number, trend: string): string {
  if (score >= 0.8) return 'Excellent ! Votre connexion sur ce point est forte. Continuez à cultiver cette force.';

  const advice: Record<string, string> = {
    'vulnérabilité': score < 0.4
      ? 'Essayez de partager une peur ou un doute ce soir, sans chercher de solution.'
      : 'Prochain étape : partagez quelque chose que vous n\'avez jamais dit à l\'autre.',
    'communication': score < 0.4
      ? 'Instaurez un moment de 10 minutes d\'écoute sans interruption, sans conseil.'
      : 'Pratiquez la reformulation : "Si je comprends bien, tu ressens..."',
    'conflit': score < 0.4
      ? 'Avant de réagir, respirez 3 fois et demandez-vous : "Qu\'est-ce que l\'autre essaie de me dire ?"'
      : 'Vous gérez mieux les tensions. Essayez maintenant d\'aborder un sujet difficile calmement.',
    'désir': score < 0.4
      ? 'Réallouez un moment d\'intimité sans pression : une main posée, un regard, un mot doux.'
      : 'Explorez ce qui vous attire réciproquement. Un compliment sincère peut tout changer.',
    'projets': score < 0.4
      ? 'Listez ensemble 3 choses que vous aimeriez faire cette semaine. Choisissez-en une.'
      : 'Vous avez une vision commune. Formalisez-la : écrivez-la ensemble.',
  };

  return advice[axis] || 'Continuez à investir votre relation, chaque petit geste compte.';
}

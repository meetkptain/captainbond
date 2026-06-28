'use client';

import { Icon, type IconName } from '@/components/Icon';
import { useTranslation } from '@/lib/i18n';

interface GameModeItem {
  id: string;
  name: string;
  icon: IconName;
  descriptionKey: 'mode_icebreaker_desc' | 'mode_deep_desc' | 'mode_spicy_desc' | 'mode_imposteur_desc' | 'mode_date_desc' | 'mode_family_desc';
  duration: string;
  intensity: 'Chill' | 'Spicy' | 'Deep';
  themeColor: string;
}

const GAME_MODES: GameModeItem[] = [
  {
    id: 'ICEBREAKER',
    name: 'Icebreaker',
    icon: 'sparkles',
    descriptionKey: 'mode_icebreaker_desc',
    duration: '10-15 min',
    intensity: 'Chill',
    themeColor: 'from-sky-500 to-blue-600'
  },
  {
    id: 'DEEP_CONNECTION',
    name: 'Deep Connection',
    icon: 'sparkles',
    descriptionKey: 'mode_deep_desc',
    duration: '20-30 min',
    intensity: 'Deep',
    themeColor: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'SPICY',
    name: 'Spicy',
    icon: 'flame',
    descriptionKey: 'mode_spicy_desc',
    duration: '15-20 min',
    intensity: 'Spicy',
    themeColor: 'from-orange-500 to-red-600'
  },
  {
    id: 'IMPOSTEUR',
    name: 'Imposteur',
    icon: 'mask',
    descriptionKey: 'mode_imposteur_desc',
    duration: '15-25 min',
    intensity: 'Chill',
    themeColor: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'DATE_NIGHT',
    name: 'Date Night',
    icon: 'heart',
    descriptionKey: 'mode_date_desc',
    duration: '20-35 min',
    intensity: 'Deep',
    themeColor: 'from-rose-500 to-pink-600'
  },
  {
    id: 'FAMILY',
    name: 'Family',
    icon: 'users',
    descriptionKey: 'mode_family_desc',
    duration: '15-25 min',
    intensity: 'Chill',
    themeColor: 'from-amber-500 to-orange-600'
  }
];

interface ModeSelectorProps {
  onSelect: (modeId: string) => void;
}

export function ModeSelector({ onSelect }: ModeSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6 p-6 max-w-lg mx-auto text-slate-100 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl">
      <div className="text-center flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
          {t('mode_title')}
        </h2>
        <p className="text-sm text-slate-400">
          {t('mode_desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 max-h-[460px] overflow-y-auto pr-1">
        {GAME_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className="flex items-start gap-4 p-4 text-left bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/30 hover:border-amber-500/30 rounded-2xl transition-all cursor-pointer group hover:shadow-lg hover:shadow-slate-950/20"
          >
            {/* Icon Container */}
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${mode.themeColor} text-white shadow-inner shrink-0 group-hover:scale-105 transition-all`}>
              <Icon name={mode.icon} className="w-6 h-6" />
            </div>

            {/* Mode Meta Info */}
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                  {mode.name}
                </h3>
                
                {/* Badges */}
                <div className="flex gap-1.5 text-[10px] font-bold">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60">
                    {mode.duration}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md border ${
                    mode.intensity === 'Chill' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                    mode.intensity === 'Spicy' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                    'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  }`}>
                    {mode.intensity === 'Chill' ? t('tree_legend_chill') : mode.intensity === 'Spicy' ? t('tree_legend_spicy') : t('tree_legend_deep')}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t(mode.descriptionKey)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

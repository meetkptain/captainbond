import { OrbeState, FusionState, TotemState } from '@/lib/db/types';
import {
  getOrCreateTotem,
  updateOrbeA,
  updateOrbeB,
  updateFusionState,
  updateTotemRitual,
} from '@/lib/db/repositories/totemRepository';
import { AppError } from '@/lib/errors';

// --- Constantes de morphing ---

const TENSION_THRESHOLD = 0.6;
const HARMONY_BOOST_PER_RITUAL = 0.05;
const TENSION_DECAY_PER_RITUAL = 0.03;
const MAX_STREAK_BONUS = 0.1;
const EVOLUTION_THRESHOLDS = [0, 5, 15, 30, 60, 100, 150, 220, 300, 400];

/**
 * Récupère ou initialise le Totem du couple.
 * Évalue dynamiquement l'état de sommeil/Tamagotchi si inactif > 48h.
 */
export async function getTotem(coupleId: string): Promise<TotemState> {
  const totem = await getOrCreateTotem(coupleId);
  
  if (totem.lastRitualAt) {
    const lastRitual = new Date(totem.lastRitualAt);
    const now = new Date();
    const hoursSinceLastRitual = (now.getTime() - lastRitual.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastRitual > 48) {
      const daysInactive = Math.floor(hoursSinceLastRitual / 24);
      const newEnergy = Math.max(0.1, 1.0 - (daysInactive - 1) * 0.1);
      const currentStatus = (totem.fusionState as any).status || 'ACTIVE';
      const currentEnergy = (totem.fusionState as any).energy ?? 1.0;
      
      if (currentStatus !== 'SLEEPING' || currentEnergy !== newEnergy) {
        return updateFusionState(coupleId, {
          status: 'SLEEPING',
          energy: newEnergy
        } as any);
      }
    }
  }
  
  return totem;
}

/**
 * Détermine quel partenaire est A ou B dans le couple, puis met à jour son Orbe.
 */
export async function updatePartnerOrbe(
  coupleId: string,
  userId: string,
  user1Id: string,
  orbeUpdate: Partial<OrbeState>
): Promise<TotemState> {
  const isPartnerA = userId === user1Id;
  if (isPartnerA) {
    return updateOrbeA(coupleId, orbeUpdate);
  }
  return updateOrbeB(coupleId, orbeUpdate);
}

/**
 * Calcule et met à jour la FusionState en fonction des deux OrbeStates.
 * Appelé après chaque rituel complété par les deux partenaires.
 */
export async function computeFusion(coupleId: string): Promise<TotemState> {
  const totem = await getOrCreateTotem(coupleId);
  const { stateA, stateB } = totem;

  // Harmonie = proximité des hues + cohérence des niveaux d'énergie
  const hueDiff = Math.abs(stateA.hue - stateB.hue);
  const normalizedHueDiff = Math.min(hueDiff, 360 - hueDiff) / 180;
  const energyDiff = Math.abs(stateA.energy - stateB.energy);

  const harmonyRate = Math.max(0, Math.min(1,
    1 - (normalizedHueDiff * 0.6 + energyDiff * 0.4)
  ));

  // Tension = énergie moyenne élevée + faible harmonie
  const avgEnergy = (stateA.energy + stateB.energy) / 2;
  const tensionLevel = Math.max(0, Math.min(1,
    avgEnergy * (1 - harmonyRate)
  ));

  // SyncScore basé sur les styles d'attachement
  const attachmentMatch = stateA.attachmentStyle === stateB.attachmentStyle ? 0.3 : 0;
  const syncScore = Math.max(0, Math.min(1,
    harmonyRate * 0.5 + (1 - tensionLevel) * 0.2 + attachmentMatch
  ));

  // Faille visible si tension dépasse le seuil
  const faultLineVisible = tensionLevel > TENSION_THRESHOLD;

  // Texture basée sur le stade d'évolution
  const fusionTexture = totem.fusionState.fusionTexture;

  return updateFusionState(coupleId, {
    harmonyRate,
    tensionLevel,
    syncScore,
    faultLineVisible,
    fusionTexture,
  });
}

/**
 * Enregistre la complétion d'un rituel et réveille le totem.
 */
export async function completeRitual(coupleId: string): Promise<TotemState> {
  const totem = await getOrCreateTotem(coupleId);

  // Le streak devient cumulatif et ne reset plus jamais à 1
  const newStreak = totem.streakDays + 1;

  // Mise à jour du streak
  const updatedTotem = await updateTotemRitual(coupleId, newStreak);

  // Calcul du stade d'évolution
  const currentStage = updatedTotem.fusionState.evolutionStage;
  const nextStageThreshold = EVOLUTION_THRESHOLDS[currentStage] ?? Infinity;
  let nextStage = currentStage;
  if (newStreak >= nextStageThreshold && currentStage < 10) {
    nextStage = currentStage + 1;
  }

  // Boost d'harmonie lié au rituel et réactivation totale
  const newHarmony = Math.min(1,
    updatedTotem.fusionState.harmonyRate + HARMONY_BOOST_PER_RITUAL
  );
  const newTension = Math.max(0,
    updatedTotem.fusionState.tensionLevel - TENSION_DECAY_PER_RITUAL
  );

  return updateFusionState(coupleId, {
    evolutionStage: nextStage,
    harmonyRate: newHarmony,
    tensionLevel: newTension,
    faultLineVisible: newTension > TENSION_THRESHOLD,
    status: 'ACTIVE',
    energy: 1.0 // Réveil complet
  } as any);
}

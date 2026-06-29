import React from 'react';

export interface PlaySetup {
  local: boolean;   // Autour de la même TV (Soirée)
  remote: boolean;  // À distance (Discord, Zoom, Streaming)
  solo: boolean;    // Seul (test de personnalité individuel)
}

export interface GameModeManifest {
  id: string;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  isPremium: boolean;
  category: 'pei' | 'soiree' | 'standard' | 'corporate';
  roundDurationSeconds?: number; // Default: 30. Override for modes with custom durations.
  profilingCapabilities?: ProfilingCapabilities;
  activeFrom?: string;    // ISO date pour modes éphémères
  activeTo?: string;      // ISO date pour modes éphémères
  playSetup: PlaySetup;
}

export interface ProfilingCapabilities {
  alignment: boolean;     // Le mode produit-il des votes de consensus ?
  perspicacity: boolean;  // Le mode mesure-t-il la détection/empathie ?
  deception: boolean;     // Le mode implique-t-il du bluff/mensonge ?
  verbalOnly: boolean;    // Est-ce un mode purement oral (ex: Date Night) ?
}

export interface ValidationResult<TResponse> {
  isValid: boolean;
  parsedAnswer: TResponse | null;
  errorMessage?: string;
}

export interface GameModeEngine<TQuestion, TResponse, TScoreUpdate> {
  /**
   * Validates and parses the raw input answer from a player's phone controller.
   */
  validateResponse(
    playerResponse: string,
    question: TQuestion
  ): ValidationResult<TResponse>;

  /**
   * Calculates points earned by players at the end of the round.
   */
  calculateScores(
    responses: Array<{ playerId: string; answer: TResponse; timeSpentMs: number }>,
    question: TQuestion,
    context?: unknown
  ): Array<{ playerId: string; pointsEarned: number; isCorrect: boolean }>;
}

export interface TVComponentProps<TQuestion, TResponse> {
  question: TQuestion;
  responses: Array<{ playerId: string; name: string; answer: TResponse }>;
  gameState: 'VOTING' | 'REVEALING';
  timerLeft: number;
}

export interface PlayerComponentProps<TQuestion> {
  question: TQuestion;
  hasSubmitted: boolean;
  onSubmitAnswer: (answer: string) => void;
  timerLeft: number;
}

export interface GameModeQuestion {
  id?: string;
  text?: string;
  metadata?: Record<string, unknown> | null;
  correctAnswer?: string;
  options?: string[];
}

export interface GameModeTVViewProps {
  question: GameModeQuestion;
  responses: Array<{ playerId: string; name: string; answer: unknown }>;
  gameState: 'VOTING' | 'REVEALING' | 'DISCUSSION';
  timerDisplay?: React.ReactNode;
  isUntimed?: boolean;
  roundConfig?: Record<string, unknown> | null;
}

export interface GameModePlayerControllerProps {
  question: GameModeQuestion;
  hasSubmitted: boolean;
  onSubmitAnswer: (answer: string) => void;
  onVote?: (answer: string) => void;
  hasVoted?: boolean;
  myAnswer?: string;
  timerLeft?: number;
  isHost?: boolean;
}

export type GameModeTVView = React.ComponentType<GameModeTVViewProps>;
export type GameModePlayerController = React.ComponentType<GameModePlayerControllerProps>;

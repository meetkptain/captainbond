// Types DB simplifiés utilisés par les repositories et services.
// À remplacer par des types générés (Supabase ou Prisma) quand disponibles.

export interface Room {
  id: string;
  code: string;
  hostId: string;
  hostToken: string;
  status: 'WAITING' | 'PLAYING' | 'REVEALING' | 'DISCUSSION' | 'ENDED';
  round: number;
  targetType?: 'GROUP' | 'SOLO';
  currentMode?: string | null;
  currentQuestionId?: string | null;
  roundConfig?: Record<string, unknown> | null;
  paidByUserId?: string | null;
  passExpiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  socketId?: string;
  roomId: string;
  userId?: string | null;
  consentGivenAt?: string | null;
  createdAt?: string;
}

export interface Question {
  id: string;
  text: string;
  mode: string;
  correctAnswer?: string;
  options?: string[];
  explanation?: string | null;
  category?: string;
  difficulty?: number;
  isPremium?: boolean;
  tags?: string[];
  metadata?: Record<string, unknown> | null;
  intensityLevel?: number;
  packId?: string | null;
  createdAt?: string;
  [key: string]: unknown;
}

export interface Response {
  id?: string;
  playerId: string;
  questionId: string;
  answer: string;
  isCorrect?: boolean | null;
  roomId?: string;
  timestamp?: string;
}

export interface Score {
  id?: string;
  playerId: string;
  roomId: string;
  points: number;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionStatus?: string;
  activePassExpiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Purchase {
  id: string;
  userId: string;
  playerId?: string | null;
  packId?: string | null;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'REFUNDED' | 'FAILED';
  stripePaymentId?: string | null;
  stripeInvoiceId?: string | null;
  metadata?: Record<string, unknown>;
  refundedAt?: string | null;
  createdAt?: string;
}

export interface Pack {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  price: number;
  stripePriceId?: string | null;
  stripeProductId?: string | null;
  productType?: string;
  scope?: Record<string, unknown> | null;
  isSubscription?: boolean;
  isPro?: boolean;
  createdAt?: string;
}

export interface UserPack {
  id?: string;
  userId: string;
  packId: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  processedAt?: string;
  createdAt?: string;
}

export interface Couple {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tree {
  id: string;
  coupleId?: string | null;
  roomId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TreeNode {
  id: string;
  treeId: string;
  questionId?: string | null;
  customText?: string | null;
  intensity: number;
  category: string;
  answeredAt?: string;
  answeredBy: string[];
  embedding?: number[] | null;
}

export interface TreeConnection {
  id: string;
  treeId: string;
  sourceId: string;
  targetId: string;
  resonance: number;
  type: string;
  createdAt?: string;
}

export interface DJProfile {
  id: string;
  coupleId?: string | null;
  roomId?: string | null;
  mood: string;
  intensityTarget: number;
  interactionHistory?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DJQuestion {
  id: string;
  profileId: string;
  text: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  feedback?: string | null;
  createdAt?: string;
}

export interface DailyQuestion {
  id: string;
  coupleId: string;
  questionId?: string | null;
  customText?: string | null;
  releasedAt?: string;
  isAnswered: boolean;
  user1Answer?: string | null;
  user2Answer?: string | null;
  revealedAt?: string | null;
  // Sync Drop (Rituel de 20h)
  user1Answered: boolean;
  user2Answered: boolean;
  isRevealed: boolean;
  resonanceScore?: number | null;
  analysisJson?: Record<string, unknown> | null;
  analysisStatus: 'PENDING' | 'COMPUTED' | 'REVEALED' | 'EXPIRED';
}

export interface CouplePortrait {
  id: string;
  coupleId: string;
  month: string;
  partnerAProfile?: Record<string, unknown> | null;
  partnerBProfile?: Record<string, unknown> | null;
  coupleDynamic?: Record<string, unknown> | null;
  alignmentTrend: number;
  createdAt?: string;
}

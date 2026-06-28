import { z } from 'zod';
import { sanitizeString, sanitizeRoomCode } from '@/lib/sanitize';

// ---------- Primitives ----------

export const uuidSchema = z.string().uuid();

export const roomCodeSchema = z
  .string()
  .min(4, 'Le code room est trop court')
  .max(10, 'Le code room est trop long')
  .transform((v) => sanitizeRoomCode(v));

export const playerNameSchema = z
  .string()
  .transform((v) => sanitizeString(v))
  .refine((v) => v.length > 0, { message: 'Le nom est requis' })
  .refine((v) => v.length <= 15, { message: 'Le nom ne doit pas dépasser 15 caractères' });

// ---------- Admin ----------

export const adminLoginSchema = z.object({
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

// ---------- Room ----------

export const roomCreateSchema = z.object({
  targetType: z.enum(['GROUP', 'SOLO']).optional(),
  playerName: playerNameSchema.optional(),
  language: z.string().optional(),
});

export type RoomCreateInput = z.infer<typeof roomCreateSchema>;

export const roomJoinSchema = z.object({
  roomCode: roomCodeSchema,
  playerName: playerNameSchema,
  consent: z.literal(true, {
    message: 'Le consentement est requis pour participer.',
  }),
});

export type RoomJoinInput = z.infer<typeof roomJoinSchema>;

export const roomCodeOnlySchema = z.object({
  roomCode: roomCodeSchema,
});

export type RoomCodeOnlyInput = z.infer<typeof roomCodeOnlySchema>;

export const roomSetModeSchema = z.object({
  roomCode: roomCodeSchema,
  mode: z.enum(['DEEP_CONNECTION', 'DATE_NIGHT', 'IMPOSTEUR']),
});

export type RoomSetModeInput = z.infer<typeof roomSetModeSchema>;

export const hostAuthSchema = z.object({
  roomCode: roomCodeSchema,
  hostId: uuidSchema,
  hostToken: z.string().min(1, 'Le hostToken est requis'),
});

export type HostAuthInput = z.infer<typeof hostAuthSchema>;

export const hostAuthQuerySchema = z.object({
  roomCode: roomCodeSchema,
  hostId: uuidSchema,
  hostToken: z.string().min(1, 'Le hostToken est requis'),
});

export type HostAuthQueryInput = z.infer<typeof hostAuthQuerySchema>;

// ---------- Player ----------

export const playerReadySchema = z.object({
  isReady: z.boolean(),
});

export type PlayerReadyInput = z.infer<typeof playerReadySchema>;

export const playerKickSchema = z.object({
  targetPlayerId: uuidSchema,
});

export type PlayerKickInput = z.infer<typeof playerKickSchema>;

export const playerVoteSchema = z.object({
  targetPlayerId: uuidSchema,
});

export type PlayerVoteInput = z.infer<typeof playerVoteSchema>;

// ---------- Checkout ----------

const checkoutUrlSchema = z.string().refine(
  (url) => url.startsWith('/') || z.string().url().safeParse(url).success,
  { message: 'URL invalide (doit être relative ou absolue)' }
);

export const checkoutSessionSchema = z.object({
  playerId: uuidSchema,
  roomCode: roomCodeSchema,
  successUrl: checkoutUrlSchema,
  cancelUrl: checkoutUrlSchema,
});

export type CheckoutSessionInput = z.infer<typeof checkoutSessionSchema>;

// ---------- Query helpers ----------

export const playerIdQuerySchema = z.object({
  playerId: uuidSchema,
});

export const entitlementsQuerySchema = z.object({
  playerId: uuidSchema.optional(),
  userId: uuidSchema.optional(),
  roomCode: roomCodeSchema.optional(),
});

// ---------- Admin questions ----------

export const questionCreateSchema = z.object({
  id: uuidSchema.optional(),
  text: z.string().min(1, 'Le texte est requis'),
  mode: z.string().min(1, 'Le mode est requis').transform((v) => v.toUpperCase()),
  correctAnswer: z.string().optional(),
  options: z.array(z.string()).optional(),
  explanation: z.string().nullable().optional(),
  category: z.string().min(1, 'La catégorie est requise'),
  difficulty: z.number().int().min(1).optional(),
  isPremium: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  packId: uuidSchema.nullable().optional(),
  intensityLevel: z.number().int().min(1).optional(),
});

export type QuestionCreateInput = z.infer<typeof questionCreateSchema>;

export const questionBulkCreateSchema = z.array(questionCreateSchema);

export const questionUpdateSchema = questionCreateSchema.partial().extend({
  id: uuidSchema,
});

export type QuestionUpdateInput = z.infer<typeof questionUpdateSchema>;

// ---------- Admin generate ----------

export const generateQuestionsSchema = z.object({
  theme: z.string().min(1, 'Le thème est requis'),
  count: z.coerce.number().int().min(1).max(15),
  mode: z.string().min(1, 'Le mode est requis'),
  category: z.string().min(1, 'La catégorie est requise'),
  difficulty: z.coerce.number().int().min(1).optional(),
});

export type GenerateQuestionsInput = z.infer<typeof generateQuestionsSchema>;

// ---------- Webhook Stripe ----------

export const stripeWebhookHeadersSchema = z.object({
  'stripe-signature': z.string().min(1, 'Signature Stripe manquante'),
});

export type StripeWebhookHeaders = z.infer<typeof stripeWebhookHeadersSchema>;

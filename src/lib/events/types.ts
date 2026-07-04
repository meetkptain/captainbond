export interface WebhookProcessedEvent {
  type: 'STRIPE' | 'REVENUECAT';
  eventId: string;
  sku?: string;
  userId?: string;
}

export interface RoomRoundRevealedEvent {
  roomId: string;
  round: number;
}

export interface RoomRoundStartedEvent {
  roomId: string;
  round: number;
}

export interface CoupleAnswerSubmittedEvent {
  coupleId: string;
  dailyQuestionId: string;
  userId: string;
}

export interface CoupleQuestionRevealedEvent {
  coupleId: string;
  dailyQuestionId: string;
  resonanceScore: number;
}

export interface InternalEventMap {
  'webhook:processed': WebhookProcessedEvent;
  'room:round:revealed': RoomRoundRevealedEvent;
  'room:round:started': RoomRoundStartedEvent;
  'couple:answer:submitted': CoupleAnswerSubmittedEvent;
  'couple:question:revealed': CoupleQuestionRevealedEvent;
}

export type InternalEventName = keyof InternalEventMap;
export type InternalEventPayload<N extends InternalEventName> = InternalEventMap[N];

/**
 * Couche d'erreurs opérationnelles.
 * Toute erreur métier prévisible doit être une AppError.
 * Les erreurs inattendues (DB down, bug) restent des Error classiques
 * et seront transformées en 500 sans fuite d'informations.
 */

export type ErrorCode =
  // Authentification / autorisation
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INVALID_CREDENTIALS'
  | 'SESSION_EXPIRED'
  // Validation
  | 'VALIDATION_ERROR'
  | 'BAD_REQUEST'
  // Ressources
  | 'NOT_FOUND'
  | 'CONFLICT'
  // Métier
  | 'ROOM_CLOSED'
  | 'ROOM_FULL'
  | 'GAME_ALREADY_STARTED'
  | 'PLAYER_NAME_TAKEN'
  | 'PAYMENT_FAILED'
  | 'ALREADY_PURCHASED'
  | 'GENERATION_FAILED'
  | 'ANALYSIS_FAILED'
  | 'COUPLE_NOT_FOUND'
  // Infrastructure
  | 'INTERNAL_ERROR'
  | 'RATE_LIMITED'
  | 'SERVICE_UNAVAILABLE';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    message: string,
    options: {
      status?: number;
      isOperational?: boolean;
      details?: Record<string, unknown>;
      cause?: unknown;
    } = {}
  ) {
    super(message, { cause: options.cause });
    this.code = code;
    this.status = options.status ?? mapCodeToStatus(code);
    this.isOperational = options.isOperational ?? true;
    this.details = options.details;
  }
}

export function mapCodeToStatus(code: ErrorCode): number {
  switch (code) {
    case 'UNAUTHORIZED':
    case 'INVALID_CREDENTIALS':
    case 'SESSION_EXPIRED':
      return 401;
    case 'FORBIDDEN':
      return 403;
    case 'NOT_FOUND':
    case 'COUPLE_NOT_FOUND':
      return 404;
    case 'GENERATION_FAILED':
    case 'ANALYSIS_FAILED':
      return 502;
    case 'CONFLICT':
    case 'PLAYER_NAME_TAKEN':
    case 'ALREADY_PURCHASED':
      return 409;
    case 'VALIDATION_ERROR':
    case 'BAD_REQUEST':
      return 400;
    case 'RATE_LIMITED':
      return 429;
    case 'SERVICE_UNAVAILABLE':
      return 503;
    case 'ROOM_CLOSED':
    case 'ROOM_FULL':
    case 'GAME_ALREADY_STARTED':
      return 403;
    case 'PAYMENT_FAILED':
      return 402;
    case 'INTERNAL_ERROR':
    default:
      return 500;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

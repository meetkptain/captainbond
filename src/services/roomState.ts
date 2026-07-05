export type RoomStatus = 'WAITING' | 'PLAYING' | 'REVEALING' | 'DISCUSSION' | 'ENDED';

const TRANSITION_MAP: Record<RoomStatus, RoomStatus[]> = {
  WAITING: ['PLAYING', 'ENDED'],
  PLAYING: ['REVEALING', 'DISCUSSION', 'ENDED', 'WAITING'],
  REVEALING: ['DISCUSSION', 'ENDED'],
  DISCUSSION: ['PLAYING', 'ENDED', 'WAITING'],
  ENDED: ['WAITING'],
};

export function canTransition(from: RoomStatus, to: RoomStatus): boolean {
  return TRANSITION_MAP[from]?.includes(to) ?? false;
}

export function assertTransition(from: RoomStatus, to: RoomStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid room status transition: ${from} → ${to}`);
  }
}

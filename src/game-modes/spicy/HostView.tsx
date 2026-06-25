'use client';

import { PresentialHostView } from '@/components/presentiel/PresentialHostView';
import { Player } from '@/components/presentiel/TalkingStick';

interface HostViewProps {
  roomCode: string;
  hostId: string;
  hostToken: string;
  players: Player[];
  onExit: () => void;
}

export function SpicyHostView(props: HostViewProps) {
  return <PresentialHostView {...props} modeId="SPICY" />;
}

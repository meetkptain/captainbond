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

export default function DeepConnectionHostView(props: HostViewProps) {
  return <PresentialHostView {...props} modeId="DEEP_CONNECTION" />;
}

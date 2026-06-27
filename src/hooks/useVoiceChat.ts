import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseVoiceChatInput {
  groupId: string;
  playerId: string;
  isEnabled: boolean;
}

export function useVoiceChat({ groupId, playerId, isEnabled }: UseVoiceChatInput) {
  const [isMuted, setIsMuted] = useState(false);
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Record<string, RTCPeerConnection>>({});
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Mute / Unmute
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!localStreamRef.current.getAudioTracks()[0].enabled);
    }
  };

  useEffect(() => {
    const currentPeers = peersRef.current;

    if (!isEnabled) {
      // Clean up connections
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      Object.entries(currentPeers).forEach(([pId, peer]) => {
        peer.close();
        delete currentPeers[pId];
      });
      setTimeout(() => {
        setConnectedPeers([]);
      }, 0);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    let active = true;

    async function initVoice() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.warn('Media devices not supported on this browser');
          return;
        }

        // 1. Get audio stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        localStreamRef.current = stream;

        // 2. Setup signaling channel
        const channel = supabase.channel(`voice-signaling-${groupId}`);
        channelRef.current = channel;

        // Handle signaling signals (SDP / ICE)
        channel
          .on('broadcast', { event: 'signal' }, async (response) => {
            const { type, signal, toPlayerId, senderId } = response.payload;
            if (toPlayerId !== playerId) return;

            if (type === 'offer') {
              const peer = getOrCreatePeer(senderId, stream, channel);
              await peer.setRemoteDescription(new RTCSessionDescription(signal));
              const answer = await peer.createAnswer();
              await peer.setLocalDescription(answer);
              await channel.send({
                type: 'broadcast',
                event: 'signal',
                payload: { type: 'answer', signal: answer, toPlayerId: senderId, senderId: playerId },
              });
            } else if (type === 'answer') {
              const peer = peersRef.current[senderId];
              if (peer) {
                await peer.setRemoteDescription(new RTCSessionDescription(signal));
              }
            } else if (type === 'ice-candidate') {
              const peer = peersRef.current[senderId];
              if (peer) {
                await peer.addIceCandidate(new RTCIceCandidate(signal));
              }
            }
          })
          .on('broadcast', { event: 'signal_ping' }, async (response) => {
            const { senderId } = response.payload;
            if (senderId === playerId) return;
            // Create offer to the pinging player
            const peer = getOrCreatePeer(senderId, stream, channel);
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            await channel.send({
              type: 'broadcast',
              event: 'signal',
              payload: { type: 'offer', signal: offer, toPlayerId: senderId, senderId: playerId },
            });
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              // Announce presence to get offers
              await channel.send({
                type: 'broadcast',
                event: 'signal_ping',
                payload: { senderId: playerId },
              });
            }
          });

      } catch (err) {
        console.error('Failed to initialize WebRTC voice chat:', err);
      }
    }

    function getOrCreatePeer(targetPlayerId: string, stream: MediaStream, channel: RealtimeChannel) {
      if (peersRef.current[targetPlayerId]) {
        return peersRef.current[targetPlayerId];
      }

      const peer = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      // Add local tracks
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      // Handle ICE candidates
      peer.onicecandidate = async (event) => {
        if (event.candidate) {
          await channel.send({
            type: 'broadcast',
            event: 'signal',
            payload: {
              type: 'ice-candidate',
              signal: event.candidate,
              toPlayerId: targetPlayerId,
              senderId: playerId,
            },
          });
        }
      };

      // Handle remote audio stream
      peer.ontrack = (event) => {
        const remoteStream = event.streams[0];
        const audio = new Audio();
        audio.srcObject = remoteStream;
        audio.play().catch(console.error);
        
        setConnectedPeers((prev) => {
          if (prev.includes(targetPlayerId)) return prev;
          return [...prev, targetPlayerId];
        });
      };

      peer.onconnectionstatechange = () => {
        if (peer.connectionState === 'disconnected' || peer.connectionState === 'closed' || peer.connectionState === 'failed') {
          peer.close();
          delete peersRef.current[targetPlayerId];
          setConnectedPeers((prev) => prev.filter((id) => id !== targetPlayerId));
        }
      };

      peersRef.current[targetPlayerId] = peer;
      return peer;
    }

    initVoice();

    return () => {
      active = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      Object.entries(currentPeers).forEach(([pId, peer]) => {
        peer.close();
        delete currentPeers[pId];
      });
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [groupId, playerId, isEnabled]);

  return {
    isMuted,
    connectedPeers,
    toggleMute,
  };
}

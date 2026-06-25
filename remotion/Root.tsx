import React from 'react';
import { Composition } from 'remotion';
import { CaptainReunionClash } from './CaptainReunionClash';
// import { CaptainBondConfession } from './CaptainBondConfession';
// import { CaptainBondChat } from './CaptainBondChat';
const CaptainBondConfession = () => null;
const CaptainBondChat = () => null;

export type PlayerScript = {
  name: string;
  initial: string;
  answer: string;
  isWinner: boolean;
};

export type ClashProps = {
  theme: string;
  question: string;
  p1: PlayerScript;
  p2: PlayerScript;
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CaptainReunionClash"
        component={CaptainReunionClash}
        durationInFrames={450} // 15 seconds at 30fps
        fps={30}
        width={1080}
        height={1920} // Resolution TikTok/Reels standard
        defaultProps={{
          theme: 'tiktok',
          question: "La vraie raison pour laquelle Mbappé a raté son action, c'est...",
          p1: { name: 'Kévin', initial: 'K', answer: 'Il avait faim et pensait à un rougail saucisse', isWinner: false },
          p2: { name: 'Sarah', initial: 'S', answer: "Il avait oublié d'enlever ses Airpods", isWinner: true },
        }}
      />
      <Composition
        id="CaptainBondConfession"
        component={CaptainBondConfession}
        durationInFrames={600} // 20 seconds at 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          amorce: "Quelle est ta plus grande peur inavouée ?",
          confession: "Je vérifie toujours 3 fois si la porte est fermée à clé, mais au fond, j'ai surtout peur de ce qui est déjà à l'intérieur...",
        }}
      />
      <Composition
        id="CaptainBondChat"
        component={CaptainBondChat}
        durationInFrames={600} // 20 seconds at 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          headerName: "Mon ex 🐍",
          messages: [
            { id: '1', sender: 'left', text: 'On doit parler.' },
            { id: '2', sender: 'right', text: 'De quoi ? Il est 2h du mat.' },
            { id: '3', sender: 'left', text: 'J\'ai tout découvert.' },
            { id: '4', sender: 'right', text: 'Découvert quoi ?' },
            { id: '5', sender: 'left', text: 'Pour toi et ma soeur.' }
          ]
        }}
      />
    </>
  );
};

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { ClashProps } from './Root';

export const CaptainReunionClash: React.FC<ClashProps> = ({
  theme,
  question,
  p1,
  p2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations Timing (Accéléré)
  const questionDrop = spring({ frame: frame - 10, fps, config: { damping: 12 } });
  
  const p1Pop = spring({ frame: frame - 40, fps, config: { damping: 10 } });
  const p2Pop = spring({ frame: frame - 70, fps, config: { damping: 10 } });
  
  const voteStartFrame = 120;
  const voteDuration = 60; // 2 seconds of voting instead of 3
  const voteProgress = interpolate(
    frame,
    [voteStartFrame, voteStartFrame + voteDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const winnerStartFrame = 210;
  const winnerScale = spring({ frame: frame - winnerStartFrame, fps, config: { damping: 8, mass: 1.2 } });

  // NEURO-HACK: Shake effect at winner reveal
  const shakeX = frame > winnerStartFrame && frame < winnerStartFrame + 10 
    ? interpolate(frame, [winnerStartFrame, winnerStartFrame + 2, winnerStartFrame + 4, winnerStartFrame + 6, winnerStartFrame + 8, winnerStartFrame + 10], [0, 15, -15, 10, -10, 0])
    : 0;

  // Styles based on theme
  const getThemeStyles = () => {
    switch (theme) {
      case 'tiktok': return { bg: 'linear-gradient(135deg, #010101 0%, #1a1a1a 100%)', text: '#fff' };
      case 'twitch': return { bg: 'linear-gradient(135deg, #1f1437 0%, #090615 100%)', text: '#fff' };
      case 'pei': return { bg: 'linear-gradient(135deg, #1B6B3A 0%, #082212 100%)', text: '#FDF5E6' };
      default: return { bg: '#111', text: '#fff' };
    }
  };
  const themeStyles = getThemeStyles();

  // Voting Math
  const p1Target = p1.isWinner ? 85 : 35;
  const p2Target = p2.isWinner ? 85 : 35;
  const currentP1Votes = Math.floor(interpolate(voteProgress, [0, 1], [0, p1Target]));
  const currentP2Votes = Math.floor(interpolate(voteProgress, [0, 1], [0, p2Target]));

  // Flash effect on winner
  const flashOpacity = interpolate(
    frame,
    [winnerStartFrame, winnerStartFrame + 5, winnerStartFrame + 15],
    [0, 0.8, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ 
      background: themeStyles.bg, 
      color: themeStyles.text, 
      fontFamily: '"Inter", sans-serif', 
      padding: '120px 60px 350px 60px', // Safe zones strictes (évite boutons droite & description)
      transform: `translateX(${shakeX}px)`,
    }}>
      
      {/* FLASH EFFECT ON WINNER */}
      {frame >= winnerStartFrame && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'white',
          opacity: flashOpacity,
          zIndex: 50,
          pointerEvents: 'none',
        }} />
      )}

      {/* QUESTION */}
      <div
        style={{
          fontSize: '75px',
          fontWeight: '900',
          textAlign: 'center',
          marginBottom: '80px',
          transform: `translateY(${interpolate(questionDrop, [0, 1], [-500, 0])}px)`,
          opacity: questionDrop,
          textShadow: '0 10px 30px rgba(0,0,0,0.8), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000', // Stroke + shadow
        }}
      >
        {question}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '60px', flex: 1, paddingRight: '40px' /* Evite les icones TikTok */ }}>
        
        {/* PLAYER 1 CARD */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(30px)',
            borderRadius: '30px',
            padding: '45px',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            transform: `scale(${p1Pop}) ${frame > winnerStartFrame && p1.isWinner ? `scale(${interpolate(winnerScale, [0, 1], [1, 1.05])})` : ''}`,
            opacity: frame >= 40 ? (frame > winnerStartFrame && !p1.isWinner ? 0.3 : 1) : 0,
            boxShadow: frame > winnerStartFrame && p1.isWinner ? '0 0 100px rgba(244, 196, 48, 0.6), inset 0 0 30px rgba(244, 196, 48, 0.3)' : '0 20px 40px rgba(0,0,0,0.3)',
            borderColor: frame > winnerStartFrame && p1.isWinner ? '#F4C430' : 'rgba(255, 255, 255, 0.2)',
            transition: 'opacity 0.3s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '25px' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '45px', fontWeight: '900', boxShadow: '0 10px 20px rgba(59,130,246,0.4)' }}>
              {p1.initial}
            </div>
            <span style={{ fontSize: '50px', fontWeight: '800' }}>{p1.name}</span>
          </div>
          <div style={{ fontSize: '55px', fontWeight: '700', lineHeight: 1.3 }}>
            {p1.answer}
          </div>
          
          {/* VOTE BAR */}
          {frame > voteStartFrame && (
            <div style={{ height: '50px', background: 'rgba(0,0,0,0.5)', borderRadius: '25px', marginTop: '40px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ width: `${currentP1Votes}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', boxShadow: '0 0 20px rgba(59,130,246,0.5)' }} />
              <div style={{ position: 'absolute', top: 0, left: '25px', height: '100%', display: 'flex', alignItems: 'center', fontSize: '28px', fontWeight: '900', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                {Math.floor((currentP1Votes / 100) * 500)} votes
              </div>
            </div>
          )}
        </div>

        {/* VS TEXT */}
        {frame > 90 && frame < winnerStartFrame && (
          <div style={{ textAlign: 'center', fontSize: '90px', fontWeight: '900', color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            VS
          </div>
        )}

        {/* PLAYER 2 CARD */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(30px)',
            borderRadius: '30px',
            padding: '45px',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            transform: `scale(${p2Pop}) ${frame > winnerStartFrame && p2.isWinner ? `scale(${interpolate(winnerScale, [0, 1], [1, 1.05])})` : ''}`,
            opacity: frame >= 70 ? (frame > winnerStartFrame && !p2.isWinner ? 0.3 : 1) : 0,
            boxShadow: frame > winnerStartFrame && p2.isWinner ? '0 0 100px rgba(244, 196, 48, 0.6), inset 0 0 30px rgba(244, 196, 48, 0.3)' : '0 20px 40px rgba(0,0,0,0.3)',
            borderColor: frame > winnerStartFrame && p2.isWinner ? '#F4C430' : 'rgba(255, 255, 255, 0.2)',
            transition: 'opacity 0.3s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '25px' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '45px', fontWeight: '900', boxShadow: '0 10px 20px rgba(239,68,68,0.4)' }}>
              {p2.initial}
            </div>
            <span style={{ fontSize: '50px', fontWeight: '800' }}>{p2.name}</span>
          </div>
          <div style={{ fontSize: '55px', fontWeight: '700', lineHeight: 1.3 }}>
            {p2.answer}
          </div>
          
          {/* VOTE BAR */}
          {frame > voteStartFrame && (
            <div style={{ height: '50px', background: 'rgba(0,0,0,0.5)', borderRadius: '25px', marginTop: '40px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ width: `${currentP2Votes}%`, height: '100%', background: 'linear-gradient(90deg, #ef4444, #f87171)', boxShadow: '0 0 20px rgba(239,68,68,0.5)' }} />
              <div style={{ position: 'absolute', top: 0, left: '25px', height: '100%', display: 'flex', alignItems: 'center', fontSize: '28px', fontWeight: '900', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                {Math.floor((currentP2Votes / 100) * 500)} votes
              </div>
            </div>
          )}
        </div>

      </div>

      {/* WINNER OVERLAY */}
      {frame > winnerStartFrame && (
        <div
          style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: `translate(-50%, -50%) rotate(-10deg) scale(${winnerScale})`,
            fontSize: '140px',
            fontWeight: '900',
            color: '#F4C430',
            textShadow: '0 15px 40px rgba(0,0,0,0.9), 0 0 100px #d97706, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff',
            whiteSpace: 'nowrap',
            zIndex: 100,
          }}
        >
          VAINQUEUR !
        </div>
      )}

    </AbsoluteFill>
  );
};

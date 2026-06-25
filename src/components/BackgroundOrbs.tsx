import React from 'react';

export function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#020617]">
      <div 
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.8) 0%, rgba(139,92,246,0) 70%)',
          animationDuration: '15s',
        }}
      />
      <div 
        className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob"
        style={{
          background: 'radial-gradient(circle, rgba(236,72,153,0.8) 0%, rgba(236,72,153,0) 70%)',
          animationDelay: '2s',
          animationDuration: '20s',
        }}
      />
      <div 
        className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob"
        style={{
          background: 'radial-gradient(circle, rgba(56,189,248,0.6) 0%, rgba(56,189,248,0) 70%)',
          animationDelay: '5s',
          animationDuration: '18s',
        }}
      />
      {/* Overlay noise texture (optional but very premium for glassmorphism) */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      ></div>
    </div>
  );
}

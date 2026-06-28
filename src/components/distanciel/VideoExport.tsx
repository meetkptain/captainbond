'use client';

import React, { useState } from 'react';
import { Player } from '@remotion/player';
import { CaptainReunionClash } from '../../../remotion/CaptainReunionClash';
import { Icon } from '../Icon';

interface VideoExportProps {
  onClose: () => void;
  questionText: string;
  partnerAName: string;
  partnerAAnswer: string;
  partnerBName: string;
  partnerBAnswer: string;
}

export function VideoExport({
  onClose,
  questionText,
  partnerAName,
  partnerAAnswer,
  partnerBName,
  partnerBAnswer,
}: VideoExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);

  const defaultProps = {
    theme: 'tiktok',
    question: questionText,
    p1: { 
      name: partnerAName, 
      initial: partnerAName[0]?.toUpperCase() || 'A', 
      answer: partnerAAnswer, 
      isWinner: true 
    },
    p2: { 
      name: partnerBName, 
      initial: partnerBName[0]?.toUpperCase() || 'B', 
      answer: partnerBAnswer, 
      isWinner: false 
    },
  };

  const handleStartExport = () => {
    setIsExporting(true);
    setProgress(0);
    
    // Simulate export progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          setExportComplete(true);
          return 100;
        }
        return prev + 10;
      });
    }, 400);
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mon Clash Captain Bond !',
          text: `Découvre notre niveau de complicité sur la question : "${questionText}" !`,
          url: `${window.location.origin}`,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${window.location.origin}`);
        alert('Lien copié dans le presse-papier !');
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        {/* Left Side: Video Preview Player */}
        <div className="w-full md:w-1/2 bg-black flex items-center justify-center p-4">
          <div className="w-full max-w-[280px] aspect-[9/16] rounded-xl overflow-hidden shadow-lg border border-white/5 relative bg-slate-900">
            <Player
              component={CaptainReunionClash}
              inputProps={defaultProps}
              durationInFrames={150}
              fps={30}
              compositionWidth={1080}
              compositionHeight={1920}
              style={{
                width: '100%',
                height: '100%',
              }}
              controls
              loop
            />
          </div>
        </div>

        {/* Right Side: Options & Actions */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold">Exporter l&apos;Analyse</h3>
                <p className="text-sm text-slate-400">Générez un Reel/TikTok de votre complicité</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
              >
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Question
                </span>
                <p className="text-sm font-medium">{questionText}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-pink-500/5 border border-pink-500/10">
                  <span className="text-xs text-pink-400 font-bold block mb-1">
                    {partnerAName}
                  </span>
                  <p className="text-xs text-slate-300 truncate">{partnerAAnswer}</p>
                </div>
                <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/10">
                  <span className="text-xs text-violet-400 font-bold block mb-1">
                    {partnerBName}
                  </span>
                  <p className="text-xs text-slate-300 truncate">{partnerBAnswer}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {isExporting ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-400">
                  <span>Génération de la vidéo...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-violet-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : exportComplete ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold justify-center">
                  <Icon name="check" className="w-5 h-5" />
                  Vidéo générée avec succès !
                </div>
                <button
                  onClick={handleShare}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <Icon name="share" className="w-4 h-4" />
                  Partager le lien (TikTok / Insta)
                </button>
                <a
                  href={`https://api.whatsapp.com/send?text=Regarde%20notre%20clash%20sur%20Captain%20Bond%20!%20${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm tracking-wide shadow-lg text-center flex items-center justify-center gap-2 text-white border-none decoration-none"
                >
                  💬 Partager sur WhatsApp
                </a>
              </div>
            ) : (
              <button
                onClick={handleStartExport}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 font-bold text-sm tracking-wide shadow-lg shadow-pink-500/25 hover:shadow-pink-500/35 flex items-center justify-center gap-2"
              >
                <Icon name="rocket" className="w-4 h-4" />
                Générer le format TikTok/Reel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import type { GameModeTVViewProps } from '../types';
import { getDiscussionPrompt } from '../prompts';

export function SpicyTVView({ question, responses, gameState, timerDisplay, isUntimed }: GameModeTVViewProps) {
  
  const options = useMemo(() => {
    if (!question?.text) return { a: 'Pour', b: 'Contre' };
    const lowerText = question.text.toLowerCase();
    if (lowerText.includes(' ou ')) {
      const parts = question.text.split(/ ou /i);
      if (parts.length === 2) {
        const optA = parts[0].replace(/tu préfères /i, '').replace(/tu preferes /i, '').trim();
        const optB = parts[1].replace(/\?/g, '').trim();
        return { 
          a: optA.charAt(0).toUpperCase() + optA.slice(1), 
          b: optB.charAt(0).toUpperCase() + optB.slice(1) 
        };
      }
    }
    return { a: 'Pour', b: 'Contre' };
  }, [question]);

  // Calculer les camps
  const { campA, campB } = useMemo(() => {
    const a: string[] = [];
    const b: string[] = [];
    responses.forEach((r) => {
      if (r.answer === 'A') a.push(r.name);
      if (r.answer === 'B') b.push(r.name);
    });
    return { campA: a, campB: b };
  }, [responses]);

  if (gameState === 'VOTING') {
    return (
      <div className="flex flex-col items-center w-full max-w-4xl text-center">
        <span className="text-neon-pink font-mono tracking-widest font-bold uppercase mb-4 px-4 py-1 bg-neon-pink/10 rounded-full border border-neon-pink/30 text-rose-400">
          🌶️ Spicy Debate
        </span>
        <h2 className="text-4xl md:text-6xl font-black leading-tight text-white mb-16">
          {question?.text || "Chargement..."}
        </h2>
        
        <div className="flex items-center gap-12 w-full max-w-2xl justify-center">
           <div className="flex flex-col items-center flex-1">
             <div className="text-6xl mb-4 animate-bounce">🔵</div>
             <div className="text-2xl font-bold text-indigo-300 text-center">{options.a}</div>
           </div>
           
           {!isUntimed && (
             <div className="w-24 h-24 flex items-center justify-center shrink-0">
               {timerDisplay}
             </div>
           )}
           {isUntimed && <div className="text-3xl font-black text-slate-500">VS</div>}

           <div className="flex flex-col items-center flex-1">
             <div className="text-6xl mb-4 animate-bounce" style={{animationDelay: '0.2s'}}>🔴</div>
             <div className="text-2xl font-bold text-rose-300 text-center">{options.b}</div>
           </div>
        </div>
        
        <p className="text-slate-400 mt-12 italic">Faites votre choix sur vos téléphones. Le débat s&apos;annonce rude.</p>
      </div>
    );
  }

  // Phase REVEALING
  const totalVotes = campA.length + campB.length;
  const pctA = totalVotes === 0 ? 50 : Math.round((campA.length / totalVotes) * 100);
  const pctB = totalVotes === 0 ? 50 : Math.round((campB.length / totalVotes) * 100);
  const minorityCamp = pctA <= pctB ? options.a : options.b;

  if (gameState === 'DISCUSSION') {
    const prompt = getDiscussionPrompt('SPICY', {
      questionText: question?.text as string,
    });
    return (
      <div className="flex flex-col items-center w-full max-w-4xl text-center animate-in zoom-in duration-500">
        <span className="text-rose-400 font-mono tracking-widest font-bold uppercase mb-4">Débat ouvert</span>
        <h2 className="text-4xl md:text-6xl font-black leading-tight text-white mb-6">
          {prompt.title}
        </h2>
        <p className="text-xl text-slate-300 mb-2">{prompt.subtitle}</p>
        <p className="text-lg text-neon-pink font-medium mt-4">{prompt.action}</p>
        <div className="mt-8 px-6 py-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
          <span className="text-rose-300 font-bold">Camp minoritaire : {minorityCamp}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-6xl animate-in fade-in duration-700 h-full">
      <h3 className="text-2xl md:text-3xl font-bold text-slate-300 mb-10 text-center px-4">
        {question?.text}
      </h3>

      <div className="flex w-full flex-1 gap-4">
        {/* CAMP A */}
        <div className={`flex-1 flex flex-col p-8 rounded-3xl border-2 transition-all duration-1000 ${pctA > pctB ? 'bg-indigo-950/50 border-indigo-500 shadow-[0_0_50px_rgba(79,70,229,0.2)]' : 'bg-slate-900/50 border-white/5'}`}>
          <div className="flex justify-between items-start mb-6">
            <h4 className="text-3xl font-black text-indigo-400">{options.a}</h4>
            <span className="text-5xl font-black text-white/20">{pctA}%</span>
          </div>
          <div className="flex flex-wrap gap-3 mt-auto">
            {campA.length === 0 && <span className="text-slate-500 italic">Personne... Quelle solitude.</span>}
            {campA.map((name, i) => (
              <div key={i} className="px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-100 font-bold text-lg animate-in zoom-in" style={{animationDelay: `${i*100}ms`}}>
                {name}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center -mx-8 z-10">
          <div className="bg-slate-950 w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center font-black text-slate-500 text-xl">
            VS
          </div>
        </div>

        {/* CAMP B */}
        <div className={`flex-1 flex flex-col p-8 rounded-3xl border-2 transition-all duration-1000 ${pctB > pctA ? 'bg-rose-950/50 border-rose-500 shadow-[0_0_50px_rgba(225,29,72,0.2)]' : 'bg-slate-900/50 border-white/5'}`}>
          <div className="flex justify-between items-start mb-6">
            <span className="text-5xl font-black text-white/20">{pctB}%</span>
            <h4 className="text-3xl font-black text-rose-400 text-right">{options.b}</h4>
          </div>
          <div className="flex flex-wrap justify-end gap-3 mt-auto">
            {campB.length === 0 && <span className="text-slate-500 italic">Personne...</span>}
            {campB.map((name, i) => (
              <div key={i} className="px-4 py-2 bg-rose-600/20 border border-rose-500/30 rounded-xl text-rose-100 font-bold text-lg animate-in zoom-in" style={{animationDelay: `${i*100}ms`}}>
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <p className="mt-10 text-xl text-slate-400 font-bold animate-pulse">
        À vous de défendre votre camp. 🥊
      </p>
    </div>
  );
}

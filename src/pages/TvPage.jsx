import React, { useState, useEffect } from 'react';
import { useTournament } from '../store/TournamentContext';
import BracketView from '../components/BracketView';

export default function TvPage() {
  const { state } = useTournament();
  const [mode, setMode] = useState('live'); // 'live', 'bracket', 'matches'

  const getPlayerName = (id) => {
    if (!id) return "";
    const p = state.players.find(p => p.id === id);
    return p ? p.name.toUpperCase() : "";
  };

  // Primary: use currentLiveMatchId. Fallback: first 'live' status match. Fallback2: first non-finished match
  const liveMatch =
    state.matches.find(m => m.id === state.currentLiveMatchId && m.status !== 'finished') ||
    state.matches.find(m => m.status === 'live') ||
    state.matches.find(m => m.status !== 'finished') ||
    null;

  // Auto-switch mode based on tournament state
  useEffect(() => {
    const isFinished = state.matches.length > 0 && state.matches[state.matches.length - 1].status === 'finished';
    if (isFinished) {
      setMode('winner');
    }
  }, [state.matches]);

  if (!state.matches.length) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-slate-500 text-3xl font-bold animate-pulse">
          EN ATTENTE DU TIRAGE AU SORT...
        </div>
      </div>
    );
  }

  const championMatch = state.matches[state.matches.length - 1];
  const champion = championMatch.status === 'finished' ? getPlayerName(championMatch.winnerId) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col overflow-hidden font-sans">
      {/* HEADER */}
      <header className="bg-slate-900 border-b-4 border-emerald-500 px-12 py-6 flex justify-between items-center shadow-2xl">
        <div className="flex flex-col">
          <h1 className="text-5xl font-black tracking-tight">{state.tournamentName || 'BILLIARD TOURNAMENT'}</h1>
          <h2 className="text-2xl text-emerald-400 font-bold tracking-widest uppercase mt-2">DÉFI {state.format}</h2>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setMode('live')} className={`px-4 py-2 font-bold rounded-lg ${mode === 'live' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>Live</button>
          <button onClick={() => setMode('bracket')} className={`px-4 py-2 font-bold rounded-lg ${mode === 'bracket' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>Bracket</button>
          <button onClick={() => setMode('matches')} className={`px-4 py-2 font-bold rounded-lg ${mode === 'matches' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>Matches</button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative overflow-auto">
        {mode === 'winner' && champion && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-emerald-900 to-slate-950 z-50">
            <div className="text-8xl mb-8">🏆</div>
            <div className="text-4xl text-emerald-400 font-bold mb-4 tracking-widest">CHAMPION</div>
            <div className="text-9xl font-black bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl text-center">
              {champion}
            </div>
            <div className="text-3xl text-slate-400 mt-12">{state.tournamentName} 2026</div>
          </div>
        )}

        {mode === 'live' && liveMatch && (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <div className="flex justify-between w-full max-w-7xl items-center mb-16">
              <div className="text-4xl font-bold text-slate-400 bg-slate-900 px-8 py-4 rounded-2xl border border-slate-800">
                TABLE {liveMatch.table || 1}
              </div>
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                <div className="text-red-500 font-bold text-4xl tracking-widest">LIVE</div>
              </div>
            </div>

            <div className="w-full max-w-7xl grid grid-cols-5 gap-8 items-center bg-slate-900/50 p-16 rounded-[3rem] border border-slate-800 backdrop-blur-sm shadow-2xl">
              {/* PLAYER 1 */}
              <div className="col-span-2 flex flex-col items-center text-center">
                <div className="text-7xl font-black truncate w-full mb-8">
                  {getPlayerName(liveMatch.player1Id) || 'TBD'}
                </div>
                <div className="text-[12rem] leading-none font-black text-emerald-400 font-mono">
                  {liveMatch.score1}
                </div>
              </div>

              {/* VS */}
              <div className="col-span-1 flex flex-col items-center justify-center">
                <div className="text-6xl font-black text-slate-700 italic">VS</div>
                <div className="mt-12 text-2xl text-slate-400 font-bold">
                  FRAME {liveMatch.score1 + liveMatch.score2 + 1}
                </div>
                <div className="text-lg text-slate-500 mt-2">
                  Target: {state.framesToWin}
                </div>
              </div>

              {/* PLAYER 2 */}
              <div className="col-span-2 flex flex-col items-center text-center">
                <div className="text-7xl font-black truncate w-full mb-8">
                  {getPlayerName(liveMatch.player2Id) || 'TBD'}
                </div>
                <div className="text-[12rem] leading-none font-black text-blue-400 font-mono">
                  {liveMatch.score2}
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'live' && !liveMatch && (
           <div className="flex-1 flex flex-col items-center justify-center">
             <div className="text-5xl text-slate-600 font-bold">NO MATCH SELECTED</div>
           </div>
        )}

        {mode === 'bracket' && (
          <div className="flex-1 flex items-center justify-center scale-125 transform origin-center">
            <BracketView />
          </div>
        )}

        {mode === 'matches' && (
          <div className="flex-1 p-12">
            <div className="grid grid-cols-2 gap-8 max-w-7xl mx-auto">
              {state.matches.filter(m => m.status === 'live').map(m => (
                <div key={m.id} className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-8 flex flex-col shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-red-600 text-white font-bold px-4 py-1 rounded-bl-xl text-sm animate-pulse">LIVE</div>
                  <div className="text-2xl text-slate-400 font-bold mb-6">TABLE {m.table || '?'}</div>
                  <div className="flex justify-between items-center text-4xl font-black">
                    <span className="truncate flex-1">{getPlayerName(m.player1Id)}</span>
                    <span className="text-emerald-400 font-mono text-5xl ml-4">{m.score1}</span>
                  </div>
                  <div className="flex justify-between items-center text-4xl font-black mt-6 pt-6 border-t border-slate-800">
                    <span className="truncate flex-1">{getPlayerName(m.player2Id)}</span>
                    <span className="text-blue-400 font-mono text-5xl ml-4">{m.score2}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

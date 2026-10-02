import React from 'react';
import { useTournament } from '../store/TournamentContext';

export default function BracketView() {
  const { state } = useTournament();
  
  if (!state.matches || state.matches.length === 0) return null;

  // Group matches by round
  const maxRound = Math.max(...state.matches.map(m => m.round));
  const rounds = [];
  for (let r = 1; r <= maxRound; r++) {
    rounds.push(state.matches.filter(m => m.round === r));
  }

  const getPlayerName = (id) => {
    if (!id) return "";
    const p = state.players.find(p => p.id === id);
    return p ? p.name : "";
  };

  return (
    <div className="w-full overflow-x-auto p-8">
      <div className="flex justify-start items-center min-w-max gap-16">
        {rounds.map((roundMatches, rIdx) => (
          <div key={`round-${rIdx}`} className="flex flex-col gap-8 justify-around h-full">
            <div className="text-center font-bold text-slate-400 mb-4 uppercase tracking-widest text-xl">
              {rIdx + 1 === maxRound ? 'FINAL' : rIdx + 2 === maxRound ? 'SEMI-FINAL' : `ROUND ${rIdx + 1}`}
            </div>
            
            <div className="flex flex-col justify-around flex-1" style={{ gap: `${Math.pow(2, rIdx) * 2}rem` }}>
              {roundMatches.map(match => (
                <div key={match.id} className="relative flex items-center">
                  <div className={`w-64 bg-slate-800 rounded-lg overflow-hidden border-2 flex flex-col ${match.status === 'live' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'border-slate-700'}`}>
                    
                    {/* Player 1 */}
                    <div className={`flex justify-between p-3 border-b border-slate-700 ${match.winnerId === match.player1Id ? 'bg-emerald-900/40 text-emerald-400 font-bold' : ''}`}>
                      <span className="truncate pr-2">{getPlayerName(match.player1Id) || 'TBD'}</span>
                      <span className="font-mono font-bold">{match.score1}</span>
                    </div>
                    
                    {/* Player 2 */}
                    <div className={`flex justify-between p-3 ${match.winnerId === match.player2Id ? 'bg-emerald-900/40 text-emerald-400 font-bold' : ''}`}>
                      <span className="truncate pr-2">{getPlayerName(match.player2Id) || 'TBD'}</span>
                      <span className="font-mono font-bold">{match.score2}</span>
                    </div>
                  </div>
                  
                  {/* Connectors (simplified CSS visualization) */}
                  {rIdx < maxRound - 1 && (
                    <div className="absolute left-full w-8 h-[2px] bg-slate-600"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

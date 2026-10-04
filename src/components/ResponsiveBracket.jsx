import React, { useRef, useEffect, useState } from 'react';
import { useTournament } from '../store/TournamentContext';
import { getRoundName } from '../lib/tournament-utils';

export default function ResponsiveBracket() {
  const { state } = useTournament();
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  if (!state.matches || state.matches.length === 0) return null;

  const maxRound = Math.max(...state.matches.map(m => m.round));
  const rounds = [];
  for (let r = 1; r <= maxRound; r++) {
    rounds.push(state.matches.filter(m => m.round === r));
  }

  const getPlayerName = (id) => {
    if (!id) return '';
    const p = state.players.find(p => p.id === id);
    return p ? p.name : '';
  };

  const getTableName = (tableId) => {
    if (!tableId) return null;
    const t = (state.tables || []).find(t => t.id === tableId);
    return t ? t.name : null;
  };

  return (
    <div className="w-full h-full overflow-auto" ref={containerRef}>
      <div className="inline-flex gap-6 md:gap-10 p-4 md:p-8 min-w-max items-start">
        {rounds.map((roundMatches, rIdx) => {
          const roundLabel = getRoundName(rIdx + 1, maxRound);
          const matchCount = roundMatches.length;
          // Vertical gap between matches grows with each round
          const gapClass = rIdx === 0 ? 'gap-3' : rIdx === 1 ? 'gap-10' : rIdx === 2 ? 'gap-24' : 'gap-48';

          return (
            <div key={`round-${rIdx}`} className="flex flex-col items-center">
              {/* Round label */}
              <div className="text-center font-bold text-slate-400 mb-4 uppercase tracking-widest text-xs md:text-sm whitespace-nowrap">
                {roundLabel}
              </div>

              {/* Matches column */}
              <div className={`flex flex-col ${gapClass} justify-around flex-1`} style={{
                gap: `${Math.pow(2, rIdx) * 1.5}rem`,
                paddingTop: rIdx === 0 ? 0 : `${Math.pow(2, rIdx - 1) * 0.75}rem`,
              }}>
                {roundMatches.map(match => {
                  const isLive = match.status === 'live';
                  const tableName = getTableName(match.tableId);
                  const p1Won = match.winnerId === match.player1Id && match.winnerId;
                  const p2Won = match.winnerId === match.player2Id && match.winnerId;

                  return (
                    <div key={match.id} className="relative flex items-center">
                      <div className={`w-44 md:w-56 bg-slate-800 rounded-lg overflow-hidden border-2 flex flex-col shadow-lg ${
                        isLive ? 'border-red-500 shadow-red-900/40' : 'border-slate-700'
                      }`}>
                        {/* Player 1 */}
                        <div className={`flex justify-between items-center px-3 py-2 border-b border-slate-700 ${p1Won ? 'bg-emerald-900/40 text-emerald-400 font-bold' : 'text-slate-200'}`}>
                          <span className="text-sm truncate max-w-[7rem]">{getPlayerName(match.player1Id) || 'TBD'}</span>
                          <span className="font-mono font-bold text-sm ml-2">{match.score1 ?? 0}</span>
                        </div>
                        {/* Player 2 */}
                        <div className={`flex justify-between items-center px-3 py-2 ${p2Won ? 'bg-emerald-900/40 text-emerald-400 font-bold' : 'text-slate-200'}`}>
                          <span className="text-sm truncate max-w-[7rem]">{getPlayerName(match.player2Id) || 'TBD'}</span>
                          <span className="font-mono font-bold text-sm ml-2">{match.score2 ?? 0}</span>
                        </div>
                        {/* Table + Status footer */}
                        <div className={`flex justify-between items-center px-3 py-1 text-xs border-t border-slate-700/60 ${
                          isLive ? 'bg-red-950/40 text-red-400' : 'bg-slate-900/50 text-slate-500'
                        }`}>
                          <span>{tableName || 'No table'}</span>
                          <span className={`font-bold uppercase ${
                            isLive ? 'text-red-400' :
                            match.status === 'finished' ? 'text-slate-400' :
                            'text-blue-400'
                          }`}>
                            {isLive ? '● LIVE' : match.status === 'finished' ? 'Done' : 'Scheduled'}
                          </span>
                        </div>
                      </div>

                      {/* Connector line to next round */}
                      {rIdx < maxRound - 1 && (
                        <div className="absolute left-full w-6 md:w-10 h-[2px] bg-slate-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

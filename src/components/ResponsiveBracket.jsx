import React from 'react';
import { useTournament } from '../store/TournamentContext';
import { getRoundName } from '../lib/tournament-utils';

export default function ResponsiveBracket() {
  const { state } = useTournament();

  if (!state.matches || state.matches.length === 0) return null;

  const maxRound = Math.max(...state.matches.map(m => m.round));
  const rounds = [];
  for (let r = 1; r <= maxRound; r++) {
    rounds.push(state.matches.filter(m => m.round === r).sort((a, b) => a.matchIndex - b.matchIndex));
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
    <div className="w-full h-full overflow-auto bg-slate-950 p-8 flex items-center">
      <div className="flex h-full min-w-max items-stretch gap-16">
        {rounds.map((roundMatches, rIdx) => {
          const roundLabel = getRoundName(rIdx + 1, maxRound);

          return (
            <div key={`round-${rIdx}`} className="flex flex-col items-center w-64 relative">
              {/* Round label */}
              <div className="absolute -top-12 text-center font-bold text-slate-400 uppercase tracking-widest text-sm">
                {roundLabel}
              </div>

              {/* Matches column */}
              <div className="flex flex-col justify-around flex-1 w-full h-full">
                {roundMatches.map((match, mIdx) => {
                  const isLive = match.status === 'live';
                  const tableName = getTableName(match.tableId);
                  const p1Won = match.winnerId === match.player1Id && match.winnerId;
                  const p2Won = match.winnerId === match.player2Id && match.winnerId;
                  const isEven = mIdx % 2 === 0;

                  return (
                    <div key={match.id} className="relative flex items-center justify-center w-full">
                      <div className={`w-full bg-slate-900 rounded-xl overflow-hidden border-2 flex flex-col shadow-2xl z-10 transition-transform ${
                        isLive ? 'border-red-500 scale-105 shadow-red-900/40' : 'border-slate-700'
                      }`}>
                        {/* Player 1 */}
                        <div className={`flex justify-between items-center px-4 py-3 border-b border-slate-700 ${p1Won ? 'bg-emerald-900/60 text-emerald-400 font-bold' : 'text-slate-100'}`}>
                          <span className="text-lg font-bold truncate text-center flex-1">{getPlayerName(match.player1Id) || 'TBD'}</span>
                          <span className="font-mono font-black text-xl ml-3 bg-slate-950/50 px-2 py-1 rounded">{match.score1 ?? 0}</span>
                        </div>
                        {/* Player 2 */}
                        <div className={`flex justify-between items-center px-4 py-3 ${p2Won ? 'bg-emerald-900/60 text-emerald-400 font-bold' : 'text-slate-100'}`}>
                          <span className="text-lg font-bold truncate text-center flex-1">{getPlayerName(match.player2Id) || 'TBD'}</span>
                          <span className="font-mono font-black text-xl ml-3 bg-slate-950/50 px-2 py-1 rounded">{match.score2 ?? 0}</span>
                        </div>
                        {/* Table + Status footer */}
                        <div className={`flex justify-between items-center px-4 py-2 text-xs font-bold tracking-wider border-t border-slate-800 ${
                          isLive ? 'bg-red-950 text-red-400' : 'bg-slate-950 text-slate-500'
                        }`}>
                          <span>{tableName || 'NO TABLE'}</span>
                          <span className={isLive ? 'text-red-400 animate-pulse' : match.status === 'finished' ? 'text-slate-600' : 'text-blue-500'}>
                            {isLive ? 'LIVE' : match.status === 'finished' ? 'FINISHED' : 'SCHEDULED'}
                          </span>
                        </div>
                      </div>

                      {/* Tree Branch Connectors */}
                      {rIdx < maxRound - 1 && (
                        <>
                          {/* Horizontal line going right */}
                          <div className="absolute left-full w-8 h-[3px] bg-slate-600 z-0"></div>
                          
                          {/* Vertical line connecting pairs */}
                          <div 
                            className={`absolute left-[calc(100%+2rem)] w-[3px] bg-slate-600 z-0`}
                            style={{
                              height: '50vh', // This is a css trick, it won't be exact without JS measuring, but flex box makes it close. Let's use CSS pseudo-elements instead of absolute divs for better scaling.
                              maxHeight: '100%',
                              top: isEven ? '50%' : 'auto',
                              bottom: !isEven ? '50%' : 'auto',
                            }}
                          ></div>
                        </>
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

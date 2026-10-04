import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTournament } from '../store/TournamentContext';
import ResponsiveBracket from '../components/ResponsiveBracket';

export default function TvPage() {
  const { tableId } = useParams();
  const { state } = useTournament();
  const [mode, setMode] = useState('live');

  const getPlayerName = (id) => {
    if (!id) return "";
    const p = state.players.find(p => p.id === id);
    return p ? p.name.toUpperCase() : "";
  };

  const getTableName = (tableId) => {
    if (!tableId) return null;
    const t = (state.tables || []).find(t => t.id === tableId);
    return t ? t.name.toUpperCase() : null;
  };

  // Primary: currentLiveMatchId (non-finished). Fallback: first live. Fallback2: first non-finished.
  let liveMatch = null;
  if (tableId) {
    liveMatch = state.matches.find(m => m.tableId === tableId && m.status === 'live') ||
                state.matches.find(m => m.tableId === tableId && m.status !== 'finished');
  } else {
    liveMatch =
      state.matches.find(m => m.id === state.currentLiveMatchId && m.status !== 'finished') ||
      state.matches.find(m => m.status === 'live') ||
      state.matches.find(m => m.status !== 'finished') ||
      null;
  }

  const allLiveMatches = state.matches.filter(m => m.status === 'live');

  // Auto-switch to winner screen when final is done (only on main TV)
  useEffect(() => {
    if (state.matches.length > 0 && !tableId) {
      const finalMatch = state.matches[state.matches.length - 1];
      if (finalMatch.status === 'finished') setMode('winner');
    }
  }, [state.matches, tableId]);

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
      <header className="bg-slate-900 border-b-4 border-emerald-500 px-6 md:px-12 py-4 md:py-6 flex justify-between items-center shadow-2xl flex-shrink-0">
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-5xl font-black tracking-tight">{state.tournamentName || 'BILLIARD TOURNAMENT'}</h1>
          <h2 className="text-base md:text-2xl text-emerald-400 font-bold tracking-widest uppercase mt-1">DÉFI {state.format}</h2>
        </div>
        <div className="flex gap-2 md:gap-4 items-center">
          <button 
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => console.log(err));
              } else {
                document.exitFullscreen().catch(err => console.log(err));
              }
            }}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition mr-2"
            title="Toggle Fullscreen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
          </button>
          {!tableId && (
            <>
              <button onClick={() => setMode('live')} className={`px-3 py-2 text-sm font-bold rounded-lg transition ${mode === 'live' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Live</button>
              <button onClick={() => setMode('matches')} className={`px-3 py-2 text-sm font-bold rounded-lg transition ${mode === 'matches' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Tables</button>
              <button onClick={() => setMode('bracket')} className={`px-3 py-2 text-sm font-bold rounded-lg transition ${mode === 'bracket' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Bracket</button>
            </>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative overflow-auto min-h-0">

        {/* WINNER MODE */}
        {mode === 'winner' && champion && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-emerald-900 to-slate-950 z-50 p-8">
            <div className="text-6xl md:text-8xl mb-6 md:mb-8">🏆</div>
            <div className="text-3xl md:text-4xl text-emerald-400 font-bold mb-4 tracking-widest">CHAMPION</div>
            <div className="text-6xl md:text-9xl font-black bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl text-center break-words max-w-full px-4">
              {champion}
            </div>
            <div className="text-2xl md:text-3xl text-slate-400 mt-8 md:mt-12 text-center">{state.tournamentName} 2026</div>
          </div>
        )}

        {/* LIVE MODE — single main match */}
        {mode === 'live' && liveMatch && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-12">
            <div className="flex flex-wrap justify-between w-full max-w-7xl items-center gap-4 mb-8 md:mb-16">
              <div className="text-xl md:text-4xl font-bold text-slate-400 bg-slate-900 px-4 md:px-8 py-2 md:py-4 rounded-2xl border border-slate-800">
                {getTableName(liveMatch.tableId) || 'TABLE ?'}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full animate-ping"></div>
                <div className="text-red-500 font-bold text-2xl md:text-4xl tracking-widest">LIVE</div>
              </div>
            </div>

            <div className="w-full max-w-7xl grid grid-cols-5 gap-4 md:gap-8 items-center bg-slate-900/50 px-6 py-10 md:p-16 rounded-[2rem] md:rounded-[3rem] border border-slate-800 backdrop-blur-sm shadow-2xl">
              {/* PLAYER 1 */}
              <div className="col-span-2 flex flex-col items-center text-center">
                <div className="text-3xl md:text-7xl font-black w-full mb-4 md:mb-8 break-words leading-tight">
                  {getPlayerName(liveMatch.player1Id) || 'TBD'}
                </div>
                <div className="text-7xl md:text-[10rem] leading-none font-black text-emerald-400 font-mono">
                  {liveMatch.score1}
                </div>
              </div>

              {/* VS */}
              <div className="col-span-1 flex flex-col items-center justify-center">
                <div className="text-3xl md:text-6xl font-black text-slate-700 italic">VS</div>
                <div className="mt-4 md:mt-12 text-sm md:text-2xl text-slate-400 font-bold text-center">
                  FRAME {liveMatch.score1 + liveMatch.score2 + 1}
                </div>
                <div className="text-xs md:text-lg text-slate-500 mt-1">
                  Target: {state.framesToWin}
                </div>
              </div>

              {/* PLAYER 2 */}
              <div className="col-span-2 flex flex-col items-center text-center">
                <div className="text-3xl md:text-7xl font-black w-full mb-4 md:mb-8 break-words leading-tight">
                  {getPlayerName(liveMatch.player2Id) || 'TBD'}
                </div>
                <div className="text-7xl md:text-[10rem] leading-none font-black text-blue-400 font-mono">
                  {liveMatch.score2}
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'live' && !liveMatch && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-4xl text-slate-600 font-bold">
              {tableId ? 'NO MATCH ASSIGNED TO THIS TABLE' : 'NO MATCH SELECTED'}
            </div>
          </div>
        )}

        {/* TABLES MODE — all live matches in responsive grid */}
        {mode === 'matches' && (
          <div className="flex-1 p-4 md:p-10">
            {allLiveMatches.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-600 text-2xl font-bold">
                No live matches right now
              </div>
            ) : (
              <div className="grid gap-4 md:gap-6 h-full" style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))'
              }}>
                {allLiveMatches.map(m => (
                  <div key={m.id} className="bg-slate-900 border-2 border-red-800/60 rounded-2xl md:rounded-3xl p-4 md:p-8 flex flex-col shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-red-600 text-white font-bold px-3 py-1 rounded-bl-xl text-xs animate-pulse">LIVE</div>
                    <div className="text-lg md:text-2xl text-purple-300 font-bold mb-2">
                      {getTableName(m.tableId) || 'TABLE ?'}
                    </div>
                    <div className="flex justify-between items-center text-2xl md:text-4xl font-black mt-2">
                      <span className="truncate flex-1 text-slate-100">{getPlayerName(m.player1Id)}</span>
                      <span className="text-emerald-400 font-mono text-3xl md:text-5xl ml-4">{m.score1}</span>
                    </div>
                    <div className="flex justify-between items-center text-2xl md:text-4xl font-black mt-4 pt-4 border-t border-slate-800">
                      <span className="truncate flex-1 text-slate-100">{getPlayerName(m.player2Id)}</span>
                      <span className="text-blue-400 font-mono text-3xl md:text-5xl ml-4">{m.score2}</span>
                    </div>
                    <div className="mt-4 text-sm text-slate-500">
                      Frame {m.score1 + m.score2 + 1} / Target: {state.framesToWin}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BRACKET MODE */}
        {mode === 'bracket' && (
          <div className="flex-1 min-h-0 overflow-auto">
            <ResponsiveBracket />
          </div>
        )}
      </main>
    </div>
  );
}

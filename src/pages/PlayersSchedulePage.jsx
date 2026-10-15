import React, { useState } from 'react';
import { useTournament } from '../store/TournamentContext';
import ResponsiveBracket from '../components/ResponsiveBracket';
import { Clock, ShieldCheck, Trophy, Tv, Users, Shuffle, Eye, Calendar } from 'lucide-react';

export default function PlayersSchedulePage() {
  const { state } = useTournament();
  const [activeTab, setActiveTab] = useState('matches'); // 'matches' | 'bracket' | 'players'
  const [filterQuery, setFilterQuery] = useState('');

  const getPlayerName = (id) => {
    if (!id) return "TBD";
    const p = (state.players || []).find(p => p.id === id);
    return p ? p.name : "TBD";
  };

  const getTableName = (tableId) => {
    if (!tableId) return null;
    const t = (state.tables || []).find(t => t.id === tableId);
    return t ? t.name : null;
  };

  const getRefereeName = (refId) => {
    if (!refId) return null;
    const r = (state.referees || []).find(ref => ref.id === refId);
    return r ? r.name : null;
  };

  const filteredMatches = (state.matches || []).filter(m => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    const p1 = getPlayerName(m.player1Id).toLowerCase();
    const p2 = getPlayerName(m.player2Id).toLowerCase();
    const tbl = (getTableName(m.tableId) || '').toLowerCase();
    return p1.includes(q) || p2.includes(q) || tbl.includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* HEADER HERO */}
      <header className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 p-6 md:p-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full inline-block mb-2">
              🏆 Public Player Schedule & Live Results
            </span>
            <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              {state.tournamentName || "Billiard Tournament"}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm text-slate-300">
              {state.tournamentTime && (
                <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700 font-semibold text-emerald-300">
                  <Clock size={16} className="text-emerald-400" />
                  <span>Start Time: {state.tournamentTime}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
                <Trophy size={16} className="text-yellow-400" />
                <span>Format: {state.format} (Target: {state.framesToWin})</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
                <Users size={16} className="text-blue-400" />
                <span>{state.players.length} Players</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/tv"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl transition shadow-lg text-sm"
            >
              <Tv size={18} /> Open TV Screen
            </a>
          </div>
        </div>
      </header>

      {/* TABS NAVIGATION */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
                activeTab === 'matches'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Calendar size={16} /> Matches & Tables ({state.matches.length})
            </button>
            <button
              onClick={() => setActiveTab('bracket')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
                activeTab === 'bracket'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Shuffle size={16} /> Bracket Tree
            </button>
            <button
              onClick={() => setActiveTab('players')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
                activeTab === 'players'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Users size={16} /> Players ({state.players.length})
            </button>
          </div>

          {activeTab === 'matches' && (
            <input
              type="text"
              placeholder="Search your name or table..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full sm:w-64"
            />
          )}
        </div>
      </div>

      {/* CONTENT AREA */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        {state.matches.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center my-8">
            <div className="text-5xl mb-4">🎱</div>
            <h2 className="text-2xl font-bold text-white mb-2">Draw Pending</h2>
            <p className="text-slate-400 max-w-md mx-auto">
              The tournament administrator hasn't completed the draw yet. 
              {state.tournamentTime && ` Matches will start around ${state.tournamentTime}.`} Keep this link open to see who you will play!
            </p>
          </div>
        ) : (
          <>
            {/* MATCHES VIEW */}
            {activeTab === 'matches' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMatches.map(m => {
                  const tableName = getTableName(m.tableId);
                  const tableObj = (state.tables || []).find(t => t.id === m.tableId);
                  const refName = tableObj ? getRefereeName(tableObj.refereeId) : null;
                  const isLive = m.status === 'live';
                  const isFinished = m.status === 'finished';

                  return (
                    <div
                      key={m.id}
                      className={`bg-slate-900 rounded-2xl border p-5 flex flex-col justify-between shadow-lg relative overflow-hidden transition ${
                        isLive
                          ? 'border-red-500/80 shadow-red-950/40 ring-1 ring-red-500/50'
                          : isFinished
                          ? 'border-slate-800 opacity-80'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Top badge */}
                      <div className="flex justify-between items-center mb-3 text-xs">
                        <span className="font-mono text-slate-500 font-bold">ROUND {m.round}</span>
                        <div className="flex items-center gap-1.5">
                          {isLive && (
                            <span className="bg-red-600 text-white font-black px-2 py-0.5 rounded text-[10px] animate-pulse">
                              LIVE
                            </span>
                          )}
                          {isFinished && (
                            <span className="bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded text-[10px]">
                              FINISHED
                            </span>
                          )}
                          {!isLive && !isFinished && (
                            <span className="bg-blue-950 text-blue-400 border border-blue-800/40 font-semibold px-2 py-0.5 rounded text-[10px]">
                              SCHEDULED
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Players & Scores */}
                      <div className="space-y-2.5 my-2">
                        {/* Player 1 */}
                        <div
                          className={`flex justify-between items-center p-3 rounded-xl ${
                            m.winnerId === m.player1Id
                              ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-black'
                              : 'bg-slate-950/60 text-slate-200 font-semibold'
                          }`}
                        >
                          <span className="truncate pr-2 text-base">{getPlayerName(m.player1Id)}</span>
                          <span className="font-mono text-xl">{m.score1}</span>
                        </div>

                        {/* Player 2 */}
                        <div
                          className={`flex justify-between items-center p-3 rounded-xl ${
                            m.winnerId === m.player2Id
                              ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-black'
                              : 'bg-slate-950/60 text-slate-200 font-semibold'
                          }`}
                        >
                          <span className="truncate pr-2 text-base">{getPlayerName(m.player2Id)}</span>
                          <span className="font-mono text-xl">{m.score2}</span>
                        </div>
                      </div>

                      {/* Footer: Table & Referee info */}
                      <div className="pt-3 border-t border-slate-800/80 mt-2 flex flex-wrap justify-between items-center gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          {tableName ? (
                            <span className="font-bold text-purple-300 bg-purple-950/80 border border-purple-800/50 px-2 py-0.5 rounded">
                              🎱 {tableName}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">Table TBD</span>
                          )}
                        </div>

                        {refName && (
                          <div className="flex items-center gap-1 text-amber-300 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded font-medium">
                            <ShieldCheck size={12} /> Ref: {refName}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* BRACKET VIEW */}
            {activeTab === 'bracket' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 overflow-hidden shadow-2xl h-[700px]">
                <ResponsiveBracket />
              </div>
            )}

            {/* PLAYERS LIST VIEW */}
            {activeTab === 'players' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {state.players.map((p, idx) => (
                  <div key={p.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-white truncate">{p.name}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

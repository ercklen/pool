import React, { useState } from 'react';
import { useTournament } from '../store/TournamentContext';
import { generateDraw } from '../lib/tournament-utils';
import { Users, LayoutList, Settings2, PlayCircle, Trophy } from 'lucide-react';

export default function AdminPage() {
  const { state, setTournamentState, updateMatch, setLiveMatch } = useTournament();
  const [newPlayerName, setNewPlayerName] = useState('');
  
  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    
    const newPlayer = {
      id: `p-${Date.now()}`,
      name: newPlayerName.trim()
    };
    
    setTournamentState({
      ...state,
      players: [...state.players, newPlayer]
    });
    setNewPlayerName('');
  };

  const handleRemovePlayer = (id) => {
    setTournamentState({
      ...state,
      players: state.players.filter(p => p.id !== id)
    });
  };

  const handleDraw = () => {
    if (state.players.length < 2) {
      alert("Need at least 2 players!");
      return;
    }
    const matches = generateDraw(state.players, state.format, state.framesToWin);
    setTournamentState({
      ...state,
      matches,
      currentLiveMatchId: matches.length > 0 ? matches[0].id : null
    });
  };

  const resetTournament = () => {
    if (confirm("Are you sure? This will delete all matches and players.")) {
      setTournamentState({
        tournamentName: "",
        format: "A3",
        framesToWin: 3,
        players: [],
        matches: [],
        currentLiveMatchId: null
      });
    }
  };

  const getPlayerName = (id) => {
    if (!id) return "TBD";
    const p = state.players.find(p => p.id === id);
    return p ? p.name : "Unknown";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-slate-900 p-6 rounded-xl border border-slate-800">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Billiard Tournament Admin
            </h1>
            <p className="text-slate-400 mt-1">Configure and manage your tournament</p>
          </div>
          <div className="flex gap-4">
            <a href="/tv" target="_blank" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition">
              <PlayCircle size={20} /> TV Screen
            </a>
            <a href="/remote" target="_blank" className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold transition">
              <LayoutList size={20} /> Remote Control
            </a>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CONFIGURATION PANEL */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-6">
            <div className="flex items-center gap-2 text-xl font-semibold border-b border-slate-800 pb-2">
              <Settings2 className="text-emerald-400" />
              <h2>Setup</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tournament Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:border-emerald-500 focus:outline-none"
                  value={state.tournamentName}
                  onChange={e => setTournamentState({ ...state, tournamentName: e.target.value })}
                  placeholder="e.g. Master Cup 2026"
                />
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-slate-400 mb-1">Format</label>
                  <select 
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:border-emerald-500 focus:outline-none"
                    value={state.format}
                    onChange={e => {
                      const val = e.target.value;
                      let frames = state.framesToWin;
                      if (val.startsWith('A')) {
                        frames = parseInt(val.replace('A', ''));
                      }
                      setTournamentState({ ...state, format: val, framesToWin: frames });
                    }}
                  >
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="A3">A3</option>
                    <option value="A4">A4</option>
                    <option value="A5">A5</option>
                  </select>
                </div>
                <div className="w-1/3">
                  <label className="block text-sm text-slate-400 mb-1">Target</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:border-emerald-500 focus:outline-none"
                    value={state.framesToWin}
                    onChange={e => setTournamentState({ ...state, framesToWin: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PLAYERS PANEL */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-6 lg:col-span-2">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xl font-semibold">
                <Users className="text-blue-400" />
                <h2>Players ({state.players.length})</h2>
              </div>
              {state.matches.length === 0 && (
                <button 
                  onClick={handleDraw}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-2 px-6 rounded-lg shadow-lg transform transition hover:-translate-y-0.5"
                >
                  🎲 EFFECTUER LE TIRAGE AU SORT
                </button>
              )}
            </div>

            {state.matches.length === 0 ? (
              <>
                <form onSubmit={handleAddPlayer} className="flex gap-2">
                  <input 
                    type="text"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter player name..."
                    value={newPlayerName}
                    onChange={e => setNewPlayerName(e.target.value)}
                  />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-6 rounded-lg font-semibold transition">
                    Add
                  </button>
                </form>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-2">
                  {state.players.map(p => (
                    <div key={p.id} className="flex justify-between items-center bg-slate-800 px-3 py-2 rounded-lg">
                      <span className="font-medium truncate">{p.name}</span>
                      <button onClick={() => handleRemovePlayer(p.id)} className="text-red-400 hover:text-red-300">
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
                  <Trophy size={32} />
                </div>
                <h3 className="text-2xl font-bold">Draw Completed</h3>
                <p className="text-slate-400 mt-2">The tournament is underway. Use the remote to control matches.</p>
                <button 
                  onClick={resetTournament}
                  className="mt-6 text-red-400 hover:text-red-300 underline underline-offset-4 text-sm"
                >
                  Reset Tournament
                </button>
              </div>
            )}
          </div>

        </div>

        {/* MATCHES TABLE */}
        {state.matches.length > 0 && (
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-6">
            <h2 className="text-xl font-semibold border-b border-slate-800 pb-2">Matches Overview</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-sm">
                    <th className="py-3 px-4">Match ID</th>
                    <th className="py-3 px-4">Round</th>
                    <th className="py-3 px-4">Player 1</th>
                    <th className="py-3 px-4">Player 2</th>
                    <th className="py-3 px-4 text-center">Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {state.matches.map(m => (
                    <tr key={m.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">{m.id}</td>
                      <td className="py-3 px-4 text-sm">R{m.round}</td>
                      <td className={`py-3 px-4 ${m.winnerId === m.player1Id ? 'text-emerald-400 font-bold' : ''}`}>
                        {getPlayerName(m.player1Id)}
                      </td>
                      <td className={`py-3 px-4 ${m.winnerId === m.player2Id ? 'text-emerald-400 font-bold' : ''}`}>
                        {getPlayerName(m.player2Id)}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-lg">
                        {m.score1} - {m.score2}
                      </td>
                      <td className="py-3 px-4">
                        {m.status === 'finished' ? (
                          <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs">Finished</span>
                        ) : m.status === 'live' ? (
                          <span className="px-2 py-1 bg-red-900/50 text-red-400 border border-red-800/50 rounded text-xs animate-pulse">LIVE</span>
                        ) : (
                          <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs">Scheduled</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button 
                          onClick={() => setLiveMatch(m.id)}
                          className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded transition"
                        >
                          Set Live TV
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

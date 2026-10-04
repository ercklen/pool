import React, { useState } from 'react';
import { useTournament } from '../store/TournamentContext';
import { PlusCircle, Trash2, Monitor } from 'lucide-react';

export default function TableManagement() {
  const { state, addTable, removeTable } = useTournament();
  const tables = state.tables || [];

  const getTableStatus = (tableId) => {
    const match = state.matches.find(m => m.tableId === tableId);
    if (!match) return { status: 'available', match: null };
    if (match.status === 'finished') return { status: 'finished', match };
    if (match.status === 'live') return { status: 'live', match };
    return { status: 'assigned', match };
  };

  const getPlayerName = (id) => {
    if (!id) return 'TBD';
    const p = state.players.find(p => p.id === id);
    return p ? p.name : 'Unknown';
  };

  const handleRemoveTable = (table) => {
    const { match } = getTableStatus(table.id);
    if (match && match.status !== 'finished') {
      alert(
        `TABLE "${table.name}" IS CURRENTLY ASSIGNED\n\n` +
        `${getPlayerName(match.player1Id)} vs ${getPlayerName(match.player2Id)}\n\n` +
        `Please remove the match assignment first before deleting this table.`
      );
      return;
    }
    if (confirm(`Remove "${table.name}"? This cannot be undone.`)) {
      removeTable(table.id);
    }
  };

  const statusConfig = {
    available: { label: '🟢 AVAILABLE', cls: 'text-emerald-400 bg-emerald-900/20 border-emerald-800/50' },
    assigned:  { label: '🔵 ASSIGNED',  cls: 'text-blue-400 bg-blue-900/20 border-blue-800/50' },
    live:      { label: '🔴 LIVE',      cls: 'text-red-400 bg-red-900/20 border-red-800/50 animate-pulse' },
    finished:  { label: '⚫ FINISHED',  cls: 'text-slate-400 bg-slate-800/50 border-slate-700/50' },
  };

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <Monitor className="text-purple-400" />
          <h2>Table Management <span className="text-slate-500 text-base font-normal">({tables.length} tables)</span></h2>
        </div>
        <button
          onClick={addTable}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg font-semibold text-sm transition"
        >
          <PlusCircle size={16} /> ADD TABLE
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tables.map(table => {
          const { status, match } = getTableStatus(table.id);
          const cfg = statusConfig[status];
          return (
            <div key={table.id} className={`rounded-xl border p-4 flex flex-col gap-2 ${cfg.cls}`}>
              <div className="flex justify-between items-start">
                <span className="font-bold text-lg text-white">{table.name}</span>
                <button
                  onClick={() => handleRemoveTable(table)}
                  className="text-slate-500 hover:text-red-400 transition"
                  title="Remove table"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <span className="text-sm font-bold">{cfg.label}</span>
              {match && match.status !== 'finished' && (
                <div className="text-xs text-slate-300 mt-1 truncate">
                  {getPlayerName(match.player1Id)} vs {getPlayerName(match.player2Id)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { useTournament } from '../store/TournamentContext';
import { X } from 'lucide-react';

export default function TableSelector({ match, onClose }) {
  const { state, assignTable } = useTournament();
  const tables = state.tables || [];

  const getPlayerName = (id) => {
    if (!id) return 'TBD';
    const p = state.players.find(p => p.id === id);
    return p ? p.name : 'Unknown';
  };

  const getTableOccupant = (tableId) => {
    return state.matches.find(
      m => m.tableId === tableId && m.status !== 'finished' && m.id !== match.id
    );
  };

  const handleSelect = (tableId) => {
    const occupant = getTableOccupant(tableId);
    if (occupant) {
      const ok = confirm(
        `"${tables.find(t => t.id === tableId)?.name}" IS ALREADY ASSIGNED\n\n` +
        `${getPlayerName(occupant.player1Id)} vs ${getPlayerName(occupant.player2Id)}\n\n` +
        `Do you want to replace this assignment?`
      );
      if (!ok) return;
    }
    assignTable(match.id, tableId);
    onClose();
  };

  const handleRemove = () => {
    assignTable(match.id, null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">ASSIGN TABLE</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <div className="text-center py-3 mb-5 bg-slate-800 rounded-xl">
          <div className="font-bold text-emerald-400 text-base">{getPlayerName(match.player1Id)}</div>
          <div className="text-slate-500 text-xs my-1">VS</div>
          <div className="font-bold text-blue-400 text-base">{getPlayerName(match.player2Id)}</div>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {tables.map(table => {
            const occupant = getTableOccupant(table.id);
            const isCurrentlyAssigned = match.tableId === table.id;
            return (
              <button
                key={table.id}
                onClick={() => handleSelect(table.id)}
                className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition flex justify-between items-center ${
                  isCurrentlyAssigned
                    ? 'bg-purple-700 text-white border border-purple-500'
                    : occupant
                    ? 'bg-red-900/30 text-red-300 border border-red-800/50 hover:bg-red-900/50'
                    : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <span>{table.name}</span>
                <span className="text-xs font-normal opacity-80">
                  {isCurrentlyAssigned ? '✓ Current' : occupant ? `🔴 Busy: ${getPlayerName(occupant.player1Id)} vs ${getPlayerName(occupant.player2Id)}` : '🟢 Available'}
                </span>
              </button>
            );
          })}
        </div>

        {match.tableId && (
          <button
            onClick={handleRemove}
            className="mt-4 w-full py-2 text-sm text-red-400 border border-red-900 rounded-xl hover:bg-red-900/20 transition"
          >
            Remove Assignment
          </button>
        )}
      </div>
    </div>
  );
}

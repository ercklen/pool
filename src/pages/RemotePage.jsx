import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTournament } from '../store/TournamentContext';
import { advanceWinner } from '../lib/tournament-utils';
import { Tv, Undo2, RotateCcw, Save } from 'lucide-react';

export default function RemotePage() {
  const { tableId } = useParams();
  const { state, setTournamentState, updateMatch, setLiveMatch } = useTournament();
  const [selectedMatchId, setSelectedMatchId] = useState(null);

  const activeMatches = state.matches.filter(m => m.status !== 'finished');

  const handleSelectMatch = (matchId) => {
    setSelectedMatchId(matchId);
    // Set this match as the live TV match
    setLiveMatch(matchId);
    // Mark as live if scheduled
    const match = state.matches.find(m => m.id === matchId);
    if (match && match.status === 'scheduled') {
      updateMatch({ id: matchId, status: 'live' });
    }
  };

  // Auto-select match logic
  useEffect(() => {
    if (tableId) {
      // If table-specific remote, find the live match assigned to this table
      const assignedMatch = state.matches.find(m => m.tableId === tableId && m.status !== 'finished');
      if (assignedMatch && assignedMatch.id !== selectedMatchId) {
        setSelectedMatchId(assignedMatch.id);
      } else if (!assignedMatch && selectedMatchId) {
        setSelectedMatchId(null); // Clear if no match is assigned anymore
      }
    } else {
      // General remote: auto-select the current live TV match if not already selected
      if (state.currentLiveMatchId && !selectedMatchId) {
        setSelectedMatchId(state.currentLiveMatchId);
      }
    }
  }, [state.currentLiveMatchId, state.matches, tableId, selectedMatchId]);

  const getPlayerName = (id) => {
    if (!id) return "TBD";
    const p = state.players.find(p => p.id === id);
    return p ? p.name : "Unknown";
  const getTableName = (id) => {
    if (!id) return "?";
    const t = (state.tables || []).find(t => t.id === id);
    return t ? t.name : "?";
  };

  const currentMatch = state.matches.find(m => m.id === selectedMatchId);

  const addFrame = (playerNum) => {
    if (!currentMatch) return;

    const isPlayer1 = playerNum === 1;
    let newScore1 = currentMatch.score1;
    let newScore2 = currentMatch.score2;

    if (isPlayer1) newScore1++; else newScore2++;

    const newFrames = [...currentMatch.frames, {
      frameNumber: currentMatch.frames.length + 1,
      winnerId: isPlayer1 ? currentMatch.player1Id : currentMatch.player2Id,
      timestamp: Date.now()
    }];

    const updatedMatch = {
      ...currentMatch,
      score1: newScore1,
      score2: newScore2,
      frames: newFrames
    };

    // Check win condition
    if (newScore1 >= state.framesToWin || newScore2 >= state.framesToWin) {
      updatedMatch.status = 'finished';
      updatedMatch.winnerId = newScore1 >= state.framesToWin ? currentMatch.player1Id : currentMatch.player2Id;

      // Advance winner in bracket
      const updatedMatchList = state.matches.map(m => m.id === updatedMatch.id ? updatedMatch : m);
      const matchesAfterAdvancement = advanceWinner(updatedMatchList, updatedMatch.id, updatedMatch.winnerId);

      // Find next available match to auto-switch to
      // Priority: next scheduled/live match in same round, then any non-finished match
      const nextMatch =
        matchesAfterAdvancement.find(m => m.status !== 'finished' && m.player1Id && m.player2Id && m.id !== updatedMatch.id) ||
        matchesAfterAdvancement.find(m => m.status !== 'finished' && m.id !== updatedMatch.id) ||
        null;

      const nextLiveMatchId = nextMatch ? nextMatch.id : null;

      setTournamentState({
        ...state,
        matches: matchesAfterAdvancement,
        currentLiveMatchId: nextLiveMatchId
      });

      // Auto-switch Remote to next match too
      if (nextMatch) {
        setSelectedMatchId(nextMatch.id);
        if (nextMatch.status === 'scheduled') {
          // Will be marked live via updateMatch below, but since we wrote full state above,
          // just mark it live in that same write
        }
      } else {
        setSelectedMatchId(null);
      }

      return;
    }

    updateMatch(updatedMatch);
  };

  const removeFrame = (playerNum) => {
    if (!currentMatch) return;
    
    const isPlayer1 = playerNum === 1;
    if (isPlayer1 && currentMatch.score1 === 0) return;
    if (!isPlayer1 && currentMatch.score2 === 0) return;

    let newScore1 = currentMatch.score1;
    let newScore2 = currentMatch.score2;
    
    if (isPlayer1) newScore1--; else newScore2--;
    
    // Naively pop last frame
    const newFrames = [...currentMatch.frames];
    newFrames.pop();

    updateMatch({
      id: currentMatch.id,
      score1: newScore1,
      score2: newScore2,
      frames: newFrames
    });
  };

  const undoLastAction = () => {
    if (!currentMatch || currentMatch.frames.length === 0) return;
    const lastFrame = currentMatch.frames[currentMatch.frames.length - 1];
    
    const isPlayer1 = lastFrame.winnerId === currentMatch.player1Id;
    removeFrame(isPlayer1 ? 1 : 2);
  };

  const resetMatch = () => {
    if (confirm("Reset this match completely?")) {
      updateMatch({
        id: currentMatch.id,
        score1: 0,
        score2: 0,
        frames: [],
        status: 'live',
        winnerId: null
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden touch-manipulation">
      <header className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center">
        <h1 className="text-xl font-bold text-emerald-400">
          {tableId ? `${getTableName(tableId)} Remote` : 'Master Remote'}
        </h1>
      </header>

      <main className="p-4 max-w-md mx-auto flex flex-col h-[calc(100vh-4rem)]">
        
        {!tableId && (
          <div className="mb-6">
            <label className="block text-sm text-slate-400 mb-2 uppercase font-bold">Select Match</label>
            <select 
              className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-4 text-lg font-bold focus:border-emerald-500 focus:outline-none appearance-none"
              value={selectedMatchId || ''}
              onChange={e => handleSelectMatch(e.target.value)}
            >
              <option value="" disabled>-- Select a match --</option>
              {activeMatches.map(m => (
                <option key={m.id} value={m.id}>
                  {getTableName(m.tableId)} : {getPlayerName(m.player1Id)} vs {getPlayerName(m.player2Id)}
                </option>
              ))}
            </select>
          </div>
        )}

        {currentMatch ? (
          <div className="flex-1 flex flex-col justify-between">
            {currentMatch.status === 'finished' && (
              <div className="bg-emerald-900/50 border border-emerald-500 rounded-2xl p-6 text-center mb-6">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-xl text-emerald-400 font-bold mb-1">MATCH WINNER</div>
                <div className="text-4xl font-black">{getPlayerName(currentMatch.winnerId)}</div>
                <div className="text-2xl mt-4 font-mono font-bold text-slate-300">
                  {currentMatch.score1} - {currentMatch.score2}
                </div>
              </div>
            )}
            
            <div className={`flex flex-col gap-6 ${currentMatch.status === 'finished' ? 'opacity-50 pointer-events-none' : ''}`}>
              {/* PLAYER 1 CONTROLS */}
              <div className="bg-slate-900 rounded-3xl p-4 border-t-4 border-emerald-500 shadow-xl">
                <div className="text-center font-bold text-2xl mb-4 truncate text-emerald-400">
                  {getPlayerName(currentMatch.player1Id)}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <button 
                    onClick={() => removeFrame(1)}
                    className="w-20 h-24 bg-slate-800 rounded-2xl text-4xl font-black active:bg-slate-700 transition"
                  >-1</button>
                  <div className="text-7xl font-black font-mono flex-1 text-center">
                    {currentMatch.score1}
                  </div>
                  <button 
                    onClick={() => addFrame(1)}
                    className="w-24 h-32 bg-emerald-600 rounded-2xl text-5xl font-black active:bg-emerald-500 shadow-[0_8px_0_rgb(4,120,87)] active:shadow-none active:translate-y-2 transition-all"
                  >+1</button>
                </div>
              </div>

              {/* PLAYER 2 CONTROLS */}
              <div className="bg-slate-900 rounded-3xl p-4 border-t-4 border-blue-500 shadow-xl">
                <div className="text-center font-bold text-2xl mb-4 truncate text-blue-400">
                  {getPlayerName(currentMatch.player2Id)}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <button 
                    onClick={() => removeFrame(2)}
                    className="w-20 h-24 bg-slate-800 rounded-2xl text-4xl font-black active:bg-slate-700 transition"
                  >-1</button>
                  <div className="text-7xl font-black font-mono flex-1 text-center">
                    {currentMatch.score2}
                  </div>
                  <button 
                    onClick={() => addFrame(2)}
                    className="w-24 h-32 bg-blue-600 rounded-2xl text-5xl font-black active:bg-blue-500 shadow-[0_8px_0_rgb(29,78,216)] active:shadow-none active:translate-y-2 transition-all"
                  >+1</button>
                </div>
              </div>
            </div>

            {/* ACTION BAR */}
            <div className="mt-8 grid grid-cols-2 gap-4 pb-8">
              <button 
                onClick={undoLastAction}
                disabled={currentMatch.frames.length === 0}
                className="flex flex-col items-center justify-center bg-slate-800 p-4 rounded-2xl disabled:opacity-50"
              >
                <Undo2 size={32} className="mb-2" />
                <span className="font-bold">UNDO</span>
              </button>
              <button 
                onClick={resetMatch}
                className="flex flex-col items-center justify-center bg-red-900/30 text-red-400 p-4 rounded-2xl border border-red-900"
              >
                <RotateCcw size={32} className="mb-2" />
                <span className="font-bold">RESET MATCH</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 font-bold text-xl text-center p-4">
            {tableId ? 'No active match assigned to this table' : 'Select a match to start scoring'}
          </div>
        )}
      </main>
    </div>
  );
}

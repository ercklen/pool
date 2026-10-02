import React, { useState } from 'react';
import { useTournament } from '../store/TournamentContext';
import { advanceWinner } from '../lib/tournament-utils';
import { Undo2, RotateCcw, Save } from 'lucide-react';

export default function RemotePage() {
  const { state, setTournamentState, updateMatch } = useTournament();
  const [selectedMatchId, setSelectedMatchId] = useState(null);

  const activeMatches = state.matches.filter(m => m.status !== 'finished');

  const handleSelectMatch = (e) => {
    const matchId = e.target.value;
    setSelectedMatchId(matchId);
    
    // Set status to live if scheduled
    const match = state.matches.find(m => m.id === matchId);
    if (match && match.status === 'scheduled') {
      updateMatch({ id: matchId, status: 'live' });
    }
  };

  const getPlayerName = (id) => {
    if (!id) return "TBD";
    const p = state.players.find(p => p.id === id);
    return p ? p.name : "Unknown";
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

    const update = {
      ...currentMatch,
      score1: newScore1,
      score2: newScore2,
      frames: newFrames
    };

    // Check win condition
    if (newScore1 >= state.framesToWin || newScore2 >= state.framesToWin) {
      update.status = 'finished';
      update.winnerId = newScore1 >= state.framesToWin ? currentMatch.player1Id : currentMatch.player2Id;
      
      // We must advance the winner in the full state
      const updatedMatchInList = state.matches.map(m => m.id === update.id ? update : m);
      const matchesAfterAdvancement = advanceWinner(updatedMatchInList, update.id, update.winnerId);
      
      setTournamentState({
        ...state,
        matches: matchesAfterAdvancement
      });
      return;
    }

    updateMatch(update);
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
        <h1 className="text-xl font-bold text-emerald-400">Match Remote</h1>
      </header>

      <main className="p-4 max-w-md mx-auto flex flex-col h-[calc(100vh-4rem)]">
        
        <div className="mb-6">
          <label className="block text-sm text-slate-400 mb-2 uppercase font-bold">Select Match</label>
          <select 
            className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-4 text-lg font-bold focus:border-emerald-500 focus:outline-none appearance-none"
            value={selectedMatchId || ''}
            onChange={handleSelectMatch}
          >
            <option value="" disabled>-- Select a match --</option>
            {activeMatches.map(m => (
              <option key={m.id} value={m.id}>
                TABLE {m.table || '?'} : {getPlayerName(m.player1Id)} vs {getPlayerName(m.player2Id)}
              </option>
            ))}
          </select>
        </div>

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
          <div className="flex-1 flex items-center justify-center text-slate-500 font-bold text-xl text-center">
            Select a match to start scoring
          </div>
        )}
      </main>
    </div>
  );
}

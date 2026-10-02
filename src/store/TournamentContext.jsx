import React, { createContext, useContext, useEffect, useState } from 'react';
import { ref, onValue, set, update } from "firebase/database";
import { db } from '../lib/firebase';

const initialState = {
  tournamentName: "",
  format: "A3",
  framesToWin: 3,
  players: [],
  matches: [],
  currentLiveMatchId: null,
};

export const TournamentContext = createContext();

export function TournamentProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(true);

  // Sync state FROM Firebase
  useEffect(() => {
    const tournamentRef = ref(db, 'tournament');
    
    const unsubscribe = onValue(tournamentRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Firebase arrays might be undefined if empty, ensure defaults
        setState({
          ...initialState,
          ...data,
          players: data.players || [],
          matches: data.matches || []
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase read error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Modify entire state
  const setTournamentState = (newState) => {
    // We update local state optimistically, but Firebase will be the source of truth
    set(ref(db, 'tournament'), newState).catch(err => console.error("Firebase write error:", err));
  };

  // Update a specific match
  const updateMatch = (matchUpdate) => {
    // Optimistic update
    const newMatches = state.matches.map(m => m.id === matchUpdate.id ? { ...m, ...matchUpdate } : m);
    
    // Write to Firebase
    set(ref(db, 'tournament/matches'), newMatches).catch(err => console.error("Firebase match update error:", err));
  };

  // Set live match ID
  const setLiveMatch = (matchId) => {
    set(ref(db, 'tournament/currentLiveMatchId'), matchId).catch(err => console.error("Firebase live match update error:", err));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-emerald-400">
        <div className="text-4xl font-black mb-4 animate-pulse">CONNECTING TO FIREBASE...</div>
        <div className="text-slate-500">Synchronizing live tournament data</div>
      </div>
    );
  }

  return (
    <TournamentContext.Provider value={{ state, setTournamentState, updateMatch, setLiveMatch }}>
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
}

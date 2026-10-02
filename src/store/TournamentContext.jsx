import React, { createContext, useContext, useEffect, useState } from 'react';
import { ref, onValue, set } from "firebase/database";
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

// Firebase converts arrays to objects with numeric keys — convert them back
function toArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return Object.values(val);
}

// Deep-clean a state object coming from Firebase
function sanitizeFromFirebase(data) {
  return {
    ...initialState,
    ...data,
    framesToWin: data.framesToWin ?? initialState.framesToWin,
    players: toArray(data.players).map(p => ({ ...p })),
    matches: toArray(data.matches).map(m => ({
      ...m,
      frames: toArray(m.frames),
    })),
    currentLiveMatchId: data.currentLiveMatchId ?? null,
  };
}

export function TournamentProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to Firebase for real-time updates
  useEffect(() => {
    const tournamentRef = ref(db, 'tournament');

    const unsubscribe = onValue(
      tournamentRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setState(sanitizeFromFirebase(data));
        } else {
          setState(initialState);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Firebase read error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const setTournamentState = (newState) => {
    set(ref(db, 'tournament'), newState).catch(err => {
      console.error("Firebase write error:", err);
      setError(err.message);
    });
  };

  const updateMatch = (matchUpdate) => {
    const newMatches = state.matches.map(m =>
      m.id === matchUpdate.id ? { ...m, ...matchUpdate } : m
    );
    set(ref(db, 'tournament/matches'), newMatches).catch(err => {
      console.error("Firebase match update error:", err);
    });
  };

  const setLiveMatch = (matchId) => {
    set(ref(db, 'tournament/currentLiveMatchId'), matchId).catch(err => {
      console.error("Firebase live match error:", err);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-emerald-400">
        <div className="text-6xl mb-6">🎱</div>
        <div className="text-4xl font-black mb-4 animate-pulse">CONNECTING...</div>
        <div className="text-slate-500 text-lg">Connecting to Firebase Realtime Database</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-red-400 p-8">
        <div className="text-6xl mb-6">⚠️</div>
        <div className="text-3xl font-black mb-4">FIREBASE ERROR</div>
        <div className="text-slate-400 text-center max-w-lg bg-slate-900 p-6 rounded-xl font-mono text-sm">{error}</div>
        <div className="mt-6 text-slate-500">Check your Firebase rules and internet connection.</div>
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

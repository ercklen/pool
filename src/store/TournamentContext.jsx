import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

const initialState = {
  tournamentName: "",
  format: "A3",
  framesToWin: 3,
  players: [],
  matches: [],
  currentLiveMatchId: null,
};

const TOURNAMENT_STORAGE_KEY = 'billiard_tournament_state';
const BROADCAST_CHANNEL_NAME = 'billiard_tournament_sync';

export const TournamentContext = createContext();

function tournamentReducer(state, action) {
  switch (action.type) {
    case 'SET_STATE': {
      const newState = { ...state, ...action.payload };
      // Prevent infinite loop by checking if state actually changed
      if (JSON.stringify(state) === JSON.stringify(newState)) {
        return state;
      }
      return newState;
    }
    case 'UPDATE_MATCH':
      return {
        ...state,
        matches: state.matches.map(m => m.id === action.payload.id ? { ...m, ...action.payload } : m)
      };
    case 'SET_LIVE_MATCH':
      return { ...state, currentLiveMatchId: action.payload };
    case 'RESET_TOURNAMENT':
      return { ...initialState };
    default:
      return state;
  }
}

export function TournamentProvider({ children }) {
  const [state, dispatch] = useReducer(tournamentReducer, initialState, (initial) => {
    try {
      const stored = localStorage.getItem(TOURNAMENT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : initial;
    } catch (e) {
      return initial;
    }
  });

  const broadcastChannel = React.useRef(null);

  useEffect(() => {
    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    broadcastChannel.current = channel;
    
    channel.onmessage = (event) => {
      if (event.data) {
        dispatch({ type: 'SET_STATE', payload: event.data });
      }
    };

    const handleStorage = (e) => {
      if (e.key === TOURNAMENT_STORAGE_KEY && e.newValue) {
        try {
          dispatch({ type: 'SET_STATE', payload: JSON.parse(e.newValue) });
        } catch (err) {}
      }
    };
    
    window.addEventListener('storage', handleStorage);

    return () => {
      channel.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(TOURNAMENT_STORAGE_KEY, JSON.stringify(state));
    if (broadcastChannel.current) {
      try {
        broadcastChannel.current.postMessage(state);
      } catch (e) {
        console.warn("BroadcastChannel postMessage failed:", e);
      }
    }
  }, [state]);

  const setTournamentState = useCallback((newState) => {
    dispatch({ type: 'SET_STATE', payload: newState });
  }, []);

  const updateMatch = useCallback((matchUpdate) => {
    dispatch({ type: 'UPDATE_MATCH', payload: matchUpdate });
  }, []);

  const setLiveMatch = useCallback((matchId) => {
    dispatch({ type: 'SET_LIVE_MATCH', payload: matchId });
  }, []);

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

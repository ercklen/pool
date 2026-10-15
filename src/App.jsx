import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TournamentProvider } from './store/TournamentContext';

import AdminPage from './pages/AdminPage';
import TvPage from './pages/TvPage';
import RemotePage from './pages/RemotePage';
import PlayersSchedulePage from './pages/PlayersSchedulePage';

function App() {
  return (
    <TournamentProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/schedule" replace />} />
          <Route path="/schedule" element={<PlayersSchedulePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/tv" element={<TvPage />} />
          <Route path="/tv/:tableId" element={<TvPage />} />
          <Route path="/remote" element={<RemotePage />} />
          <Route path="/remote/:tableId" element={<RemotePage />} />
        </Routes>
      </BrowserRouter>
    </TournamentProvider>
  );
}

export default App;

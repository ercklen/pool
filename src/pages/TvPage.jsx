import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTournament } from '../store/TournamentContext';
import ResponsiveBracket from '../components/ResponsiveBracket';

const s = {
  root: { minHeight: '100vh', background: '#020617', color: '#f1f5f9', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'Arial, sans-serif' },
  header: { background: '#0f172a', borderBottom: '4px solid #10b981', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', gap: 12 },
  headerLeft: { display: 'flex', flexDirection: 'column' },
  headerTitle: { fontSize: 'clamp(20px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-1px', margin: 0 },
  headerSub: { fontSize: 'clamp(14px, 2vw, 22px)', color: '#34d399', fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', marginTop: 4 },
  headerRight: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  tabBtn: (active) => ({ padding: '6px 16px', fontSize: 14, fontWeight: 700, borderRadius: 8, border: 'none', cursor: 'pointer', background: active ? '#334155' : 'transparent', color: active ? '#fff' : '#64748b', transition: 'all 0.2s' }),
  fsBtn: { padding: 8, background: '#1e293b', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', minHeight: 0, position: 'relative' },

  // waiting screen
  waitingRoot: { minHeight: '100vh', background: '#020617', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' },
  waitingTitle: { fontSize: 'clamp(28px, 5vw, 60px)', fontWeight: 900, color: '#fff', marginBottom: 16 },
  waitingTime: { fontSize: 'clamp(18px, 3vw, 30px)', color: '#34d399', fontWeight: 700, marginBottom: 24, background: '#0f172a', border: '1px solid rgba(16,185,129,0.3)', padding: '12px 24px', borderRadius: 16 },
  waitingPulse: { fontSize: 'clamp(20px, 3vw, 30px)', color: '#475569', fontWeight: 700 },

  // winner screen
  winnerRoot: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom, #064e3b, #020617)', zIndex: 50, padding: 32 },
  winnerEmoji: { fontSize: 'clamp(60px, 10vw, 96px)', marginBottom: 24 },
  winnerLabel: { fontSize: 'clamp(24px, 4vw, 36px)', color: '#34d399', fontWeight: 700, letterSpacing: 8, marginBottom: 16 },
  winnerName: { fontSize: 'clamp(48px, 8vw, 112px)', fontWeight: 900, background: 'linear-gradient(to right, #fde047, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center', wordBreak: 'break-word', maxWidth: '100%', padding: '0 16px' },
  winnerYear: { fontSize: 'clamp(20px, 3vw, 28px)', color: '#64748b', marginTop: 32, textAlign: 'center' },

  // live match
  liveRoot: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(16px, 3vw, 48px)' },
  liveTopBar: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%', maxWidth: 1100, alignItems: 'center', gap: 12, marginBottom: 'clamp(24px, 4vw, 64px)' },
  tableChip: { fontSize: 'clamp(16px, 2.5vw, 32px)', fontWeight: 700, color: '#94a3b8', background: '#0f172a', padding: 'clamp(8px, 1.5vw, 16px) clamp(16px, 3vw, 32px)', borderRadius: 16, border: '1px solid #1e293b' },
  refChip: { fontSize: 'clamp(12px, 1.8vw, 22px)', fontWeight: 700, color: '#fcd34d', background: 'rgba(120,53,15,0.4)', border: '1px solid rgba(245,158,11,0.4)', padding: 'clamp(8px, 1.5vw, 16px) clamp(12px, 2vw, 24px)', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 8 },
  liveTag: { display: 'flex', alignItems: 'center', gap: 8 },
  liveDot: { width: 'clamp(10px, 1.5vw, 16px)', height: 'clamp(10px, 1.5vw, 16px)', background: '#ef4444', borderRadius: '50%' },
  liveText: { color: '#ef4444', fontWeight: 700, fontSize: 'clamp(20px, 3vw, 36px)', letterSpacing: 4 },
  scoreGrid: { width: '100%', maxWidth: 1100, display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: 'clamp(12px, 2vw, 32px)', alignItems: 'center', background: 'rgba(15,23,42,0.5)', padding: 'clamp(24px, 4vw, 64px)', borderRadius: 'clamp(20px, 3vw, 48px)', border: '1px solid #1e293b' },
  playerCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  playerName: { fontSize: 'clamp(24px, 5vw, 72px)', fontWeight: 900, width: '100%', marginBottom: 'clamp(12px, 2vw, 32px)', wordBreak: 'break-word', lineHeight: 1.1 },
  score1: { fontSize: 'clamp(60px, 12vw, 160px)', lineHeight: 1, fontWeight: 900, color: '#34d399', fontFamily: 'monospace' },
  score2: { fontSize: 'clamp(60px, 12vw, 160px)', lineHeight: 1, fontWeight: 900, color: '#60a5fa', fontFamily: 'monospace' },
  vsCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  vsText: { fontSize: 'clamp(24px, 5vw, 60px)', fontWeight: 900, color: '#1e293b', fontStyle: 'italic' },
  frameText: { marginTop: 'clamp(16px, 2vw, 48px)', fontSize: 'clamp(12px, 1.5vw, 22px)', color: '#64748b', fontWeight: 700, textAlign: 'center' },
  targetText: { fontSize: 'clamp(10px, 1.2vw, 18px)', color: '#475569', marginTop: 4 },

  // no match / debug
  noMatchRoot: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 32 },
  noMatchText: { fontSize: 'clamp(20px, 3vw, 36px)', color: '#334155', fontWeight: 700, textAlign: 'center' },
  debugBox: { background: '#0f172a', border: '1px solid #334155', borderRadius: 20, padding: 24, maxWidth: 560, width: '100%', fontSize: 14 },
  debugTitle: { color: '#94a3b8', marginBottom: 12, fontWeight: 700 },
  debugLabel: { color: '#64748b', marginBottom: 8 },
  debugId: { color: '#facc15', background: '#1e293b', padding: '2px 10px', borderRadius: 6, fontFamily: 'monospace' },
  debugTableRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', borderRadius: 10, padding: '8px 14px', marginBottom: 6 },
  debugTableName: { color: '#fff', fontWeight: 700 },
  debugTableId: { color: '#34d399', background: '#020617', padding: '2px 8px', borderRadius: 6, fontFamily: 'monospace', fontSize: 11 },
  debugHint: { marginTop: 16, color: '#475569', fontSize: 12 },
  debugUrl: { color: '#34d399' },

  // tables mode
  tablesRoot: { flex: 1, padding: 'clamp(16px, 3vw, 40px)' },
  tablesGrid: { display: 'grid', gap: 'clamp(12px, 2vw, 24px)', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', height: '100%' },
  matchCard: { background: '#0f172a', border: '2px solid rgba(153,27,27,0.6)', borderRadius: 'clamp(16px, 2vw, 28px)', padding: 'clamp(16px, 2vw, 32px)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' },
  liveBadge: { position: 'absolute', top: 0, right: 0, background: '#dc2626', color: '#fff', fontWeight: 700, padding: '4px 14px', borderBottomLeftRadius: 12, fontSize: 12 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8, paddingRight: 48 },
  cardTableName: { fontSize: 'clamp(16px, 2vw, 22px)', color: '#c4b5fd', fontWeight: 700 },
  cardRefChip: { fontSize: 12, fontWeight: 600, color: '#fcd34d', background: 'rgba(120,53,15,0.5)', border: '1px solid rgba(245,158,11,0.3)', padding: '2px 10px', borderRadius: 8 },
  cardRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'clamp(18px, 2.5vw, 32px)', fontWeight: 900, marginTop: 8 },
  cardRow2: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'clamp(18px, 2.5vw, 32px)', fontWeight: 900, marginTop: 16, paddingTop: 16, borderTop: '1px solid #1e293b' },
  cardPlayerName: { color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 },
  cardScore1: { color: '#34d399', fontFamily: 'monospace', fontSize: 'clamp(24px, 3.5vw, 48px)', marginLeft: 16 },
  cardScore2: { color: '#60a5fa', fontFamily: 'monospace', fontSize: 'clamp(24px, 3.5vw, 48px)', marginLeft: 16 },
  cardFooter: { marginTop: 16, fontSize: 12, color: '#475569' },
};

export default function TvPage() {
  const { tableId } = useParams();
  const { state } = useTournament();
  const [mode, setMode] = useState('live');
  const [dotVisible, setDotVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setDotVisible(v => !v), 600);
    return () => clearInterval(interval);
  }, []);

  const getPlayerName = (id) => {
    if (!id) return '';
    const p = state.players.find(p => p.id === id);
    return p ? p.name.toUpperCase() : '';
  };

  const getTableName = (tId) => {
    if (!tId) return null;
    const t = (state.tables || []).find(t => t.id === tId);
    return t ? t.name.toUpperCase() : null;
  };

  const getRefereeForTable = (tId) => {
    if (!tId) return null;
    const t = (state.tables || []).find(t => t.id === tId);
    if (!t || !t.refereeId) return null;
    const r = (state.referees || []).find(ref => ref.id === t.refereeId);
    return r ? r.name.toUpperCase() : null;
  };

  let liveMatch = null;
  if (tableId) {
    liveMatch = state.matches.find(m => m.tableId === tableId && m.status === 'live') ||
                state.matches.find(m => m.tableId === tableId && m.status !== 'finished');
  } else {
    liveMatch =
      state.matches.find(m => m.id === state.currentLiveMatchId && m.status !== 'finished') ||
      state.matches.find(m => m.status === 'live') ||
      state.matches.find(m => m.status !== 'finished') ||
      null;
  }

  const allLiveMatches = state.matches.filter(m => m.status === 'live');

  useEffect(() => {
    if (state.matches.length > 0 && !tableId) {
      const finalMatch = state.matches[state.matches.length - 1];
      if (finalMatch.status === 'finished') setMode('winner');
    }
  }, [state.matches, tableId]);

  if (!state.matches.length) {
    return (
      <div style={s.waitingRoot}>
        <h1 style={s.waitingTitle}>{state.tournamentName || 'BILLIARD TOURNAMENT'}</h1>
        {state.tournamentTime && (
          <div style={s.waitingTime}>⏰ DÉBUT : {state.tournamentTime}</div>
        )}
        <div style={s.waitingPulse}>EN ATTENTE DU TIRAGE AU SORT...</div>
      </div>
    );
  }

  const championMatch = state.matches[state.matches.length - 1];
  const champion = championMatch.status === 'finished' ? getPlayerName(championMatch.winnerId) : null;

  return (
    <div style={s.root}>
      {/* HEADER */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={s.headerTitle}>{state.tournamentName || 'BILLIARD TOURNAMENT'}</h1>
            {state.tournamentTime && (
              <span style={{ fontSize: 'clamp(11px, 1.5vw, 16px)', fontWeight: 700, background: 'rgba(6,78,59,0.8)', border: '1px solid rgba(16,185,129,0.4)', color: '#6ee7b7', padding: '4px 14px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 6 }}>
                ⏰ {state.tournamentTime}
              </span>
            )}
          </div>
          <h2 style={s.headerSub}>DÉFI {state.format}</h2>
        </div>
        <div style={s.headerRight}>
          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
              } else {
                document.exitFullscreen && document.exitFullscreen();
              }
            }}
            style={s.fsBtn}
            title="Toggle Fullscreen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
          </button>
          {!tableId && (
            <>
              <button onClick={() => setMode('live')} style={s.tabBtn(mode === 'live')}>Live</button>
              <button onClick={() => setMode('matches')} style={s.tabBtn(mode === 'matches')}>Tables</button>
              <button onClick={() => setMode('bracket')} style={s.tabBtn(mode === 'bracket')}>Bracket</button>
            </>
          )}
        </div>
      </header>

      {/* MAIN */}
      <main style={s.main}>

        {/* WINNER */}
        {mode === 'winner' && champion && (
          <div style={s.winnerRoot}>
            <div style={s.winnerEmoji}>🏆</div>
            <div style={s.winnerLabel}>CHAMPION</div>
            <div style={s.winnerName}>{champion}</div>
            <div style={s.winnerYear}>{state.tournamentName} 2026</div>
          </div>
        )}

        {/* LIVE MATCH */}
        {mode === 'live' && liveMatch && (() => {
          const refName = getRefereeForTable(liveMatch.tableId);
          return (
            <div style={s.liveRoot}>
              <div style={s.liveTopBar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={s.tableChip}>{getTableName(liveMatch.tableId) || 'TABLE ?'}</div>
                  {refName && (
                    <div style={s.refChip}>🛡️ REF: {refName}</div>
                  )}
                </div>
                <div style={s.liveTag}>
                  <div style={{ ...s.liveDot, opacity: dotVisible ? 1 : 0, transition: 'opacity 0.3s' }}></div>
                  <div style={s.liveText}>LIVE</div>
                </div>
              </div>

              <div style={s.scoreGrid}>
                {/* PLAYER 1 */}
                <div style={s.playerCol}>
                  <div style={s.playerName}>{getPlayerName(liveMatch.player1Id) || 'TBD'}</div>
                  <div style={s.score1}>{liveMatch.score1}</div>
                </div>

                {/* VS */}
                <div style={s.vsCol}>
                  <div style={s.vsText}>VS</div>
                  <div style={s.frameText}>FRAME {liveMatch.score1 + liveMatch.score2 + 1}</div>
                  <div style={s.targetText}>Target: {state.framesToWin}</div>
                </div>

                {/* PLAYER 2 */}
                <div style={s.playerCol}>
                  <div style={s.playerName}>{getPlayerName(liveMatch.player2Id) || 'TBD'}</div>
                  <div style={s.score2}>{liveMatch.score2}</div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* NO MATCH */}
        {mode === 'live' && !liveMatch && (
          <div style={s.noMatchRoot}>
            <div style={s.noMatchText}>
              {tableId ? 'NO MATCH ASSIGNED TO THIS TABLE' : 'NO MATCH SELECTED'}
            </div>
            {tableId && (
              <div style={s.debugBox}>
                <div style={s.debugTitle}>🔍 Debug Info</div>
                <div style={s.debugLabel}>
                  URL Table ID: <span style={s.debugId}>{tableId}</span>
                </div>
                <div style={{ ...s.debugLabel, marginTop: 12 }}>Available tables in Firebase:</div>
                <div>
                  {(state.tables || []).map(t => (
                    <div key={t.id} style={s.debugTableRow}>
                      <span style={s.debugTableName}>{t.name}</span>
                      <span style={s.debugTableId}>{t.id}</span>
                    </div>
                  ))}
                </div>
                <div style={s.debugHint}>
                  ⚠️ Make sure the URL uses the exact table ID shown above.<br />
                  Example: <span style={s.debugUrl}>/tv/{(state.tables || [])[0]?.id || 'table-id-here'}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TABLES MODE */}
        {mode === 'matches' && (
          <div style={s.tablesRoot}>
            {allLiveMatches.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#334155', fontSize: 24, fontWeight: 700 }}>
                No live matches right now
              </div>
            ) : (
              <div style={s.tablesGrid}>
                {allLiveMatches.map(m => {
                  const refName = getRefereeForTable(m.tableId);
                  return (
                    <div key={m.id} style={s.matchCard}>
                      <div style={s.liveBadge}>LIVE</div>
                      <div style={s.cardHeader}>
                        <div style={s.cardTableName}>{getTableName(m.tableId) || 'TABLE ?'}</div>
                        {refName && <div style={s.cardRefChip}>🛡️ {refName}</div>}
                      </div>
                      <div style={s.cardRow}>
                        <span style={s.cardPlayerName}>{getPlayerName(m.player1Id)}</span>
                        <span style={s.cardScore1}>{m.score1}</span>
                      </div>
                      <div style={s.cardRow2}>
                        <span style={s.cardPlayerName}>{getPlayerName(m.player2Id)}</span>
                        <span style={s.cardScore2}>{m.score2}</span>
                      </div>
                      <div style={s.cardFooter}>
                        Frame {m.score1 + m.score2 + 1} / Target: {state.framesToWin}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* BRACKET MODE */}
        {mode === 'bracket' && (
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <ResponsiveBracket />
          </div>
        )}
      </main>
    </div>
  );
}

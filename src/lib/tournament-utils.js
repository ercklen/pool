export function generateDraw(players, format, framesToWin) {
  // Shuffle players
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  
  // Calculate power of 2 for bracket size (2, 4, 8, 16, 32, 64)
  const numPlayers = shuffled.length;
  let bracketSize = 2;
  while (bracketSize < numPlayers) {
    bracketSize *= 2;
  }
  
  const numByes = bracketSize - numPlayers;
  const initialMatches = bracketSize / 2;
  
  const matches = [];
  
  // Generate first round matches
  let playerIdx = 0;
  for (let i = 0; i < initialMatches; i++) {
    const match = {
      id: `m-r1-${i + 1}`,
      round: 1,
      matchIndex: i,
      table: null,
      player1Id: null,
      player2Id: null,
      score1: 0,
      score2: 0,
      frames: [],
      status: 'scheduled', // 'scheduled', 'live', 'finished'
      winnerId: null,
      nextMatchId: `m-r2-${Math.floor(i / 2)}`
    };

    // Assign player 1
    if (playerIdx < shuffled.length) {
      match.player1Id = shuffled[playerIdx].id;
      playerIdx++;
    }

    // Assign player 2 (or leave null if it's a BYE)
    // To distribute BYEs, we could put them at the end, or evenly.
    // For simplicity, we just put them at the end.
    if (i < initialMatches - numByes && playerIdx < shuffled.length) {
      match.player2Id = shuffled[playerIdx].id;
      playerIdx++;
    }

    // If there is a BYE for this match (player2 is null), auto-advance player1
    if (match.player1Id && !match.player2Id) {
      match.status = 'finished';
      match.winnerId = match.player1Id;
    }
    
    matches.push(match);
  }

  // Generate subsequent rounds
  let currentRound = 1;
  let matchesInRound = initialMatches;
  let nextRoundMatchesInRound = matchesInRound / 2;

  while (nextRoundMatchesInRound >= 1) {
    currentRound++;
    for (let i = 0; i < nextRoundMatchesInRound; i++) {
      const match = {
        id: `m-r${currentRound}-${i}`,
        round: currentRound,
        matchIndex: i,
        table: null,
        player1Id: null,
        player2Id: null,
        score1: 0,
        score2: 0,
        frames: [],
        status: 'scheduled',
        winnerId: null,
        nextMatchId: nextRoundMatchesInRound === 1 ? null : `m-r${currentRound + 1}-${Math.floor(i / 2)}`
      };
      matches.push(match);
    }
    matchesInRound = nextRoundMatchesInRound;
    nextRoundMatchesInRound = matchesInRound / 2;
  }

  // Propagate BYE winners to next round immediately
  matches.filter(m => m.round === 1 && m.status === 'finished').forEach(m => {
    const nextMatch = matches.find(nm => nm.id === m.nextMatchId);
    if (nextMatch) {
      if (m.matchIndex % 2 === 0) {
        nextMatch.player1Id = m.winnerId;
      } else {
        nextMatch.player2Id = m.winnerId;
      }
    }
  });

  return matches;
}

export function getRoundName(round, totalRounds) {
  if (round === totalRounds) return "FINAL";
  if (round === totalRounds - 1) return "SEMI-FINAL";
  if (round === totalRounds - 2) return "QUARTER-FINAL";
  if (round === totalRounds - 3) return "ROUND OF 16";
  if (round === totalRounds - 4) return "ROUND OF 32";
  return `ROUND ${round}`;
}

export function advanceWinner(matches, matchId, winnerId) {
  const newMatches = JSON.parse(JSON.stringify(matches));
  const currentMatch = newMatches.find(m => m.id === matchId);
  
  if (!currentMatch || !currentMatch.nextMatchId) return newMatches;

  const nextMatch = newMatches.find(m => m.id === currentMatch.nextMatchId);
  if (nextMatch) {
    if (currentMatch.matchIndex % 2 === 0) {
      nextMatch.player1Id = winnerId;
    } else {
      nextMatch.player2Id = winnerId;
    }
  }

  return newMatches;
}

export function unadvanceWinner(matches, matchId) {
  const newMatches = JSON.parse(JSON.stringify(matches));
  const currentMatch = newMatches.find(m => m.id === matchId);
  
  if (!currentMatch || !currentMatch.nextMatchId) return newMatches;

  const nextMatch = newMatches.find(m => m.id === currentMatch.nextMatchId);
  if (nextMatch) {
    if (currentMatch.matchIndex % 2 === 0) {
      nextMatch.player1Id = null;
    } else {
      nextMatch.player2Id = null;
    }
  }

  return newMatches;
}

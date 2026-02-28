const BASE_URL = "http://localhost:8000"

export const api = {
  startGame: async (playerName: string) => {
    const res = await fetch(`${BASE_URL}/game/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_name: playerName }),
    });
    if (!res.ok) throw new Error("Failed to start game");
    return res.json();
  },

  submitTrades: async (
    gameId: string,
    roundNumber: number,
    trades: any[],
    predictedSector: string
  ) => {
    const res = await fetch(`${BASE_URL}/game/trade`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        game_id: gameId,
        round_number: roundNumber,
        player_trades: trades,
        player_predicted_sector: predictedSector,
      }),
    });
    if (!res.ok) throw new Error("Failed to submit trades");
    return res.json();
    // Returns: { ai_reasoning: string, ai_trades: [...] }
  },

  resolveRound: async (gameId: string) => {
    const res = await fetch(`${BASE_URL}/game/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game_id: gameId }),
    });
    if (!res.ok) throw new Error("Failed to resolve round");
    return res.json();
    // Returns: { updated_stocks, player_portfolio_value, ai_portfolio_value, next_headline, game_over }
  },

  getDebrief: async (gameId: string, roundNumber: number) => {
    const res = await fetch(`${BASE_URL}/game/debrief`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game_id: gameId, round_number: roundNumber }),
    });
    if (!res.ok) throw new Error("Failed to get debrief");
    return res.json();
    // Returns: { debrief_text: string }
  },

  getBridgeAdvice: async (
    gameId: string,
    invests: boolean,
    accountType: string,
    techAllocation: number
  ) => {
    const res = await fetch(`${BASE_URL}/game/bridge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        game_id: gameId,
        invests,
        account_type: accountType,
        tech_allocation: techAllocation,
      }),
    });
    if (!res.ok) throw new Error("Failed to get bridge advice");
    return res.json();
    // Returns: { advice: string }
  },

  getGameState: async (gameId: string) => {
    const res = await fetch(`${BASE_URL}/game/${gameId}/state`);
    if (!res.ok) throw new Error("Failed to get game state");
    return res.json();
  },
};
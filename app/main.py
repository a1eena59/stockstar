

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import uuid
import json
import asyncio
import os
import uvicorn

from app.config import STARTING_CASH, TOTAL_ROUNDS
from app.data.stocks import STOCKS, fetch_all_prices, calculate_new_price
from app.data.news import fetch_market_news, get_correct_sector
from app.agents.opponent import run_ai_opponent
from app.rag.coach import load_principles, generate_debrief, generate_bridge_advice

app = FastAPI(title="Stock Star API")
if __name__ == "__main__":
    # Use the port Render gives you, default to 8000 locally
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
    

# Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://stockstar.vercel.app","https://stockstar-8f48.vercel.app",
        "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],

    allow_headers=["*"],
)

# ─────────────────────────────────────────
# IN-MEMORY GAME STORE
# (Simple dict — no DB needed for hackathon)
# ─────────────────────────────────────────
games = {}


# ─────────────────────────────────────────
# REQUEST MODELS
# ─────────────────────────────────────────

class StartGameRequest(BaseModel):
    player_name: Optional[str] = "Player"


class TradeItem(BaseModel):
    stock_id: str
    action: str  # "buy" | "sell" | "hold"
    quantity: int


class SubmitTradesRequest(BaseModel):
    game_id: str
    round_number: int
    player_trades: list[TradeItem]
    player_predicted_sector: Optional[str] = None


class BridgeRequest(BaseModel):
    game_id: str
    invests: bool
    account_type: str
    tech_allocation: int


# ─────────────────────────────────────────
# STARTUP — Load RAG on boot
# ─────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    print("🚀 Starting Stock Star API...")
    load_principles()
    print("✅ Backend ready")


# ─────────────────────────────────────────
# ROUTE 1 — Start Game
# ─────────────────────────────────────────

@app.post("/game/start")
def game_start(request: StartGameRequest):
    game_id = str(uuid.uuid4())

    # Fetch all data upfront and cache it
    print("📈 Fetching stock prices...")
    prices = fetch_all_prices()

    print("📰 Fetching headlines...")
    headlines = fetch_market_news()
    print(f"📰 First headline: {headlines[0]}")

    # Build initial holdings (empty) for both player and AI
    initial_holdings = {s["id"]: 0 for s in STOCKS}

    # Store full game state in memory
    games[game_id] = {
        "game_id": game_id,
        "player_name": request.player_name,
        "current_round": 1,
        "player_cash": STARTING_CASH,
        "ai_cash": STARTING_CASH,
        "player_holdings": dict(initial_holdings),
        "ai_holdings": dict(initial_holdings),
        "current_prices": prices,
        "headlines": headlines,
        "round_history": [],
        "lessons_learned": [],
    }

    # Build stock info for frontend
    stocks_with_prices = []
    for s in STOCKS:
        stocks_with_prices.append({
            "id": s["id"],
            "display_name": s["display_name"],
            "sector": s["sector"],
            "price": prices.get(s["id"], s["base_price"]),
            "previous_price": prices.get(s["id"], s["base_price"]),
        })

    return {
        "game_id": game_id,
        "player_name": request.player_name,
        "current_round": 1,
        "total_rounds": TOTAL_ROUNDS,
        "player_cash": STARTING_CASH,
        "ai_cash": STARTING_CASH,
        "stocks": stocks_with_prices,
        "headline": headlines[0],
        "correct_sector": get_correct_sector(headlines[0]),
    }


# ─────────────────────────────────────────
# ROUTE 2 — Submit Trades + Get AI Response
# ─────────────────────────────────────────

@app.post("/game/trade")
def game_trade(request: SubmitTradesRequest):
    game = games.get(request.game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    headline = game["headlines"][request.round_number - 1]

    # Check if player predicted correctly
    correct_sector = get_correct_sector(headline)
    player_correct = request.player_predicted_sector == correct_sector

    # Run AI opponent agent
    ai_result = run_ai_opponent(
        headline=headline,
        current_prices=game["current_prices"],
        ai_cash=game["ai_cash"],
        ai_holdings=game["ai_holdings"],
    )

    # Store trades temporarily for resolve step
    game["pending_player_trades"] = [t.dict() for t in request.player_trades]
    game["pending_ai_trades"] = ai_result["trades"]
    game["pending_reasoning"] = ai_result["reasoning"]
    game["pending_sentiment"] = ai_result["sentiment_scores"]
    game["player_predicted_correctly"] = player_correct

    return {
        "ai_reasoning": ai_result["reasoning"],
        "ai_trades": ai_result["trades"],
        "sentiment_scores": ai_result["sentiment_scores"],
        "player_predicted_correctly": player_correct,
        "correct_sector": correct_sector,
    }


# ─────────────────────────────────────────
# HELPER — Apply Trades to Portfolio
# ─────────────────────────────────────────

def apply_trades(trades: list, holdings: dict, cash: float, prices: dict) -> tuple:
    """Apply a list of trades to holdings and cash. Returns updated holdings and cash."""
    for trade in trades:
        stock_id = trade.get("stock_id") or trade.get("stock_id")
        action = trade.get("action")
        quantity = int(trade.get("quantity", 0))
        price = prices.get(stock_id, 0)

        if action == "buy" and quantity > 0:
            cost = price * quantity
            if cost <= cash:
                cash -= cost
                holdings[stock_id] = holdings.get(stock_id, 0) + quantity

        elif action == "sell" and quantity > 0:
            owned = holdings.get(stock_id, 0)
            sell_qty = min(quantity, owned)
            cash += price * sell_qty
            holdings[stock_id] = owned - sell_qty

    return holdings, round(cash, 2)


def calculate_portfolio_value(holdings: dict, prices: dict, cash: float) -> float:
    """Total value = cash + value of all holdings."""
    holdings_value = sum(
        holdings.get(s["id"], 0) * prices.get(s["id"], s["base_price"])
        for s in STOCKS
    )
    return round(cash + holdings_value, 2)


# ─────────────────────────────────────────
# ROUTE 3 — Resolve Round
# ─────────────────────────────────────────

@app.post("/game/resolve")
def game_resolve(body: dict):
    game_id = body.get("game_id")
    game = games.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    round_number = game["current_round"]
    headline = game["headlines"][round_number - 1]
    sentiment = game.get("pending_sentiment", {})
    old_prices = dict(game["current_prices"])

    # Apply player trades
    game["player_holdings"], game["player_cash"] = apply_trades(
        game.get("pending_player_trades", []),
        game["player_holdings"],
        game["player_cash"],
        old_prices
    )

    # Apply AI trades
    game["ai_holdings"], game["ai_cash"] = apply_trades(
        game.get("pending_ai_trades", []),
        game["ai_holdings"],
        game["ai_cash"],
        old_prices
    )

    # Update prices based on sentiment
    new_prices = {}
    price_changes = {}
    for s in STOCKS:
        sid = s["id"]
        sector_sentiment = sentiment.get(s["sector"], 0.0)
        old_price = old_prices.get(sid, s["base_price"])
        new_price = calculate_new_price(old_price, sector_sentiment)
        new_prices[sid] = new_price
        price_changes[sid] = round((new_price - old_price) / old_price, 4)

    game["current_prices"] = new_prices

    # Calculate portfolio values
    player_value = calculate_portfolio_value(
        game["player_holdings"], new_prices, game["player_cash"]
    )
    ai_value = calculate_portfolio_value(
        game["ai_holdings"], new_prices, game["ai_cash"]
    )

    # Save round snapshot
    round_snapshot = {
        "round": round_number,
        "headline": headline,
        "price_changes": price_changes,
        "player_value": player_value,
        "ai_value": ai_value,
    }
    game["round_history"].append(round_snapshot)

    # Advance round
    game["current_round"] += 1

    # Build updated stock list for frontend
    updated_stocks = []
    for s in STOCKS:
        sid = s["id"]
        updated_stocks.append({
            "id": sid,
            "display_name": s["display_name"],
            "sector": s["sector"],
            "price": new_prices[sid],
            "previous_price": old_prices[sid],
            "change_pct": round(price_changes[sid] * 100, 2),
        })

    return {
        "round_number": round_number,
        "updated_stocks": updated_stocks,
        "price_changes": price_changes,
        "player_cash": game["player_cash"],
        "ai_cash": game["ai_cash"],
        "player_portfolio_value": player_value,
        "ai_portfolio_value": ai_value,
        "player_holdings": game["player_holdings"],
        "ai_holdings": game["ai_holdings"],
        "game_over": game["current_round"] > TOTAL_ROUNDS,
        "next_headline": game["headlines"][game["current_round"] - 1] if game["current_round"] <= TOTAL_ROUNDS else None,
        "next_correct_sector": get_correct_sector(game["headlines"][game["current_round"] - 1]) if game["current_round"] <= TOTAL_ROUNDS else None,
    }


# ─────────────────────────────────────────
# ROUTE 4 — Coach Debrief
# ─────────────────────────────────────────

@app.post("/game/debrief")
def game_debrief(body: dict):
    game_id = body.get("game_id")
    game = games.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    round_number = body.get("round_number", game["current_round"] - 1)
    round_data = next(
        (r for r in game["round_history"] if r["round"] == round_number), None
    )

    if not round_data:
        raise HTTPException(status_code=404, detail="Round data not found")

    debrief_text = generate_debrief(
        headline=round_data["headline"],
        price_changes=round_data["price_changes"],
        player_portfolio_change=round_data["player_value"] - (
            game["round_history"][round_number - 2]["player_value"]
            if round_number > 1 else STARTING_CASH
        ),
        ai_portfolio_change=round_data["ai_value"] - (
            game["round_history"][round_number - 2]["ai_value"]
            if round_number > 1 else STARTING_CASH
        ),
        player_predicted_correctly=game.get("player_predicted_correctly", False)
    )

    # Save lesson for results page
    game["lessons_learned"].append({
        "round": round_number,
        "headline": round_data["headline"],
        "lesson": debrief_text[:150] + "..."
    })

    return {
        "debrief_text": debrief_text,
        "round_number": round_number,
    }


# ─────────────────────────────────────────
# ROUTE 5 — Personal Bridge
# ─────────────────────────────────────────

@app.post("/game/bridge")
def game_bridge(request: BridgeRequest):
    game = games.get(request.game_id)
    lessons = game.get("lessons_learned", []) if game else []
    lesson_texts = [l["lesson"] for l in lessons]

    advice = generate_bridge_advice(
        invests=request.invests,
        account_type=request.account_type,
        tech_allocation=request.tech_allocation,
        lessons_learned=lesson_texts
    )

    return {
        "advice": advice,
        "player_name": game["player_name"] if game else "Player",
    }


# ─────────────────────────────────────────
# ROUTE 6 — Get Game State (useful for frontend)
# ─────────────────────────────────────────

@app.get("/game/{game_id}/state")
def get_game_state(game_id: str):
    game = games.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    return {
        "game_id": game_id,
        "current_round": game["current_round"],
        "player_cash": game["player_cash"],
        "ai_cash": game["ai_cash"],
        "player_holdings": game["player_holdings"],
        "ai_holdings": game["ai_holdings"],
        "current_prices": game["current_prices"],
        "round_history": game["round_history"],
        "headline": game["headlines"][game["current_round"] - 1] if game["current_round"] <= TOTAL_ROUNDS else None,
    }


@app.get("/")
def root():
    return {"status": "Stock Star API running"}

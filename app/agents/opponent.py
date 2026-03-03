from groq import Groq
from config import GROQ_API_KEY, GROQ_MODEL_ADVANCED
from data.stocks import STOCKS, SECTOR_MAP, get_stocks_by_sector
import json

groq_client = Groq(api_key=GROQ_API_KEY)


# ─────────────────────────────────────────
# TOOL 1 — Analyze News Sentiment
# ─────────────────────────────────────────

def analyze_news_sentiment(headline: str) -> dict:
    """
    Given a headline, score each sector from -1 to +1.
    -1 = very bad for sector, +1 = very good for sector, 0 = no impact.
    """
    prompt = f"""You are a professional stock market analyst.

Given this news headline, score how it affects each of these 4 stock market sectors.
Use a score from -1.0 (very negative) to +1.0 (very positive). 0.0 means no impact.

HEADLINE: {headline}

Respond ONLY with a valid JSON object in exactly this format, nothing else:
{{
  "Tech": 0.0,
  "Energy": 0.0,
  "Healthcare": 0.0,
  "Consumer": 0.0,
  "reasoning": "one sentence explaining your scores"
}}"""

    response = groq_client.chat.completions.create(
        model=GROQ_MODEL_ADVANCED,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=150,
        temperature=0.3
    )

    raw = response.choices[0].message.content.strip()
    print(f"  🔍 Raw sentiment response: {raw}")
    
    try:
        raw = response.choices[0].message.content.strip()
        
        # Remove markdown code blocks if present
        raw = raw.replace("```json", "").replace("```", "").strip()
        
        # Extract JSON object
        start = raw.find("{")
        end = raw.rfind("}") + 1
        json_str = raw[start:end]
        result = json.loads(json_str)
        
        # Validate all keys exist
        for sector in ["Tech", "Energy", "Healthcare", "Consumer"]:
            if sector not in result:
                result[sector] = 0.0
                
        return result
    except Exception as e:
        print(f"  ⚠️ Sentiment parse failed: {e}, raw response: {raw[:100]}")
        return {
            "Tech": 0.0,
            "Energy": 0.0,
            "Healthcare": 0.0,
            "Consumer": 0.0,
            "reasoning": "Unable to parse sentiment"
        }


# ─────────────────────────────────────────
# TOOL 2 — Check Portfolio Exposure
# ─────────────────────────────────────────

def check_portfolio_exposure(holdings: dict, current_prices: dict) -> dict:
    """
    Given current AI holdings and prices, calculate sector concentration.
    
    holdings: { stock_id: quantity }
    current_prices: { stock_id: price }
    
    Returns sector percentages and total portfolio value.
    """
    sector_values = {
        "Tech": 0.0,
        "Energy": 0.0,
        "Healthcare": 0.0,
        "Consumer": 0.0
    }

    total_value = 0.0

    for stock in STOCKS:
        stock_id = stock["id"]
        quantity = holdings.get(stock_id, 0)
        price = current_prices.get(stock_id, stock["base_price"])
        value = quantity * price
        sector_values[stock["sector"]] += value
        total_value += value

    # Calculate percentages
    sector_percentages = {}
    for sector, value in sector_values.items():
        if total_value > 0:
            sector_percentages[sector] = round((value / total_value) * 100, 1)
        else:
            sector_percentages[sector] = 0.0

    return {
        "sector_percentages": sector_percentages,
        "total_holdings_value": round(total_value, 2)
    }


# ─────────────────────────────────────────
# TOOL 3 — Execute Trade
# ─────────────────────────────────────────

def execute_trade(
    sentiment_scores: dict,
    portfolio_exposure: dict,
    current_prices: dict,
    ai_cash: float,
    ai_holdings: dict
) -> dict:
    """
    Given sentiment + exposure, decide trades for all 8 stocks.
    Returns trade decisions and a reasoning string for the UI.
    """

    # Build context for the AI
    holdings_summary = []
    for stock in STOCKS:
        sid = stock["id"]
        qty = ai_holdings.get(sid, 0)
        price = current_prices.get(sid, stock["base_price"])
        holdings_summary.append(
            f"{stock['display_name']} ({stock['sector']}): {qty} shares @ ${price}"
        )

    sector_pct = portfolio_exposure.get("sector_percentages", {})
    stocks_list = [
    {
        "id": s["id"],
        "name": s["display_name"],
        "sector": s["sector"],
        "price": current_prices.get(s["id"], s["base_price"])
    }
    for s in STOCKS
    ]

    prompt = f"""You are an aggressive but smart AI stock trader in a simulation game.

YOUR CURRENT SITUATION:
- Available cash: ${ai_cash:.2f}
- Portfolio sector exposure: {json.dumps(sector_pct)}
- Current holdings:
{chr(10).join(holdings_summary)}

MARKET SENTIMENT FROM NEWS:
- Tech sector: {sentiment_scores.get('Tech', 0)} (-1=bad, +1=good)
- Energy sector: {sentiment_scores.get('Energy', 0)}
- Healthcare sector: {sentiment_scores.get('Healthcare', 0)}
- Consumer sector: {sentiment_scores.get('Consumer', 0)}
- Analyst note: {sentiment_scores.get('reasoning', '')}

AVAILABLE STOCKS TO TRADE:
{json.dumps(stocks_list, indent=2)}

YOUR TASK:
Decide what to do with each stock. For each stock, choose:
- "buy" with a quantity (use available cash wisely, max 30% of cash on one stock)
- "sell" with a quantity (can only sell what you own)
- "hold" with quantity 0

Respond ONLY with a valid JSON object in exactly this format:
{{
  "trades": [
    {{"stock_id": "cloudcorp", "action": "buy", "quantity": 5}},
    {{"stock_id": "chipmaker", "action": "sell", "quantity": 3}},
    {{"stock_id": "oilgiant", "action": "hold", "quantity": 0}}
  ],
  "reasoning": "2-3 sentences explaining your strategy in plain English like a real trader would say out loud"
}}

Include all 8 stocks in your trades array. The reasoning will be shown to the human player."""

    response = groq_client.chat.completions.create(
        model=GROQ_MODEL_ADVANCED,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=500,
        temperature=0.4
    )

    raw = response.choices[0].message.content.strip()

    # try:
    #     start = raw.find("{")
    #     end = raw.rfind("}") + 1
    #     json_str = raw[start:end]
    #     result = json.loads(json_str)
    #     return result
    # except Exception:
    #     # Safe fallback — hold everything
    #     return {
    #         "trades": [
    #             {"stock_id": s["id"], "action": "hold", "quantity": 0}
    #             for s in STOCKS
    #         ],
    #         "reasoning": "Analyzing market conditions carefully before making moves."
    #     }
    try:
        raw = response.choices[0].message.content.strip()
        
        # Remove markdown code blocks if present
        raw = raw.replace("```json", "").replace("```", "").strip()
        
        start = raw.find("{")
        end = raw.rfind("}") + 1
        json_str = raw[start:end]
        result = json.loads(json_str)
        return result
    except Exception as e:
        print(f"  ⚠️ Trade parse failed: {e}")
        return {
            "trades": [
                {"stock_id": s["id"], "action": "hold", "quantity": 0}
                for s in STOCKS
            ],
            "reasoning": "Analyzing market conditions carefully before making moves."
        }

# ─────────────────────────────────────────
# MAIN AGENT RUNNER
# ─────────────────────────────────────────

def run_ai_opponent(
    headline: str,
    current_prices: dict,
    ai_cash: float,
    ai_holdings: dict
) -> dict:
    """
    Main function called every round.
    Runs all 3 tools in sequence and returns trades + reasoning.
    
    Returns:
    {
        "trades": [...],
        "reasoning": "...",
        "sentiment_scores": {...}
    }
    """

    print(f"\n🤖 AI Opponent analyzing: {headline[:50]}...")

    # Step 1 — Analyze the news
    print("  Tool 1: Analyzing news sentiment...")
    sentiment = analyze_news_sentiment(headline)
    print(f"  Sentiment: {sentiment}")

    # Step 2 — Check current exposure
    print("  Tool 2: Checking portfolio exposure...")
    exposure = check_portfolio_exposure(ai_holdings, current_prices)
    print(f"  Exposure: {exposure}")

    # Step 3 — Decide trades
    print("  Tool 3: Executing trade decisions...")
    trade_decision = execute_trade(
        sentiment_scores=sentiment,
        portfolio_exposure=exposure,
        current_prices=current_prices,
        ai_cash=ai_cash,
        ai_holdings=ai_holdings
    )
    print(f"  Reasoning: {trade_decision.get('reasoning', '')}")

    return {
        "trades": trade_decision.get("trades", []),
        "reasoning": trade_decision.get("reasoning", ""),
        "sentiment_scores": sentiment
    }
import requests
from app.config import ALPHA_VANTAGE_KEY

STOCKS = [
    {"id": "cloudcorp", "display_name": "CloudCorp", "ticker": "MSFT", "sector": "Tech", "base_price": 415.00},
    {"id": "chipmaker", "display_name": "ChipMaker", "ticker": "NVDA", "sector": "Tech", "base_price": 875.00},
    {"id": "oilgiant", "display_name": "OilGiant", "ticker": "XOM", "sector": "Energy", "base_price": 112.00},
    {"id": "greenpower", "display_name": "GreenPower", "ticker": "NEE", "sector": "Energy", "base_price": 67.00},
    {"id": "pharmamax", "display_name": "PharmaMax", "ticker": "JNJ", "sector": "Healthcare", "base_price": 158.00},
    {"id": "bioleap", "display_name": "BioLeap", "ticker": "MRNA", "sector": "Healthcare", "base_price": 95.00},
    {"id": "retailking", "display_name": "RetailKing", "ticker": "AMZN", "sector": "Consumer", "base_price": 185.00},
    {"id": "brandhouse", "display_name": "BrandHouse", "ticker": "PG", "sector": "Consumer", "base_price": 165.00},
]

SECTOR_MAP = {
    "Tech": ["cloudcorp", "chipmaker"],
    "Energy": ["oilgiant", "greenpower"],
    "Healthcare": ["pharmamax", "bioleap"],
    "Consumer": ["retailking", "brandhouse"],
}


def fetch_real_price(ticker: str) -> float:
    """Fetch real current price from Alpha Vantage. Falls back to base price if API fails."""
    try:
        url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={ticker}&apikey={ALPHA_VANTAGE_KEY}"
        response = requests.get(url, timeout=5)
        data = response.json()
        price = float(data["Global Quote"]["05. price"])
        return price
    except Exception:
        # Return base price as fallback if API fails
        stock = next((s for s in STOCKS if s["ticker"] == ticker), None)
        return stock["base_price"] if stock else 100.0


def fetch_all_prices() -> dict:
    """Fetch prices for all 8 stocks. Called once at game start."""
    prices = {}
    for stock in STOCKS:
        prices[stock["id"]] = fetch_real_price(stock["ticker"])
    return prices


def calculate_new_price(current_price: float, sentiment_score: float) -> float:
    """
    Apply sentiment score to current price.
    sentiment_score is between -1 and 1.
    Max movement is 8% in either direction.
    """
    from app.config import PRICE_MOVEMENT_MULTIPLIER
    change = sentiment_score * PRICE_MOVEMENT_MULTIPLIER
    new_price = current_price * (1 + change)
    return round(new_price, 2)


def get_stock_by_id(stock_id: str) -> dict:
    return next((s for s in STOCKS if s["id"] == stock_id), None)


def get_stocks_by_sector(sector: str) -> list:
    ids = SECTOR_MAP.get(sector, [])
    return [s for s in STOCKS if s["id"] in ids]

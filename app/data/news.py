import requests
from app.config import ALPHA_VANTAGE_KEY

# Fallback headlines if API fails
FALLBACK_HEADLINES = [
    "Federal Reserve raises interest rates by 0.5% to combat inflation",
    "Major oil supply disruption reported in Middle East region",
    "Breakthrough cancer drug receives FDA approval after successful trials",
    "US unemployment rate drops to historic low of 3.2 percent",
    "Global semiconductor shortage expected to last through next year",
    "Consumer confidence index falls sharply amid recession fears",
    "Renewable energy investment hits record high as governments push green agenda",
    "Major retail chains report disappointing holiday season sales figures",
    "Tech giant announces massive layoffs citing economic uncertainty ahead",
    "OPEC agrees to cut oil production by two million barrels per day",
]

SECTOR_HINTS = {
    "Federal Reserve raises interest rates": "Tech",
    "oil supply disruption": "Energy",
    "FDA approval": "Healthcare",
    "unemployment rate": "Consumer",
    "semiconductor shortage": "Tech",
    "consumer confidence": "Consumer",
    "renewable energy": "Energy",
    "retail chains": "Consumer",
    "Tech giant": "Tech",
    "OPEC": "Energy",
}


def fetch_market_news() -> list:
    """
    Fetch real financial headlines from Alpha Vantage.
    Falls back to hardcoded headlines if API fails.
    Returns a list of 10 headline strings.
    """
    try:
        url = f"https://www.alphavantage.co/query?function=NEWS_SENTIMENT&limit=10&apikey={ALPHA_VANTAGE_KEY}"
        response = requests.get(url, timeout=5)
        data = response.json()

        headlines = []
        for item in data.get("feed", [])[:10]:
            headlines.append(item.get("title", ""))

        if len(headlines) >= 5:
            print(f"✅ Fetched {len(headlines)} real headlines from Alpha Vantage")
            return headlines
        else:
            print("⚠️ Not enough headlines from API, using fallback")
            return FALLBACK_HEADLINES

    except Exception as e:
        print(f"⚠️ News API failed ({e}), using fallback headlines")
        return FALLBACK_HEADLINES


def get_correct_sector(headline: str) -> str:
    """
    Returns which sector is most affected by a headline.
    Used to check if player prediction was correct.
    """
    headline_lower = headline.lower()
    for keyword, sector in SECTOR_HINTS.items():
        if keyword.lower() in headline_lower:
            return sector
    return "Tech"  # default
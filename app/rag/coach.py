import chromadb
from chromadb.utils import embedding_functions
from groq import Groq
from app.config import GROQ_API_KEY, GROQ_MODEL
import os

# Initialize Groq client
groq_client = Groq(api_key=GROQ_API_KEY)

# Initialize ChromaDB (runs locally, no external service needed)
chroma_client = chromadb.Client()

# Use sentence transformers for free local embeddings (no API cost)
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

# Global collection variable
principles_collection = None


def load_principles():
    """
    Load principles.txt into ChromaDB.
    Called once when the backend starts.
    """
    global principles_collection

    # Read the principles file
    principles_path = os.path.join(os.path.dirname(__file__), "principles.txt")
    with open(principles_path, "r") as f:
        content = f.read()

    # Split into individual chunks by double newline
    chunks = [chunk.strip() for chunk in content.split("\n\n") if chunk.strip()]

    # Create or get the collection
    try:
        chroma_client.delete_collection("market_principles")
    except Exception:
        pass

    principles_collection = chroma_client.create_collection(
        name="market_principles",
        embedding_function=embedding_fn
    )

    # Add all chunks to the collection
    principles_collection.add(
        documents=chunks,
        ids=[f"principle_{i}" for i in range(len(chunks))]
    )

    print(f"✅ RAG Coach loaded {len(chunks)} market principles into ChromaDB")
    return len(chunks)


def retrieve_relevant_principles(headline: str, n_results: int = 3) -> list:
    """
    Given a news headline, retrieve the most relevant market principles.
    """
    global principles_collection

    if principles_collection is None:
        load_principles()

    results = principles_collection.query(
        query_texts=[headline],
        n_results=n_results
    )

    return results["documents"][0]


def generate_debrief(
    headline: str,
    price_changes: dict,
    player_portfolio_change: float,
    ai_portfolio_change: float,
    player_predicted_correctly: bool
) -> str:
    """
    Generate the post-round coach debrief using RAG.
    
    price_changes: { stock_id: percentage_change }
    player_portfolio_change: float (e.g. +450.00)
    ai_portfolio_change: float (e.g. +820.00)
    """

    # Step 1: Retrieve relevant principles
    relevant_principles = retrieve_relevant_principles(headline)
    principles_text = "\n".join([f"- {p}" for p in relevant_principles])

    # Step 2: Find biggest movers for context
    biggest_gainer = max(price_changes, key=price_changes.get)
    biggest_loser = min(price_changes, key=price_changes.get)
    gainer_pct = round(price_changes[biggest_gainer] * 100, 1)
    loser_pct = round(price_changes[biggest_loser] * 100, 1)

    # Step 3: Build the prompt
    prediction_context = "The player correctly predicted the most affected sector." if player_predicted_correctly else "The player did not correctly predict the most affected sector."

    prompt = f"""You are a friendly but sharp financial coach in a stock market simulation game.

A news event just hit the market. Here is what happened:

NEWS HEADLINE: {headline}

MARKET REACTION:
- Biggest gainer: {biggest_gainer} moved {gainer_pct}%
- Biggest loser: {biggest_loser} moved {loser_pct}%
- Player portfolio changed by: ${player_portfolio_change:+.2f}
- AI portfolio changed by: ${ai_portfolio_change:+.2f}
- {prediction_context}

RELEVANT MARKET PRINCIPLES TO USE IN YOUR EXPLANATION:
{principles_text}

Write a 3-4 sentence debrief that:
1. Explains WHY the market moved the way it did using the principles above
2. Specifically mentions which stocks moved and why
3. Tells the player what they should have done differently if they lost ground
4. Ends with one forward-looking tip for the next round

Be specific, use real financial reasoning, keep it conversational. Do not use bullet points. Write in flowing sentences."""

    # Step 4: Call Groq
    response = groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=300,
        temperature=0.7
    )

    return response.choices[0].message.content


def generate_bridge_advice(
    invests: bool,
    account_type: str,
    tech_allocation: int,
    lessons_learned: list
) -> str:
    """
    Generate personalized post-game financial advice connecting
    game lessons to the player's real financial situation.
    """

    lessons_text = "\n".join([f"- {lesson}" for lesson in lessons_learned])

    if not invests:
        situation = "The player does not currently invest."
    else:
        situation = f"The player invests through a {account_type} and estimates {tech_allocation}% of their portfolio is in Tech stocks."

    prompt = f"""You are a financial literacy coach. A player just finished a stock market simulation game and learned these lessons:

{lessons_text}

PLAYER'S REAL FINANCIAL SITUATION:
{situation}

Write 3-4 paragraphs of personalized advice that:
1. Connects the specific lessons from the game to their real situation
2. Gives them one concrete actionable thing they can check or do this week
3. If they have high Tech allocation and learned about rate risk, warn them specifically
4. If they don't invest yet, encourage them with what they just learned and suggest a simple starting point
5. Keep it encouraging, specific, and practical — not generic

Do not use bullet points. Write in warm, direct paragraphs."""

    response = groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=500,
        temperature=0.7
    )

    return response.choices[0].message.content

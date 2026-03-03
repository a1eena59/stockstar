from dotenv import load_dotenv
import os

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
ALPHA_VANTAGE_KEY = os.getenv("ALPHA_VANTAGE_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Game Configuration
TOTAL_ROUNDS = 5
STARTING_CASH = 10000.0
PRICE_MOVEMENT_MULTIPLIER = 0.08

# Groq Model Configuration
GROQ_MODEL = "llama-3.1-8b-instant"
GROQ_MODEL_ADVANCED = "llama-3.3-70b-versatile"
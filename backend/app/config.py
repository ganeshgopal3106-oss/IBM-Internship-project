import os
from dotenv import load_dotenv

# Load environment variables from a .env file if it exists
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
TMDB_API_KEY = os.getenv("TMDB_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_TIMEOUT_SECONDS = float(os.getenv("OPENAI_TIMEOUT_SECONDS", "45"))
TMDB_TIMEOUT_SECONDS = float(os.getenv("TMDB_TIMEOUT_SECONDS", "8"))
FRONTEND_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

# Server configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# Verify keys are loaded (helpful for debugging)
if not OPENAI_API_KEY:
    print("Warning: OPENAI_API_KEY is not set. OpenAI integrations will not function.")
if not TMDB_API_KEY:
    print("Warning: TMDB_API_KEY is not set. Movie metadata and posters will be limited.")

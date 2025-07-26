import os
from dotenv import load_dotenv

# load .env variables (GOOGLE_API_KEY, etc.)
load_dotenv()

class Config:
    # ─────────────────────────────────────
    # Flask / SQL‑Alchemy
    # ─────────────────────────────────────
    SECRET_KEY = os.getenv("SECRET_KEY", "super‑secret‑dev‑key")

    # change to your Postgres URI if you’re using Postgres
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "sqlite:///intelli_claim.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ─────────────────────────────────────
    # Gemini / Google LLM
    # ─────────────────────────────────────
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")   # already picked up in llm.py

    # ─────────────────────────────────────
    # Upload settings
    # ─────────────────────────────────────
    ALLOWED_EXTENSIONS = {"pdf", "docx", "doc", "txt", "eml"}
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024          # 16 MB

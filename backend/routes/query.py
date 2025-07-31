from flask import Blueprint, request, jsonify
from services.llm import generate_decision
import os
import logging
import google.generativeai as genai
from PyPDF2 import PdfReader

query_bp = Blueprint("query", __name__)

# ──────────────────────────────────────────────
# 🔐 Logging and Config
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

API_KEY = os.getenv("HACKRX_API_KEY")
GOOGLE_KEY = os.getenv("GOOGLE_API_KEY")

genai.configure(api_key=GOOGLE_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

# ──────────────────────────────────────────────
# 📄 Load policy text from local file
def load_policy_from_file():
    try:
        with open("policy.pdf", "rb") as f:
            pdf = PdfReader(f)
            text = ""
            for page in pdf.pages:
                text += page.extract_text() or ""
            return text.strip()
    except Exception as e:
        logger.error(f"Error loading local policy.pdf: {e}")
        return ""

# ──────────────────────────────────────────────
# 🎯 Manual testing endpoint (Optional)
@query_bp.route("/query", methods=["POST"])
def process_query():
    try:
        if not request.is_json:
            return jsonify({"error": "Invalid content type. Expected application/json."}), 400
        data = request.get_json(force=True, silent=True)
        query = data.get("query", "").strip()
        if not query:
            return jsonify({"error": "Query field is required."}), 400
        result = generate_decision(query)
        return jsonify(result), 200
    except Exception as e:
        logger.exception("Error in /query")
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

# ──────────────────────────────────────────────
# ✅ HackRx-Compliant Endpoint
@query_bp.route("/hackrx/run", methods=["POST"])
def hackrx_run():
    try:
        # 🔐 Validate API key
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer ") or auth_header.split(" ")[1] != API_KEY:
            return jsonify({"error": "Unauthorized. Invalid or missing API key."}), 401

        # 📥 Parse request
        data = request.get_json()
        questions = data.get("questions", [])

        if not questions:
            return jsonify({"error": "Missing 'questions' list."}), 400

        # 📄 Load static policy document
        policy_text = load_policy_from_file()
        if not policy_text:
            return jsonify({"error": "Failed to load policy text from local file."}), 500

        # 🧠 Generate answers
        answers = []
        for question in questions:
            prompt = f"""
You are a health insurance expert. Based on the policy text below, answer the user's question.

<Policy>
{policy_text}
</Policy>

<Question>
{question}
</Question>

Provide a concise 1-2 line answer. Avoid generic disclaimers.
"""
            try:
                response = model.generate_content(prompt)
                answers.append(response.text.strip())
            except Exception as e:
                logger.error(f"Gemini error: {e}")
                answers.append("Unable to generate response.")

        return jsonify({"answers": answers}), 200

    except Exception as e:
        logger.exception("Error in /hackrx/run")
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

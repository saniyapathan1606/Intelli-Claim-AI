from flask import Blueprint, request, jsonify
from services.llm import generate_decision
import os
import logging
import google.generativeai as genai
import requests
from PyPDF2 import PdfReader
from io import BytesIO

query_bp = Blueprint("query", __name__)

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load keys from environment
API_KEY = os.getenv("HACKRX_API_KEY")
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

# ──────────────────────────────────────────────
# 📄 Extract PDF Text from URL
def extract_text_from_pdf_url(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        pdf = PdfReader(BytesIO(response.content))
        text = ""
        for page in pdf.pages:
            text += page.extract_text() or ""
        return text.strip()
    except Exception as e:
        logger.error(f"Error extracting PDF: {e}")
        return ""

# ──────────────────────────────────────────────
# 🎯 Manual Query Endpoint (Optional)
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
        # Auth check
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer ") or auth_header.split(" ")[1] != API_KEY:
            return jsonify({"error": "Unauthorized. Invalid or missing API key."}), 401

        # Parse input
        data = request.get_json()
        doc_url = data.get("documents")
        questions = data.get("questions", [])

        if not doc_url or not questions:
            return jsonify({"error": "Missing 'documents' URL or 'questions' list."}), 400

        # Extract policy text
        policy_text = extract_text_from_pdf_url(doc_url)
        if not policy_text:
            return jsonify({"error": "Could not extract text from provided PDF."}), 500

        # Generate answers
        answers = []
        for question in questions:
            prompt = f"""
You are a health insurance policy analyst. Based on the policy document below, answer the user's question.

<Policy>
{policy_text}
</Policy>

<Question>
{question}
</Question>

Provide your answer in 1-2 sentences. Be clear and direct. Do not add disclaimers.
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

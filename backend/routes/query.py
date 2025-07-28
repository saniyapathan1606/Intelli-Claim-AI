from flask import Blueprint, request, jsonify
from services.llm import generate_decision
import logging

query_bp = Blueprint("query", __name__)

# Optional: configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@query_bp.route("/query", methods=["POST"])
def process_query():
    try:
        if not request.is_json:
            return jsonify({
                "error": "Invalid content type. Expected application/json."
            }), 400

        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({
                "error": "Invalid or missing JSON in request body."
            }), 400

        query = data.get("query", "").strip()

        if not query:
            return jsonify({
                "error": "Query field is required and cannot be empty."
            }), 400

        logger.info(f"Received query: {query}")

        # 🔍 Call Gemini decision engine
        decision = generate_decision(query)

        return jsonify(decision), 200

    except Exception as e:
        logger.exception("Error processing query")
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500

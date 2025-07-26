from flask import Blueprint, request, jsonify
from services.llm import generate_decision

query_bp = Blueprint("query", __name__)

@query_bp.route("/query", methods=["POST"])
def process_query():
    try:
        data = request.get_json()
        query = data.get("query", "")

        if not query:
            return jsonify({"error": "Query is required"}), 400

        # Call the Gemini-based decision engine
        decision = generate_decision(query)

        return jsonify(decision), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

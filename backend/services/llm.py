import os
import re
import google.generativeai as genai
from models.document_model import Document
from database import db

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

def get_all_policy_text():
    # Get the most recent document
    document = Document.query.order_by(Document.created_at.desc()).first()
    if document and document.extracted_text:
        return document.extracted_text
    else:
        return "No extracted policy text found."


def parse_response(response_text):
    # Extract decision (Approved/Rejected)
    decision_match = re.search(r"\*\*Claim: (APPROVED|REJECTED)\*\*", response_text, re.IGNORECASE)
    decision = decision_match.group(1).lower() if decision_match else "unknown"

    # Extract reason/justification
    justification = response_text.strip()

    # Extract relevant clauses (between **Relevant Clauses:** and next section)
    relevant_clauses_match = re.search(r"\*\*Relevant Clauses:\*\*(.*?)(?:\n\n|\Z)", response_text, re.DOTALL | re.IGNORECASE)
    relevant_clauses = []
    if relevant_clauses_match:
        clause_text = relevant_clauses_match.group(1).strip()
        relevant_clauses = [clause.strip("* ").strip() for clause in clause_text.split("\n") if clause.strip()]

    # Extract estimated amount
    amount_match = re.search(r"\*\*Estimated Amount:\*\*\s*\$?([\d,\.]+)", response_text)
    amount = float(amount_match.group(1).replace(",", "")) if amount_match else 0.0

    # Extract confidence
    confidence_match = re.search(r"\*\*Confidence:\*\*\s*(\w+)", response_text)
    confidence_str = confidence_match.group(1).lower() if confidence_match else "medium"
    confidence_map = {"low": 0.4, "medium": 0.6, "high": 0.75}
    confidence = confidence_map.get(confidence_str, 0.6)

    return {
        "decision": decision,
        "justification": justification,
        "relevant_clauses": relevant_clauses,
        "confidence": confidence,
        "amount": amount
    }


def generate_decision(query):
    prompt = f"""
    Given this insurance policy:
    <POLICY_TEXT>
    {get_all_policy_text()}
    </POLICY_TEXT>

    And this user query:
    {query}

    Determine whether the claim is APPROVED or REJECTED, and provide:
    - Reason
    - Relevant clauses
    - Confidence
    - Estimated amount
    """

    response = model.generate_content(prompt)
    return parse_response(response.text)

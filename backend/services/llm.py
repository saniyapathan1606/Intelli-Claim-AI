import os
import re
from datetime import datetime
import google.generativeai as genai
from models.document_model import Document
from database import db
from models.clause_model import Clause

# 🔐 Configure Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")  # You may switch to gemini-1.5-pro if needed

# ✅ Get trimmed policy text for faster LLM processing
def get_all_policy_text():
    document = Document.query.order_by(Document.created_at.desc()).first()
    if not document or not document.extracted_text:
        return "No extracted policy text found."

    raw_text = document.extracted_text
    important_sections = []
    for section_title in ["SECTION B", "Waiting Period", "Coverage", "Exclusions"]:
        match = re.search(rf"{section_title}.*?(?=SECTION|\Z)", raw_text, re.DOTALL | re.IGNORECASE)
        if match:
            important_sections.append(match.group().strip())

    return "\n\n".join(important_sections) if important_sections else raw_text


# ✅ Parse Gemini's response into structured format
def parse_response(response_text):
    decision_match = re.search(r"\*\*Claim:\*\*\s*(APPROVED|REJECTED)", response_text, re.IGNORECASE)
    decision = decision_match.group(1).capitalize() if decision_match else "Unknown"

    reason = re.search(r"\*\*Reason:\*\*\s*(.+?)(?=\*\*|$)", response_text, re.DOTALL)
    reason_text = reason.group(1).strip() if reason else "No specific reason provided."

    clauses_match = re.search(r"\*\*Relevant Clauses:\*\*(.+?)(?=\*\*|$)", response_text, re.DOTALL)
    clause_lines = []
    if clauses_match:
        clause_lines = [line.strip("*\u2022- ").strip() for line in clauses_match.group(1).strip().splitlines() if line.strip()]

    amount_match = re.search(r"\*\*Estimated Amount:\*\*\s*\u20b9?([\d,.]+)", response_text)
    amount = float(amount_match.group(1).replace(",", "")) if amount_match else 0.0

    confidence_match = re.search(r"\*\*Confidence:\*\*\s*(\w+)", response_text)
    confidence_str = confidence_match.group(1).capitalize() if confidence_match else "Medium"
    confidence_map = {"Low": 0.4, "Medium": 0.6, "High": 0.95}
    confidence = confidence_map.get(confidence_str, 0.6)

    structured_clauses = match_clauses_to_db(clause_lines)
    justification = f"""
Decision: The claim is **{decision}**.

Reasoning: {reason_text}

Clause Analysis: {"Relevant clauses were identified and analyzed." if clause_lines else "No relevant clauses were found."}

Conclusion: Based on the above reasoning and policy wording, the claim has been {decision.lower()} with a confidence level of {confidence_str}.

Estimated Payout: ₹{int(amount):,} (if applicable)
""".strip()

    extracted_info = extract_structured_info(response_text)

    return {
        "decision": {
            "decision": decision.lower(),
            "justification": justification,
            "confidence": confidence,
            "amount": amount
        },
        "timestamp": datetime.now().isoformat(),
        "extractedInfo": extracted_info,
        "relevantClauses": structured_clauses
    }


# 🧠 Extract info like Age, Gender, Procedure, Location

def extract_structured_info(text):
    def extract(pattern):
        match = re.search(pattern, text, re.IGNORECASE)
        return match.group(1).strip() if match else "N/A"

    return {
        "age": extract(r"\*\*Age:\*\*\s*(.+)"),
        "gender": extract(r"\*\*Gender:\*\*\s*(.+)"),
        "procedure": extract(r"\*\*Procedure:\*\*\s*(.+)"),
        "location": extract(r"\*\*Location:\*\*\s*(.+)"),
        "policyAge": extract(r"\*\*Policy Age:\*\*\s*(.+)")
    }


# 🔍 Match Gemini’s clause text to your clause DB
def match_clauses_to_db(text_clauses):
    all_clauses = Clause.query.all()
    structured = []

    for txt in text_clauses:
        best_match = None
        best_score = 0

        for clause in all_clauses:
            if clause.content:
                common = set(txt.lower().split()).intersection(set(clause.content.lower().split()))
                score = len(common) / max(len(txt.split()), 1)
                if score > best_score:
                    best_score = score
                    best_match = clause

        if best_match and best_score > 0.3:
            structured.append({
                "clauseId": best_match.clause_id,
                "text": best_match.content[:300] + "...",
                "page": best_match.page_number,
                "document": Document.query.get(best_match.document_id).name if best_match.document_id else "Unknown",
                "relevanceScore": round(best_score, 2)
            })
        else:
            structured.append({
                "clauseId": "N/A",
                "text": txt,
                "page": None,
                "document": "Not found",
                "relevanceScore": 0.0
            })

    return structured


# 🚀 Generate Decision Using Gemini
def generate_decision(query):
    policy_text = get_all_policy_text()
    prompt = f"""
You are a health insurance expert. Based on the following policy and user query, determine:

**Claim:** APPROVED or REJECTED  
**Reason:** Brief reasoning  
**Relevant Clauses:** Mention clause references  
**Confidence:** Low / Medium / High  
**Estimated Amount:** ₹XXXX  
**Age:**  
**Gender:**  
**Procedure:**  
**Location:**  
**Policy Age:**  

<Policy>
{policy_text}
</Policy>

<User Query>
{query}
</User Query>
"""

    response = model.generate_content(prompt)
    return parse_response(response.text)

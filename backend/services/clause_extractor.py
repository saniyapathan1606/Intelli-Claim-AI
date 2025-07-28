import fitz  # PyMuPDF

def extract_text_from_pdf(file):
    try:
        file.seek(0)
        doc = fitz.open(stream=file.read(), filetype="pdf")

        if doc.page_count == 0:
            return "", {
                "pages": 0,
                "confidence": 0.0,
                "language": "unknown",
                "processingTime": "0s"
            }

        text = ""
        for page in doc:
            page_text = page.get_text("text")  # Use "text" mode for more structure
            text += page_text + "\n"

        metadata = {
            "pages": doc.page_count,
            "confidence": 0.97 if len(text.strip()) > 50 else 0.3,  # Dynamically set confidence
            "language": "en",  # Optional: Use langdetect
            "processingTime": f"{round(doc.page_count * 0.3, 1)}s"
        }
        return text.strip(), metadata

    except Exception as e:
        print(f"[ERROR] PDF extraction failed: {e}")
        return "", {
            "pages": 0,
            "confidence": 0.0,
            "language": "unknown",
            "processingTime": "0s",
            "error": str(e)
        }
import re

def extract_clauses_from_text(text):
    pattern = r"(?:(Section|Clause)\s+\d+(?:\.\d+)*[:.\s])|(^[A-Za-z\s]+:)"
    matches = list(re.finditer(pattern, text, re.MULTILINE))

    clauses = []
    for i, match in enumerate(matches):
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        clause_text = text[start:end].strip()
        heading = match.group().strip()
        if clause_text and heading:
            clauses.append({
                "clause_id": f"C{i+1:03}",
                "title": heading.replace(":", "").strip(),
                "text": clause_text,
                "keywords": [],
                "page": None
            })
    return clauses

    # Match common clause headings
    pattern = r"(Section\s+\d+(?:\.\d+)?[:.\s]|Clause\s+\d+(?:\.\d+)*[:.\s])"
    matches = list(re.finditer(pattern, text, re.IGNORECASE))

    clauses = []

    if not matches:
        print("[INFO] No clause patterns found.")
        return []

    for i, match in enumerate(matches):
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        clause_text = text[start:end].strip()
        heading = match.group().strip()

        # Skip small junk text (e.g., less than 10 words)
        if len(clause_text.split()) < 5:
            continue

        clause = {
            "clause_id": f"C{i+1:03}",
            "title": heading,
            "text": clause_text,
            "keywords": [],      # Optional NLP later
            "page": None         # Optional: add page logic
        }
        clauses.append(clause)

    return clauses

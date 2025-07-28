from flask import Blueprint, request, jsonify
import os

from services.clause_extractor import extract_clauses_from_text
from .document_parser import (
    extract_text_from_pdf,
    extract_text_from_docx,
    extract_text_from_msg,
    extract_text_from_eml,
)

from models.document_model import insert_document, get_document_by_id, serialize_document
from models.clause_model import insert_clause

upload_bp = Blueprint('upload', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'msg', 'eml'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@upload_bp.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = file.filename
        ext = filename.rsplit('.', 1)[1].lower()

        file_content = file.read()
        file.seek(0)  # Reset stream for parsers

        # ✨ Choose extractor based on file type
        if ext == "pdf":
            extracted_text, metadata = extract_text_from_pdf(file)
        elif ext == "docx":
            extracted_text = extract_text_from_docx(file)
            metadata = {"source": "docx", "confidence": 0.95}
        elif ext == "msg":
            extracted_text = extract_text_from_msg(file)
            metadata = {"source": "email-msg", "confidence": 0.94}
        elif ext == "eml":
            extracted_text = extract_text_from_eml(file)
            metadata = {"source": "email-eml", "confidence": 0.94}
        else:
            return jsonify({"error": "Unsupported file format"}), 400

        # ✅ Save document in DB
        doc_id = insert_document(
            name=filename,
            file_type=file.content_type,
            size=len(file_content),
            extracted_text=extracted_text,
            metadata=metadata,
        )

        # ✅ Extract clauses from text
        clauses = extract_clauses_from_text(extracted_text)

        # ✅ Insert clauses into DB
        for clause in clauses:
            insert_clause(
                clause_id=clause.get("clause_id"),
                document_id=doc_id,
                content=clause.get("text"),
                title=clause.get("title"),
                page_number=clause.get("page"),
                keywords=clause.get("keywords", []),
            )

        # ✅ Return the document object
        doc = get_document_by_id(doc_id)
        return jsonify(serialize_document(doc)), 200

    return jsonify({"error": "Invalid file format"}), 400

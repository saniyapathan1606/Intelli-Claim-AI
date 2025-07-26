from flask import Blueprint, jsonify, abort
from models.document_model import Document
from database import db

viewer_bp = Blueprint("viewer", __name__)

# ────────────────────────────────────────────────
# List all processed documents
# ────────────────────────────────────────────────
@viewer_bp.route("/documents", methods=["GET"])
def list_documents():
    docs = Document.query.order_by(Document.created_at.desc()).all()
    out = [
        {
            "id": d.id,
            "name": d.name,
            "type": d.type,
            "size": d.size,
            "uploadedAt": d.uploaded_at.isoformat(),
            "status": d.status,
            "metadata": d.doc_metadata or {},
            "pages": (d.doc_metadata or {}).get("pages"),
        }
        for d in docs
    ]
    return jsonify(out)

# ────────────────────────────────────────────────
# Fetch full content for a single document
# ────────────────────────────────────────────────
@viewer_bp.route("/documents/<int:doc_id>", methods=["GET"])
def get_document(doc_id: int):
    doc = Document.query.get(doc_id)
    if not doc:
        abort(404, description="Document not found")

    out = {
        "id": doc.id,
        "name": doc.name,
        "type": doc.type,
        "size": doc.size,
        "uploadedAt": doc.uploaded_at.isoformat(),
        "status": doc.status,
        "metadata": doc.doc_metadata or {},
        "extractedText": doc.extracted_text,
    }
    return jsonify(out)

from datetime import datetime
from database import db

class Document(db.Model):
    __tablename__ = 'documents'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(100), nullable=False)
    size = db.Column(db.Integer, nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='processed')
    extracted_text = db.Column(db.Text)
    doc_metadata = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Document {self.name}>"

# ✅ Insert a new document
def insert_document(name, file_type, size, extracted_text, metadata=None):
    new_doc = Document(
        name=name,
        type=file_type,
        size=size,
        extracted_text=extracted_text,
        doc_metadata=metadata or {},
        uploaded_at=datetime.utcnow(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.session.add(new_doc)
    db.session.commit()
    return new_doc.id

# ✅ Fetch document by ID
def get_document_by_id(doc_id):
    return Document.query.get(doc_id)

# ✅ Serialize document to JSON
def serialize_document(doc):
    return {
        "id": doc.id,
        "name": doc.name,
        "type": doc.type,
        "size": doc.size,
        "uploadedAt": doc.uploaded_at.isoformat() if doc.uploaded_at else "",
        "status": doc.status,
        "extractedText": doc.extracted_text,
        "analysis": f"Structured analysis for: {doc.name}",  # Dummy text for now
        "metadata": {
            "pages": doc.doc_metadata.get("pages", 3),
            "language": doc.doc_metadata.get("language", "en"),
            "confidence": doc.doc_metadata.get("confidence", 0.97),
            "wordCount": len(doc.extracted_text.split()) if doc.extracted_text else 0,
            "processingTime": doc.doc_metadata.get("processingTime", "1.2s"),
        }
    }

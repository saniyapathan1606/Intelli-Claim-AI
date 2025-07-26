from datetime import datetime
from database import db

class Document(db.Model):
    __tablename__ = 'documents'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(100), nullable=False)
    size = db.Column(db.Integer, nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='processing')
    extracted_text = db.Column(db.Text)
    doc_metadata = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Document {self.name}>"

# ✅ Utility function to insert a new document
def insert_document(name, file_type, size, extracted_text, metadata=None):
    new_doc = Document(
        name=name,
        type=file_type,
        size=size,
        extracted_text=extracted_text,
        doc_metadata=metadata or {},  # ✅ Use the argument passed
        uploaded_at=datetime.utcnow(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.session.add(new_doc)
    db.session.commit()
    return new_doc.id


from datetime import datetime
from database import db
from sqlalchemy.dialects.sqlite import JSON  # 👈 for SQLite

class Clause(db.Model):
    __tablename__ = 'clauses'

    id = db.Column(db.Integer, primary_key=True)
    clause_id = db.Column(db.String(20), unique=True, nullable=False)
    document_id = db.Column(db.Integer, db.ForeignKey('documents.id'), nullable=True)
    title = db.Column(db.String(255))
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100))
    page_number = db.Column(db.Integer)
    relevance_keywords = db.Column(JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Clause {self.clause_id}>"

# ✅ Insert clause utility
import uuid
from sqlalchemy.exc import IntegrityError

def insert_clause(clause_id, document_id, content, title=None, category=None, page_number=None, keywords=None):
    from models.clause_model import Clause

    # Check if clause_id already exists
    existing = Clause.query.filter_by(clause_id=clause_id).first()
    if existing:
        print(f"⚠️ Clause ID '{clause_id}' already exists. Skipping insert.")
        return None  # You can also raise a custom error or log instead

    try:
        clause = Clause(
            clause_id=clause_id,
            document_id=document_id,
            content=content,
            title=title,
            category=category,
            page_number=page_number,
            relevance_keywords=keywords or [],
            created_at=datetime.utcnow()
        )
        db.session.add(clause)
        db.session.commit()
        print(f"✅ Inserted clause {clause_id}")
        return clause.id
    except IntegrityError as e:
        db.session.rollback()
        print(f"🚨 IntegrityError while inserting clause '{clause_id}': {str(e)}")
        return None
    except Exception as e:
        db.session.rollback()
        print(f"🔥 Unexpected error while inserting clause '{clause_id}': {str(e)}")
        return None

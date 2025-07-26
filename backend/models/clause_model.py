from datetime import datetime
from database import db

class Clause(db.Model):
    __tablename__ = 'clauses'

    id = db.Column(db.Integer, primary_key=True)
    clause_id = db.Column(db.String(20), unique=True, nullable=False)
    document_id = db.Column(db.Integer, db.ForeignKey('documents.id'), nullable=True)
    title = db.Column(db.String(255))
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100))
    page_number = db.Column(db.Integer)
    relevance_keywords = db.Column(db.ARRAY(db.Text))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Clause {self.clause_id}>"

# ✅ Insert clause utility
def insert_clause(clause_id, document_id, content, title=None, category=None, page_number=None, keywords=None):
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
    return clause.id

from datetime import datetime
from database import db

class Decision(db.Model):
    __tablename__ = 'decisions'

    id = db.Column(db.Integer, primary_key=True)
    query = db.Column(db.Text, nullable=False)
    parsed_query = db.Column(db.JSON)
    decision = db.Column(db.String(20), nullable=False)  # 'approved' or 'rejected'
    confidence = db.Column(db.Numeric(3, 2))
    amount = db.Column(db.Integer, default=0)
    justification = db.Column(db.Text)
    relevant_clauses = db.Column(db.JSON)
    processing_time = db.Column(db.String(10))
    documents_searched = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Decision {self.id} - {self.decision}>"

# ✅ Insert decision utility
def insert_decision(query, parsed_query, decision, confidence, amount, justification, relevant_clauses, processing_time, documents_searched):
    dec = Decision(
        query=query,
        parsed_query=parsed_query,
        decision=decision,
        confidence=confidence,
        amount=amount,
        justification=justification,
        relevant_clauses=relevant_clauses,
        processing_time=processing_time,
        documents_searched=documents_searched,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.session.add(dec)
    db.session.commit()
    return dec.id

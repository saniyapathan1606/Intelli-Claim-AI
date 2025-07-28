from database import db
from models.document_model import Document
from flask import Flask

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///intelli_claim.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)


with app.app_context():
    try:
        num_deleted = Document.query.delete()
        db.session.commit()
        print(f"✅ Successfully deleted {num_deleted} records from 'documents' table.")
    except Exception as e:
        db.session.rollback()
        print(f"❌ Failed to clear 'documents' table: {e}")

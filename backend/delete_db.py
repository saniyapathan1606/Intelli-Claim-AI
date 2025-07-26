from database import db
from models.document_model import Document
from flask import Flask

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///intelli_claim.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    doc_id = 9 # 👈 Change this to the ID of the document you want to delete
    doc = Document.query.get(doc_id)

    if doc:
        db.session.delete(doc)
        db.session.commit()
        print(f"✅ Document ID {doc_id} deleted successfully.")
    else:
        print(f"⚠️ Document with ID {doc_id} not found.")

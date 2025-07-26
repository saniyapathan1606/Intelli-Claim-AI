# check_db.py
from database import db
from models.document_model import Document
from flask import Flask

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///intelli_claim.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    docs = Document.query.all()
    for doc in docs:
        print(doc.name, doc.size, doc.uploaded_at)

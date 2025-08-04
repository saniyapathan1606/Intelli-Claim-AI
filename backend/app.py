from flask import Flask
from flask_cors import CORS
from database import db
from routes.upload import upload_bp
from routes.query import query_bp
from routes.viewer import viewer_bp

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///intelli_claim.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

app.register_blueprint(upload_bp, url_prefix="/api")
app.register_blueprint(query_bp, url_prefix="/api")
app.register_blueprint(viewer_bp, url_prefix="/api")

@app.route('/')
def index():
    return "Backend Running Successfully ✅"

with app.app_context():
    db.create_all()
    print("✅ Database tables created (if not existing).")

# ✅ FIX: Correct run block for Render
if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 10000))
    app.run(debug=False, host="0.0.0.0", port=port)

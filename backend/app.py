from flask import Flask
from flask_cors import CORS
from database import db
from routes.upload import upload_bp
from routes.query import query_bp
from routes.viewer import viewer_bp  # ✅ Make sure filename is viewer.py

app = Flask(__name__)

# ✅ Enable CORS before registering blueprints
CORS(app, supports_credentials=True)

# ✅ Configure Database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///intelli_claim.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# ✅ Initialize DB
db.init_app(app)

# ✅ Register Blueprints
app.register_blueprint(upload_bp, url_prefix="/api")
app.register_blueprint(query_bp, url_prefix="/api")
app.register_blueprint(viewer_bp, url_prefix="/api")  # viewer endpoints

# ✅ Health Check
@app.route('/')
def index():
    return "Backend Running Successfully ✅"

# ✅ Create all tables if not present
with app.app_context():
    db.create_all()
    print("✅ Database tables created (if not existing).")

# ✅ Run the app
if __name__ == "__main__":
    app.run(debug=True)

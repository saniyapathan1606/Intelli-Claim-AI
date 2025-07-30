# 🧠 Intelli-Claim AI — Health Insurance Claim Decision System

Intelli-Claim AI is an intelligent health insurance claim assessment system powered by LLMs (Gemini). It evaluates user queries (like procedures, age, policy details) against the policy document to determine whether the claim is **Approved** or **Rejected**, along with a detailed justification, relevant clauses, and confidence score.

---

## 📁 Project Structure

```
.
├── backend/            # Flask-based backend with Gemini integration
│   ├── app.py
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── database.py
│   └── requirements.txt
│
├── frontend/           # Frontend (React or other framework)
│   ├── public/
│   └── src/
│
├── README.md
└── .gitignore
```

---

## ⚙️ Backend — API Server (Flask)

### 🔗 **Main API Endpoint**

```
POST /api/query
Content-Type: application/json
```

### 📤 Sample cURL Request

```bash
curl -X POST http://localhost:5000/api/query \
     -H "Content-Type: application/json" \
     -d '{"query": "46-year-old male, knee surgery in Pune, 3-month-old insurance policy"}'
```

### 📥 Sample Response

```json
{
  "decision": {
    "decision": "rejected",
    "justification": "Decision: The claim is rejected...\nReasoning: Not covered under waiting period...",
    "confidence": 0.6,
    "amount": 0
  },
  "timestamp": "2025-07-30T15:32:25",
  "extractedInfo": {
    "age": "46",
    "gender": "Male",
    "procedure": "Knee surgery",
    "location": "Pune",
    "policyAge": "3 months"
  },
  "relevantClauses": [
    {
      "clauseId": "C154",
      "text": "Waiting period for orthopedic surgery is 12 months...",
      "page": 4,
      "document": "PolicyWordings.pdf",
      "relevanceScore": 0.74
    }
  ]
}
```

---

## 🚀 Run Locally

### 🔧 Backend (Flask)

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 🌐 Frontend

*(Add your frontend instructions here)*

---

## 🔐 API Key Setup (Gemini)

Create a `.env` file in the root or `backend/` folder:

```
GOOGLE_API_KEY=your_gemini_api_key_here
```

---

## 🧠 Powered By

* Google Gemini API (LLM)
* Flask
* SQLite
* SQLAlchemy

---

## 🛆 Hosting Plan

* **Backend**: [Render](https://render.com/)
* **Frontend**: [Vercel](https://vercel.com/) *(planned)*

---

## 📋 Submission Guidelines

* ✅ API accepts `POST` requests in cURL format
* ✅ Response is in JSON with decision, clauses, justification
* ✅ Clean and modular code
* ✅ Updated `requirements.txt` in `backend/`

---

## 👤 Author

**Saniya Pathan** and **Srushti Lakare**

> Final Year Students | HealthTech AI Enthusiasts


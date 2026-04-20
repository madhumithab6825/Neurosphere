# 🧠 NeuroSphere AI — Multi-Agent RAG System

A production-ready multi-agent AI system that autonomously thinks, plans, retrieves, and responds using a ReAct (Reasoning + Acting) loop.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.12-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)

---

## 🚀 What It Does

- 📄 Ask questions from uploaded documents (PDF, DOCX, TXT)
- 📊 Analyze CSV and Excel datasets with natural language
- 🖼️ Extract and understand text from images using OCR
- 🌐 Scrape and query any website by pasting a URL
- 💬 Answer general knowledge questions with LLM fallback
- 🎙️ Voice input (STT) and voice output (TTS)
- 💡 Remembers past conversations per user
- ⚡ Response styles — brief, bullets, paragraph, detailed

---

## 🧠 How It Works

```
User Query
    ↓
ReAct Agent — Think → Act → Observe → Repeat
    ↓
Router — detects intent automatically
    ↓
RAG / Web / OCR / Data / Chat Tool
    ↓
Memory Context injected
    ↓
Groq LLM generates final answer
    ↓
Response formatted by user preference
    ↓
Saved to MongoDB memory
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, Tailwind CSS, TypeScript |
| Backend | FastAPI, Python 3.12 |
| LLM | Groq — LLaMA 3.3 70B |
| Vector DB | Qdrant Cloud |
| Database | MongoDB Atlas |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) |
| Auth | JWT + bcrypt |
| File Storage | AWS S3 |
| OCR | EasyOCR |
| Data Analysis | Pandas |
| Web Scraping | BeautifulSoup4 |
| Deploy | Railway + Vercel |

---

## 📁 Project Structure

```
neurosphere/
├── backend/
│   ├── agents/
│   │   ├── react_agent.py       # Think→Act→Observe loop
│   │   ├── rag_agent.py         # document search
│   │   ├── web_agent.py         # URL scraping
│   │   ├── ocr_agent.py         # image OCR
│   │   ├── data_agent.py        # CSV/Excel analysis
│   │   └── router_agent.py      # autonomous tool selection
│   ├── services/
│   │   ├── orchestrator.py      # ties all agents together
│   │   ├── embedding_service.py # text → vectors
│   │   ├── retrieval_service.py # semantic search + MMR
│   │   ├── chunk_service.py     # semantic chunking
│   │   ├── memory_service.py    # per-user memory
│   │   └── response_formatter.py
│   ├── auth/                    # JWT register/login
│   ├── database/                # MongoDB + Qdrant
│   └── models/                  # chat, preferences
└── frontend/
    ├── app/                     # Next.js pages
    └── components/              # UI components
```

---

## ⚙️ Local Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Copy `backend/.env.example` to `backend/.env` and fill in your values:
```
MONGO_URI=
MONGO_DB_NAME=neurosphere
GROQ_API_KEY=
QDRANT_URL=
QDRANT_API_KEY=
QDRANT_COLLECTION=neurosphere_vectors
JWT_SECRET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
S3_BUCKET_NAME=
```

---

## 🌐 Deployment

- Backend → [Railway](https://railway.app)
- Frontend → [Vercel](https://vercel.com)
- Database → [MongoDB Atlas](https://cloud.mongodb.com)
- Vectors → [Qdrant Cloud](https://cloud.qdrant.io)
- Files → [AWS S3](https://aws.amazon.com/s3)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 👤 Author

Made by **Madhumitha**

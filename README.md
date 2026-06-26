# CycleWise (CyclePred)

A full-stack menstrual cycle tracking and PCOS screening web application.

## Stack

- **Frontend:** React + Vite (`frontend/cyclewise-frontend`)
- **Backend:** FastAPI + MongoDB Atlas + scikit-learn (`backend`)

## Project structure

```
cyclepred/
├── backend/              # FastAPI app, ML models, routes
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   └── ml/models/        # trained .joblib models
└── frontend/
    └── cyclewise-frontend/
        ├── src/
        ├── package.json
        └── .env.example
```

## Local setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # fill in real values
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend/cyclewise-frontend
npm install
cp .env.example .env       # fill in real values
npm run dev
```

## Environment variables

**Backend (`backend/.env`):**
- `MONGODB_URL` – MongoDB Atlas connection string
- `JWT_SECRET` – secret for signing auth tokens
- `JWT_ALGORITHM`, `JWT_EXPIRE_MINUTES`
- `GEMINI_API_KEY` – Gemini API key
- `FRONTEND_ORIGINS` – comma-separated list of allowed CORS origins in production

**Frontend (`frontend/cyclewise-frontend/.env`):**
- `VITE_API_URL` – base URL of the backend API

## Deployment

Deployed on [Render](https://render.com) — backend as a Web Service, frontend as a Static Site.

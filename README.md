# SkillMind AI 🧠

> AI-powered personalized learning, skill intelligence, and career development platform.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/skillmind-ai)

---

## Project Structure

```
skillmind-ai/
├── frontend/          ← React + Vite + TypeScript (Vercel)
│   ├── src/
│   │   ├── App.tsx       ← Main app (all pages)
│   │   ├── AuthPage.tsx  ← Login / Register UI
│   │   ├── main.tsx      ← Entry point with auth guard
│   │   └── style.css     ← Design tokens & component styles
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vercel.json
│
├── backend/           ← FastAPI + SQLAlchemy + SQLite (Render/Railway)
│   ├── app/
│   │   ├── main.py       ← API routes
│   │   ├── models.py     ← DB models (User, Learner, Skills, Jobs…)
│   │   ├── seed.py       ← Demo data seeder
│   │   ├── db.py         ← SQLAlchemy engine
│   │   ├── catalog.py    ← Skills, roles, MCQ catalog
│   │   ├── routers/
│   │   │   └── auth.py   ← JWT auth (register, login, /me)
│   │   └── agents/
│   │       └── core.py   ← Multi-agent orchestrator
│   ├── requirements.txt
│   └── Dockerfile
│
├── package.json       ← Root scripts
├── vercel.json        ← Vercel frontend deployment config
├── .gitignore
└── README.md
```

---

## ✨ Features

- 🔐 **JWT Authentication** — Register / Login as Learner or Recruiter
- 🎯 **AI Career Matching** — Weighted skill-gap analysis against 20+ roles
- 🗺️ **Adaptive Roadmaps** — Dependency-ordered, phased learning plans
- 📊 **Skill Analytics** — Radar chart, proficiency scores, gap cards
- 🏔️ **Learning Journey** — Gamified mountain UI with XP milestones
- 🤖 **AI Mentor Chat** — Context-aware career guidance
- 💼 **Recruiter Portal** — Job management, candidate pipeline
- 🌙 **Dark / Light Mode** — Full theme support

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+

### 1. Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Seed demo data (creates demo@learner.com / demo1234)
python -m app.seed

# Start API server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend

# Install packages
npm install

# Start dev server
npm run dev
```

App: http://localhost:5173

---

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 🎓 Learner | `demo@learner.com` | `demo1234` |
| 💼 Recruiter | `recruiter@demo.com` | `demo1234` |

---

## 🌐 Deploy to Vercel (Frontend)

1. Push to GitHub (see below)
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. Set **Root Directory** to `frontend`
4. Add environment variable: `VITE_API_URL=https://your-backend-url.com`
5. Click **Deploy**

## 🖥️ Deploy Backend (Render.com)

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo
3. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
4. Add env var `JWT_SECRET=your-strong-secret-here`

---

## 🔐 Auth API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login, get JWT |
| GET | `/auth/me` | Get current user |

---

## 📦 Push to GitHub

```bash
cd skillmind-ai

git init
git add .
git commit -m "feat: SkillMind AI — full stack with JWT auth"

# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/skillmind-ai.git
git branch -M main
git push -u origin main
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Recharts, Lucide |
| Backend | FastAPI, SQLAlchemy, Pydantic, Python 3.11 |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT (stdlib, no external deps) |
| Deploy | Vercel (frontend) + Render (backend) |

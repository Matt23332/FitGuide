# FitGuide AI — Setup Guide

A personalized fitness and nutrition assistant powered by Claude AI.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Auth | Supabase Auth |
| AI | Anthropic Claude API |
| Nutrition API | Nutritionix |
| Exercise API | ExerciseDB |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## Prerequisites

- Node.js 18+
- npm or pnpm
- A Supabase account (free tier works)
- An Anthropic API key
- A Nutritionix API key (free tier)

---

## 1. Clone & Install

```bash
git clone https://github.com/yourname/fitguide-ai.git
cd fitguide-ai

# Install frontend deps
cd frontend && npm install

# Install backend deps
cd ../backend && npm install
```

---

## 2. Supabase Setup

1. Go to https://supabase.com and create a new project
2. Copy your **Project URL** and **anon public key** from Settings → API
3. Enable Email auth under Authentication → Providers

---

## 3. Environment Variables

### Frontend (`frontend/.env.local`)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001
```

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_JWT_SECRET=your-jwt-secret
NUTRITIONIX_APP_ID=your-app-id
NUTRITIONIX_API_KEY=your-api-key
PORT=3001
NODE_ENV=development
```

---

## 4. Database Setup

```bash
cd backend

# Push schema to your database
npx prisma db push

# Generate Prisma client
npx prisma generate

# (Optional) Seed with sample data
npx ts-node prisma/seed.ts
```

---

## 5. Run Locally

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Frontend: http://localhost:5173
Backend:  http://localhost:3001

---

## 6. Project Structure

```
fitguide-ai/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # shadcn/ui primitives
│   │   │   ├── forms/       # Onboarding step forms
│   │   │   ├── dashboard/   # Plan display components
│   │   │   └── layout/      # Nav, sidebar, shell
│   │   ├── pages/           # Route-level page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Supabase client, utils
│   │   ├── store/           # Zustand state stores
│   │   └── styles/          # Global CSS
│   ├── .env.local
│   ├── vite.config.ts
│   └── package.json
│
└── backend/
    ├── src/
    │   ├── routes/          # Express route handlers
    │   ├── middleware/       # Auth, error handling
    │   ├── services/         # AI, nutrition, exercise logic
    │   └── lib/             # Prisma client, Anthropic client
    ├── prisma/
    │   ├── schema.prisma    # Database schema
    │   └── seed.ts          # Sample data
    ├── .env
    └── package.json
```

---

## 7. Deploy

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
# Set env vars in Vercel dashboard
```

### Backend → Railway
```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up
# Set env vars in Railway dashboard
```

---

## Key API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/profile | Save user profile |
| POST | /api/plan/generate | Generate AI fitness plan |
| GET | /api/plan/:userId | Fetch saved plan |
| POST | /api/coach/chat | AI coaching conversation |
| GET | /api/nutrition/search | Search foods |
| GET | /api/exercises | Browse exercise library |
| POST | /api/progress | Log workout/weight |
| GET | /api/progress/:userId | Get progress history |

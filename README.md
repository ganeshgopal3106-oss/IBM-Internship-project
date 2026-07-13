# MovieMind AI - Your Intelligent Movie Assistant

MovieMind AI is an AI-powered movie companion for chat, recommendations, spoiler-free reviews, plot explanations, comparisons, posters, and personalized watchlists.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Lucide Icons, React Markdown
- Backend: FastAPI, Pydantic, HTTPX
- AI: OpenAI Python SDK with the Responses API, default model `gpt-4o-mini`
- Metadata/Posters: TMDb API
- Deployment: Docker and Docker Compose, AWS-ready container settings

## Environment

Create `backend/.env` for local backend development, or provide these variables through Docker/AWS environment settings:

```env
OPENAI_API_KEY=your_openai_api_key_here
TMDB_API_KEY=your_tmdb_api_key_here
OPENAI_MODEL=gpt-4o-mini
FRONTEND_ORIGINS=http://localhost:3000,http://localhost:5173
```

There is no demo or mock AI mode. `OPENAI_API_KEY` is required for AI-generated chat, reviews, explanations, comparisons, recommendations, and watchlists. `TMDB_API_KEY` is required for reliable title resolution, metadata, ambiguity detection, and posters. If a poster is unavailable, the UI shows a local no-poster card without exposing keys.

## Run With Docker Compose

```bash
docker-compose up --build
```

Frontend: `http://localhost:3000`
Backend: `http://localhost:8000`
Health check: `http://localhost:8000/health`

## Run Locally

Backend:

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Tests

```bash
cd backend
pytest

cd ../frontend
npm run build
```

## API

- `POST /chat` streams plain text.
- `POST /recommend` streams plain text.
- `POST /review` streams plain text.
- `POST /explain` streams plain text.
- `POST /compare` streams plain text with markdown tables.
- `POST /watchlist` streams plain text.
- `GET /poster?title=...` returns JSON poster and metadata details.
- `GET /health` returns JSON service status.

All JSON endpoints validate inputs with Pydantic. Streaming endpoints return `text/plain` and produce user-friendly text for unknown or ambiguous movies.

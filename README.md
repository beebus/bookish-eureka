# bookish-eureka
A chatbot to talk with virtual recruiters.

Practice screening calls with an AI recruiter, powered by a local LLM via [Ollama](https://ollama.com).

## Setup

1. Install Ollama and pull a model: `ollama pull llama3.1:8b`
2. Backend (from the repo root):
   ```
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   copy .env.example .env
   uvicorn backend.main:app --reload
   ```
3. Frontend (in another terminal):
   ```
   cd frontend
   npm install
   npm run dev
   ```
4. Open http://localhost:5173

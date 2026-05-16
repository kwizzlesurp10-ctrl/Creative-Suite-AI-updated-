# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Creative Suite AI is a two-service application:

- **Frontend** (port 3000): React 19 + TypeScript + Vite 6 SPA. Start with `npm run dev`.
- **Backend** (port 5001): Python 3.12 + Flask REST API for AnyTool workflow orchestration (optional). Start with `cd backend && python3 server.py`.
- **Both together**: `npm run dev:full` (uses `concurrently`).

### Environment variables

Both services need `GEMINI_API_KEY`. Without a real key, the frontend renders but AI features (image generation, video, transcription) won't work. The backend will refuse to start if `GEMINI_API_KEY` is missing from `backend/.env`.

- Frontend: `.env.local` in repo root (`GEMINI_API_KEY=...`)
- Backend: `backend/.env` (`GEMINI_API_KEY=...`)

For dev environment setup without a real key, set `GEMINI_API_KEY=dummy_key_for_dev` in both files.

### Build & lint

- `npm run build` — Vite production build (succeeds).
- `npx tsc --noEmit` — TypeScript check. There are **pre-existing TS errors** in `components/ErrorBoundary.tsx` (class component `state`/`props` access without proper typing). These are not introduced by agents and should be ignored unless explicitly fixing them.
- No ESLint config is present in this repo; there is no lint script in `package.json`.

### Backend notes

- Python dependencies install to user site-packages (`pip install --user`). No virtualenv needed in the Cloud Agent VM.
- The backend uses a placeholder AnyTool wrapper (simulates workflow execution). Real AnyTool is not installed and is optional.
- The Vite dev server proxies `/api` requests to `localhost:5001`, so both services work together when running `npm run dev:full`.

### Testing

- No automated test framework is configured for either frontend or backend.
- Backend can be tested manually via `curl http://localhost:5001/api/health`.
- Frontend loads at `http://localhost:3000` and all five tabs (Story to Video, Image Genie, Image Analyzer, Image to Video, Transcriber) render correctly.

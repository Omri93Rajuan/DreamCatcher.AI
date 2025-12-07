# DreamCatcher.AI Server

The `server_ai` workspace powers the backend API, authentication, MongoDB models, and the OpenRouter/MCP integration that drives the AI dream interpretation layer.

## Stack highlights
- **Runtime:** Node.js 20
- **Framework:** Express + TypeScript
- **Database:** MongoDB with Mongoose models (`dream`, `user`) + Zod validation in `validation/`
- **AI middleware:** OpenRouter/MCP provider located under `llm/`, with helper hooks for language models
- **Infrastructure:** JWT auth, Nodemailer helpers, validation middleware, and error sanitization for production readiness

## Quickstart
```bash
cd server_ai
npm install
npm run dev        # nodemon + tsc-watch
# For production build:
npm run build && npm start
```
Development runs on `http://localhost:3000` by default.

## Environment (`server_ai/.env`)
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/dreamcatcher
JWT_SECRET=replace-with-secret
APP_URL=http://localhost:5173

# Optional LLM/OpenRouter keys
OPENROUTER_API_KEY=sk-...
OPENROUTER_MODEL=meta-llama/...

# S3-compatible (e.g., Cloudflare R2 / iDrive e2) for avatar uploads
S3_ENDPOINT=https://s3.eu-central-2.idrivee2.com
S3_BUCKET=users-avatar
S3_ACCESS_KEY_ID=xxx
S3_SECRET_ACCESS_KEY=xxx
S3_PUBLIC_BASE=https://s3.eu-central-2.idrivee2.com/users-avatar
S3_REGION=eu-central-2
PRESIGN_TTL=300
AVATAR_MAX_BYTES=2097152
```

## Scripts
| Script | Description |
| --- | --- |
| `npm run dev` | Development server with `tsc-watch` + `nodemon`. |
| `npm run build` | Compiles TypeScript to `dist/`. |
| `npm start` | Runs the compiled server from `dist/`. |
| `npm test` | Jest unit tests (Mongo Memory Server). |

## Directory overview
```
controllers/    # auth.controller.ts, dream.controller.ts, etc.
services/       # orchestrations, user flows, uploads
models/         # Mongoose schemas for users, dreams, and shared content
validation/     # Zod schemas used by request middleware
routes/         # Express route definitions
llm/            # OpenRouter provider, MCP client, LLM types
mcp/            # MCP client + helpers
helpers/        # mailer, error helpers, bcrypt utils
types/          # shared TS definitions (DreamCategory, responses, etc.)
```

## Production guidance
1. Supply a secure `JWT_SECRET` and point `MONGO_URI` at your production database.
2. Enable TLS/HTTPS via reverse proxy (e.g., Nginx or cloud load balancer) before exposing the API.
3. Run `npm run lint`, `npm test`, and `npm run build` before rolling out a release.
4. Configure rate limiting, Redis session caching, or Sentry tracing as needed; the scaffolding supports middleware extensions.
5. Use the `APP_URL` variable so the backend can craft full URLs (emails, redirects, google callbacks).
6. For avatar uploads via R2, set the env vars above and use `/api/uploads/avatar-url` (authenticated).

This backend is shaped for production: typed contracts, central validation, AI orchestration, and clean deployment scripts.

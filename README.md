# DreamCatcher.AI

DreamCatcher.AI is a bilingual dream journaling and interpretation app that pairs a responsive React + Vite frontend with an Express/Mongoose backend and a lightweight AI/MCP layer. The product is built with RTL-ready styling, thoughtful routing, and reusable legal/UX components so Hebrew-speaking users can journal with confidence and explore their subconscious in a modern, production-quality experience.

## What’s inside
- client/ – React 18 + Vite + TypeScript + Tailwind CSS with Zustand state management, TanStack Query for data fetching, Framer Motion for micro-interactions, and i18n-ready layouts.
- server_ai/ – Express API built with Node.js 20, MongoDB/Mongoose models, Zod validation, JWT auth, and integrations to OpenRouter/MCP for AI-driven dream analysis.
- nginx/ – (Optional) proxy configuration to front the API and handle TLS/staging traffic when deploying behind a reverse proxy.

## Production-ready principles
- Typed APIs & validation – all payloads pass through centralized Zod schemas to protect the database from malformed input.
- Legal content is centralized – terms and privacy text is sourced from shared constants so the same copy feeds the dialog and standalone screens, which reduces duplication and eases translations.
- Router-friendly navigation – links use react-router rather than direct window assignments, ensuring in-app navigation keeps the history stack clean.
- Safety-first – the UX explicitly surface Terms and Privacy links, breadcrumb-style navigation, and fallback 404 handling to prevent confused journeys.
- Tests & linting (suggested) – run npm run lint and npm run test within both client/ and server_ai/ before releasing; consider adding Playwright or Cypress E2E coverage once the flows stabilize.

## Getting started
1. Clone the repo and install dependencies:
   ```bash
   git clone <repo>
   cd DreamCatcher.AI
   cd client && npm install
   cd ../server_ai && npm install
   ```
2. Copy the example environment files (if present) and supply production-safe secrets (JWT_SECRET, MONGODB_URI, OpenRouter API keys, etc.).
3. Run both apps during development:
   - npm run dev inside client/ (Vite dev server).
   - npm run dev or npm start inside server_ai/ (Express).
4. Visit http://localhost:5173 for the client and ensure it talks to the API (adjust proxy/settings in client/vite.config.ts if needed).

## Directory overview
| Scope | Details |
| --- | --- |
| client/ | UI, auth flows, dream feed, and legal dialogs; ships with RTL-friendly, dark-mode-aware components. |
| server_ai/ | API routes, controllers, Mongoose models (dream, user), and AI orchestration for interpreting dreams. |
| nginx/ | Optional configuration for Nginx reverse proxy or staging TLS setup. |

## Recommended release checklist
1. Run linting and unit tests: npm run lint and npm run test inside each workspace.
2. Validate legal copy and privacy sections display the current content from client/src/constants/terms.ts.
3. Build optimized bundles: npm run build inside client/ and server_ai/, then verify the server bundle runs against a staging database.
4. Deploy with a reverse proxy or CDN; ensure HTTPS, rate limiting, and CORS headers are configured for the API.

## Documentation links
- client/README.md – frontend-specific notes (if present) with UX/growth info.
- server_ai/README.md – backend/AI deployment concepts and environment variable reference.

---
DreamCatcher.AI is production-focused, multilingual, and ready for regulated dream journaling journeys. Let me know if you want a CI/CD checklist or deployment scripts next.

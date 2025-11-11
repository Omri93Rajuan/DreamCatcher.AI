```markdown
# DreamCatcher.AI Client

This is the React/Vite frontend for **DreamCatcher.AI**.  
It delivers a responsive, RTL-aware experience that lets Hebrew-speaking users sign up, log in, journal dreams, and read AI-powered interpretations — while keeping legal content consistent across dialogs and dedicated pages.

---

## 🧩 Stack Highlights

- **Framework:** React 18 + Vite + TypeScript  
- **Styling:** Tailwind CSS with custom gradients, Framer Motion micro-interactions, and reusable RTL-ready components  
- **State + Data:** Zustand global store, TanStack Query for data loading/caching, hooks under `/src/hooks` for auth and dreams logic  
- **Routing:** `react-router` with layout wrapper, privacy/terms pages, and a custom 404  
- **Assets:** Localized illustrations, icons, SVG gradients, and brand imagery in `/src/assets`

---

## 🚀 Getting Started

```bash
cd client
npm install
npm run dev      # starts Vite + HMR on http://localhost:5173
```

Ensure the frontend can reach the API (adjust `VITE_API_BASE_URL` in `.env` if necessary).

---

## ⚙️ Environment Variables (`client/.env`)

```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=DreamCatcher.AI
VITE_SENTRY_DSN=
```

Add optional keys (Sentry, analytics, etc.) only when configured for the environment.

---

## 📜 NPM Scripts

| Script | Purpose |
|--------|----------|
| `npm run dev` | Local development server (Vite) |
| `npm run build` | Production build output in `dist/` |
| `npm run preview` | Serve the production build for a final sanity check |
| `npm run lint` | ESLint + TypeScript validation |

---

## 🧠 Production Notes

- Always run `npm run build` and `npm run lint` before deploying.  
- Keep legal copy in `src/constants/terms.ts` so dialogs and pages stay synchronized.  
- Use router navigation (`Link`, `useNavigate`) instead of global redirects to maintain SPA history.  
- Serve the built `dist/` folder behind a CDN or reverse proxy (e.g., Nginx) with proper cache headers.

---

## 📁 Project Layout

```
src/
  components/   # cards, form inputs, modals, legal dialogs, trends/dream widgets
  pages/        # Login, Register, Privacy, Terms, NotFound, Dream journal flow
  lib/          # API clients, hooks, utility helpers
  assets/       # images, logos, icons, gradients
  stores/       # Zustand stores for auth, dreams, UI state
  styles/       # Tailwind overrides, gradients, global classes
```

---

## 🧭 Recommended Workflow

1. Install dependencies in both `client/` and `server_ai/`.  
2. Run the frontend against the backend API by setting `VITE_API_BASE_URL` to the Express base URL (default `http://localhost:3000`).  
3. Use `npm run lint` and `npm run build` as gating steps for deployment.  
4. Optionally add Storybook or E2E tests (Playwright/Cypress) for flows like registration and dream sharing.

---

✅ This client is **production-ready**, **RTL-first**, and designed for a confident **DreamCatcher.AI** rollout.
```

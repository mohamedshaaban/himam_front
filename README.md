# Himam — Web app (React + Vite)

The reader-facing app and admin dashboard for the Himam reading programme
(منصة همم — جمعية مرتقي العلمية), built from the Claude Design mockups.

The API lives in `../Himam-Backend`.

## Setup

```bash
npm install
```

Start the API first (see the backend README), then:

```bash
npm run dev
```

The dev server runs on <http://localhost:5173> and proxies `/api` to
`http://127.0.0.1:8000`, so the browser stays on one origin and cookies and CORS
behave in development the way they will behind one domain in production.

Sign in with `mohammed@himam.test` (reader) or `admin@himam.test`
(administrator); the password for both is `password`.

## Languages

Four locales ship: Arabic (default, RTL), English, French and Urdu (RTL).
`src/i18n/index.js` is the single source of truth — adding a language means a
locale JSON in `src/i18n/locales/` and one entry in `LOCALES`, plus the matching
entry in the backend's `config/himam.php` so the *content* is translatable too.

`dir` and `lang` are set on `<html>` rather than a wrapper element: the whole
layout is built on logical CSS properties (`margin-inline`, `inset-inline`), and
the document direction is also what tells the browser how to handle caret
movement and text selection inside form fields. Arabic uses Amiri, Urdu uses
Noto Nastaliq Urdu with looser leading, and Latin scripts fall back to the design
system's Cormorant Garamond / Lora pairing.

### A note on `useLocalizedQuery`

Reads go through `src/api/useLocalizedQuery.js` rather than relying on the axios
interceptor's ambient locale. Reading the active language at request time is not
safe: a language switch changes the React Query cache key immediately, but the
request for the new key can still be dispatched in a tick where the i18n instance
still reports the previous language. The result was content that lagged one
language behind the interface — and cached under the *new* key, so it never
corrected itself.

Capturing the language during render and sending it as an explicit `?lang=` makes
the two agree by construction: the payload in a cache slot is always the language
that slot is keyed by.

## Layout

- `src/styles/tokens.css` — the design system: colour ramps, type scale, spacing,
  and component classes (`.btn`, `.card`, `.plate`, `.tag`, `.table`).
- `src/components` — shared shell: header, layout, slider, language switcher,
  route guards, query states.
- `src/pages` — landing, intro, login, register, home, progress, books, book
  detail, read, quiz, badges, certificates, honour board, notifications, account.
  `Progress.jsx` is the reader's own dashboard: overall completion, points per
  month, a level → book → section breakdown where every section shows whether it
  was read or passed and the best score so far, the badges within reach, and
  recent attempts. Its bar chart is hand-rolled from flex boxes rather than a
  charting library — twelve bars don't justify the payload, and CSS bars inherit
  the theme's colours and RTL flow for free.
- `src/admin` — role-protected `/admin` area: overview, levels, books (with the
  section and question editor), badges, announcements, slides, certificates and
  users. `TranslatableField` renders one input per language for translatable
  content; `useCrud` carries the shared list/dialog/save plumbing.

Route guards in `RequireAuth` / `RequireAdmin` are the UI half only — the API
enforces the same rules independently.

## Assets

`public/assets/` holds the design's imagery. `logo.svg`, `banner.svg` and the
three `avatar-*.svg` files are on-brand stand-ins: the originals exceeded the
design API's 256 KiB per-file fetch limit. Drop the real `logo.png` /
`banner.png` in and update the references to swap them in.

## Build

```bash
npm run build
```

## Deploying

Build command `npm run build`, output directory `dist`, and one environment
variable — `VITE_API_URL` pointing at the deployed API including the `/api`
suffix. It must be set at build time: Vite inlines `VITE_*` into the bundle.

SPA routing is already handled (`public/_redirects` for Cloudflare Pages and
Netlify, `vercel.json` for Vercel). Full guide, including where to host the
Laravel API for free, is in `../Himam-Backend/DEPLOYMENT.md`.

# Billwise

A personal bill reminder app that tracks upcoming bills and sends push notifications before they're due. Installable as a PWA for a native-like experience on iOS and Android. Built for solo use — lightweight, simple, and focused on one job: making sure you never miss a payment.

---

## Overview

Billwise is a single-user, mobile-first web app. Sign in, add your recurring bills, and Billwise handles the rest — reminding you before each one is due, resetting automatically once the cycle rolls over, and working entirely in the background via server-side scheduling. No offline mode; an active internet connection is required.

---

## Features

- **Authentication** — email/password login; bills sync across devices and reinstalls
- **Bill list** — cards sorted by next due date, with amber (due ≤7 days) and red (due today) warning states; paid bills stay visible but dimmed
- **Add / edit / delete bills** — bottom-sheet form with name, optional amount, due date (calendar picker), and recurrence (weekly, monthly, yearly); delete via swipe with a confirmation dialog
- **Mark as paid** — one tap or swipe to mark a bill paid for the cycle; suppresses further notifications until the next cycle
- **Automatic cycle reset** — due dates advance and paid status resets server-side once a due date passes, even if the app is never opened (handles short months, e.g. the 31st → last day of February)
- **PWA install** — installable to the home screen on Android (native banner) and iOS (guided Share → Add to Home Screen instructions), running full-screen with no browser chrome
- **Push notifications** — configurable reminder window (7 days before, 3 days before, or day-of); tapping a notification opens the app to that bill
- **Notification settings** — enable/disable push, choose reminder window, set delivery time, install prompt
- **Permission & subscription banners** — persistent banner if push permission is denied, and a re-enable prompt if a push subscription silently expires
- **App updates** — non-intrusive "Update available" toast when a new version is deployed; reload preserves data

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Vue 3 (Composition API) + Vite |
| Server state | TanStack Query (`@tanstack/vue-query`) |
| Forms | TanStack Form + vee-validate + Zod |
| UI | Tailwind CSS v4 + reka-ui (shadcn-vue primitives) |
| PWA | vite-plugin-pwa (Workbox) |
| Backend / DB | Supabase (Auth, Postgres, Row-Level Security) |
| Push notifications | OneSignal |
| Scheduling | `pg_cron` + `pg_net` (daily Postgres job — no Edge Function needed) |
| Deployment | Vercel |

> **iOS note:** Web Push requires iOS 16.4+ and only works when the app is installed to the home screen.

---

## Getting Started

### Prerequisites

- Node `^20.19.0` or `>=22.12.0`

### Setup

```sh
npm install
```

Create a `.env` file with:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_ONESIGNAL_APP_ID=
```

### Run the dev server

```sh
npm run dev
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with hot-reload |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run oxlint and eslint (auto-fix) |
| `npm run format` | Format `src/` with Prettier |

---

## Notes

- **No offline support** — the app requires an active internet connection.
- **iOS push notifications** require the app to be installed to the home screen on iOS 16.4+; older iOS versions won't receive pushes.

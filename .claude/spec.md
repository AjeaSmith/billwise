# Bill Reminder App — Specification

## Overview

A personal bill reminder app that tracks upcoming bills and sends push notifications before they're due. Installable on your phone as a PWA (Progressive Web App) for a native-like experience. Designed for solo use — lightweight, simple, and focused on one job: making sure you never miss a payment.

---

## Goals

- Track bills by name, due date, and amount
- Automatically send push notifications before each bill is due
- Provide a simple dashboard to view and manage upcoming bills
- Support recurring bills (monthly, weekly, yearly)
- Installable on iOS and Android as a PWA with a mobile-first UI

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | Vue 3 + Vite | Familiar, fast to build |
| Server state | TanStack Query (`@tanstack/vue-query`) | Handles fetching, caching, background refetching, and mutations for all server data |
| PWA | vite-plugin-pwa (Workbox) | Service worker + manifest generation, works seamlessly with Vite |
| Backend / DB | Supabase | Auth, database, and edge functions in one |
| Push Notifications | OneSignal | Managed web push service — handles subscription, delivery, and iOS/Android compatibility |
| Scheduling | pg_cron + pg_net | Daily Postgres function triggers notification delivery and cycle resets directly from the database |
| Deployment | Vercel or Netlify | HTTPS required for PWA and Web Push |

> **Alternative:** Nuxt 3 with `@vite-pwa/nuxt` module on Vercel — same PWA and Web Push capabilities with Nuxt's file-based routing.

> **iOS note:** Web Push is supported on iOS 16.4+ but only when the app is installed to the home screen. Users on older iOS versions will not receive push notifications.

---

## Features

Features are listed in implementation order — each layer builds on the one before it.

### 1. Authentication

Login is required. Users sign in via email and password. All bill data is tied to the authenticated account and persists across devices and reinstalls. On first open, users land on a sign-in screen before reaching the app.

### 2. Bill list

The main view is a card list of all bills sorted by next due date. Each card shows the bill name, amount, and days until due. Bills due within 7 days display an amber warning state. Bills due today display a red urgent state. Already-paid bills are visually dimmed but remain visible so the full month is always in view. There is no monthly total — the list is the only summary.

### 3. Empty state

When no bills have been added yet, the screen shows an illustration with an "Add your first bill" prompt in place of the list. The standard bill list is hidden until at least one bill exists.

### 4. Add a bill

A bottom sheet form (slides up like a native modal) with four fields: name, amount (optional), due date, and recurrence. Amount is optional to support variable bills like utilities — the notification still fires without a dollar figure. Due date uses a calendar picker — tapping the field opens a calendar where the user selects a specific date. Recurrence options are weekly, monthly, and yearly (no one-time option). Monthly is pre-selected by default. The save button is muted until required fields are filled.

### 5. Edit a bill

Any existing bill can be edited using the same bottom sheet form, pre-filled with the current values. Tapping a bill card on the home screen opens the edit form.

### 6. Delete a bill

A bill is deleted by swiping the bill card left on the bill list, revealing a red delete action. A confirmation dialog prevents accidental deletion. On confirmation, the bill is permanently deleted and no further notifications will fire. There is no undo.

### 7. Mark as paid

A single tap on a bill card or a swipe gesture marks it paid for the current cycle. A "Marked as paid" toast appears briefly, then the card dims. No further notifications fire for a bill once it is marked paid.

### 8. Automatic cycle reset

When a bill's due date passes, it resets to unpaid automatically in the background and the due date advances by the recurrence interval. This happens server-side so it works even if the app is never opened. The bill reappears as active on the next open, ready for the new cycle. If the due day doesn't exist in a given month (e.g. the 31st in February), the app uses the last day of that month instead.

### 9. App install (PWA)

The app is installable to the home screen on both Android and iOS and runs full-screen with no browser chrome. On Android, Chrome displays a native install banner. On iOS, the Settings screen shows a step-by-step install card (Share → Add to Home Screen → Add). Push notifications on iOS require the app to be installed to the home screen. An active internet connection is required to use the app — offline mode is not supported.

### 10. Push notifications

On first open the app requests notification permission. Once granted, notifications fire automatically in the background at the user's configured time. Each notification includes the bill name, amount (if set), and due date. Tapping a notification opens the app directly to that bill. No notification fires for a bill that is already marked paid.

Configurable reminder window (one of three options):
- 7 days before due
- 3 days before due
- Day of due date

### 11. Notification settings

- Enable or disable push notifications
- Select a single reminder window — 7 days before, 3 days before, or day of
- Set the time of day notifications are sent — tapping opens the native device time picker
- Install the app to home screen (native prompt on Android; step-by-step instructions for iOS)

### 12. Notification permission denied

If the user denies notification permission, a persistent banner appears at the top of the bill list explaining that notifications are off, with a direct link to the device's system Settings to enable them.

### 13. Expired notification subscription

If the push subscription silently expires, a banner appears on the bill list on next open prompting the user to re-enable notifications with a single tap.

### 14. App updates

When a new version is deployed, a non-intrusive toast appears at the bottom of the screen: "Update available — tap to refresh." The page reloads with the new version and no data is lost.

---

## Technical Decisions

### Frontend — Vue 3 + Vite

Vue 3 with the Composition API throughout. TanStack Query (`@tanstack/vue-query`) handles all server state — fetching, caching, background refetching, and mutations for bills and user settings via `useQuery` and `useMutation`. Composables wrap TanStack Query hooks to keep components clean (e.g. `useBills`, `useCreateBill`, `useUpdateBill`). A `usePush` composable manages permission state, subscription registration, and the install prompt. Vue Router for navigation between the bill list, add/edit form, and settings.

### Styling — Tailwind v4 + shadcn-vue

Mobile-first throughout, designed for a ~390px viewport. Bottom navigation bar for switching between the bills list and settings. Minimum 44px touch targets on all interactive elements. shadcn-vue components used for: Card (bill items), Sheet (add/edit form sliding up from the bottom), Toast (update prompt and paid confirmation), Switch (notification toggles in settings), and Dialog (delete confirmation). The send time field uses a native `<input type="time">` so the device's built-in time picker handles the interaction. Timezone is populated automatically on first open using `Intl.DateTimeFormat().resolvedOptions().timeZone` and saved to user settings; users can manually override it via a select if needed.

### Backend — Supabase

Supabase handles auth (email and password), the Postgres database, and `pg_cron` for the daily scheduled job. Login is required — all bill data is tied to an authenticated user account so it persists across devices and reinstalls. Row-level security ensures all data is locked to the authenticated user. The schema covers two tables: bills and user settings. Push subscription management is handled entirely by OneSignal.

### Push Notifications — OneSignal

OneSignal handles all web push functionality — subscription management, delivery, and cross-platform compatibility for Android and iOS. The OneSignal SDK is initialised in the app and manages the permission prompt and push subscription automatically. When a bill reminder is due, a Supabase Edge Function calls the OneSignal REST API to send the notification to the user's device. Expired or invalid subscriptions are handled by OneSignal automatically. OneSignal's free tier is sufficient for a single-user personal app.

### PWA — vite-plugin-pwa (Workbox)

`vite-plugin-pwa` generates the service worker and `manifest.webmanifest` automatically at build time. Workbox is configured with a cache-first strategy for static assets (JS, CSS, fonts, icons). `skipWaiting` and `clientsClaim` are enabled for instant service worker activation on update. The manifest uses `display: standalone`, a `theme_color` matching the app palette, and includes both 192×192 and 512×512 maskable PNG icons.

### Scheduling — pg_cron + pg_net

A `pg_cron` job runs once daily at a fixed UTC time. A single Postgres function handles everything in sequence: reads user settings, resets any bills whose `next_due_date` has passed (advancing `next_due_date` and flipping `is_paid`), then queries bills where `next_due_date = today + reminder_day` and `is_paid = false`. For each matching bill, `pg_net` makes an HTTP POST directly to the OneSignal API to deliver the notification. No Edge Function is needed — the entire scheduling and notification logic lives inside the database function.

### Deployment — Vercel

HTTPS out of the box (required for both PWA install and Web Push). Automatic deploys from `main`. Supabase handles all backend infrastructure independently of Vercel, so the Vercel deploy is purely the static frontend.
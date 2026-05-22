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
| PWA | vite-plugin-pwa (Workbox) | Service worker + manifest generation, works seamlessly with Vite |
| Backend / DB | Supabase | Auth, database, and edge functions in one |
| Push Notifications | Web Push (VAPID) + Supabase Edge Functions | Free, no third-party service needed |
| Scheduling | Supabase Edge Functions + pg_cron | Run daily checks for upcoming bills |
| Deployment | Vercel or Netlify | HTTPS required for PWA and Web Push |

> **Alternative:** Nuxt 3 with `@vite-pwa/nuxt` module on Vercel — same PWA and Web Push capabilities with Nuxt's file-based routing.

> **iOS note:** Web Push is supported on iOS 16.4+ but only when the app is installed to the home screen. Users on older iOS versions will not receive push notifications.

---

## Features

Features are listed in implementation order — each layer builds on the one before it.

### 1. Authentication

Login is required. Users sign in via magic link (email) — no password needed. All bill data is tied to the authenticated account and persists across devices and reinstalls. On first open, users land on a sign-in screen before reaching the app.

### 2. Bill list

The main view is a card list of all bills sorted by next due date. Each card shows the bill name, amount, and days until due. Bills due within 7 days display an amber warning state. Bills due today display a red urgent state. Already-paid bills are visually dimmed but remain visible so the full month is always in view. There is no monthly total — the list is the only summary.

### 3. Empty state

When no bills have been added yet, the screen shows an illustration with an "Add your first bill" prompt in place of the list. The standard bill list is hidden until at least one bill exists.

### 4. Add a bill

A bottom sheet form (slides up like a native modal) with four fields: name, amount (optional), due date, and recurrence. Amount is optional to support variable bills like utilities — the notification still fires without a dollar figure. Due date uses a calendar picker — tapping the field opens a calendar where the user selects a specific date. Recurrence options are weekly, monthly, and yearly (no one-time option). Monthly is pre-selected by default. The save button is muted until required fields are filled.

### 5. Edit a bill

Any existing bill can be edited using the same bottom sheet form, pre-filled with the current values. Tapping a bill card on the home screen opens the edit form.

### 6. Delete a bill

Deleting is available from the edit screen behind a confirmation dialog. No undo is available after confirming. The bill is permanently removed and no further notifications will fire.

### 7. Mark as paid

A single tap on a bill card or a swipe gesture marks it paid for the current cycle. A "Marked as paid" toast appears briefly, then the card dims. No further notifications fire for a bill once it is marked paid.

### 8. Automatic cycle reset

When a bill's due date passes, it resets to unpaid automatically in the background and the due date advances by the recurrence interval. This happens server-side so it works even if the app is never opened. The bill reappears as active on the next open, ready for the new cycle. If the due day doesn't exist in a given month (e.g. the 31st in February), the app uses the last day of that month instead.

### 9. App install (PWA)

The app is installable to the home screen on both Android and iOS and runs full-screen with no browser chrome. On Android, Chrome displays a native install banner. On iOS, the Settings screen shows a step-by-step install card (Share → Add to Home Screen → Add). Push notifications on iOS require the app to be installed to the home screen. An active internet connection is required to use the app — offline mode is not supported.

### 10. Push notifications

On first open the app requests notification permission. Once granted, notifications fire automatically in the background at the user's configured time. Each notification includes the bill name, amount (if set), and due date. Tapping a notification opens the app directly to that bill. No notification fires for a bill that is already marked paid.

Configurable reminder windows:
- 7 days before due
- 3 days before due
- Day of due date

Each window can be enabled or disabled independently in Settings.

### 11. Notification settings

- Enable or disable push notifications
- Toggle each reminder interval independently (7 days, 3 days, day of)
- Set the time of day notifications are sent — tapping opens the native device time picker
- Timezone auto-detects from the device on first open and is displayed as a read-only value; user can manually change it if needed
- Install the app to home screen (native prompt on Android; step-by-step instructions for iOS)

### 12. Notification permission denied

If the user denies notification permission, a persistent banner appears at the top of the bill list explaining that notifications are off, with a direct link to the device's system Settings to enable them.

### 13. Expired notification subscription

If the push subscription silently expires, a banner appears on the bill list on next open prompting the user to re-enable notifications with a single tap.

### 14. App updates

When a new version is deployed, a non-intrusive toast appears at the bottom of the screen: "Update available — tap to refresh." The page reloads with the new version and no data is lost.

---

## Flows

### First open — Android

1. App loads to an empty bill list with a prompt to add the first bill
2. User adds a bill via the bottom sheet form
3. App requests notification permission
4. User grants permission — push subscription is saved to the database
5. Chrome displays the native install banner
6. User installs — app is now on the home screen and notifications are active

### First open — iOS

1. Same bill-adding flow as Android
2. App requests notification permission
3. User grants permission
4. Settings screen surfaces a card: "To receive notifications, add this app to your Home Screen" with a step-by-step graphic (Share → Add to Home Screen)
5. User installs to home screen — push notifications are now active

### Daily notification firing

1. Cron job runs at midnight UTC
2. Queries all bills whose `next_due_date` falls within a user's configured reminder windows
3. For each match, checks whether a reminder record already exists for that bill, window, and cycle
4. If not, computes the user's local send time from their timezone and `send_hour` setting
5. Sends push notification via VAPID to the saved push subscription endpoint
6. Saves a reminder record marked as `sent` so the same window doesn't fire twice
7. Notification appears on the lock screen with bill name, amount, and due date

### Marking paid after a notification

1. Push notification fires on the lock screen
2. User taps — app opens and scrolls to the relevant bill
3. User taps or swipes the card to mark it paid
4. A "Marked as paid" toast appears, then the card dims
5. No further notifications fire for that bill this cycle

### Monthly cycle reset

1. When a bill's `next_due_date` passes, the cron job resets `is_paid` to false and advances `next_due_date` by the recurrence interval
2. This happens server-side so it works even if the app is never opened
3. The bill reappears as unpaid on the next open, ready for the new cycle

### App update

1. New version is deployed to Vercel
2. Service worker detects the update in the background on next app open
3. A toast appears at the bottom: "Update available — tap to refresh"
4. User taps — page reloads with the new version, no data lost

---

## Technical Decisions

### Frontend — Vue 3 + Vite

Vue 3 with the Composition API throughout. A `useBills` composable handles all bill data fetching, optimistic updates, and cycle reset logic. A `usePush` composable manages permission state, subscription registration, and the install prompt. Pinia for global state: bill list, current paid statuses, and user settings. Vue Router for navigation between the bill list, add/edit form, and settings.

### Styling — Tailwind v4 + shadcn-vue

Mobile-first throughout, designed for a ~390px viewport. Bottom navigation bar for switching between the bills list and settings. Minimum 44px touch targets on all interactive elements. shadcn-vue components used for: Card (bill items), Sheet (add/edit form sliding up from the bottom), Toast (update prompt and paid confirmation), Switch (notification toggles in settings), and Dialog (delete confirmation). The send time field uses a native `<input type="time">` so the device's built-in time picker handles the interaction. Timezone is populated automatically on first open using `Intl.DateTimeFormat().resolvedOptions().timeZone` and saved to user settings; users can manually override it via a select if needed.

### Backend — Supabase

Supabase handles auth (magic link — no passwords), the Postgres database, Edge Functions for push sending logic, and `pg_cron` for the daily scheduled job. Login is required — all bill data is tied to an authenticated user account so it persists across devices and reinstalls. Row-level security ensures all data is locked to the authenticated user. The schema covers tables for bills, reminders (tracks which notification windows have fired per cycle), push subscriptions, and user settings.

### Push Notifications — Web Push (VAPID)

No third-party service, no cost. A VAPID key pair is generated once and the private key is stored as a Supabase secret. The public key is embedded in the frontend. When the user grants notification permission, `PushManager.subscribe()` returns an endpoint and encryption keys that are saved to the `push_subscriptions` table. The Supabase Edge Function that fires notifications uses the `web-push` npm package to encrypt the payload and POST to the browser's push service. If the push endpoint returns a 410 (subscription expired), the subscription is deleted and the user is prompted to re-enable notifications on next open.

### PWA — vite-plugin-pwa (Workbox)

`vite-plugin-pwa` generates the service worker and `manifest.webmanifest` automatically at build time. Workbox is configured with a cache-first strategy for static assets (JS, CSS, fonts, icons). `skipWaiting` and `clientsClaim` are enabled for instant service worker activation on update. The manifest uses `display: standalone`, a `theme_color` matching the app palette, and includes both 192×192 and 512×512 maskable PNG icons.

### Scheduling — pg_cron + Supabase Edge Functions

A `pg_cron` job runs at midnight UTC every day. It queries bills due within any user's active reminder windows, cross-references the reminders table to avoid duplicate sends, and invokes a Supabase Edge Function for each pending notification. The Edge Function handles the VAPID signing and push delivery. Cycle resets (advancing `next_due_date`, flipping `is_paid`) run in the same cron job.

### Deployment — Vercel

HTTPS out of the box (required for both PWA install and Web Push). Automatic deploys from `main`. Supabase handles all backend infrastructure independently of Vercel, so the Vercel deploy is purely the static frontend.
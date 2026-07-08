# Push Notifications

## Summary

The app sends push notifications to the user's device before each bill is due, at a time and frequency they configure. Notifications are delivered automatically in the background by a server-side scheduled job — the user doesn't need to open the app for them to fire. OneSignal is used to manage push delivery across Android and iOS.

---

## Goals

- Remind the user about upcoming bills before they are due without any manual action required
- Give the user control over when and how often reminders fire
- Handle the case where permission is denied or the push subscription expires gracefully
- Ensure no duplicate notifications fire for the same bill and reminder window in the same cycle
- Never send a notification for a bill that is already marked paid

---

## Requirements

### Permission
- On first open, the app must request notification permission from the user
- If the user grants permission, `OneSignal.login(userId)` must be called with the authenticated user's ID to associate the push subscription with their account in OneSignal
- If the user denies permission, a persistent banner must appear at the top of the bill list explaining notifications are off, with a direct link to the device's system Settings
- On iOS, push notifications only work when the app is installed to the home screen — the app must surface this requirement clearly

### Reminder window
- The user selects a single reminder window from three options:
  - 7 days before the bill's due date
  - 3 days before the bill's due date
  - The day the bill is due
- Only one window can be active at a time
- The default is 3 days before

### Notification content
- Each notification must include the bill name, amount (if set), and due date
- If no amount is set on the bill, the amount is omitted from the notification
- Tapping the notification must open the app

### Delivery timing
- Notifications must be delivered at a fixed UTC time configured in the cron job schedule — no timezone conversion is needed
- The UTC time is set to the equivalent of the user's preferred local send time (e.g. 14:00 UTC for 9:00 AM ET)
- The send hour is stored in user settings and used to configure the cron schedule

### Server-side scheduling
- A daily scheduled job must run server-side once per day to identify and trigger all pending notifications
- The job must query all bills where `next_due_date` equals today plus the user's configured `reminder_day`
- The job must not send a notification for a bill that is already marked paid
- The job must not send a notification if push notifications are disabled in the user's settings
- The OneSignal API must be called directly from the Postgres function using `pg_net` — no Edge Function is needed
- Since the job runs once per day, duplicate notifications are not possible

### Expired subscription
- If the push subscription expires or becomes invalid, a banner must appear on the bill list on the next open prompting the user to re-enable notifications
- Re-enabling registers a new push subscription with OneSignal

### Settings
- The user must be able to enable or disable push notifications entirely via a master toggle
- The user must be able to select a single reminder window (7 days, 3 days, or day of) — only one can be active at a time
- The user must be able to set the time of day notifications are sent via the device's native time picker

---

## Implementation Steps

### Step 1 — User settings schema and UI

Create the user settings table in Supabase with columns for `push_enabled`, `reminder_day` (single integer — one of `0`, `3`, or `7`, defaulting to `3`), and `send_hour`. Build the Settings screen UI with the master push toggle, a single reminder window selector (three options, one selectable at a time), and the send time row (native time picker). Save changes to Supabase on every interaction. No push subscription or notifications yet — this step is purely the settings data layer and UI.

**Reviewable outcome:** The Settings screen renders correctly. Selecting a reminder window saves the single value to Supabase and persists across page reloads. The send time picker opens the native time input on tap.

---

### Step 2 — OneSignal SDK setup and permission prompt

Install and configure `onesignal-vue3` in the app. Register it as a Vue plugin in `main.ts` with the OneSignal app ID. On first open (after the user has added at least one bill), request notification permission via OneSignal. On grant, call `OneSignal.login(userId)` with the authenticated user's Supabase ID to associate the push subscription with their account in OneSignal. On denial, show the persistent banner at the top of the bill list with a link to system Settings. On iOS, surface a clear message explaining the app must be installed to the home screen for push to work.

**Reviewable outcome:** Opening the app triggers the permission prompt at the right time. Granting permission calls `OneSignal.login()` and registers the user in OneSignal (visible in the OneSignal dashboard against their user ID). Denying shows the banner on the bill list. The banner links correctly to system Settings.

---

### Step 3 — pg_cron scheduled job and OneSignal delivery

Set up a `pg_cron` job that runs once daily at the configured UTC time. Inside a single Postgres function: read user settings, reset any bills whose `next_due_date` has passed, then query bills where `next_due_date = today + reminder_day` and `is_paid = false`. For each matching bill, use `pg_net` to POST directly to the OneSignal API with the notification payload — bill name, amount if set, and due date. The OneSignal API key is stored as a Postgres setting.

**Reviewable outcome:** The cron job runs on schedule. A bill matching the reminder window receives a push notification on the test device. A paid bill receives no notification. A user with `push_enabled = false` receives no notification. Cycle resets fire correctly in the same job run.

---

### Step 4 — Expired subscription handling

Detect when a OneSignal subscription has expired or become invalid — either via a webhook from OneSignal or by checking subscription status on app open. When detected, show the re-enable banner on the bill list. Tapping the banner re-triggers the OneSignal permission and subscription flow.

**Reviewable outcome:** An expired subscription surfaces the banner on the bill list on next open. Tapping the banner re-registers the push subscription with OneSignal. Notifications resume after re-registration.


- The `onesignal-vue3` package is used to integrate OneSignal into the Vue 3 app — it provides the SDK and Vue plugin interface
- iOS push notifications require the app to be installed to the home screen and iOS 16.4 or later
- Notifications are device-level — there is no in-app notification inbox or history
- No notification is sent for a bill marked paid, regardless of the reminder window
- No timezone conversion is needed — the cron job runs at a fixed UTC time equivalent to the user's local send time
- The cron job runs once per day — duplicate notifications are not possible by design
- The OneSignal API is called directly from the Postgres function via `pg_net` — no Edge Function is needed
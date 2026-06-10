# Add a Bill

## Summary

The add bill form is how a user creates a new recurring bill in the app. It slides up from the bottom of the screen as a sheet, collects four pieces of information, and saves the bill to the user's account. It is the primary data entry point for the entire app — nothing else in the app works until bills exist.

---

## Goals

- Allow the user to add a new bill quickly with minimal friction
- Collect everything needed to track and remind the user about the bill
- Make optional fields clearly optional so variable bills (no fixed amount) are easy to add
- Prevent saving incomplete bills by keeping the save button disabled until required fields are filled
- Default sensible values where possible to reduce taps

---

## Requirements

### Form fields

- **Name** — required. Free text. The label the user recognises the bill by (e.g. "Rent", "Netflix")
- **Amount** — optional. A numeric value in dollars. If left blank, the bill is treated as variable and notifications fire without a dollar figure
- **Due date** — required. The user selects a day of the month using a calendar picker. Only the day number is stored, not a full date — this day number repeats each cycle
- **Recurrence** — required. One of three options: weekly, monthly, or yearly. Monthly is pre-selected by default

### Calendar picker behaviour
- Tapping the due date field opens a calendar
- The calendar displays the current month with navigable month arrows
- Today's date is visually highlighted for orientation
- Only the day number is stored — the full `next_due_date` is calculated from the selected day at save time
- If the selected day doesn't exist in a given month (e.g. 31st in February), the app uses the last day of that month instead

### Save behaviour
- The save button is disabled until name and due date are both filled
- On save, `next_due_date` is calculated from the selected due day:
  - If the day has not yet passed this month, `next_due_date` is set to that day in the current month
  - If the day has already passed this month, `next_due_date` is set to that day in the next month
- The bill is saved to the database and the sheet closes
- The new bill appears in the bill list immediately after saving

### Sheet behaviour
- The form opens as a bottom sheet that slides up over the bill list
- The sheet has a drag handle at the top
- The sheet can be dismissed by swiping down or tapping outside it
- Dismissing without saving discards any entered data

### Entry points
- The FAB on the bill list opens the add form
- The "Add your first bill" button on the empty state opens the add form

---

## Implementation Steps

### Step 1 — Bottom sheet shell

Build the bottom sheet component that the add form will live in. It should slide up from the bottom of the screen with a drag handle, be dismissible by swiping down or tapping the backdrop, and render a default slot for content. Wire up the FAB on the bill list and the "Add your first bill" button on the empty state to open and close the sheet. No form content yet — the sheet can render placeholder text to confirm it opens and closes correctly.

**Reviewable outcome:** Tapping the FAB or the empty state button opens the sheet. Swiping down or tapping outside closes it. The drag handle is visible. The sheet animates in and out smoothly.

---

### Step 2 — Form fields and layout

Build the four form fields inside the sheet: name (text input), amount (optional numeric input with `$` prefix), due date (tappable field that shows a placeholder for now), and recurrence (three pill options: weekly, monthly, yearly with monthly pre-selected). Style the layout to match the design — field labels, input styling, and the muted save button. No save logic or calendar picker yet.

**Reviewable outcome:** All four fields render correctly inside the sheet. Recurrence pills are tappable and update the selected state. The amount field shows the `$` prefix. The save button is visible but muted. The form looks correct across both the add and a future edit state.

---

### Step 3 — Calendar picker

Build the inline calendar picker that opens when the user taps the due date field. It should display the current month in a 7-column grid, highlight today's date, allow month navigation with previous/next arrows, and mark the selected day with the primary brand colour. Selecting a day closes the calendar and shows the selected day in the due date field. No `next_due_date` calculation yet — just store the raw day number in local form state.

**Reviewable outcome:** Tapping the due date field expands the calendar inline. Tapping a day selects it and collapses the calendar. Month navigation works. Today is visually distinct. The selected day is reflected in the field trigger.

---

### Step 4 — Save logic and `next_due_date` calculation

Enable the save button once name and due date are both filled. On save, calculate `next_due_date` from the selected `due_day` — if the day hasn't passed this month use the current month, otherwise use next month, applying the short month clamp where needed. Call the create bill mutation (TanStack Query `useMutation`), close the sheet on success, and invalidate the bills query so the list refreshes with the new bill immediately.

**Reviewable outcome:** Save button activates only when required fields are filled. Saving creates the bill in Supabase with the correct `due_day`, `next_due_date`, `amount`, `name`, and `recurrence`. The sheet closes and the new bill appears in the correct position in the bill list without a page reload. A bill with no amount saves correctly with a null amount.

---

### Step 5 — Error handling and loading state

Add a loading state to the save button while the mutation is in flight — disable it and show a subtle spinner or "Saving…" label. If the mutation fails, show an error toast and keep the sheet open so the user doesn't lose their input. Prevent double-submission by disabling the save button while loading.

**Reviewable outcome:** Tapping save disables the button while the request is in flight. A failed save shows an error toast and keeps the sheet open with all entered data intact. Tapping save a second time before the first completes does nothing.


- One-time recurrence is not supported — all bills are recurring
- The amount field has no currency selector — USD only
- There is no multi-bill or bulk import flow — bills are added one at a time
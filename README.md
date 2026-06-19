# Gatekeeper — Secure Access Form

---

A sign-up form that validates every field in the browser before "submitting" — no backend, no libraries, just semantic HTML, vanilla JS, and regex.

## What it does

- **Full name** — required, letters/spaces only
- **Email** — required, basic syntax check (text + `@` + domain dot)
- **Password** — required, must have 8+ characters, one uppercase, one lowercase, one number, one symbol (live checklist shown as you type)
- **Confirm password** — must match the password field
- **Terms checkbox** — must be checked

On success, the form swaps to a panel showing the JSON payload that would be sent to a backend (password masked). On failure, each broken field gets a red border, a specific error message, and focus moves to the first invalid field.

## How it maps to the brief

| Brief phase | Where it lives |
|---|---|
| Phase 1 — Semantic Skeleton | `index.html`: real `<form>`, `<label>`, `<input>` — no `<div>` soup |
| Phase 2 — Default Threat | `script.js`: `event.preventDefault()` on submit, before anything else runs |
| The Regex Inspector | `script.js`: named regex rules for name, email, and each password requirement |
| Phase 3 — The Communicator | Red/green field states + a built JSON payload on success |
| The Accessibility Tether | Every input has `aria-describedby` pointing to its status message, and toggles `aria-invalid` |
| Live Regions | Status messages use `aria-live="polite"` — errors are announced on blur/submit, not on every keystroke |

## Files

```
gatekeeper/
├── index.html   → structure & ARIA wiring
├── style.css    → all styling (design tokens at the top)
├── script.js    → validation logic + UI state
├── README.md
└── QUICKSTART.md
```

## Design

Dark "security console" theme, since the brief itself frames form validation as a checkpoint. The three accent colors are pulled straight from the brief's own diagrams: blue for the system, red for a rejected payload, green for an approved one. The Input → Process → Output bar at the top of the card visualizes which stage the form is in.

## Notes for the submission

- No external JS libraries — pure DOM APIs, matches the "Aura" project's approach.
- Tested with valid/invalid inputs (including a deliberately weak password and mismatched confirm-password) — see `QUICKSTART.md` for a manual test checklist.
- Real production code would still verify email/password server-side; this only proves the client-side gatekeeping logic.

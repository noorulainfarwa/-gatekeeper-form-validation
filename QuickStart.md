# Quick Start

## Run it

No install, no build step.

1. Open the `gatekeeper` folder in VS Code.
2. Right-click `index.html` → **Open with Live Server** (or just double-click the file to open it in a browser).

That's it — it's a static site.

## Try it

| Field | Try this | Expect |
|---|---|---|
| Full name | `A1` | Red error: letters and spaces only |
| Email | `notanemail` | Red error: invalid address |
| Password | `weak` | Checklist stays mostly unfilled (gray dots) |
| Password | `Str0ng!Pass` | All 5 checklist items turn green |
| Confirm password | different value than password | Red error: passwords don't match |
| Terms | leave unchecked, then submit | Red error under the checkbox |
| All fields filled correctly | — | Submit button briefly says "Verifying…", then the success panel shows the JSON payload |

## File you'll edit most

- `script.js` if you want to add/change a field or its validation rule.
- `style.css` → the `:root` block at the top has every color/font as a variable, change there to retheme.

## Submitting to the portal

Push `index.html`, `style.css`, `script.js`, `README.md`, and `QUICKSTART.md` to your GitHub repo and enable GitHub Pages (Settings → Pages → deploy from main branch) like your previous projects.
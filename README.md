# OET Study Portal (Static HTML/CSS/JavaScript)

This repository now ships as a static web app built with:
- HTML
- CSS
- Vanilla JavaScript (ES modules)

No TypeScript, Next.js runtime, or build step is required for the final app.

## Features

- Student learning portal with curriculum navigation
- Per-chapter completion tracking
- Knowledge-check prompts with revealable answers
- Final assessment scoring (certificate unlock at 3/4 + all chapters complete)
- Printable certificate with learner name and current date
- Student registration modal with browser-side validation and duplicate checks
- Admin portal (`/admin.html`) to edit chapters/materials/video links and publish updates

## Data Persistence

Because this is a static app, data is stored in `localStorage` in the browser:
- Course edits
- Registration records
- Learner progress
- Learner first name for certificate

## Run locally

From the repository root:

```bash
npm run dev
```

Then open:
- `http://localhost:3000/index.html`
- `http://localhost:3000/admin.html`

## Admin access

Admin password is configured in:
- `/home/runner/work/OET101/OET101/js/config.js`

Update `OET_ADMIN_PASSWORD` before deployment.

## Deploy to GitHub Pages

A workflow is included at:
- `/home/runner/work/OET101/OET101/.github/workflows/deploy-pages.yml`

Setup:
1. Go to **Repository Settings → Pages**
2. Set **Source** to **GitHub Actions**
3. Push to `master` and wait for the workflow to complete

Published URL pattern:
- `https://yawdompreh.github.io/OET101/`

## Notes on parity

The student and admin flows from the previous app are preserved in static form. The only unavoidable difference is persistence scope: course updates and registrations are now browser-local (`localStorage`) instead of server-side files/APIs.

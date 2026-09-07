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
- Firebase Email/Password admin login with forgot-password and in-app password change flow

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

Admin identity is fixed to:
- `yawdompreh@gmail.com` (configured in `/home/runner/work/OET101/OET101/js/config.js`)

The password is managed by Firebase Authentication (not stored in this repository).

## Firebase setup (required)

1. Create or open a Firebase project.
2. In Firebase Console, go to **Authentication → Sign-in method** and enable **Email/Password**.
3. In Firebase Console, go to **Authentication → Users** and create the admin user with email:
   - `yawdompreh@gmail.com`
4. In Firebase Console, go to **Project settings → General → Your apps** and copy the web app config values.
5. Update `/home/runner/work/OET101/OET101/js/firebase-env.js` with your Firebase config:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `appId`
   - `messagingSenderId` (recommended)
   - `storageBucket` (recommended)
   - `measurementId` (optional)

Notes:
- Firebase web config values are client-side identifiers, not server secrets.
- Do not commit service-account keys or private backend credentials.

## Forgot-password flow (production)

- On admin login UI, click **Forgot password?**
- Enter `yawdompreh@gmail.com` and submit.
- Firebase sends the reset email using its hosted flow.
- In production on GitHub Pages, this works directly as long as Email/Password is enabled and the admin user exists.

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

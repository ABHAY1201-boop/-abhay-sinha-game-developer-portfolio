# ABHAY SINHA — Full-stack Game Developer Portfolio

Responsive personal portfolio with a Node.js/Express backend.

## Features
- Responsive portfolio frontend: About, Skills, RhythmParry, Education, Certificate and Contact.
- Working contact form with validation and server feedback.
- Express API and persistent JSON message store (`data/messages.json`).
- Rate limit: 5 contact submissions per 15 minutes per IP.
- Honeypot spam field.
- Token-protected admin inbox at `/admin`.
- Admin can list, mark read/unread and delete submissions.
- Helmet security headers and restrictive Content Security Policy.

## Requirements
Node.js 20+ and npm.

## Run locally
1. Extract the ZIP and open a terminal in the project folder.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Generate a private admin token:
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
5. Put the generated value in `.env` as `ADMIN_TOKEN=...`.
6. Run `npm start`.
7. Visit `http://localhost:3000`; admin inbox: `http://localhost:3000/admin`.

## API
- `GET /api/health`
- `POST /api/contact`
- `GET /api/admin/messages` (Bearer admin token)
- `PATCH /api/admin/messages/:id/read` (Bearer admin token)
- `DELETE /api/admin/messages/:id` (Bearer admin token)

## Deployment / production
- This is a Node application. GitHub Pages cannot run its Express backend.
- Deploy to a Node.js host with persistent disk storage, or migrate message storage to a managed database before using an ephemeral/serverless host.
- Set `NODE_ENV=production`, `ADMIN_TOKEN` to a unique random secret (24+ characters), and the host-provided `PORT`.
- Use HTTPS and back up `data/messages.json`.
- Contact messages are stored in the admin inbox; email notifications are not configured yet.
- The RhythmParry GitHub repository is private. Grant access or make it public only after checking third-party asset licences.
- Project art is a CSS-created visual, not gameplay footage. Replace with genuine captures when available.
- Resume download is not displayed until a real resume has been created.

## Files
- `server.js`: backend and API
- `public/index.html`: portfolio
- `public/styles.css`: responsive styling
- `public/app.js`: contact form and navigation
- `public/admin.*`: protected admin inbox
- `data/`: persistent message store

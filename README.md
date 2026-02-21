# Believein Billing Management System

This project is now segregated into `frontend` and `backend`.

## Project Structure

```text
rfp/
  frontend/
    html/
    css/
    js/
    assets/
  backend/
    index.js           # Express server and API routes
    config/db.js       # MongoDB connection
    models/            # Mongoose models (user, patient, billing)
  package.json
  run.sh
```

## Prerequisites

- Node.js 18+
- MongoDB running locally on `mongodb://127.0.0.1:27017/billing`
  - Or set `MONGO_URI` in `.env`

## Environment Variables (optional)

Create `.env` in the project root:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/billing
SESSION_SECRET=change-this-secret
```

## Install

```bash
npm install
```

## Run

Development mode (auto-restart):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Or run:

```bash
./run.sh
```

## Open in Browser

- `http://localhost:3000/html/login.html`

## Main API Routes

- `POST /login1`
- `POST /for` (authenticated users)
- `POST /admit` (authenticated users)
- `POST /billing` (authenticated users)
- `GET /patients` (authenticated users)
- `GET /billing-data` (authenticated users)
- `GET /stats` (authenticated users)
- `GET /me` (authenticated users)
- `GET /admin/users` (admin only)
- `GET /admin/users/list` (admin only)
- `POST /admin/users` (admin only)
- `GET /logout`

## Account Provisioning

- Public signup is disabled.
- Admins create billing users from `http://localhost:3000/admin/users`.


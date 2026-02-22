# Believein Billing Management System

Hospital admission, discharge billing, invoice listing, and admin user management.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- Session auth (`express-session`)
- Vanilla HTML/CSS/JS frontend

## Project Structure

```text
rfp/
  frontend/
    html/
    css/
    js/
    assets/
  backend/
    index.js
    config/db.js
    models/
      user.js
      patient.js
      billing.js
      counter.js
  package.json
  run.sh
```

## Prerequisites

- Node.js 18+
- MongoDB running locally, or a valid MongoDB URI

## Environment Variables

Create `.env` in project root:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/billing
SESSION_SECRET=change-this-secret
```

## Installation

```bash
npm install
```

Install dependencies explicitly (optional):

```bash
npm install express express-session mongoose bcryptjs dotenv cors body-parser
```

Install dev dependency:

```bash
npm install -D nodemon
```

## Run

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Shortcut script:

```bash
./run.sh
```

App URL:

- `http://localhost:3000/html/login.html`

## Authentication and Roles

- Login route creates session cookie (`connect.sid`).
- Protected routes require active session.
- Admin routes require `role: "admin"`.
- Public signup is disabled.

Roles:

- `admin`: full access, including user management.
- `billing_staff`: admissions, billing, invoices, patients, dashboard.

## API Reference

Base URL: `http://localhost:3000`

Notes:

- All JSON requests use header: `Content-Type: application/json`
- Routes marked `Auth Required` need logged-in session cookie.
- Routes marked `Admin Only` need admin session.

## Postman Full Routes

Use these exact URLs in Postman:

- `POST http://localhost:3000/login1`
- `POST http://localhost:3000/for`
- `POST http://localhost:3000/admit`
- `GET http://localhost:3000/patient-id/next`
- `POST http://localhost:3000/billing`
- `GET http://localhost:3000/stats`
- `GET http://localhost:3000/billing-data`
- `GET http://localhost:3000/patients`
- `DELETE http://localhost:3000/discharge/PAT00001`
- `GET http://localhost:3000/me`
- `GET http://localhost:3000/admin/users`
- `GET http://localhost:3000/admin/users/list`
- `POST http://localhost:3000/admin/users`
- `GET http://localhost:3000/logout`

Postman headers for JSON APIs:

- `Content-Type: application/json`

Postman auth/session note:

- Login once using `POST /login1`, then reuse the same Postman request collection/session so cookie `connect.sid` is sent automatically.

### 1. Login

- Method: `POST`
- Route: `/login1`
- Auth: `Public`

Request body:

```json
{
  "username": "admin",
  "role": "admin",
  "password": "your_password"
}
```

Success response:

```json
{
  "success": true,
  "redirect": "/html/dashboard.html"
}
```

Failure response (example):

```json
{
  "success": false,
  "message": "Selected role does not match this account"
}
```

### 2. Reset Password

- Method: `POST`
- Route: `/for`
- Auth: `Auth Required`

Request body:

```json
{
  "username": "billing1",
  "newPassword": "new_password",
  "confirmPassword": "new_password"
}
```

Success response:

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

### 3. Admit Patient

- Method: `POST`
- Route: `/admit`
- Auth: `Auth Required`
- `patientId` is generated on server during save

Request body:

```json
{
  "patientName": "Ravi Kumar",
  "mobileNumber": "9876543210",
  "patientAge": 42,
  "patientGender": "Male",
  "dateOfAdmission": "2026-02-22",
  "doctorName": "Dr. Ashok",
  "medicalCondition": "Fever and dehydration"
}
```

Success response:

```json
{
  "success": true,
  "message": "Patient admitted successfully",
  "patientId": "PAT00001"
}
```

### 4. Preview Next Patient ID

- Method: `GET`
- Route: `/patient-id/next`
- Auth: `Auth Required`

Success response:

```json
{
  "success": true,
  "patientId": "PAT00002"
}
```

### 5. Generate Billing / Discharge

- Method: `POST`
- Route: `/billing`
- Auth: `Auth Required`
- Saves billing record and removes patient from active admissions

Request body:

```json
{
  "patientId": "PAT00001",
  "patientName": "Ravi Kumar",
  "mobileNumber": "9876543210",
  "date": "2026-02-22",
  "doctorName": "Dr. Ashok",
  "labTests": 1200,
  "medicines": 800,
  "consultationFees": 500,
  "roomTaken": "yes",
  "roomCost": 2500
}
```

Success response:

```json
{
  "success": true,
  "message": "Patient Discharged Successfully",
  "redirect": "/html/invoices.html"
}
```

### 6. Dashboard Stats

- Method: `GET`
- Route: `/stats`
- Auth: `Auth Required`

Success response:

```json
{
  "success": true,
  "admittedPatients": 3,
  "dischargedPatients": 5,
  "totalPatients": 8
}
```

### 7. List Billing Records

- Method: `GET`
- Route: `/billing-data`
- Auth: `Auth Required`

Success response:

```json
{
  "success": true,
  "data": [
    {
      "_id": "65d7...",
      "patientName": "Ravi Kumar",
      "patientId": "PAT00001",
      "doctorName": "Dr. Ashok",
      "date": "2026-02-22T00:00:00.000Z",
      "labTests": 1200,
      "medicines": 800,
      "consultationFees": 500,
      "roomCost": 2500,
      "mobileNumber": "9876543210"
    }
  ]
}
```

### 8. List Active Patients

- Method: `GET`
- Route: `/patients`
- Auth: `Auth Required`

Success response:

```json
{
  "success": true,
  "data": [
    {
      "_id": "65d7...",
      "patientId": "PAT00002",
      "patientName": "Anita",
      "patientAge": 31,
      "patientGender": "Female"
    }
  ]
}
```

### 9. Discharge Action Endpoint

- Method: `DELETE`
- Route: `/discharge/:id`
- Auth: `Auth Required`
- Example route: `/discharge/PAT00002`

Success response:

```json
{
  "success": true,
  "message": "Discharged",
  "redirect": "/html/billing.html"
}
```

### 10. Current Logged-In User

- Method: `GET`
- Route: `/me`
- Auth: `Auth Required`

Success response:

```json
{
  "success": true,
  "user": {
    "username": "admin",
    "role": "admin"
  }
}
```

### 11. Admin Users Page

- Method: `GET`
- Route: `/admin/users`
- Auth: `Admin Only`
- Returns admin HTML page.

### 12. Admin List Users

- Method: `GET`
- Route: `/admin/users/list`
- Auth: `Admin Only`

Success response:

```json
{
  "success": true,
  "data": [
    {
      "_id": "65d7...",
      "username": "admin",
      "email": "admin@believein.com",
      "role": "admin"
    }
  ]
}
```

### 13. Admin Create User

- Method: `POST`
- Route: `/admin/users`
- Auth: `Admin Only`

Request body:

```json
{
  "username": "billing2",
  "email": "billing2@believein.com",
  "password": "pass123",
  "confirmPassword": "pass123",
  "role": "billing_staff"
}
```

Success response:

```json
{
  "success": true,
  "message": "User created successfully"
}
```

Failure response (example):

```json
{
  "success": false,
  "message": "Username or email already exists"
}
```

### 14. Logout

- Method: `GET`
- Route: `/logout`
- Auth: `Auth Required session recommended`
- Destroys session and redirects to login page.

## Account Provisioning

- Public signup endpoint returns `403`.
- First admin user should be inserted/updated in MongoDB with:
  - `role: "admin"`
- After that, create additional users via:
  - `http://localhost:3000/admin/users`

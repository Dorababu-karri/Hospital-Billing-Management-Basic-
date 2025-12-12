# 🏥 Hospital Billing Management System

A web-based application for managing patient admissions, viewing admitted patients, generating bills/invoices, and handling user authentication (signup, login, password reset).

---

##  Features

###  Authentication

* User Signup
* Login
* Reset Password

###  Patient Management

* Admit a new patient
* View list of admitted patients
* Discharge a patient

###  Billing System

* Bill generation with lab tests, medicines, consultation, room charges
* Auto calculated total bill
* Download invoice as PDF (via browser print)
* List all bills & invoices

###  Dashboard

* Total Patients
* Admitted Patients
* Discharged Patients

---

#  Tech Stack

| Layer    | Technology               |
| -------- | ------------------------ |
| Frontend | HTML, CSS, JavaScript    |
| Backend  | Node.js + Express        |
| Database | MongoDB                  |
| Runtime  | Nodemon for auto-restart |

---

#  Installation & Setup Guide

##  **Install Node.js**

Download & install from:
[https://nodejs.org/](https://nodejs.org/)

Check installation:

```sh
node -v
npm -v
```

---

##  **Install MongoDB**

### 🔹 Option A: Install Local MongoDB Server

Download from:
[https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)

After installation, start MongoDB service:

**Windows**

```sh
net start MongoDB
```

**macOS / Linux**

```sh
sudo systemctl start mongod
```

###  Option B: Use MongoDB Atlas (Cloud)

1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create free cluster
3. Create database user (username & password)
4. Get connection string like:

```
mongodb+srv://<user>:<password>@cluster0.mongodb.net/hospital
```

---

## 3️⃣ **Clone or Add Project Files**

Inside your folder ensure `index.js` exists (backend file).

---

## 4️⃣ **Install all required npm packages**

Open terminal in the project folder:

```sh
npm install express mongoose cors body-parser nodemon
```

---

## 5️⃣ **Configure MongoDB Connection**

Inside `index.js` (or `indes.js` in your command), include:

```js
const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/hospitalDB") 
// or your MongoDB Atlas URL
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("MongoDB error:", err));
```

---

##  **Run the App**

```sh
npx nodemon index.js
```

---

#  Usage Instructions

### 1. Open browser

```
http://localhost:3000/login1.html
```

### 2. Login or Signup

* Signup → `/signup`
* Login → `/login1`

### 3. Dashboard

Shows patient statistics.

### 4. Admit Patient

`admit.html`

### 5. View Admitted Patients

`viewpat.html`

* Click **Discharge** to go to billing.

### 6. Billing Interface

`billGen.html`

* Enter details
* Calculate total
* Submit
* Redirects to invoice record

### 7. View Bills / Download Invoice

`bills-invoices.html`

---

# 📡 Backend API Routes (Summary)

| Route           | Method | Description           |
| --------------- | ------ | --------------------- |
| `/signup`       | POST   | Register user         |
| `/login1`       | POST   | User login            |
| `/for`          | POST   | Reset password        |
| `/admit`        | POST   | Admit patient         |
| `/patients`     | GET    | Get admitted patients |
| `/billing`      | POST   | Store billing details |
| `/billing-data` | GET    | Fetch all bills       |
| `/stats`        | GET    | Dashboard stats       |

---

#  Testing Database Connection

Run:

```js
mongoose.connection.once("open", () => {
    console.log("MongoDB connection successful.");
});
```

Then start server:

```sh
npx nodemon indes.js
```

---

#  License

This project is **free to use and modify**.

---

 
const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const session = require("express-session");
require("dotenv").config();

const connectDB = require("./config/db");
const User = require("./models/user");
const Patient = require("./models/patient");
const Billing = require("./models/billing");
const Counter = require("./models/counter");

const app = express();
const port = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === "production";
const sessionSecret = process.env.SESSION_SECRET || "secure-secret-key";

const PATIENT_ID_KEY = "patientId";

async function findMaxPatientIdNumber() {
    const [patients, billingRecords] = await Promise.all([
        Patient.find({}, { patientId: 1, _id: 0 }),
        Billing.find({}, { patientId: 1, _id: 0 })
    ]);

    let maxNumber = 0;
    const records = [...patients, ...billingRecords];
    for (const record of records) {
        const match = /^PAT(\d+)$/.exec(record.patientId || "");
        if (!match) {
            continue;
        }
        const numericId = parseInt(match[1], 10);
        if (numericId > maxNumber) {
            maxNumber = numericId;
        }
    }

    return maxNumber;
}

async function reserveNextPatientId() {
    let counter = await Counter.findOne({ key: PATIENT_ID_KEY });
    if (!counter) {
        const maxNumber = await findMaxPatientIdNumber();
        counter = await Counter.create({ key: PATIENT_ID_KEY, value: maxNumber });
    }

    const updatedCounter = await Counter.findOneAndUpdate(
        { key: PATIENT_ID_KEY },
        { $inc: { value: 1 } },
        { new: true }
    );

    return `PAT${String(updatedCounter.value).padStart(5, "0")}`;
}

async function getNextPatientIdPreview() {
    const counter = await Counter.findOne({ key: PATIENT_ID_KEY });
    if (!counter) {
        const maxNumber = await findMaxPatientIdNumber();
        return `PAT${String(maxNumber + 1).padStart(5, "0")}`;
    }
    return `PAT${String(counter.value + 1).padStart(5, "0")}`;
}

function requireAuth(req, res, next) {
    if (!req.session.user || !req.session.user.username) {
        if (req.accepts("html")) {
            return res.redirect("/html/login.html");
        }
        return res.status(401).json({ success: false, message: "Authentication required" });
    }
    return next();
}

function requireRole(role) {
    return (req, res, next) => {
        if (!req.session.user || !req.session.user.username) {
            if (req.accepts("html")) {
                return res.redirect("/html/login.html");
            }
            return res.status(401).json({ success: false, message: "Authentication required" });
        }
        if (req.session.user.role !== role) {
            if (req.accepts("html")) {
                return res.redirect("/html/dashboard.html");
            }
            return res.status(403).json({ success: false, message: "Access denied" });
        }
        return next();
    };
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
    session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: isProduction,
            httpOnly: true,
            sameSite: "lax"
        }
    })
);

// Prevent cached pages from showing protected content after logout.
app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
});

const publicPath = path.join(__dirname, "..", "frontend");

app.use("/html/dashboard.html", requireAuth);
app.use("/html/admit.html", requireAuth);
app.use("/html/patients.html", requireAuth);
app.use("/html/billing.html", requireAuth);
app.use("/html/invoices.html", requireAuth);
app.use("/html/reset-password.html", requireAuth);
app.use("/html/admin-users.html", requireRole("admin"));

app.use(express.static(publicPath));

app.get("/", (req, res) => {
    if (req.session.user) {
        return res.redirect("/html/dashboard.html");
    }
    return res.sendFile(path.join(publicPath, "html", "login.html"));
});

app.post("/login1", async (req, res) => {
    try {
        const selectedRole = req.body.role;
        if (!selectedRole || !["admin", "billing_staff"].includes(selectedRole)) {
            return res.json({ success: false, message: "Please select a valid role" });
        }

        const user = await User.findOne({ username: req.body.username });

        if (!user) {
            return res.json({ success: false, message: "Invalid Username/Password" });
        }

        if (user.role !== selectedRole) {
            return res.json({ success: false, message: "Selected role does not match this account" });
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordValid) {
            return res.json({ success: false, message: "Wrong password" });
        }

        req.session.user = { username: user.username, role: user.role };
        return res.json({ success: true, redirect: "/html/dashboard.html" });
    } catch {
        return res.json({ success: false, message: "Server error, please try again." });
    }
});

app.post("/for", requireAuth, async (req, res) => {
    try {
        const { username, newPassword, confirmPassword } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.json({ success: false, message: "Enter a valid Username" });
        }

        if (newPassword !== confirmPassword) {
            return res.json({ success: false, message: "Passwords do not match" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.updateOne({ username }, { $set: { password: hashedPassword } });

        return res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Password reset error:", error);
        return res.json({ success: false, message: "Server error" });
    }
});

app.post("/admit", requireAuth, async (req, res) => {
    try {
        const requestPayload = { ...req.body };
        requestPayload.patientId = await reserveNextPatientId();

        const existingPatientRecord =
            (await Patient.findOne({ patientId: requestPayload.patientId })) ||
            (await Billing.findOne({ patientId: requestPayload.patientId }));

        if (existingPatientRecord) {
            return res.json({ success: false, message: "Patient ID already exists" });
        }

        await Patient.create(requestPayload);
        return res.json({
            success: true,
            message: "Patient admitted successfully",
            patientId: requestPayload.patientId
        });
    } catch (error) {
        console.error("Admission error:", error);
        return res.json({ success: false, message: "Server error" });
    }
});

app.get("/patient-id/next", requireAuth, async (req, res) => {
    try {
        const patientId = await getNextPatientIdPreview();
        return res.json({ success: true, patientId });
    } catch (error) {
        console.error("Preview patient id error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

app.post("/billing", requireAuth, async (req, res) => {
    try {
        const billingRecord = new Billing(req.body);
        await billingRecord.save();

        await Patient.findOneAndDelete({ patientId: req.body.patientId });

        return res.json({
            success: true,
            message: "Patient Discharged Successfully",
            redirect: "/html/invoices.html"
        });
    } catch (error) {
        console.error("Billing error:", error);
        return res.json({ success: false });
    }
});

app.get("/stats", requireAuth, async (req, res) => {
    try {
        const admittedCount = await Patient.countDocuments();
        const dischargedCount = await Billing.countDocuments();

        return res.json({
            success: true,
            admittedPatients: admittedCount,
            dischargedPatients: dischargedCount,
            totalPatients: admittedCount + dischargedCount
        });
    } catch (error) {
        console.error("Stats error:", error);
        return res.json({ success: false, message: "Server error" });
    }
});

app.get("/billing-data", requireAuth, async (req, res) => {
    try {
        const bills = await Billing.find().sort({ date: -1 });
        return res.json({ success: true, data: bills });
    } catch (error) {
        console.error("Billing data error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

app.get("/patients", requireAuth, async (req, res) => {
    try {
        const patients = await Patient.find();
        return res.json({ success: true, data: patients });
    } catch (error) {
        console.error("Patient data error:", error);
        return res.json({ success: false, message: "Server error" });
    }
});

app.delete("/discharge/:id", requireAuth, async (req, res) => {
    try {
        const dischargedPatient = await Patient.findOneAndDelete({ patientId: req.params.id });
        if (!dischargedPatient) {
            return res.json({ success: false, message: "Patient not found" });
        }
        return res.json({ success: true, message: "Discharged", redirect: "/html/billing.html" });
    } catch (error) {
        console.error("Discharge error:", error);
        return res.json({ success: false, message: "Server error" });
    }
});

app.get("/me", requireAuth, (req, res) => {
    return res.json({
        success: true,
        user: {
            username: req.session.user.username,
            role: req.session.user.role
        }
    });
});

app.get("/admin/users", requireRole("admin"), (req, res) => {
    return res.sendFile(path.join(publicPath, "html", "admin-users.html"));
});

app.get("/admin/users/list", requireRole("admin"), async (req, res) => {
    try {
        const users = await User.find({}, { username: 1, email: 1, role: 1 }).sort({ username: 1 });
        return res.json({ success: true, data: users });
    } catch (error) {
        console.error("Admin list users error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

app.post("/admin/users", requireRole("admin"), async (req, res) => {
    try {
        const { username, email, password, confirmPassword, role } = req.body;

        if (!username || !email || !password || !confirmPassword) {
            return res.json({ success: false, message: "All fields are required" });
        }

        if (password !== confirmPassword) {
            return res.json({ success: false, message: "Passwords do not match" });
        }

        const normalizedRole = role === "admin" ? "admin" : "billing_staff";
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.json({ success: false, message: "Username or email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, email, password: hashedPassword, role: normalizedRole });

        return res.json({ success: true, message: "User created successfully" });
    } catch (error) {
        console.error("Admin create user error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy((error) => {
        res.clearCookie("connect.sid", { path: "/" });
        if (error) {
            console.error("Logout error:", error);
        }
        return res.redirect("/html/login.html");
    });
});

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log("http://localhost:" + port);
            console.log("Server running on port", port);
        });
    })
    .catch((error) => {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    });

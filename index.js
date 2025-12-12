const express = require("express");
const path = require("path");
const app = express();
const bcrypt = require("bcryptjs");
const session = require("express-session");

const LoginCollection = require("./mongo");
const PatientDetails = require("./patientsMongo");
const BillingData = require("./billingData");

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: "secure-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));

const publicPath = path.join(__dirname, "project");
app.use(express.static(publicPath));

app.get("/", (req, res) => {
    if (req.session.user) {
        return res.redirect("/dashboard.html");
    }
    res.sendFile(path.join(publicPath, "login1.html"));
});

app.post("/login1", async (req, res) => {
    try {
        const user = await LoginCollection.findOne({ username: req.body.username });

        if (!user) {
            return res.json({ success: false, message: "Invalid Username/Password" });
        }

        const match = await bcrypt.compare(req.body.password, user.password);
        if (match) {
            req.session.user = user.username;
            return res.json({ success: true, redirect: "/dashboard.html" });
        } else {
            return res.json({ success: false, message: "Wrong password" });
        }
    } catch {
        return res.json({ success: false, message: "Server error, please try again." });
    }
});

app.post("/for", async (req, res) => {
    try {
        const { username, newPassword, confirmPassword } = req.body;
        const user = await LoginCollection.findOne({ username });

        if (!user) {
            return res.json({ success: false, message: "Enter a valid Username" });
        }

        if (newPassword !== confirmPassword) {
            return res.json({ success: false, message: "Passwords do not match" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await LoginCollection.updateOne({ username }, { $set: { password: hashedPassword } });

        return res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Password reset error:", error);
        return res.json({ success: false, message: "Server error" });
    }
});

app.post("/admit", async (req, res) => {
    try {
        const exists = await PatientDetails.findOne({ patientId: req.body.patientId }) ||
                       await BillingData.findOne({ patientId: req.body.patientId });

        if (exists) {
            return res.json({ success: false, message: "Patient ID already exists" });
        }

        await PatientDetails.create(req.body);
        return res.json({ success: true, message: "Patient admitted successfully" });
    } catch (error) {
        console.error("Admission error:", error);
        res.json({ success: false, message: "Server error" });
    }
});

app.post("/billing", async (req, res) => {
    try {
        const billing = new BillingData(req.body);
        await billing.save();

        await PatientDetails.findOneAndDelete({ patientId: req.body.patientId });

        res.json({ success: true,message:"Patient Diascharged Successfully", redirect: "/bills-invoices.html" });
    } catch (error) {
        console.error("Billing error:", error);
        res.json({ success: false });
    }
});

app.get("/stats", async (req, res) => {
    try {
        const admittedCount = await PatientDetails.countDocuments();
        const dischargedCount = await BillingData.countDocuments();
        const totalCount = admittedCount + dischargedCount;

        res.json({
            success: true,
            admittedPatients: admittedCount,
            dischargedPatients: dischargedCount,
            totalPatients: totalCount
        });
    } catch (error) {
        console.error("Stats error:", error);
        res.json({ success: false, message: "Server error" });
    }
});


app.get("/billing-data", async (req, res) => {
    try {
        const bills = await BillingData.find().sort({ date: -1 });
        res.json({ success: true, data: bills });
    } catch (error) {
        console.error("Billing data error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.get("/patients", async (req, res) => {
    try {
        const patients = await PatientDetails.find();
        res.json({ success: true, data: patients });
    } catch (error) {
        console.error("Patient data error:", error);
        res.json({ success: false, message: "Server error" });
    }
});

app.delete("/discharge/:id", async (req, res) => {
    try {
        const removed = await PatientDetails.findOneAndDelete({ patientId: req.params.id });
        if (!removed) {
            return res.json({ success: false, message: "Patient not found" });
        }
        res.json({ success: true, message: "Discharged", redirect: "/billGen.html" });
    } catch (error) {
        console.error("Discharge error:", error);
        res.json({ success: false, message: "Server error" });
    }
});

app.get("/dashboard.html", (req, res) => {
    res.sendFile(path.join(publicPath, "dashboard.html"));
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.redirect("/");
    });
});

app.listen(port, () => {
    console.log("Server running on port", port);
});
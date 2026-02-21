const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
    patientId: {
        type: String,
        required: true,
        unique: true
    },
    patientName: {
        type: String,
        required: true
    },
    patientAge: {
        type: Number,
        required: true
    },
    patientGender: {
        type: String,
        required: true
    },
    dateOfAdmission: {
        type: Date,
        required: true
    },
    doctorName: {
        type: String,
        required: true
    },
    medicalCondition: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: String,
        required: true
    }
});

const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient;

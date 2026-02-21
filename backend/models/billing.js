const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema({
    patientName: {
        type: String,
        required: true
    },
    patientId: {
        type: String,
        required: true,
        index: true
    },
    doctorName: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    labTests: {
        type: Number,
        required: true
    },
    medicines: {
        type: Number,
        required: true
    },
    consultationFees: {
        type: Number,
        required: true
    },
    roomCost: {
        type: Number,
        required: true
    },
    mobileNumber: {
        type: String,
        required: true
    }
});

const Billing = mongoose.model("Billing", billingSchema);
module.exports = Billing;

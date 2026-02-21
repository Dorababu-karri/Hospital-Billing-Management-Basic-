document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("date").value = new Date().toISOString().split("T")[0];

    const urlParams = new URLSearchParams(window.location.search);
    document.getElementById("patientId").value = urlParams.get("id") || "";
    document.getElementById("patientName").value = urlParams.get("name") || "";
    document.getElementById("doctorName").value = urlParams.get("doctor") || "";
    document.getElementById("mobileNumber").value = urlParams.get("mobile") || "";
});

const roomTakenSelect = document.getElementById("roomTaken");
const roomCostSection = document.getElementById("room-cost-section");
const totalBillDisplay = document.getElementById("total-bill-display");

roomTakenSelect.addEventListener("change", () => {
    if (roomTakenSelect.value === "yes") {
        roomCostSection.style.display = "grid";
    } else {
        roomCostSection.style.display = "none";
        document.getElementById("roomCost").value = "";
    }
});

document.getElementById("total-bill-btn").addEventListener("click", () => {
    const labTests = parseFloat(document.getElementById("labTests").value) || 0;
    const medicines = parseFloat(document.getElementById("medicines").value) || 0;
    const consultationFees = parseFloat(document.getElementById("consultationFees").value) || 0;
    const roomCost = roomTakenSelect.value === "yes" ? (parseFloat(document.getElementById("roomCost").value) || 0) : 0;

    const totalBill = labTests + medicines + consultationFees + roomCost;
    totalBillDisplay.innerText = `Total Bill: Rs. ${totalBill.toFixed(2)}`;
});

document.getElementById("billing-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const billingPayload = Object.fromEntries(formData.entries());

    if (billingPayload.roomTaken === "no") {
        billingPayload.roomCost = 0;
    }

    const statusMessage = document.getElementById("status-message");

    try {
        const response = await fetch("/billing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(billingPayload)
        });

        const billingResult = await response.json();

        if (billingResult.success) {
            statusMessage.textContent = "Patient discharged successfully.";
            statusMessage.style.color = "#1f8f4a";
            window.location.href = billingResult.redirect;
        } else {
            statusMessage.textContent = "Failed to store billing data. Please try again.";
            statusMessage.style.color = "#be2d2d";
        }
    } catch (error) {
        console.error("Error submitting form:", error);
        statusMessage.textContent = "Server error. Please try again later.";
        statusMessage.style.color = "#be2d2d";
    }
});

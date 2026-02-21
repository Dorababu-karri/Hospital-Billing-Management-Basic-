const admitForm = document.getElementById("admit-form");
const patientIdInput = document.getElementById("pid");
const dateInput = document.getElementById("date");
const today = new Date().toISOString().split("T")[0];
dateInput.value = today;
const errorMessage = document.getElementById("error-message");

async function loadGeneratedPatientId() {
    try {
        const response = await fetch("/patient-id/next");
        const reserveResult = await response.json();

        if (reserveResult.success) {
            patientIdInput.value = reserveResult.patientId;
            return;
        }

        errorMessage.textContent = "Unable to generate Patient ID. Please refresh.";
        errorMessage.style.display = "block";
        errorMessage.style.color = "#be2d2d";
    } catch (error) {
        console.error("Patient ID generation error:", error);
        errorMessage.textContent = "Unable to generate Patient ID. Please refresh.";
        errorMessage.style.display = "block";
        errorMessage.style.color = "#be2d2d";
    }
}

loadGeneratedPatientId();

admitForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
        patientName: document.getElementById("name").value,
        mobileNumber: document.getElementById("mobile").value,
        patientAge: document.getElementById("age").value,
        patientGender: document.getElementById("gender").value,
        dateOfAdmission: document.getElementById("date").value,
        doctorName: document.getElementById("doctor").value,
        medicalCondition: document.getElementById("condition").value
    };

    const response = await fetch("/admit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const admissionResult = await response.json();
    errorMessage.textContent = admissionResult.message;
    errorMessage.style.display = "block";
    errorMessage.style.color = admissionResult.success ? "#1f8f4a" : "#be2d2d";

    if (admissionResult.success) {
        admitForm.reset();
        dateInput.value = today;
        await loadGeneratedPatientId();
    }
});

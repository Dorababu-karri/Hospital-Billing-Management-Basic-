document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById("patients-table-body");

    try {
        const response = await fetch("/patients");
        const patientsResult = await response.json();

        if (!patientsResult.success) {
            return;
        }

        tableBody.innerHTML = "";

        patientsResult.data.forEach((patient) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${patient.patientId}</td>
                <td>${patient.patientName}</td>
                <td>${patient.patientAge}</td>
                <td>${patient.patientGender}</td>
                <td><button class="discharge-btn" data-id="${patient.patientId}" data-name="${patient.patientName}" data-doctor="${patient.doctorName}" data-mobile="${patient.mobileNumber}">Discharge</button></td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll(".discharge-btn").forEach((button) => {
            button.addEventListener("click", () => {
                const patientId = button.getAttribute("data-id");
                const patientName = button.getAttribute("data-name");
                const doctorName = button.getAttribute("data-doctor");
                const mobileNumber = button.getAttribute("data-mobile");

                if (confirm("Are you sure you want to discharge this patient?")) {
                    window.location.href = `billing.html?id=${patientId}&name=${encodeURIComponent(patientName)}&doctor=${encodeURIComponent(doctorName)}&mobile=${encodeURIComponent(mobileNumber)}`;
                }
            });
        });
    } catch (error) {
        console.error("Error fetching patients:", error);
    }
});

document.addEventListener("DOMContentLoaded", async function () {
    const invoiceTableBody = document.getElementById("invoice-table-body");

    try {
        const response = await fetch("/billing-data");
        const billingRecordsResult = await response.json();

        if (billingRecordsResult.success && Array.isArray(billingRecordsResult.data)) {
            if (billingRecordsResult.data.length === 0) {
                invoiceTableBody.innerHTML = '<tr><td colspan="5">No billing data found.</td></tr>';
                return;
            }

            billingRecordsResult.data.forEach((billRecord) => {
                const invoiceRow = document.createElement("tr");
                const totalAmount =
                    parseFloat(billRecord.labTests || 0) +
                    parseFloat(billRecord.medicines || 0) +
                    parseFloat(billRecord.consultationFees || 0) +
                    parseFloat(billRecord.roomCost || 0);

                invoiceRow.setAttribute("data-room", billRecord.roomCost || 0);
                invoiceRow.setAttribute("data-lab", billRecord.labTests || 0);
                invoiceRow.setAttribute("data-meds", billRecord.medicines || 0);
                invoiceRow.setAttribute("data-fees", billRecord.consultationFees || 0);
                invoiceRow.setAttribute("data-doctor", billRecord.doctorName || "N/A");
                invoiceRow.setAttribute("data-mobile", billRecord.mobileNumber || "N/A");

                invoiceRow.innerHTML = `
                    <td>${billRecord.patientId}</td>
                    <td>${billRecord.patientName}</td>
                    <td>Rs. ${totalAmount.toFixed(2)}</td>
                    <td>${new Date(billRecord.date).toLocaleDateString()}</td>
                    <td><button class="download-btn">Download</button></td>
                `;
                invoiceTableBody.appendChild(invoiceRow);
            });

            attachDownloadListeners();
        } else {
            invoiceTableBody.innerHTML = '<tr><td colspan="5">Failed to load data</td></tr>';
        }
    } catch (error) {
        console.error("Failed to fetch billing data:", error);
        invoiceTableBody.innerHTML = '<tr><td colspan="5">Server error. Could not load data.</td></tr>';
    }

    document.getElementById("search-btn").addEventListener("click", function () {
        const searchTerm = document.getElementById("search").value.toLowerCase();
        const invoiceRows = document.querySelectorAll(".invoice-table tbody tr");

        invoiceRows.forEach((invoiceRow) => {
            const patientName = invoiceRow.cells[1].textContent.toLowerCase();
            const invoiceId = invoiceRow.cells[0].textContent.toLowerCase();
            invoiceRow.style.display = patientName.includes(searchTerm) || invoiceId.includes(searchTerm) ? "" : "none";
        });
    });
});

function attachDownloadListeners() {
    document.querySelectorAll(".download-btn").forEach((downloadButton) => {
        downloadButton.addEventListener("click", function () {
            const invoiceRow = this.closest("tr");
            const invoiceId = "INV-" + invoiceRow.cells[0].textContent;
            const patientName = invoiceRow.cells[1].textContent;
            const amount = invoiceRow.cells[2].textContent;
            const dateIssued = invoiceRow.cells[3].textContent;
            const mobileNumber = invoiceRow.getAttribute("data-mobile");

            const invoiceHtml = `
<html>
<head><title>Invoice - ${invoiceId}</title>
<style>
body { font-family: Arial, sans-serif; padding: 20px; background: #f4f8fb; color: #333; }
h2 { text-align: center; color: #123; margin-bottom: 30px; }
table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; }
td { border: 1px solid #ddd; padding: 10px; }
.downloadBtn { background: #2564ac; color: white; padding: 10px 20px; border: none; border-radius: 5px; margin-top: 16px; }
@media print { .downloadBtn { display: none; } }
</style>
</head>
<body>
<h2>Invoice</h2>
<table>
<tr><td><strong>Invoice ID:</strong> ${invoiceId}</td></tr>
<tr><td><strong>Patient Name:</strong> ${patientName}</td></tr>
<tr><td><strong>Mobile Number:</strong> ${mobileNumber}</td></tr>
<tr><td><strong>Consulted Doctor:</strong> ${invoiceRow.getAttribute("data-doctor")}</td></tr>
<tr><td><strong>Date Issued:</strong> ${dateIssued}</td></tr>
<tr><td><strong>Room Cost:</strong> Rs. ${parseFloat(invoiceRow.getAttribute("data-room")).toFixed(2)}</td></tr>
<tr><td><strong>Lab Tests:</strong> Rs. ${parseFloat(invoiceRow.getAttribute("data-lab")).toFixed(2)}</td></tr>
<tr><td><strong>Medicines:</strong> Rs. ${parseFloat(invoiceRow.getAttribute("data-meds")).toFixed(2)}</td></tr>
<tr><td><strong>Consultation Fees:</strong> Rs. ${parseFloat(invoiceRow.getAttribute("data-fees")).toFixed(2)}</td></tr>
<tr><td><strong>Total Amount:</strong> ${amount}</td></tr>
</table>
<button class="downloadBtn" onclick="window.print()">Download</button>
</body>
</html>`;

            const invoiceWindow = window.open("", "_blank");
            invoiceWindow.document.write(invoiceHtml);
            invoiceWindow.document.close();
        });
    });
}

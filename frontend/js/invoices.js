const currencyFormat = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2
});

function formatMoney(value) {
    return currencyFormat.format(Number(value || 0));
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function createInvoicePrintHtml(invoiceData) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice - ${escapeHtml(invoiceData.invoiceId)}</title>
  <style>
    :root {
      --ink: #0f172a;
      --muted: #64748b;
      --line: #dbe5f4;
      --brand: #0f6fc9;
      --brand-soft: #eef5ff;
      --surface: #ffffff;
      --bg: #f4f7fc;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", Arial, sans-serif;
      color: var(--ink);
      background: var(--bg);
      padding: 24px;
    }
    .invoice-sheet {
      max-width: 900px;
      margin: 0 auto;
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
    }
    .invoice-top {
      padding: 20px 24px;
      background: linear-gradient(135deg, #0f6fc9, #1297d7);
      color: #ffffff;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      flex-wrap: wrap;
    }
    .brand-title {
      margin: 0;
      font-size: 1.4rem;
      font-weight: 800;
      letter-spacing: 0.01em;
    }
    .brand-subtitle {
      margin: 6px 0 0;
      opacity: 0.92;
      font-size: 0.92rem;
    }
    .invoice-tag {
      background: rgba(255, 255, 255, 0.16);
      border: 1px solid rgba(255, 255, 255, 0.24);
      border-radius: 999px;
      padding: 8px 14px;
      font-size: 0.86rem;
      font-weight: 700;
    }
    .invoice-body {
      padding: 24px;
      display: grid;
      gap: 18px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    .meta-card {
      background: #f9fbff;
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 12px;
    }
    .meta-label {
      margin: 0 0 4px;
      font-size: 0.76rem;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 700;
    }
    .meta-value {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: #0f2746;
    }
    .section-title {
      margin: 0;
      font-size: 1rem;
      color: #133f78;
    }
    .charges-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid var(--line);
      border-radius: 10px;
      overflow: hidden;
    }
    .charges-table th,
    .charges-table td {
      padding: 11px 12px;
      border-bottom: 1px solid var(--line);
      text-align: left;
    }
    .charges-table th {
      background: var(--brand-soft);
      color: #113d73;
      font-size: 0.85rem;
      letter-spacing: 0.02em;
    }
    .charges-table td:last-child {
      text-align: right;
      font-weight: 700;
      color: #0f2746;
    }
    .charges-table tr:last-child td {
      border-bottom: 0;
      background: #f5faff;
      font-weight: 800;
    }
    .invoice-foot {
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .note {
      margin: 0;
      color: var(--muted);
      font-size: 0.86rem;
    }
    .print-btn {
      border: 0;
      background: linear-gradient(130deg, #0f6fc9, #1987e3);
      color: #ffffff;
      font-weight: 700;
      border-radius: 8px;
      padding: 10px 16px;
      cursor: pointer;
    }
    @media (max-width: 700px) {
      body { padding: 12px; }
      .invoice-body { padding: 16px; }
      .meta-grid { grid-template-columns: 1fr; }
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .invoice-sheet { box-shadow: none; border-radius: 0; border: 0; max-width: 100%; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <article class="invoice-sheet">
    <header class="invoice-top">
      <div>
        <h1 class="brand-title">Believein Hospitals</h1>
        <p class="brand-subtitle">Billing and Discharge Invoice</p>
      </div>
      <div class="invoice-tag">Invoice ${escapeHtml(invoiceData.invoiceId)}</div>
    </header>

    <section class="invoice-body">
      <div class="meta-grid">
        <div class="meta-card">
          <p class="meta-label">Patient ID</p>
          <p class="meta-value">${escapeHtml(invoiceData.patientId)}</p>
        </div>
        <div class="meta-card">
          <p class="meta-label">Invoice Date</p>
          <p class="meta-value">${escapeHtml(invoiceData.dateIssued)}</p>
        </div>
        <div class="meta-card">
          <p class="meta-label">Patient Name</p>
          <p class="meta-value">${escapeHtml(invoiceData.patientName)}</p>
        </div>
        <div class="meta-card">
          <p class="meta-label">Mobile Number</p>
          <p class="meta-value">${escapeHtml(invoiceData.mobileNumber)}</p>
        </div>
        <div class="meta-card">
          <p class="meta-label">Consulted Doctor</p>
          <p class="meta-value">${escapeHtml(invoiceData.doctorName)}</p>
        </div>
        <div class="meta-card">
          <p class="meta-label">Payment Status</p>
          <p class="meta-value">Paid at Discharge</p>
        </div>
      </div>

      <h2 class="section-title">Charge Breakdown</h2>
      <table class="charges-table">
        <thead>
          <tr>
            <th>Charge Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Room Charges</td>
            <td>${escapeHtml(formatMoney(invoiceData.roomCost))}</td>
          </tr>
          <tr>
            <td>Lab Tests</td>
            <td>${escapeHtml(formatMoney(invoiceData.labCost))}</td>
          </tr>
          <tr>
            <td>Medicines</td>
            <td>${escapeHtml(formatMoney(invoiceData.medicineCost))}</td>
          </tr>
          <tr>
            <td>Consultation Fees</td>
            <td>${escapeHtml(formatMoney(invoiceData.consultationCost))}</td>
          </tr>
          <tr>
            <td>Total Amount</td>
            <td>${escapeHtml(formatMoney(invoiceData.totalAmount))}</td>
          </tr>
        </tbody>
      </table>

      <footer class="invoice-foot">
        <p class="note">This is a system-generated invoice from Believein Hospitals.</p>
        <button class="print-btn" onclick="window.print()">Download / Print</button>
      </footer>
    </section>
  </article>
</body>
</html>`;
}

function attachDownloadListeners() {
    document.querySelectorAll(".download-btn").forEach((downloadButton) => {
        downloadButton.addEventListener("click", function () {
            const invoiceRow = this.closest("tr");
            const patientId = invoiceRow.cells[0].textContent;
            const invoiceData = {
                invoiceId: `INV-${patientId}`,
                patientId,
                patientName: invoiceRow.cells[1].textContent,
                dateIssued: invoiceRow.cells[3].textContent,
                mobileNumber: invoiceRow.dataset.mobile || "N/A",
                doctorName: invoiceRow.dataset.doctor || "N/A",
                roomCost: Number(invoiceRow.dataset.room || 0),
                labCost: Number(invoiceRow.dataset.lab || 0),
                medicineCost: Number(invoiceRow.dataset.meds || 0),
                consultationCost: Number(invoiceRow.dataset.fees || 0)
            };

            invoiceData.totalAmount =
                invoiceData.roomCost +
                invoiceData.labCost +
                invoiceData.medicineCost +
                invoiceData.consultationCost;

            const invoiceWindow = window.open("", "_blank");
            if (!invoiceWindow) {
                alert("Popup blocked. Please allow popups to open invoice.");
                return;
            }

            invoiceWindow.document.write(createInvoicePrintHtml(invoiceData));
            invoiceWindow.document.close();
        });
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    const invoiceTableBody = document.getElementById("invoice-table-body");
    const searchInput = document.getElementById("search");
    const searchButton = document.getElementById("search-btn");

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
                const roomCost = Number(billRecord.roomCost || 0);
                const labCost = Number(billRecord.labTests || 0);
                const medicineCost = Number(billRecord.medicines || 0);
                const consultationCost = Number(billRecord.consultationFees || 0);
                const totalAmount = roomCost + labCost + medicineCost + consultationCost;

                invoiceRow.dataset.room = String(roomCost);
                invoiceRow.dataset.lab = String(labCost);
                invoiceRow.dataset.meds = String(medicineCost);
                invoiceRow.dataset.fees = String(consultationCost);
                invoiceRow.dataset.doctor = billRecord.doctorName || "N/A";
                invoiceRow.dataset.mobile = billRecord.mobileNumber || "N/A";

                invoiceRow.innerHTML = `
                    <td>${escapeHtml(billRecord.patientId)}</td>
                    <td>${escapeHtml(billRecord.patientName)}</td>
                    <td>${escapeHtml(formatMoney(totalAmount))}</td>
                    <td>${escapeHtml(new Date(billRecord.date).toLocaleDateString())}</td>
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

    function filterInvoices() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const invoiceRows = document.querySelectorAll(".invoice-table tbody tr");

        invoiceRows.forEach((invoiceRow) => {
            const patientName = invoiceRow.cells[1].textContent.toLowerCase();
            const patientId = invoiceRow.cells[0].textContent.toLowerCase();
            invoiceRow.style.display = patientName.includes(searchTerm) || patientId.includes(searchTerm) ? "" : "none";
        });
    }

    searchButton.addEventListener("click", filterInvoices);
    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            filterInvoices();
        }
    });
});

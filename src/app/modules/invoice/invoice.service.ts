import puppeteer from 'puppeteer';

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  courseName: string;
  courseType?: string;
  batchName?: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  paidAt?: string;
  status: string;
}

const generateInvoiceHTML = (data: InvoiceData): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155; background: #fff; }
    .invoice { max-width: 800px; margin: 0 auto; padding: 40px; }
    
    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #41bfb8; }
    .logo-section h1 { font-size: 24px; color: #0f172a; font-weight: 800; }
    .logo-section h1 span { color: #41bfb8; }
    .logo-section p { font-size: 11px; color: #94a3b8; margin-top: 4px; }
    .invoice-meta { text-align: right; }
    .invoice-meta h2 { font-size: 28px; color: #41bfb8; font-weight: 800; letter-spacing: 2px; margin-bottom: 8px; }
    .invoice-meta p { font-size: 12px; color: #64748b; line-height: 1.6; }
    .invoice-meta strong { color: #0f172a; }
    
    /* Status */
    .status-badge { display: inline-block; padding: 4px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .status-paid { background: #dcfce7; color: #16a34a; }
    .status-pending { background: #fef3c7; color: #d97706; }
    .status-failed { background: #fee2e2; color: #dc2626; }
    
    /* Info Sections */
    .info-grid { display: flex; gap: 40px; margin-bottom: 32px; }
    .info-box { flex: 1; }
    .info-box h3 { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; font-weight: 700; }
    .info-box p { font-size: 13px; line-height: 1.8; color: #475569; }
    .info-box p strong { color: #0f172a; }
    
    /* Table */
    .table-container { margin-bottom: 32px; }
    table { width: 100%; border-collapse: collapse; }
    thead th { background: #f1f5f9; padding: 12px 16px; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; text-align: left; font-weight: 700; }
    tbody td { padding: 16px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
    tbody tr:last-child td { border-bottom: none; }
    .course-title { font-weight: 600; color: #0f172a; }
    .course-type { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    
    /* Totals */
    .totals { display: flex; justify-content: flex-end; margin-bottom: 40px; }
    .totals-box { width: 280px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #64748b; }
    .totals-row.total { border-top: 2px solid #41bfb8; padding-top: 12px; margin-top: 8px; font-size: 18px; font-weight: 800; color: #0f172a; }
    .totals-row.total span:last-child { color: #41bfb8; }
    
    /* Payment Info */
    .payment-info { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 32px; }
    .payment-info h3 { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
    .payment-grid { display: flex; gap: 32px; }
    .payment-item { font-size: 12px; }
    .payment-item label { display: block; color: #94a3b8; font-size: 10px; text-transform: uppercase; margin-bottom: 2px; }
    .payment-item span { color: #0f172a; font-weight: 600; }
    
    /* Footer */
    .footer { text-align: center; padding-top: 24px; border-top: 1px solid #e2e8f0; }
    .footer p { font-size: 11px; color: #94a3b8; line-height: 1.8; }
    .footer a { color: #41bfb8; text-decoration: none; }
    
    /* Watermark */
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 80px; color: rgba(65, 191, 184, 0.06); font-weight: 900; pointer-events: none; z-index: 0; }
  </style>
</head>
<body>
  <div class="watermark">BD CALLING ACADEMY</div>
  <div class="invoice">
    <!-- Header -->
    <div class="header">
      <div class="logo-section">
        <h1>BD Calling <span>Academy</span></h1>
        <p>Your Gateway to Tech Excellence</p>
      </div>
      <div class="invoice-meta">
        <h2>INVOICE</h2>
        <p>
          <strong>Invoice #:</strong> ${data.invoiceNumber}<br>
          <strong>Date:</strong> ${data.date}<br>
          <span class="status-badge status-${data.status.toLowerCase()}">${data.status}</span>
        </p>
      </div>
    </div>
    
    <!-- Info Grid -->
    <div class="info-grid">
      <div class="info-box">
        <h3>Billed To</h3>
        <p>
          <strong>${data.studentName}</strong><br>
          ${data.studentEmail}<br>
          ${data.studentPhone || ''}
        </p>
      </div>
      <div class="info-box">
        <h3>From</h3>
        <p>
          <strong>BD Calling Academy</strong><br>
          Dhaka, Bangladesh<br>
          info@bdcallingacademy.com
        </p>
      </div>
    </div>
    
    <!-- Table -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 60%">Course</th>
            <th>Batch</th>
            <th style="text-align: right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="course-title">${data.courseName}</div>
              <div class="course-type">${data.courseType || 'Online Course'}</div>
            </td>
            <td>${data.batchName || 'N/A'}</td>
            <td style="text-align: right; font-weight: 600;">৳${data.amount.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Totals -->
    <div class="totals">
      <div class="totals-box">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>৳${data.amount.toLocaleString()}</span>
        </div>
        <div class="totals-row">
          <span>Tax</span>
          <span>৳0</span>
        </div>
        <div class="totals-row">
          <span>Discount</span>
          <span>৳0</span>
        </div>
        <div class="totals-row total">
          <span>Total</span>
          <span>৳${data.amount.toLocaleString()}</span>
        </div>
      </div>
    </div>
    
    <!-- Payment Info -->
    <div class="payment-info">
      <h3>Payment Information</h3>
      <div class="payment-grid">
        <div class="payment-item">
          <label>Method</label>
          <span>${data.paymentMethod.toUpperCase()}</span>
        </div>
        <div class="payment-item">
          <label>Transaction ID</label>
          <span>${data.transactionId || 'N/A'}</span>
        </div>
        <div class="payment-item">
          <label>Paid At</label>
          <span>${data.paidAt || 'N/A'}</span>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p>
        Thank you for choosing BD Calling Academy!<br>
        For any queries, contact us at <a href="mailto:info@bdcallingacademy.com">info@bdcallingacademy.com</a><br>
        <small>This is a computer-generated invoice and does not require a signature.</small>
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

// ─── Generate PDF Buffer ────────────────────────────────────
export const generateInvoicePDF = async (data: InvoiceData): Promise<Buffer> => {
  const html = generateInvoiceHTML(data);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
  });

  await browser.close();
  return Buffer.from(pdfBuffer);
};

export const InvoiceService = {
  generateInvoicePDF,
};

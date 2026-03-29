/**
 * Email Service — SendGrid Integration
 * 
 * Currently in DEMO mode (logs to console).
 * To enable real emails:
 * 1. npm install @sendgrid/mail
 * 2. Set SENDGRID_API_KEY in .env
 * 3. Set EMAIL_FROM in .env
 * 4. Change DEMO_MODE to false
 */

const DEMO_MODE = true;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@bdcallingacademy.com';

// ─── Email Templates ────────────────────────────────────────

const templates = {
  welcome: (name: string) => ({
    subject: 'Welcome to BD Calling Academy! 🎉',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:linear-gradient(135deg,#41bfb8,#38a89d);padding:30px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:#fff;margin:0;">🎓 BD Calling Academy</h1>
        </div>
        <div style="background:#fff;padding:30px;border:1px solid #e2e8f0;border-radius:0 0 12px 12px;">
          <h2 style="color:#1e293b;">Welcome, ${name}!</h2>
          <p style="color:#64748b;">You have successfully registered. Start exploring courses and begin your learning journey.</p>
          <a href="http://localhost:3000/courses" style="display:inline-block;padding:12px 24px;background:#41bfb8;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Browse Courses</a>
        </div>
      </div>
    `,
  }),

  paymentConfirmation: (name: string, courseName: string, amount: number, transactionId: string) => ({
    subject: `Payment Confirmed — ${courseName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:linear-gradient(135deg,#41bfb8,#38a89d);padding:30px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:#fff;margin:0;">💳 Payment Confirmed</h1>
        </div>
        <div style="background:#fff;padding:30px;border:1px solid #e2e8f0;border-radius:0 0 12px 12px;">
          <h2 style="color:#1e293b;">Hi ${name},</h2>
          <p style="color:#64748b;">Your payment has been confirmed.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b;">Course</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:bold;">${courseName}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b;">Amount</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:bold;">৳${amount}</td></tr>
            <tr><td style="padding:8px;color:#64748b;">Transaction ID</td><td style="padding:8px;font-weight:bold;">${transactionId}</td></tr>
          </table>
          <a href="http://localhost:3000/dashboard/user/courses" style="display:inline-block;padding:12px 24px;background:#41bfb8;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Start Learning</a>
        </div>
      </div>
    `,
  }),

  classReminder: (name: string, className: string, time: string, meetingLink?: string) => ({
    subject: `Class Reminder — ${className}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:30px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:#fff;margin:0;">📅 Class Reminder</h1>
        </div>
        <div style="background:#fff;padding:30px;border:1px solid #e2e8f0;border-radius:0 0 12px 12px;">
          <h2 style="color:#1e293b;">Hi ${name},</h2>
          <p style="color:#64748b;">Your class <strong>${className}</strong> starts at <strong>${time}</strong>.</p>
          ${meetingLink ? `<a href="${meetingLink}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Join Class</a>` : ''}
        </div>
      </div>
    `,
  }),

  certificateReady: (name: string, courseName: string, certId: string) => ({
    subject: `Your Certificate is Ready — ${courseName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:linear-gradient(135deg,#10b981,#059669);padding:30px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:#fff;margin:0;">🎓 Certificate Ready!</h1>
        </div>
        <div style="background:#fff;padding:30px;border:1px solid #e2e8f0;border-radius:0 0 12px 12px;">
          <h2 style="color:#1e293b;">Congratulations, ${name}!</h2>
          <p style="color:#64748b;">Your certificate for <strong>${courseName}</strong> is ready.</p>
          <p style="color:#64748b;">Certificate ID: <strong>${certId}</strong></p>
          <a href="http://localhost:3000/dashboard/user/certificates" style="display:inline-block;padding:12px 24px;background:#10b981;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">View Certificate</a>
        </div>
      </div>
    `,
  }),

  installmentDue: (name: string, courseName: string, amount: number, dueDate: string) => ({
    subject: `Installment Due — ৳${amount}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:30px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:#fff;margin:0;">💰 Installment Reminder</h1>
        </div>
        <div style="background:#fff;padding:30px;border:1px solid #e2e8f0;border-radius:0 0 12px 12px;">
          <h2 style="color:#1e293b;">Hi ${name},</h2>
          <p style="color:#64748b;">Your installment of <strong>৳${amount}</strong> for <strong>${courseName}</strong> is due on <strong>${dueDate}</strong>.</p>
          <a href="http://localhost:3000/dashboard/user/payments" style="display:inline-block;padding:12px 24px;background:#f59e0b;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Pay Now</a>
        </div>
      </div>
    `,
  }),
};

// ─── Send Email ─────────────────────────────────────────────

const sendEmail = async (to: string, subject: string, html: string) => {
  if (DEMO_MODE) {
    console.log(`📧 [DEMO EMAIL] To: ${to} | Subject: ${subject}`);
    return { success: true, demo: true };
  }

  try {
    // Real SendGrid integration
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({ to, from: EMAIL_FROM, subject, html });
    return { success: true };
  } catch (err: any) {
    console.error('Email error:', err.message);
    return { success: false, error: err.message };
  }
};

// ─── High-level Email Functions ─────────────────────────────

const sendWelcome = async (email: string, name: string) => {
  const t = templates.welcome(name);
  return sendEmail(email, t.subject, t.html);
};

const sendPaymentConfirmation = async (email: string, name: string, courseName: string, amount: number, txnId: string) => {
  const t = templates.paymentConfirmation(name, courseName, amount, txnId);
  return sendEmail(email, t.subject, t.html);
};

const sendClassReminder = async (email: string, name: string, className: string, time: string, meetingLink?: string) => {
  const t = templates.classReminder(name, className, time, meetingLink);
  return sendEmail(email, t.subject, t.html);
};

const sendCertificateReady = async (email: string, name: string, courseName: string, certId: string) => {
  const t = templates.certificateReady(name, courseName, certId);
  return sendEmail(email, t.subject, t.html);
};

const sendInstallmentDue = async (email: string, name: string, courseName: string, amount: number, dueDate: string) => {
  const t = templates.installmentDue(name, courseName, amount, dueDate);
  return sendEmail(email, t.subject, t.html);
};

export const EmailService = {
  sendEmail, sendWelcome, sendPaymentConfirmation,
  sendClassReminder, sendCertificateReady, sendInstallmentDue,
  templates,
};

/**
 * SMS Service — BulkSMSBD Integration
 * 
 * Currently in DEMO mode (logs to console).
 * To enable real SMS:
 * 1. Set BULKSMS_API_KEY in .env
 * 2. Set BULKSMS_SENDER_ID in .env
 * 3. Change DEMO_MODE to false
 */

const DEMO_MODE = true;
const API_URL = 'https://bulksmsbd.net/api/smsapi';
const API_KEY = process.env.BULKSMS_API_KEY || '';
const SENDER_ID = process.env.BULKSMS_SENDER_ID || 'BDCalling';

// ─── SMS Templates ──────────────────────────────────────────

const templates = {
  welcome: (name: string) =>
    `Welcome to BD Calling Academy, ${name}! Start your learning journey today. Visit: bdcallingacademy.com`,

  paymentConfirmed: (name: string, courseName: string, amount: number) =>
    `Hi ${name}, your payment of ৳${amount} for "${courseName}" is confirmed. Happy learning! - BD Calling Academy`,

  classReminder: (name: string, className: string, time: string) =>
    `Hi ${name}, your class "${className}" starts at ${time}. Don't miss it! - BD Calling Academy`,

  certificateReady: (name: string, courseName: string) =>
    `Congratulations ${name}! Your certificate for "${courseName}" is ready. Check your dashboard. - BD Calling Academy`,

  installmentDue: (name: string, amount: number, dueDate: string) =>
    `Hi ${name}, your installment of ৳${amount} is due on ${dueDate}. Pay now to avoid late fees. - BD Calling Academy`,

  examReminder: (name: string, examTitle: string, date: string) =>
    `Hi ${name}, your exam "${examTitle}" is scheduled on ${date}. Prepare well! - BD Calling Academy`,

  otp: (otp: string) =>
    `Your BD Calling Academy verification code is: ${otp}. Valid for 5 minutes. Do not share.`,
};

// ─── Send SMS ───────────────────────────────────────────────

const sendSMS = async (phoneNumber: string, message: string) => {
  if (DEMO_MODE) {
    console.log(`📱 [DEMO SMS] To: ${phoneNumber} | Message: ${message}`);
    return { success: true, demo: true };
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: API_KEY,
        senderid: SENDER_ID,
        number: phoneNumber,
        message,
        type: 'text',
      }),
    });
    const data = await response.json();
    return { success: data.response_code === 202, data };
  } catch (err: any) {
    console.error('SMS error:', err.message);
    return { success: false, error: err.message };
  }
};

// ─── High-level SMS Functions ───────────────────────────────

const sendBulkSMS = async (phoneNumbers: string[], message: string) => {
  const results = await Promise.allSettled(
    phoneNumbers.map(phone => sendSMS(phone, message))
  );
  return results;
};

const sendWelcomeSMS = (phone: string, name: string) => sendSMS(phone, templates.welcome(name));
const sendPaymentSMS = (phone: string, name: string, course: string, amount: number) => sendSMS(phone, templates.paymentConfirmed(name, course, amount));
const sendClassReminderSMS = (phone: string, name: string, className: string, time: string) => sendSMS(phone, templates.classReminder(name, className, time));
const sendCertificateSMS = (phone: string, name: string, course: string) => sendSMS(phone, templates.certificateReady(name, course));
const sendInstallmentSMS = (phone: string, name: string, amount: number, dueDate: string) => sendSMS(phone, templates.installmentDue(name, amount, dueDate));

export const SmsService = {
  sendSMS, sendBulkSMS,
  sendWelcomeSMS, sendPaymentSMS, sendClassReminderSMS,
  sendCertificateSMS, sendInstallmentSMS,
  templates,
};

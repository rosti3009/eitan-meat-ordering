/**
 * Google Apps Script web app endpoint for order intake.
 * Existing flow preserved:
 * 1) Save order to Google Sheets
 * 2) Generate PDF
 * 3) Upload PDF to Drive
 * 4) Send notification email (new)
 */

const ORDERS_SHEET_NAME = 'Orders';
const NOTIFICATION_EMAIL = 'aviv@blucher.co.il';
const NOTIFICATION_SUBJECT = 'הזמנה חדשה התקבלה באתר';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');

    validateOrderPayload(payload);

    const createdAt = payload.createdAt || new Date().toISOString();
    payload.createdAt = createdAt;

    // Preserve existing functionality: write order to sheet.
    const orderId = appendOrderToSheet(payload);

    // Preserve existing functionality: generate and upload PDF to Drive.
    const pdfFile = createAndUploadOrderPdf(payload, orderId);

    // New requirement: send notification email after successful order creation.
    sendNewOrderNotificationEmail(payload, orderId, pdfFile);

    return jsonOutput({
      success: true,
      orderId,
      pdfFileId: pdfFile ? pdfFile.getId() : null,
      emailed: true
    });
  } catch (error) {
    return jsonOutput({ success: false, error: String(error && error.message ? error.message : error) });
  }
}

function appendOrderToSheet(order) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(ORDERS_SHEET_NAME) || ss.insertSheet(ORDERS_SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Order ID', 'Created At', 'Customer Name', 'Phone', 'City', 'Order Type', 'Notes', 'Items', 'Total']);
  }

  const orderId = Utilities.getUuid();
  const itemsText = (order.items || [])
    .map(item => `${item.name} ×${item.quantity} (${item.unit || ''}) — ₪${item.lineTotal}`)
    .join('\n');

  sheet.appendRow([
    orderId,
    order.createdAt,
    order.customer.name,
    order.customer.phone,
    order.customer.city,
    order.customer.orderType || '',
    order.customer.notes || '',
    itemsText,
    Number(order.total || 0)
  ]);

  return orderId;
}

function createAndUploadOrderPdf(order, orderId) {
  const createdAtText = formatOrderDate(order.createdAt);
  const itemsLines = (order.items || []).map((item, index) => {
    return `${index + 1}. ${item.name} | כמות: ${item.quantity} | יחידה: ${item.unit || ''} | מחיר: ₪${item.price} | סה"כ: ₪${item.lineTotal}`;
  }).join('\n');

  const doc = DocumentApp.create(`Order-${orderId}`);
  const body = doc.getBody();

  body.appendParagraph('הזמנה חדשה').setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(`מספר הזמנה: ${orderId}`);
  body.appendParagraph(`תאריך: ${createdAtText}`);
  body.appendParagraph(`שם לקוח: ${order.customer.name}`);
  body.appendParagraph(`טלפון: ${order.customer.phone}`);
  body.appendParagraph(`עיר: ${order.customer.city}`);
  body.appendParagraph(`סוג הזמנה: ${order.customer.orderType || ''}`);
  body.appendParagraph(`הערות: ${order.customer.notes || '-'}`);
  body.appendParagraph('פריטים:');
  body.appendParagraph(itemsLines || '-');
  body.appendParagraph(`סה"כ: ₪${order.total || 0}`);

  doc.saveAndClose();

  const pdfBlob = DriveApp.getFileById(doc.getId()).getBlob().getAs(MimeType.PDF).setName(`Order-${orderId}.pdf`);
  const pdfFile = DriveApp.createFile(pdfBlob);

  // Keep the doc tidy by moving the source doc to trash after PDF creation.
  DriveApp.getFileById(doc.getId()).setTrashed(true);

  return pdfFile;
}

function sendNewOrderNotificationEmail(order, orderId, pdfFile) {
  const customer = order.customer || {};
  const itemsText = (order.items || []).map((item, index) => {
    return `${index + 1}. ${item.name} ×${item.quantity} (${item.unit || ''}) — ₪${item.lineTotal}`;
  }).join('\n');

  const body = [
    'התקבלה הזמנה חדשה באתר.',
    '',
    `מספר הזמנה: ${orderId}`,
    `שם לקוח: ${customer.name || ''}`,
    `טלפון: ${customer.phone || ''}`,
    `עיר: ${customer.city || ''}`,
    `הערות: ${customer.notes || '-'}`,
    '',
    'פריטים שהוזמנו:',
    itemsText || '-',
    '',
    `סה"כ מחיר: ₪${order.total || 0}`,
    `תאריך/שעת הזמנה: ${formatOrderDate(order.createdAt)}`
  ].join('\n');

  const mailOptions = {};
  if (pdfFile) {
    mailOptions.attachments = [pdfFile.getBlob()];
  }

  MailApp.sendEmail(NOTIFICATION_EMAIL, NOTIFICATION_SUBJECT, body, mailOptions);
}

function formatOrderDate(isoString) {
  const date = isoString ? new Date(isoString) : new Date();
  return Utilities.formatDate(date, 'Asia/Jerusalem', 'dd/MM/yyyy HH:mm:ss');
}

function validateOrderPayload(payload) {
  if (!payload || !payload.customer || !Array.isArray(payload.items)) {
    throw new Error('Invalid order payload');
  }
  if (!payload.customer.name || !payload.customer.phone || !payload.customer.city) {
    throw new Error('Missing required customer fields');
  }
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

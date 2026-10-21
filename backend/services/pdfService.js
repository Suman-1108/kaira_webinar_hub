const PDFDocument = require('pdfkit');

/**
 * Generates a professional A4 Tax Invoice / Payment Receipt PDF
 */
function generateInvoicePdf({
  invoiceNumber,
  studentName,
  studentEmail,
  studentPhone = '',
  courseTitle,
  amount,
  currency = 'INR',
  paymentMethod = 'PhonePe',
  transactionId = '',
  orderId = '',
  paidAt = new Date()
}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Invoice ${invoiceNumber}`,
          Author: 'Kaira Webinar Hub',
          Subject: 'Payment Receipt'
        }
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      const primaryColor = '#970747'; // Burgundy
      const darkColor = '#1C1D1F';
      const grayColor = '#6B7280';
      const lightBg = '#FDF2F4';

      const dateStr = new Date(paidAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      // Header Banner
      doc.rect(40, 40, 515, 65).fill(lightBg);

      // Brand Logo Text
      doc.fillColor(primaryColor).fontSize(22).font('Helvetica-Bold')
        .text('Kaira', 55, 55, { continued: true })
        .fillColor(darkColor).text('Hub')
        .fontSize(9).font('Helvetica')
        .fillColor(grayColor)
        .text('EXPERT-LED MASTERCLASSES & PRACTICAL LEARNING', 55, 82);

      // Invoice Badge
      doc.fillColor(primaryColor).fontSize(16).font('Helvetica-Bold')
        .text('TAX INVOICE', 380, 55, { align: 'right', width: 160 })
        .fontSize(10).font('Helvetica')
        .fillColor(darkColor)
        .text(`#${invoiceNumber}`, 380, 75, { align: 'right', width: 160 })
        .fillColor(grayColor).fontSize(9)
        .text(`Date: ${dateStr}`, 380, 89, { align: 'right', width: 160 });

      // Seller and Buyer Grid
      const topY = 125;
      
      // Seller Details
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold')
        .text('ISSUED BY', 45, topY)
        .font('Helvetica-Bold').fontSize(11).fillColor(darkColor)
        .text(process.env.COMPANY_LEGAL_NAME || 'Kaira Technologies Private Limited', 45, topY + 16)
        .font('Helvetica').fontSize(9).fillColor(grayColor)
        .text('Platform: Kaira Webinar Hub', 45, topY + 30)
        .text('Email: support@kairawebinarhub.com', 45, topY + 43)
        .text('Web: https://kairahub.live', 45, topY + 56);

      // Student / Buyer Details
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold')
        .text('BILLED TO', 320, topY)
        .font('Helvetica-Bold').fontSize(11).fillColor(darkColor)
        .text(studentName || 'Valued Learner', 320, topY + 16)
        .font('Helvetica').fontSize(9).fillColor(grayColor)
        .text(`Email: ${studentEmail}`, 320, topY + 30);
      if (studentPhone) {
        doc.text(`Phone: ${studentPhone}`, 320, topY + 43);
      }
      doc.text('Status: Verified Account', 320, studentPhone ? topY + 56 : topY + 43);

      // Payment Details Bar
      const paymentBarY = 205;
      doc.rect(40, paymentBarY, 515, 32).fill('#F4F4F5');
      doc.fillColor(darkColor).font('Helvetica-Bold').fontSize(9)
        .text('Payment Method:', 55, paymentBarY + 10)
        .font('Helvetica').text(paymentMethod.toUpperCase(), 145, paymentBarY + 10)
        .font('Helvetica-Bold').text('Reference ID:', 260, paymentBarY + 10)
        .font('Helvetica').text(transactionId || orderId || 'VERIFIED_TXN', 340, paymentBarY + 10, { width: 140, ellipsis: true })
        .fillColor('#059669').font('Helvetica-Bold').text('PAID', 495, paymentBarY + 10);

      // Line Items Table Header
      const tableY = 255;
      doc.rect(40, tableY, 515, 24).fill(primaryColor);
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9)
        .text('SL', 55, tableY + 7)
        .text('ITEM DESCRIPTION', 90, tableY + 7)
        .text('QTY', 370, tableY + 7, { align: 'center', width: 40 })
        .text('PRICE', 425, tableY + 7, { align: 'right', width: 60 })
        .text('TOTAL', 490, tableY + 7, { align: 'right', width: 55 });

      // Item Row
      const rowY = tableY + 32;
      doc.fillColor(darkColor).font('Helvetica-Bold').fontSize(10)
        .text('1.', 55, rowY)
        .text(courseTitle, 90, rowY, { width: 260 })
        .font('Helvetica').fontSize(8).fillColor(grayColor)
        .text('Full course enrollment pass, lifetime materials & verifiable certificate', 90, rowY + 15, { width: 260 })
        .fillColor(darkColor).font('Helvetica').fontSize(9)
        .text('1', 370, rowY, { align: 'center', width: 40 })
        .text(`${currency} ${Number(amount).toFixed(2)}`, 425, rowY, { align: 'right', width: 60 })
        .font('Helvetica-Bold')
        .text(`${currency} ${Number(amount).toFixed(2)}`, 490, rowY, { align: 'right', width: 55 });

      // Table Line
      doc.moveTo(40, rowY + 45).lineTo(555, rowY + 45).strokeColor('#E4E4E7').lineWidth(1).stroke();

      // Calculation Section
      const totalsY = rowY + 55;
      const subtotal = Number(amount);
      const taxRate = 0; // Inclusive
      const total = subtotal;

      doc.fillColor(grayColor).font('Helvetica').fontSize(9)
        .text('Subtotal:', 360, totalsY, { align: 'right', width: 100 })
        .fillColor(darkColor).font('Helvetica')
        .text(`${currency} ${subtotal.toFixed(2)}`, 470, totalsY, { align: 'right', width: 75 })
        
        .fillColor(grayColor)
        .text('Taxes (GST/VAT):', 360, totalsY + 16, { align: 'right', width: 100 })
        .fillColor(darkColor)
        .text('Included (0.00)', 470, totalsY + 16, { align: 'right', width: 75 })

        .rect(360, totalsY + 32, 195, 26).fill(lightBg)
        .fillColor(primaryColor).font('Helvetica-Bold').fontSize(11)
        .text('Grand Total:', 370, totalsY + 40)
        .text(`${currency} ${total.toFixed(2)}`, 460, totalsY + 40, { align: 'right', width: 85 });

      // Notes & Terms
      const notesY = totalsY + 80;
      doc.rect(40, notesY, 515, 60).fill('#FAFAFA');
      doc.fillColor(darkColor).font('Helvetica-Bold').fontSize(9)
        .text('Terms & Access Instructions:', 50, notesY + 8)
        .font('Helvetica').fontSize(8).fillColor(grayColor)
        .text('1. Your enrollment entitlement has been activated for this course under your registered email account.', 50, notesY + 22)
        .text('2. Log in at https://kairahub.live/my-learning to access the interactive course player, lessons, and section quizzes.', 50, notesY + 33)
        .text('3. This invoice serves as official proof of payment. For support inquiries, contact support@kairawebinarhub.com.', 50, notesY + 44);

      // Footer
      doc.fontSize(8).font('Helvetica').fillColor('#9CA3AF')
        .text('Kaira Webinar Hub  *  Authorized E-Learning Provider  *  Computer-generated invoice requiring no physical signature.', 40, 750, { align: 'center', width: 515 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generates an attractive landscape A4 Certificate of Completion PDF
 */
function generateCertificatePdf({
  certificateNumber,
  studentName,
  courseTitle,
  instructorName = 'Lead Specialist & Masterclass Instructor',
  instructorRole = 'Director of Academic Curriculum',
  issuedAt = new Date(),
  verificationUrl = ''
}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 30,
        info: {
          Title: `Certificate - ${studentName}`,
          Author: 'Kaira Webinar Hub',
          Subject: 'Certificate of Course Completion'
        }
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      const width = 841.89; // Landscape A4 width in pt
      const height = 595.28; // Landscape A4 height in pt

      const primary = '#970747'; // Deep Burgundy
      const gold = '#D4AF37'; // Elegant Gold
      const dark = '#1C1D1F';
      const muted = '#64748B';

      const formattedDate = new Date(issuedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      // Outer Decorative Border
      doc.rect(20, 20, width - 40, height - 40).strokeColor(primary).lineWidth(3).stroke();
      doc.rect(26, 26, width - 52, height - 52).strokeColor(gold).lineWidth(1).stroke();

      // Corner Accents
      const drawCorner = (x, y, dx, dy) => {
        doc.rect(x, y, 16 * dx, 16 * dy).fill(primary);
      };
      drawCorner(28, 28, 1, 1);
      drawCorner(width - 44, 28, 1, 1);
      drawCorner(28, height - 44, 1, 1);
      drawCorner(width - 44, height - 44, 1, 1);

      // Header Brand
      doc.fillColor(primary).font('Helvetica-Bold').fontSize(16)
        .text('KAIRA WEBINAR HUB', 0, 55, { align: 'center', width });
      
      doc.fillColor(gold).font('Helvetica-Bold').fontSize(9)
        .text('ACADEMY OF PROFESSIONAL EXCELLENCE & ADVANCED MASTERY', 0, 75, { align: 'center', width });

      // Title
      doc.fillColor(dark).font('Helvetica-Bold').fontSize(32)
        .text('Certificate of Completion', 0, 115, { align: 'center', width });

      // Subtitle
      doc.fillColor(muted).font('Helvetica').fontSize(12)
        .text('This is to certify that', 0, 160, { align: 'center', width });

      // Student Name
      doc.fillColor(primary).font('Helvetica-Bold').fontSize(28)
        .text(studentName || 'Distinguished Scholar', 0, 185, { align: 'center', width });

      // Decorative divider under name
      doc.moveTo(width / 2 - 120, 225).lineTo(width / 2 + 120, 225).strokeColor(gold).lineWidth(1.5).stroke();

      // Description
      doc.fillColor(muted).font('Helvetica').fontSize(11)
        .text('has successfully demonstrated mastery by completing all required lecture modules,', 0, 245, { align: 'center', width })
        .text('practical assessments, hands-on implementations, and section examinations for the masterclass', 0, 262, { align: 'center', width });

      // Course Title
      doc.fillColor(dark).font('Helvetica-Bold').fontSize(20)
        .text(courseTitle, 60, 292, { align: 'center', width: width - 120 });

      // Issue Statement
      doc.fillColor(muted).font('Helvetica').fontSize(10)
        .text(`Issued on ${formattedDate}  *  Awarded with Honors of Completion`, 0, 335, { align: 'center', width });

      // Bottom Section: Signatures & Verification
      const bottomY = 415;

      // Left: Instructor Signature Block
      doc.moveTo(90, bottomY + 35).lineTo(260, bottomY + 35).strokeColor('#CBD5E1').lineWidth(1).stroke();
      doc.fillColor(dark).font('Helvetica-Bold').fontSize(11)
        .text(instructorName, 90, bottomY + 42, { align: 'center', width: 170 })
        .font('Helvetica').fontSize(8).fillColor(muted)
        .text(instructorRole, 90, bottomY + 56, { align: 'center', width: 170 });

      // Center: Official Seal Badge
      doc.circle(width / 2, bottomY + 30, 32).fillAndStroke(lightBgOrWhite('#FDF2F4'), gold);
      doc.fillColor(primary).font('Helvetica-Bold').fontSize(9)
        .text('OFFICIAL', width / 2 - 25, bottomY + 18, { align: 'center', width: 50 })
        .text('VERIFIED', width / 2 - 25, bottomY + 28, { align: 'center', width: 50 })
        .fontSize(6).fillColor(gold)
        .text('★ ★ ★', width / 2 - 25, bottomY + 40, { align: 'center', width: 50 });

      // Right: Certification Authority Block
      doc.moveTo(width - 260, bottomY + 35).lineTo(width - 90, bottomY + 35).strokeColor('#CBD5E1').lineWidth(1).stroke();
      doc.fillColor(dark).font('Helvetica-Bold').fontSize(11)
        .text('Academic Standards Board', width - 260, bottomY + 42, { align: 'center', width: 170 })
        .font('Helvetica').fontSize(8).fillColor(muted)
        .text('Kaira Webinar Hub Authority', width - 260, bottomY + 56, { align: 'center', width: 170 });

      // Verification Footnote
      const verifyLink = verificationUrl || `https://kairahub.live/verify/cert/${certificateNumber}`;
      doc.rect(40, height - 62, width - 80, 24).fill('#F8FAFC');
      doc.fillColor(muted).font('Helvetica').fontSize(8)
        .text(`Certificate ID: ${certificateNumber}`, 50, height - 54)
        .text(`Public Verification: ${verifyLink}`, width - 420, height - 54, { align: 'right', width: 360 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function lightBgOrWhite(hex) {
  return hex;
}

module.exports = {
  generateInvoicePdf,
  generateCertificatePdf
};

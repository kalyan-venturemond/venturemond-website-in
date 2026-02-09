const express = require('express');
const nodemailer = require('nodemailer');
const Contact = require('../models/Contact');
const router = express.Router();

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// POST /api/send-email
router.post('/send-email', async (req, res) => {
  try {
    const { name, email, company, division, service, budget, timeline, description, otherDescription } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // Save to MongoDB
    const contact = new Contact({
      name,
      email,
      company,
      division,
      service,
      budget,
      timeline,
      description,
      otherDescription
    });
    await contact.save();
    console.log('✅ Contact saved to database:', contact._id);

    // User confirmation email
    const userMail = {
      from: `Venturemond <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Thanks for Reaching Out to Venturemond',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Thank You</title>
        </head>
        <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#ffffff;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="padding: 20px;">
                  <tr>
                    <td style="font-size: 16px; line-height: 24px; color:#333;">
                      <p>Hello ${name},</p>
                      <p>We hope you're doing well.</p>
                      <p>Thanks for getting in touch, we've received your message. Someone from our team will get back to you within the next 24 hours</p>
                      <p>If your request is urgent, feel free to reply directly to this email.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 16px; line-height: 24px; color:#333; padding-top:10px;">
                      <p>Sincerely,<br/>
                        Team Venturemond<br/>
                        Technology Venture Builder 
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    // Team notification email
    const teamMail = {
      from: `Venturemond Website <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: `New Inquiry from ${name}`,
      text: `
A new inquiry was submitted from the website:

Name: ${name}
Email: ${email}
Company: ${company || 'N/A'}
Division: ${division || 'N/A'}
Service: ${service || 'N/A'}
Budget: ${budget || 'N/A'}
Timeline: ${timeline || 'N/A'}

Message:
${description || 'N/A'}

Other Details:
${otherDescription || 'N/A'}

Submitted at: ${new Date().toLocaleString()}
Database ID: ${contact._id}
      `
    };

    // Send emails in BACKGROUND (Fire and Forget)
    // We do NOT await this, so the user gets an instant response.
    Promise.all([
      transporter.sendMail(userMail),
      transporter.sendMail(teamMail)
    ])
      .then(() => console.log('✅ Emails sent successfully in background'))
      .catch(err => console.error('⚠️ Background email failed:', err));

    // Respond immediately after DB save
    res.json({
      success: true,
      message: 'Inquiry received successfully!',
      contactId: contact._id
    });

  } catch (error) {
    console.error('❌ Database Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save contact',
      error: error.message
    });
  }
});

module.exports = router;

const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

// Path to store emails
const EMAILS_FILE = path.join(__dirname, "newsletter_emails.txt");

// Configure your email transport (update with your real credentials)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  // Save email to file
  fs.appendFile(EMAILS_FILE, email + "\n", (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to save email" });
    }
  });

  // Send notification email
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: "New Newsletter Subscription",
      text: `New subscriber: ${email}`,
    });
  } catch (err) {
    // Log error but don't fail the request
    console.error("Email notification failed:", err);
  }

  // Example: Integrate with a third-party service (e.g., Mailchimp)
  /*
  // Uncomment and configure for Mailchimp
  // const mailchimp = require('@mailchimp/mailchimp_marketing');
  // mailchimp.setConfig({ apiKey: 'YOUR_API_KEY', server: 'YOUR_SERVER_PREFIX' });
  // await mailchimp.lists.addListMember('YOUR_LIST_ID', { email_address: email, status: 'subscribed' });
  */

  res.status(200).json({ success: true });
};

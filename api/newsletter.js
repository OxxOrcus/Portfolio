const { Resend } = require("resend");

module.exports = async function handler(req, res) {
  // Construct the Resend client at runtime to avoid throwing on module import
  // when the RESEND_API_KEY is not provided in development environments.
  let resend = null;
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn(
        "RESEND_API_KEY is not set. Newsletter emails will not be sent."
      );
    } else {
      resend = new Resend(process.env.RESEND_API_KEY);
    }
  } catch (err) {
    console.error(
      "Failed to initialize Resend client:",
      err && err.message ? err.message : err
    );
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body || {};
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  try {
    if (!resend) {
      // If client isn't available, respond success to avoid blocking the user,
      // but log a warning so it can be investigated. Alternatively, return
      // an error if you prefer strict behavior.
      console.warn("Resend client not initialized; skipping send.");
      return res.status(200).json({ success: true });
    }

    await resend.emails.send({
      // Use a verified sender in production (e.g. no-reply@yourdomain.com)
      from: `No Reply <no-reply@${process.env.EMAIL_DOMAIN || "example.com"}>`,
      to: process.env.EMAIL_TO,
      subject: "Nova inscrição na newsletter",
      text: `Novo inscrito: ${email}`,
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(
      "Error sending newsletter email:",
      err && err.message ? err.message : err
    );
    return res.status(500).json({ error: "Erro ao enviar e-mail" });
  }
};

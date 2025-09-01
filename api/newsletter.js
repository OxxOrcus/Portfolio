import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  try {
    await resend.emails.send({
      from: "Seu Nome <paulobroccodev.com>", // Altere para um domínio verificado na Resend
      to: process.env.EMAIL_TO,
      subject: "Nova inscrição na newsletter",
      text: `Novo inscrito: ${email}`,
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao enviar e-mail" });
  }
}

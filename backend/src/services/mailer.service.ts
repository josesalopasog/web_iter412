import { Resend } from "resend";
import { env } from "../config/env.js";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

type RegistrationRole = "SOLDADO" | "SERVIDOR";

const roleLabel: Record<RegistrationRole, string> = {
  SOLDADO: "Soldado",
  SERVIDOR: "Servidor",
};

const buildConfirmationEmailHtml = (name: string, role: RegistrationRole) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
    <h2 style="color: #7a1f1f;">¡Inscripción confirmada!</h2>
    <p>Hola <strong>${name}</strong>,</p>
    <p>Tu inscripción como <strong>${roleLabel[role]}</strong> al Iter 412 quedó registrada correctamente.</p>
    <p>Pronto recibirás más información sobre los próximos pasos.</p>
    <p>¡Nos vemos en el retiro!</p>
    <p style="margin-top: 24px; font-size: 12px; color: #666;">Este es un correo automático, por favor no respondas a este mensaje.</p>
  </div>
`;

export const sendRegistrationConfirmationEmail = async (
  to: string,
  name: string,
  role: RegistrationRole
) => {
  if (!resend) {
    console.warn("RESEND_API_KEY no está configurada; se omite el envío del correo de confirmación.");
    return;
  }

  try {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: "Confirmación de inscripción - Iter 412",
      html: buildConfirmationEmailHtml(name, role),
    });
  } catch (error) {
    console.error("Error enviando correo de confirmación:", error);
  }
};

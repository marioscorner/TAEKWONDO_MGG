// src/lib/email.ts
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Envía un email usando nodemailer
 */
export async function sendEmail({ to, subject, html }: EmailOptions) {
  // Verificar que las variables de entorno estén configuradas
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('Variables SMTP no configuradas correctamente');
    throw new Error('Configuración de email incompleta');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true para 465, false para otros puertos
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}

/**
 * Genera el template HTML para el email de recuperación de contraseña
 */
export function getPasswordResetEmailTemplate(username: string, resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 30px 20px;
        }
        .button {
          display: inline-block;
          padding: 14px 30px;
          background-color: #2563eb;
          color: white !important;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          margin: 20px 0;
          text-align: center;
        }
        .button:hover {
          background-color: #1d4ed8;
        }
        .link-box {
          background-color: #f3f4f6;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
          word-break: break-all;
          font-size: 14px;
          color: #2563eb;
        }
        .warning {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 12px 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          background-color: #f9fafb;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🥋 Recuperación de Contraseña</h1>
        </div>
        
        <div class="content">
          <p>Hola <strong>${username}</strong>,</p>
          
          <p>Has solicitado restablecer tu contraseña en <strong>Taekwondo Mario Gutiérrez</strong>.</p>
          
          <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
          </div>
          
          <p>O copia y pega este enlace en tu navegador:</p>
          <div class="link-box">${resetUrl}</div>
          
          <div class="warning">
            <strong>⚠️ Importante:</strong> Este enlace expira en <strong>1 hora</strong>.
          </div>
          
          <p>Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña permanecerá sin cambios.</p>
        </div>
        
        <div class="footer">
          <p><strong>Taekwondo Mario Gutiérrez</strong></p>
          <p>Madrid, España</p>
          <p>Este es un email automático, por favor no respondas a este mensaje.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}


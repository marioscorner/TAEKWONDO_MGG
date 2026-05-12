// src/app/api/auth/password/request-reset/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitizeEmail, generateRandomToken } from '@/lib/auth-helpers';
import { sendEmail, getPasswordResetEmailTemplate } from '@/lib/email';
import { z } from 'zod';

const requestResetSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = requestResetSchema.parse(body);

    const sanitized = sanitizeEmail(email);

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: sanitized },
    });

    // Por seguridad, siempre responder exitosamente
    // (no revelar si el email existe o no)
    if (!user) {
      return NextResponse.json({
        message: 'Si el email existe, recibirás un enlace de recuperación.',
      });
    }

    // Generar token de reset
    const resetToken = generateRandomToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Guardar token en BD
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Crear URL de reset
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/confirm?token=${resetToken}`;

    // Enviar email
    try {
      await sendEmail({
        to: user.email,
        subject: '🥋 Recuperación de Contraseña - Taekwondo Mario Gutiérrez',
        html: getPasswordResetEmailTemplate(user.username, resetUrl),
      });
      
      console.log(`✅ Email de recuperación enviado a: ${user.email}`);
    } catch (emailError: unknown) {
      console.error('❌ Error al enviar email:', emailError);
      const details = emailError instanceof Error ? emailError.message : String(emailError);
      const stack = emailError instanceof Error ? emailError.stack : undefined;
      console.error('   Detalles:', details);
      console.error('   Stack:', stack);
      // No fallar la petición si el email falla, pero loguear
      // En producción, podrías querer manejar esto de forma diferente
    }

    return NextResponse.json({
      message: 'Si el email existe, recibirás un enlace de recuperación.',
    });
  } catch (error) {
    console.error('Error en solicitud de reset:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

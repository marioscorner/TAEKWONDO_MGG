// src/app/api/auth/password/request-reset/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitizeEmail, generateRandomToken } from '@/lib/auth-helpers';
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

    // TODO: Guardar token en BD y enviar email
    // Por ahora, solo logging
    console.log(`Reset token para ${email}: ${resetToken}`);
    console.log(`Link: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`);

    // TODO: Implementar envío de email con SMTP
    // await sendResetPasswordEmail(user.email, resetToken);

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


// src/app/api/auth/password/reset/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth-helpers';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, newPassword } = resetPasswordSchema.parse(body);

    // TODO: Verificar token en BD
    // Por ahora, retornar que no está implementado
    return NextResponse.json(
      { 
        error: 'Recuperación de contraseña no implementada completamente. Contacta al administrador.',
        info: 'Se requiere configurar SMTP y tabla de reset tokens'
      },
      { status: 501 }
    );

    // Código para cuando esté implementado:
    /*
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.expiresAt < new Date() || resetRecord.used) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({ message: 'Contraseña actualizada correctamente' });
    */
  } catch (error) {
    console.error('Error en reset de contraseña:', error);
    return NextResponse.json(
      { error: 'Error al resetear contraseña' },
      { status: 500 }
    );
  }
}


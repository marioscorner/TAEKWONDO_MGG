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

    // Buscar token en BD
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 400 }
      );
    }

    if (resetRecord.used) {
      return NextResponse.json(
        { error: 'Este token ya fue utilizado' },
        { status: 400 }
      );
    }

    if (resetRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Token expirado. Solicita uno nuevo.' },
        { status: 400 }
      );
    }

    // Actualizar contraseña y marcar token como usado
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

    console.log(`✅ Contraseña actualizada para usuario: ${resetRecord.user.username}`);

    return NextResponse.json({ 
      message: 'Contraseña actualizada correctamente' 
    });
  } catch (error) {
    console.error('Error en reset de contraseña:', error);
    return NextResponse.json(
      { error: 'Error al resetear contraseña' },
      { status: 500 }
    );
  }
}


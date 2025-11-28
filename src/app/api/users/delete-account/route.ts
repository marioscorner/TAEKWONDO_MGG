// src/app/api/users/delete-account/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, verifyPassword } from '@/lib/auth-helpers';
import { z } from 'zod';

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'La contraseña es requerida'),
  confirmation: z.literal('DELETE', {
    errorMap: () => ({ message: 'Debes escribir DELETE para confirmar' }),
  }),
});

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const data = deleteAccountSchema.parse(body);

    // Verificar contraseña
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const passwordValid = await verifyPassword(data.password, dbUser.password);

    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    // Eliminar usuario (Cascade eliminará todo lo relacionado)
    await prisma.user.delete({
      where: { id: user.userId },
    });

    return NextResponse.json({
      message: 'Cuenta eliminada correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la cuenta' },
      { status: 500 }
    );
  }
}


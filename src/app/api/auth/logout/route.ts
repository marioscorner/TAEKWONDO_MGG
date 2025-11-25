// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { refreshTokenSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refresh } = refreshTokenSchema.parse(body);

    // Revocar el refresh token
    await prisma.refreshToken.updateMany({
      where: { token: refresh },
      data: { revoked: true },
    });

    return NextResponse.json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    console.error('Error en logout:', error);
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}


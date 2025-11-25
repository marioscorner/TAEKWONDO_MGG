// src/app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
} from '@/lib/auth-helpers';
import { refreshTokenSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refresh } = refreshTokenSchema.parse(body);

    // Verificar token
    const payload = await verifyRefreshToken(refresh);

    // Buscar token en BD
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refresh },
      include: { user: true },
    });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Refresh token inválido o expirado' },
        { status: 401 }
      );
    }

    // Revocar el token antiguo
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    // Generar nuevos tokens
    const newAccessToken = await signAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      username: storedToken.user.username,
      role: storedToken.user.role,
    });

    const newRefreshToken = await signRefreshToken({ userId: storedToken.user.id });

    // Guardar nuevo refresh token
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({
      access: newAccessToken,
      refresh: newRefreshToken,
    });
  } catch (error) {
    console.error('Error en refresh:', error);
    return NextResponse.json(
      { error: 'Error al refrescar token' },
      { status: 401 }
    );
  }
}


// src/app/api/friends/block/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/middleware/auth';
import { blockUserSchema } from '@/lib/validations';
import { ZodError } from 'zod';

// POST - Bloquear usuario
export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const body = await req.json();
    const data = blockUserSchema.parse(body);

    if (data.user_id === user.userId) {
      return NextResponse.json(
        { error: 'No puedes bloquearte a ti mismo' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const targetUser = await prisma.user.findUnique({
      where: { id: data.user_id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que no esté ya bloqueado
    const existing = await prisma.blockedUser.findFirst({
      where: {
        blockerId: user.userId,
        blockedId: data.user_id,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Usuario ya bloqueado' },
        { status: 400 }
      );
    }

    // Bloquear y eliminar amistad si existe
    await prisma.$transaction([
      prisma.blockedUser.create({
        data: {
          blockerId: user.userId,
          blockedId: data.user_id,
        },
      }),
      prisma.friendship.deleteMany({
        where: {
          OR: [
            { userId: user.userId, friendId: data.user_id },
            { userId: data.user_id, friendId: user.userId },
          ],
        },
      }),
      // Rechazar solicitudes pendientes
      prisma.friendRequest.updateMany({
        where: {
          OR: [
            { fromUserId: user.userId, toUserId: data.user_id, status: 'PENDING' },
            { fromUserId: data.user_id, toUserId: user.userId, status: 'PENDING' },
          ],
        },
        data: { status: 'REJECTED' },
      }),
    ]);

    return NextResponse.json({ message: 'Usuario bloqueado' }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error al bloquear usuario:', error);
    return NextResponse.json(
      { error: 'Error al bloquear usuario' },
      { status: 500 }
    );
  }
}


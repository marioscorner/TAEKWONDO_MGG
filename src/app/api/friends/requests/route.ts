// src/app/api/friends/requests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/middleware/auth';
import { sendFriendRequestSchema } from '@/lib/validations';
import { ZodError } from 'zod';

// POST - Enviar solicitud de amistad
export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const body = await req.json();
    const data = sendFriendRequestSchema.parse(body);

    // No puedes enviarte solicitud a ti mismo
    if (data.to_user === user.userId) {
      return NextResponse.json(
        { error: 'No puedes enviarte una solicitud a ti mismo' },
        { status: 400 }
      );
    }

    // Verificar que el usuario destino existe
    const targetUser = await prisma.user.findUnique({
      where: { id: data.to_user },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que no estén bloqueados
    const blocked = await prisma.blockedUser.findFirst({
      where: {
        OR: [
          { blockerId: user.userId, blockedId: data.to_user },
          { blockerId: data.to_user, blockedId: user.userId },
        ],
      },
    });

    if (blocked) {
      return NextResponse.json(
        { error: 'No puedes enviar solicitud a este usuario' },
        { status: 403 }
      );
    }

    // Verificar que no sean ya amigos
    const friendship = await prisma.friendship.findFirst({
      where: {
        userId: user.userId,
        friendId: data.to_user,
      },
    });

    if (friendship) {
      return NextResponse.json(
        { error: 'Ya sois amigos' },
        { status: 400 }
      );
    }

    // Verificar que no haya solicitud pendiente
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { fromUserId: user.userId, toUserId: data.to_user, status: 'PENDING' },
          { fromUserId: data.to_user, toUserId: user.userId, status: 'PENDING' },
        ],
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Ya existe una solicitud pendiente' },
        { status: 400 }
      );
    }

    // Crear solicitud
    const request = await prisma.friendRequest.create({
      data: {
        fromUserId: user.userId,
        toUserId: data.to_user,
        message: data.message,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        toUser: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        id: request.id,
        from_user: request.fromUser,
        to_user: request.toUser,
        message: request.message,
        status: request.status,
        created_at: request.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error al enviar solicitud:', error);
    return NextResponse.json(
      { error: 'Error al enviar solicitud' },
      { status: 500 }
    );
  }
}


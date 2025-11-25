// src/app/api/friends/requests/[id]/accept/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/middleware/auth';

type Params = { params: { id: string } };

// POST - Aceptar solicitud de amistad
export async function POST(req: NextRequest, { params }: Params) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const requestId = parseInt(params.id);

    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: 'ID de solicitud inválido' },
        { status: 400 }
      );
    }

    // Buscar la solicitud
    const request = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que el usuario es el destinatario
    if (request.toUserId !== user.userId) {
      return NextResponse.json(
        { error: 'No tienes permiso para aceptar esta solicitud' },
        { status: 403 }
      );
    }

    // Verificar que esté pendiente
    if (request.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Esta solicitud ya fue procesada' },
        { status: 400 }
      );
    }

    // Aceptar solicitud y crear amistad (bidireccional)
    await prisma.$transaction([
      // Actualizar solicitud
      prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      }),
      // Crear amistad en ambas direcciones
      prisma.friendship.create({
        data: {
          userId: request.fromUserId,
          friendId: request.toUserId,
        },
      }),
      prisma.friendship.create({
        data: {
          userId: request.toUserId,
          friendId: request.fromUserId,
        },
      }),
    ]);

    return NextResponse.json({ message: 'Solicitud aceptada' });
  } catch (error) {
    console.error('Error al aceptar solicitud:', error);
    return NextResponse.json(
      { error: 'Error al aceptar solicitud' },
      { status: 500 }
    );
  }
}


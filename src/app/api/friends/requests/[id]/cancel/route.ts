// src/app/api/friends/requests/[id]/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/middleware/auth';

type Params = { params: Promise<{ id: string }> };

// POST - Cancelar solicitud de amistad enviada
export async function POST(req: NextRequest, { params }: Params) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const resolvedParams = await params;
    const requestId = parseInt(resolvedParams.id);

    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: 'ID de solicitud inválido' },
        { status: 400 }
      );
    }

    const request = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }

    if (request.fromUserId !== user.userId) {
      return NextResponse.json(
        { error: 'No tienes permiso para cancelar esta solicitud' },
        { status: 403 }
      );
    }

    if (request.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Esta solicitud ya fue procesada' },
        { status: 400 }
      );
    }

    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json({ message: 'Solicitud cancelada' });
  } catch (error) {
    console.error('Error al cancelar solicitud:', error);
    return NextResponse.json(
      { error: 'Error al cancelar solicitud' },
      { status: 500 }
    );
  }
}


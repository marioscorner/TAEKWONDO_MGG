// src/app/api/friends/unfriend/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/middleware/auth';

type Params = { params: { id: string } };

// POST - Eliminar amistad
export async function POST(req: NextRequest, { params }: Params) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const friendId = parseInt(params.id);

    if (isNaN(friendId)) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      );
    }

    // Eliminar ambas direcciones de la amistad
    await prisma.$transaction([
      prisma.friendship.deleteMany({
        where: {
          userId: user.userId,
          friendId: friendId,
        },
      }),
      prisma.friendship.deleteMany({
        where: {
          userId: friendId,
          friendId: user.userId,
        },
      }),
    ]);

    return NextResponse.json({ message: 'Amistad eliminada' });
  } catch (error) {
    console.error('Error al eliminar amistad:', error);
    return NextResponse.json(
      { error: 'Error al eliminar amistad' },
      { status: 500 }
    );
  }
}


// src/app/api/friends/unfriend/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/middleware/auth';

type Params = { params: Promise<{ id: string }> };

// POST - Eliminar amistad
export async function POST(req: NextRequest, { params }: Params) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const resolvedParams = await params;
    const friendId = parseInt(resolvedParams.id);

    if (isNaN(friendId)) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      );
    }

    // Verificar que el amigo existe
    const friend = await prisma.user.findUnique({
      where: { id: friendId },
      select: { id: true, role: true, username: true },
    });

    if (!friend) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // ALUMNOS no pueden eliminar a INSTRUCTORES o ADMIN
    if (user.role === 'ALUMNO' && (friend.role === 'INSTRUCTOR' || friend.role === 'ADMIN')) {
      return NextResponse.json(
        { error: 'No puedes eliminar a un instructor o administrador de tu lista de amigos' },
        { status: 403 }
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


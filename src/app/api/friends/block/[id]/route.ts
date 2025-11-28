// src/app/api/friends/block/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/middleware/auth';

type Params = { params: Promise<{ id: string }> };

// DELETE - Desbloquear usuario
export async function DELETE(req: NextRequest, { params }: Params) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const resolvedParams = await params;
    const blockedId = parseInt(resolvedParams.id);

    if (isNaN(blockedId)) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      );
    }

    const result = await prisma.blockedUser.deleteMany({
      where: {
        blockerId: user.userId,
        blockedId: blockedId,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Usuario no bloqueado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Usuario desbloqueado' });
  } catch (error) {
    console.error('Error al desbloquear usuario:', error);
    return NextResponse.json(
      { error: 'Error al desbloquear usuario' },
      { status: 500 }
    );
  }
}


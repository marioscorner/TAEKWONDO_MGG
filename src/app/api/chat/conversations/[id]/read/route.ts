// src/app/api/chat/conversations/[id]/read/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/middleware/auth';

type Params = { params: Promise<{ id: string }> };

// POST - Marcar conversación como leída
export async function POST(req: NextRequest, { params }: Params) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const resolvedParams = await params;
    const conversationId = parseInt(resolvedParams.id);

    if (isNaN(conversationId)) {
      return NextResponse.json(
        { error: 'ID de conversación inválido' },
        { status: 400 }
      );
    }

    // Actualizar lastReadAt del participante
    const updated = await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId: user.userId,
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { error: 'No eres participante de esta conversación' },
        { status: 403 }
      );
    }

    return NextResponse.json({ message: 'Conversación marcada como leída' });
  } catch (error) {
    console.error('Error al marcar como leída:', error);
    return NextResponse.json(
      { error: 'Error al marcar como leída' },
      { status: 500 }
    );
  }
}


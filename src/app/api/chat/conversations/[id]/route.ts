// src/app/api/chat/conversations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/middleware/auth';

type Params = { params: Promise<{ id: string }> };

// GET - Obtener detalles de una conversación
export async function GET(req: NextRequest, { params }: Params) {
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

    // Verificar que el usuario sea participante
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId: user.userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversación no encontrada' },
        { status: 404 }
      );
    }

    // Calcular mensajes no leídos
    const participant = conversation.participants.find((p) => p.userId === user.userId);
    const unreadCount = participant
      ? await prisma.message.count({
          where: {
            conversationId: conversation.id,
            createdAt: {
              gt: participant.lastReadAt || new Date(0),
            },
            senderId: {
              not: user.userId,
            },
          },
        })
      : 0;

    return NextResponse.json({
      id: conversation.id,
      name: conversation.name,
      is_group: conversation.isGroup,
      created_at: conversation.createdAt.toISOString(),
      participants: conversation.participants.map((p) => ({
        user: p.user,
        joined_at: p.joinedAt.toISOString(),
        last_read_at: p.lastReadAt?.toISOString(),
      })),
      last_message: conversation.messages[0]
        ? {
            id: conversation.messages[0].id,
            content: conversation.messages[0].content,
            created_at: conversation.messages[0].createdAt.toISOString(),
            sender: conversation.messages[0].sender,
          }
        : null,
      unread_count: unreadCount,
    });
  } catch (error) {
    console.error('Error al obtener conversación:', error);
    return NextResponse.json(
      { error: 'Error al obtener conversación' },
      { status: 500 }
    );
  }
}


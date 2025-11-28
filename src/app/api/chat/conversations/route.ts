// src/app/api/chat/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/middleware/auth';
import { createConversationSchema } from '@/lib/validations';
import { ZodError } from 'zod';

// GET - Listar conversaciones del usuario
export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
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
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Transformar al formato esperado por el frontend
    const formatted = await Promise.all(
      conversations.map(async (conv) => {
        // Contar mensajes no leídos
        const participant = conv.participants.find((p) => p.userId === user.userId);
        const unreadCount = participant
          ? await prisma.message.count({
              where: {
                conversationId: conv.id,
                createdAt: {
                  gt: participant.lastReadAt || new Date(0),
                },
                senderId: {
                  not: user.userId,
                },
              },
            })
          : 0;

        return {
          id: conv.id,
          name: conv.name,
          is_group: conv.isGroup,
          group_image_url: conv.groupImageUrl,
          created_at: conv.createdAt.toISOString(),
          participants: conv.participants.map((p) => ({
            user: p.user,
            joined_at: p.joinedAt.toISOString(),
            last_read_at: p.lastReadAt?.toISOString(),
          })),
          last_message: conv.messages[0]
            ? {
                id: conv.messages[0].id,
                content: conv.messages[0].content,
                created_at: conv.messages[0].createdAt.toISOString(),
                sender: conv.messages[0].sender,
              }
            : null,
          unread_count: unreadCount,
        };
      })
    );

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error al listar conversaciones:', error);
    return NextResponse.json(
      { error: 'Error al listar conversaciones' },
      { status: 500 }
    );
  }
}

// POST - Crear conversación
export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const body = await req.json();
    const data = createConversationSchema.parse(body);

    // Verificar que no intente crear conversación consigo mismo
    if (!data.is_group && data.users.length === 1 && data.users[0] === user.userId) {
      return NextResponse.json(
        { error: 'No puedes crear una conversación contigo mismo' },
        { status: 400 }
      );
    }

    // Para conversaciones 1:1, verificar si ya existe
    if (!data.is_group && data.users.length === 1) {
      const otherUserId = data.users[0];
      const existing = await prisma.conversation.findFirst({
        where: {
          isGroup: false,
          participants: {
            every: {
              userId: { in: [user.userId, otherUserId] },
            },
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, username: true, email: true },
              },
            },
          },
        },
      });

      if (existing && existing.participants.length === 2) {
        return NextResponse.json({
          id: existing.id,
          name: existing.name,
          is_group: existing.isGroup,
          created_at: existing.createdAt.toISOString(),
          participants: existing.participants.map((p) => ({
            user: p.user,
            joined_at: p.joinedAt.toISOString(),
          })),
        });
      }
    }

    // Crear conversación
    const userIds = [user.userId, ...data.users];
    const conversation = await prisma.conversation.create({
      data: {
        name: data.name,
        isGroup: data.is_group,
        groupImageUrl: body.group_image_url || null,
        participants: {
          create: userIds.map((id) => ({
            userId: id,
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, username: true, email: true },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        id: conversation.id,
        name: conversation.name,
        is_group: conversation.isGroup,
        created_at: conversation.createdAt.toISOString(),
        participants: conversation.participants.map((p) => ({
          user: p.user,
          joined_at: p.joinedAt.toISOString(),
        })),
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

    console.error('Error al crear conversación:', error);
    return NextResponse.json(
      { error: 'Error al crear conversación' },
      { status: 500 }
    );
  }
}


// src/app/api/chat/conversations/[id]/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/middleware/auth';
import { sendMessageSchema } from '@/lib/validations';
import { ZodError } from 'zod';

type Params = { params: Promise<{ id: string }> };

// GET - Listar mensajes de una conversación
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
    const isParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: user.userId,
      },
    });

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'No eres participante de esta conversación' },
        { status: 403 }
      );
    }

    // Paginación simple
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('page_size') || '50'), 100);

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    const total = await prisma.message.count({
      where: {
        conversationId,
        isDeleted: false,
      },
    });

    return NextResponse.json({
      results: messages.reverse().map((m) => ({
        id: m.id,
        content: m.content,
        created_at: m.createdAt.toISOString(),
        edited_at: m.editedAt?.toISOString(),
        sender: m.sender,
        conversation: m.conversationId,
      })),
      count: total,
      page,
      page_size: pageSize,
    });
  } catch (error) {
    console.error('Error al listar mensajes:', error);
    return NextResponse.json(
      { error: 'Error al listar mensajes' },
      { status: 500 }
    );
  }
}

// POST - Enviar mensaje (CON VALIDACIÓN DE AMISTAD)
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

    // Verificar que el usuario sea participante
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: user.userId,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: 'No eres participante de esta conversación' },
        { status: 403 }
      );
    }

    // Obtener la conversación para verificar si es 1:1
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          where: {
            userId: { not: user.userId }
          },
          select: {
            userId: true
          }
        }
      }
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversación no encontrada' },
        { status: 404 }
      );
    }

    // Si es conversación 1:1, verificar amistad
    if (!conversation.isGroup && conversation.participants.length > 0) {
      const otherUserId = conversation.participants[0].userId;
      
      // Verificar que sean amigos
      const friendship = await prisma.friendship.findFirst({
        where: {
          userId: user.userId,
          friendId: otherUserId,
        },
      });

      if (!friendship) {
        return NextResponse.json(
          { error: 'Solo puedes enviar mensajes a tus amigos' },
          { status: 403 }
        );
      }

      // Verificar que no esté bloqueado
      const blocked = await prisma.blockedUser.findFirst({
        where: {
          OR: [
            { blockerId: user.userId, blockedId: otherUserId },
            { blockerId: otherUserId, blockedId: user.userId },
          ],
        },
      });

      if (blocked) {
        return NextResponse.json(
          { error: 'No puedes enviar mensajes a este usuario' },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const data = sendMessageSchema.parse(body);

    const message = await prisma.message.create({
      data: {
        content: data.content,
        conversationId,
        senderId: user.userId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // Actualizar timestamp de la conversación
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(
      {
        id: message.id,
        content: message.content,
        created_at: message.createdAt.toISOString(),
        sender: message.sender,
        conversation: message.conversationId,
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

    console.error('Error al enviar mensaje:', error);
    return NextResponse.json(
      { error: 'Error al enviar mensaje' },
      { status: 500 }
    );
  }
}

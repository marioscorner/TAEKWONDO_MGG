// src/app/api/chat/conversations/[id]/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/middleware/auth';
import { sendMessageSchema } from '@/lib/validations';
import { ZodError } from 'zod';

type Params = { params: { id: string } };

// GET - Listar mensajes de una conversación
export async function GET(req: NextRequest, { params }: Params) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const conversationId = parseInt(params.id);

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

// POST - Enviar mensaje
export async function POST(req: NextRequest, { params }: Params) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const conversationId = parseInt(params.id);

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


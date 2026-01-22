// src/app/api/instructor/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/middleware/auth';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  // Solo INSTRUCTOR y ADMIN pueden acceder
  if (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Acceso denegado. Solo instructores y administradores' },
      { status: 403 }
    );
  }

  try {
    // Obtener todas las conversaciones del usuario con sus participantes
    const userConversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: user.userId,
          },
        },
      },
      include: {
        participants: {
          where: {
            userId: user.userId,
          },
        },
      },
    });

    // Contar conversaciones con mensajes no leídos
    let unreadConversations = 0;
    for (const conv of userConversations) {
      const participant = conv.participants[0];
      if (!participant) continue;

      const lastReadAt = participant.lastReadAt || new Date(0);
      
      // Verificar si hay mensajes no leídos (enviados por otros después de lastReadAt)
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          isDeleted: false,
          senderId: {
            not: user.userId,
          },
          createdAt: {
            gt: lastReadAt,
          },
        },
      });

      if (unreadCount > 0) {
        unreadConversations++;
      }
    }

    const [totalStudents, totalInstructors] = await Promise.all([
      prisma.user.count({ where: { role: 'ALUMNO' } }),
      prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
    ]);

    return NextResponse.json({
      totalStudents,
      totalInstructors,
      unreadConversations,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}


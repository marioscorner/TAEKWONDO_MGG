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
    const [totalStudents, totalInstructors, totalConversations, totalMessages] = await Promise.all([
      prisma.user.count({ where: { role: 'ALUMNO' } }),
      prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
      prisma.conversation.count(),
      prisma.message.count({ where: { isDeleted: false } }),
    ]);

    return NextResponse.json({
      totalStudents,
      totalInstructors,
      totalConversations,
      totalMessages,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}


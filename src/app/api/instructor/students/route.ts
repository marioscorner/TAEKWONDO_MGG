// src/app/api/instructor/students/route.ts
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
    const students = await prisma.user.findMany({
      where: {
        role: 'ALUMNO',
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        belt: true,
        createdAt: true,
        avatarUrl: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      results: students.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error al listar estudiantes:', error);
    return NextResponse.json(
      { error: 'Error al listar estudiantes' },
      { status: 500 }
    );
  }
}


// src/app/api/instructor/students/[id]/belt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/middleware/auth';

type Params = { params: Promise<{ id: string }> };

// PATCH - Actualizar cinturón de un alumno (solo INSTRUCTOR/ADMIN)
export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  // Solo INSTRUCTOR y ADMIN pueden cambiar cinturones
  if (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Acceso denegado. Solo instructores y administradores' },
      { status: 403 }
    );
  }

  try {
    const resolvedParams = await params;
    const studentId = parseInt(resolvedParams.id);
    if (isNaN(studentId)) {
      return NextResponse.json(
        { error: 'ID de estudiante inválido' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { belt } = body;

    if (!belt) {
      return NextResponse.json(
        { error: 'El cinturón es obligatorio' },
        { status: 400 }
      );
    }

    // Verificar que el estudiante existe y es ALUMNO
    const student = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Estudiante no encontrado' },
        { status: 404 }
      );
    }

    if (student.role !== 'ALUMNO') {
      return NextResponse.json(
        { error: 'Solo se puede cambiar el cinturón de alumnos' },
        { status: 400 }
      );
    }

    // Actualizar cinturón
    const updated = await prisma.user.update({
      where: { id: studentId },
      data: { belt },
      select: {
        id: true,
        username: true,
        belt: true,
      },
    });

    return NextResponse.json({
      message: 'Cinturón actualizado correctamente',
      user: updated,
    });
  } catch (error) {
    console.error('Error al actualizar cinturón:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el cinturón' },
      { status: 500 }
    );
  }
}


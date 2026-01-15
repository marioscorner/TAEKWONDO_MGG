// src/app/api/auth/register/instructor/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, sanitizeEmail } from '@/lib/auth-helpers';
import { z } from 'zod';

// Schema de validación para registro de instructor
const instructorRegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  username: z.string().min(3, 'El username debe tener al menos 3 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  secretPassword: z.string().min(1, 'La contraseña secreta es requerida'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = instructorRegisterSchema.parse(body);

    // Verificar contraseña secreta
    const INSTRUCTOR_SECRET = process.env.INSTRUCTOR_SECRET_PASSWORD;
    
    if (!INSTRUCTOR_SECRET) {
      console.error('⚠️ INSTRUCTOR_SECRET_PASSWORD no está configurada en .env');
      return NextResponse.json(
        { error: 'Configuración de servidor incompleta' },
        { status: 500 }
      );
    }

    if (data.secretPassword !== INSTRUCTOR_SECRET) {
      return NextResponse.json(
        { error: 'Contraseña secreta incorrecta' },
        { status: 403 }
      );
    }

    const email = sanitizeEmail(data.email);

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username: data.username },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email o nombre de usuario ya está registrado' },
        { status: 400 }
      );
    }

    // Crear usuario con rol INSTRUCTOR
    const hashedPassword = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email,
        username: data.username,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'INSTRUCTOR', // 🥋 Rol de instructor
        belt: 'Negro', // Instructores tienen cinturón negro por defecto
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        firstName: true,
        lastName: true,
        belt: true,
        createdAt: true,
      },
    });

    // Crear amistad automática con todos los alumnos existentes
    const alumnos = await prisma.user.findMany({
      where: { role: 'ALUMNO' },
      select: { id: true }
    });

    if (alumnos.length > 0) {
      const friendships = alumnos.flatMap(alumno => [
        {
          userId: user.id,
          friendId: alumno.id,
        },
        {
          userId: alumno.id,
          friendId: user.id,
        }
      ]);

      await prisma.friendship.createMany({
        data: friendships,
        skipDuplicates: true,
      });

      console.log(`✅ Instructor ${user.username} creado y conectado con ${alumnos.length} alumnos`);
    }

    return NextResponse.json(
      {
        message: 'Instructor registrado correctamente',
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error en registro de instructor:', error);
    return NextResponse.json(
      { error: 'Error al registrar instructor' },
      { status: 500 }
    );
  }
}


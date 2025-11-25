// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, sanitizeEmail } from '@/lib/auth-helpers';
import { registerSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

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

    // Crear usuario
    const hashedPassword = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email,
        username: data.username,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Usuario registrado correctamente',
        user,
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

    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}


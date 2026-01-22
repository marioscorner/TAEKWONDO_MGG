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
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  secretPassword: z.string().min(1, 'La contraseña secreta es requerida'),
});

export async function POST(req: NextRequest) {
  try {
    console.log('📝 Iniciando registro de instructor...');
    const body = await req.json();
    console.log('📦 Body recibido:', { ...body, password: '***', secretPassword: '***' });
    
    const data = instructorRegisterSchema.parse(body);
    console.log('✅ Validación Zod exitosa');

    // Verificar contraseña secreta
    const INSTRUCTOR_SECRET = process.env.INSTRUCTOR_SECRET_PASSWORD;
    console.log('🔐 INSTRUCTOR_SECRET configurado:', INSTRUCTOR_SECRET ? 'Sí' : 'No');
    
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
    console.log('📧 Email sanitizado:', email);

    // Verificar si el usuario ya existe
    console.log('🔍 Verificando si el usuario ya existe...');
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username: data.username },
        ],
      },
    });

    if (existingUser) {
      console.log('⚠️ Usuario ya existe:', existingUser.email);
      return NextResponse.json(
        { error: 'El email o nombre de usuario ya está registrado' },
        { status: 400 }
      );
    }

    // Crear usuario con rol INSTRUCTOR
    console.log('🔐 Hasheando contraseña...');
    const hashedPassword = await hashPassword(data.password);
    console.log('👤 Creando usuario en la base de datos...');
    const user = await prisma.user.create({
      data: {
        email,
        username: data.username,
        password: hashedPassword,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        role: 'INSTRUCTOR', // 🥋 Rol de instructor
        belt: 'Negro 1º dan', // Instructores tienen cinturón negro 1º dan por defecto
        emailVerified: true, // Instructores verificados automáticamente
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
      console.error('Error de validación Zod:', error.errors);
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    // Log detallado del error para debugging
    console.error('❌ Error en registro de instructor:', error);
    if (error instanceof Error) {
      console.error('Mensaje de error:', error.message);
      console.error('Stack:', error.stack);
    }

    return NextResponse.json(
      { 
        error: 'Error al registrar instructor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}


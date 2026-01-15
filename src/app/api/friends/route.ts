// src/app/api/friends/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/middleware/auth';

// GET - Listar amigos del usuario
export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('page_size') || '20'), 100);

    const friendships = await prisma.friendship.findMany({
      where: {
        userId: user.userId,
      },
      include: {
        friend: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });

    const total = await prisma.friendship.count({
      where: { userId: user.userId },
    });

    return NextResponse.json({
      results: friendships.map((f) => ({
        id: f.id,
        friend: f.friend,
        created_at: f.createdAt.toISOString(),
      })),
      count: total,
      page,
      page_size: pageSize,
    });
  } catch (error) {
    console.error('Error al listar amigos:', error);
    return NextResponse.json(
      { error: 'Error al listar amigos' },
      { status: 500 }
    );
  }
}


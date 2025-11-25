// src/app/api/friends/blocked/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/middleware/auth';

// GET - Listar usuarios bloqueados
export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('page_size') || '20'), 100);

    const blocked = await prisma.blockedUser.findMany({
      where: {
        blockerId: user.userId,
      },
      include: {
        blocked: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });

    const total = await prisma.blockedUser.count({
      where: { blockerId: user.userId },
    });

    return NextResponse.json({
      results: blocked.map((b) => ({
        id: b.id,
        user: b.blocked,
        created_at: b.createdAt.toISOString(),
      })),
      count: total,
      page,
      page_size: pageSize,
    });
  } catch (error) {
    console.error('Error al listar bloqueados:', error);
    return NextResponse.json(
      { error: 'Error al listar bloqueados' },
      { status: 500 }
    );
  }
}


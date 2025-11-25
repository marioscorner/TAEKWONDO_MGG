// src/app/api/friends/requests/mine/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/middleware/auth';

// GET - Obtener solicitudes del usuario (recibidas/enviadas)
export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const { searchParams } = new URL(req.url);
    const box = searchParams.get('box') || 'incoming'; // incoming, outgoing, all
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('page_size') || '20'), 100);

    let where: any = { status: 'PENDING' };

    if (box === 'incoming') {
      where.toUserId = user.userId;
    } else if (box === 'outgoing') {
      where.fromUserId = user.userId;
    } else if (box === 'all') {
      where.OR = [
        { fromUserId: user.userId },
        { toUserId: user.userId },
      ];
    }

    const requests = await prisma.friendRequest.findMany({
      where,
      include: {
        fromUser: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        toUser: {
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

    const total = await prisma.friendRequest.count({ where });

    return NextResponse.json({
      results: requests.map((r) => ({
        id: r.id,
        from_user: r.fromUser,
        to_user: r.toUser,
        message: r.message,
        status: r.status,
        created_at: r.createdAt.toISOString(),
      })),
      count: total,
      page,
      page_size: pageSize,
    });
  } catch (error) {
    console.error('Error al listar solicitudes:', error);
    return NextResponse.json(
      { error: 'Error al listar solicitudes' },
      { status: 500 }
    );
  }
}


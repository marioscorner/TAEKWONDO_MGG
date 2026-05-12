import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/server/middleware/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const pageSize = Math.min(Math.max(parseInt(searchParams.get("page_size") || "20", 10), 1), 100);
    const search = searchParams.get("search")?.trim();

    const where = {
      visibility: "PUBLIC" as const,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [documents, count] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          uploader: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.document.count({ where }),
    ]);

    return NextResponse.json({
      results: documents,
      count,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(count / pageSize),
    });
  } catch (error) {
    console.error("Error al listar documentos:", error);
    return NextResponse.json({ error: "Error al listar documentos" }, { status: 500 });
  }
}

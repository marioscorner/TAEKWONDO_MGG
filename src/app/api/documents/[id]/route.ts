import { unlink } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/server/middleware/auth";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const documentId = Number(id);
  if (!Number.isInteger(documentId)) {
    return NextResponse.json({ error: "ID de documento inválido" }, { status: 400 });
  }

  const document = await prisma.document.findUnique({
    where: { id: documentId },
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
  });

  if (!document) {
    return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
  }

  if (document.visibility !== "PUBLIC" && document.uploadedBy !== user.userId && user.role !== "ADMIN") {
    return NextResponse.json({ error: "No tienes permisos para ver este documento" }, { status: 403 });
  }

  return NextResponse.json(document);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const documentId = Number(id);
  if (!Number.isInteger(documentId)) {
    return NextResponse.json({ error: "ID de documento inválido" }, { status: 400 });
  }

  const document = await prisma.document.findUnique({ where: { id: documentId } });

  if (!document) {
    return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
  }

  if (document.uploadedBy !== user.userId && user.role !== "ADMIN") {
    return NextResponse.json({ error: "No tienes permisos para eliminar este documento" }, { status: 403 });
  }

  await prisma.document.delete({ where: { id: documentId } });

  try {
    const relativePath = document.fileUrl.replace(/^\//, "");
    await unlink(join(process.cwd(), "public", relativePath));
  } catch (error) {
    console.error("No se pudo eliminar el archivo físico del documento:", error);
  }

  return NextResponse.json({ message: "Documento eliminado" });
}

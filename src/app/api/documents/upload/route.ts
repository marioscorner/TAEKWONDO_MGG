import { randomBytes } from "crypto";
import { existsSync, mkdirSync } from "fs";
import { writeFile } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/server/middleware/auth";

export const runtime = "nodejs";

const allowedTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/gif",
]);

const maxFileSize = 50 * 1024 * 1024;

function safeFileExtension(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  return extension ? `.${extension}` : "";
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const roleError = requireRole(user, ["ADMIN", "INSTRUCTOR"]);
  if (roleError) return roleError;

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const rawName = formData.get("name");
    const rawDescription = formData.get("description");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
    }

    if (file.size > maxFileSize) {
      return NextResponse.json({ error: "El archivo no puede superar los 50MB" }, { status: 400 });
    }

    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 });
    }

    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const uploadDir = join(process.cwd(), "public", "uploads", "documents", year, month);

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const storedName = `${randomBytes(16).toString("hex")}${safeFileExtension(file.name)}`;
    const filePath = join(uploadDir, storedName);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const document = await prisma.document.create({
      data: {
        name: typeof rawName === "string" && rawName.trim() ? rawName.trim() : file.name,
        description: typeof rawDescription === "string" && rawDescription.trim() ? rawDescription.trim() : null,
        fileUrl: `/uploads/documents/${year}/${month}/${storedName}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedBy: user.userId,
        visibility: "PUBLIC",
      },
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

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error al subir documento:", error);
    return NextResponse.json({ error: "Error al subir documento" }, { status: 500 });
  }
}

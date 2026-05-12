"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DocumentUploader } from "@/components/documents/DocumentUploader";
import { DocumentsList } from "@/components/documents/DocumentsList";
import { useAuth } from "@/context/AuthContext";

export default function InstructorDocumentsPage() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const canManage = user?.role === "INSTRUCTOR" || user?.role === "ADMIN";

  if (!canManage) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
        No tienes permisos para gestionar documentos.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/dashboard/instructor" className="inline-flex items-center gap-2 text-sm font-semibold text-red-700 hover:text-red-900 dark:text-red-300 dark:hover:text-red-200">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Volver al panel
          </Link>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Gestión de documentos</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Sube recursos globales para que todos los alumnos puedan descargarlos.</p>
        </div>
      </div>

      <DocumentUploader onUploaded={() => setRefreshKey((current) => current + 1)} />

      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Documentos publicados</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Ordenados por fecha de subida, de más recientes a más antiguos.</p>
        </div>
        <DocumentsList canDelete currentUserId={user?.id} isAdmin={user?.role === "ADMIN"} refreshKey={refreshKey} />
      </section>
    </div>
  );
}

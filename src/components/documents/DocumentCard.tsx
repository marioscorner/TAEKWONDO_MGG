"use client";

import { Download, FileImage, FileSpreadsheet, FileText, Trash2 } from "lucide-react";
import type { DocumentResource } from "@/types/document";

type DocumentCardProps = {
  document: DocumentResource;
  canDelete?: boolean;
  onDelete?: (id: number) => void;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function DocumentIcon({ fileType }: { fileType: string }) {
  if (fileType.includes("image")) return <FileImage className="size-6" aria-hidden="true" />;
  if (fileType.includes("excel") || fileType.includes("spreadsheet")) {
    return <FileSpreadsheet className="size-6" aria-hidden="true" />;
  }
  return <FileText className="size-6" aria-hidden="true" />;
}

export function DocumentCard({ document, canDelete = false, onDelete }: DocumentCardProps) {
  const uploaderName = [document.uploader.firstName, document.uploader.lastName].filter(Boolean).join(" ") || document.uploader.username;

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300">
          <DocumentIcon fileType={document.fileType} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-slate-950 dark:text-white" title={document.name}>
            {document.name}
          </h3>
          <p className="mt-1 line-clamp-2 min-h-10 text-sm text-slate-600 dark:text-slate-400">
            {document.description || "Documento compartido por el instructor."}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div>
          <dt className="font-semibold uppercase tracking-wide text-slate-400">Subido por</dt>
          <dd className="truncate text-slate-700 dark:text-slate-200">{uploaderName}</dd>
        </div>
        <div>
          <dt className="font-semibold uppercase tracking-wide text-slate-400">Fecha</dt>
          <dd className="text-slate-700 dark:text-slate-200">{formatDate(document.createdAt)}</dd>
        </div>
        <div>
          <dt className="font-semibold uppercase tracking-wide text-slate-400">Archivo</dt>
          <dd className="truncate text-slate-700 dark:text-slate-200" title={document.fileName}>{document.fileName}</dd>
        </div>
        <div>
          <dt className="font-semibold uppercase tracking-wide text-slate-400">Tamaño</dt>
          <dd className="text-slate-700 dark:text-slate-200">{formatFileSize(document.fileSize)}</dd>
        </div>
      </dl>

      <div className="mt-auto flex gap-2 pt-4">
        <a
          href={document.fileUrl}
          download={document.fileName}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-red-700 px-3 py-2 text-sm font-bold text-white transition hover:bg-red-900 dark:bg-red-600 dark:hover:bg-red-500"
        >
          <Download className="size-4" aria-hidden="true" />
          Descargar
        </a>
        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete?.(document.id)}
            className="grid min-h-11 w-11 place-items-center rounded-xl border border-red-200 text-red-700 transition hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/30"
            aria-label={`Eliminar ${document.name}`}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </article>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, Search } from "lucide-react";
import { deleteDocument, listDocuments } from "@/lib/documents";
import type { DocumentResource } from "@/types/document";
import { DocumentCard } from "./DocumentCard";

type DocumentsListProps = {
  canDelete?: boolean;
  currentUserId?: number;
  isAdmin?: boolean;
  refreshKey?: number;
};

export function DocumentsList({ canDelete = false, currentUserId, isAdmin = false, refreshKey = 0 }: DocumentsListProps) {
  const [documents, setDocuments] = useState<DocumentResource[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listDocuments({ page, page_size: 18, search: query || undefined })
      .then((data) => {
        if (!mounted) return;
        setDocuments((prev) => (page === 1 ? data.results : [...prev, ...data.results]));
        setTotalPages(data.total_pages || 1);
        setError(null);
      })
      .catch(() => {
        if (mounted) setError("No se pudieron cargar los documentos.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [page, query, refreshKey]);

  const runSearch = () => {
    startTransition(() => {
      setPage(1);
      setDocuments([]);
      setQuery(search.trim());
    });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar este documento? Los alumnos dejarán de tener acceso.")) return;
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((document) => document.id !== id));
    } catch (error) {
      console.error("Error al eliminar documento:", error);
      setError("No se pudo eliminar el documento.");
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") runSearch();
            }}
            placeholder="Buscar documentos..."
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-slate-950 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-red-950/40"
          />
        </div>
        <button
          type="button"
          onClick={runSearch}
          disabled={isPending}
          className="min-h-11 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-red-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-red-100"
        >
          Buscar
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">{error}</div>}

      {loading && documents.length === 0 ? (
        <div className="grid min-h-48 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <Loader2 className="size-7 animate-spin" aria-label="Cargando documentos" />
        </div>
      ) : documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          No hay documentos disponibles todavía.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {documents.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              canDelete={canDelete && (isAdmin || document.uploadedBy === currentUserId)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {page < totalPages && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={loading}
            className="min-h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-800 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            {loading ? "Cargando..." : "Cargar más"}
          </button>
        </div>
      )}
    </section>
  );
}

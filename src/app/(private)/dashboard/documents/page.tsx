import { DocumentsList } from "@/components/documents/DocumentsList";

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 p-6 text-white shadow-martial">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-red-200">Biblioteca</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Documentos</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          Accede a los recursos compartidos por los instructores. Los documentos más recientes aparecen primero.
        </p>
      </section>

      <DocumentsList />
    </div>
  );
}

// src/app/docs/[id]/page.tsx
import API from "@/lib/api";

async function fetchDoc(id: string){
  const { data } = await API.get(`/docs/documents/${id}/`, { headers: {} });
  return data;
}

export default async function DocDetail({ params }: { params: Promise<{ id: string }> }){
  const { id } = await params;
  const doc = await fetchDoc(id);
  return (
    <div className="px-6 sm:px-8">
      <div className="w-full max-w-3xl mx-auto bg-[var(--card)] rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-4">{doc?.title || "Documento"}</h1>
        {doc?.pdf && <a className="btn-primary" href={doc.pdf} target="_blank">Abrir PDF</a>}
        {(!doc?.pdf && doc?.file) && <a className="btn-primary" href={doc.file} target="_blank">Descargar</a>}
        {!doc && <p className="text-sm text-gray-400">No encontrado.</p>}
      </div>
    </div>
  );
}

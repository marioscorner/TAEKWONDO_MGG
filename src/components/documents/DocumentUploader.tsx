"use client";

import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";
import { uploadDocument } from "@/lib/documents";

type DocumentUploaderProps = {
  onUploaded?: () => void;
};

const acceptedExtensions = ".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif";

export function DocumentUploader({ onUploaded }: DocumentUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const selectFile = (selected: File | null) => {
    setFile(selected);
    if (selected && !name) {
      setName(selected.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setNotice({ type: "error", text: "Selecciona un archivo antes de subirlo." });
      return;
    }

    setLoading(true);
    setNotice(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name.trim() || file.name);
      formData.append("description", description.trim());
      await uploadDocument(formData);
      setNotice({ type: "success", text: "Documento subido correctamente." });
      setName("");
      setDescription("");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      onUploaded?.();
    } catch (error) {
      setNotice({ type: "error", text: "No se pudo subir el documento. Revisa el tipo y tamaño del archivo." });
      console.error("Error al subir documento:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">Subir documento</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Los alumnos podrán descargarlo desde la pestaña Documentos.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            selectFile(event.dataTransfer.files?.[0] || null);
          }}
          className={`flex min-h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition ${
            dragging
              ? "border-red-600 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
              : "border-slate-300 bg-slate-50 text-slate-600 hover:border-red-400 hover:bg-red-50 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:bg-red-950/20"
          }`}
        >
          <Upload className="mb-3 size-8" aria-hidden="true" />
          <span className="font-bold">Arrastra un archivo o selecciónalo</span>
          <span className="mt-1 text-xs">PDF, Word, Excel, texto e imágenes. Máx. 50MB.</span>
          {file && <span className="mt-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700">{file.name}</span>}
        </button>

        <div className="space-y-3">
          <input ref={inputRef} type="file" accept={acceptedExtensions} className="hidden" onChange={(event) => selectFile(event.target.files?.[0] || null)} />
          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Título</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. Reglamento de competición"
              className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-red-950/40"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Descripción opcional</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="Añade una breve explicación para los alumnos."
              className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-red-950/40"
            />
          </label>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="min-h-11 w-full rounded-xl bg-red-700 px-4 py-2 font-bold text-white transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-red-600 dark:hover:bg-red-500"
          >
            {loading ? "Subiendo..." : "Publicar documento"}
          </button>
        </div>
      </div>

      {notice && (
        <div className={`mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${notice.type === "success" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"}`}>
          {notice.type === "success" ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
          {notice.text}
        </div>
      )}
    </section>
  );
}

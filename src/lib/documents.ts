import API from "./api";
import type { DocumentsPage } from "@/types/document";

export async function listDocuments(params?: { page?: number; page_size?: number; search?: string }) {
  const res = await API.get("/documents", { params });
  return res.data as DocumentsPage;
}

export async function uploadDocument(formData: FormData) {
  const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
  const res = await API.post("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.data;
}

export async function deleteDocument(id: number) {
  const res = await API.delete(`/documents/${id}`);
  return res.data;
}

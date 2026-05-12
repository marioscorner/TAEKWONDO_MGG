"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import API from "@/lib/api";
import DeleteAccountButton from "@/components/profile/DeleteAccountButton";
import { BELTS } from "@/lib/belt-colors";

type UserProfile = {
  id: number;
  username: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string;
  belt?: string;
  avatarUrl?: string;
};

export default function ProfilePage() {
  useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    belt: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await API.get("/users/profile");
      setProfile(res.data);
      setFormData({
        firstName: res.data.firstName || "",
        lastName: res.data.lastName || "",
        phone: res.data.phone || "",
        belt: res.data.belt || "",
      });
      if (res.data.avatarUrl) {
        setAvatarPreview(res.data.avatarUrl);
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen no puede superar los 5MB");
        return;
      }
      
      // Mostrar preview inmediatamente
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      setAvatarFile(file);
      
      // Subir automáticamente
      setUploadingAvatar(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "avatar");

        const res = await API.post("/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // Actualizar con la URL real del servidor
        if (res.data.url) {
          // Limpiar el preview temporal
          URL.revokeObjectURL(previewUrl);
          setAvatarPreview(res.data.url);
          setProfile(prev => prev ? { ...prev, avatarUrl: res.data.url } : null);
        }
        
        setAvatarFile(null);
        
        // Recargar el perfil completo para asegurar sincronización
        await loadProfile();
      } catch (error: unknown) {
        console.error("Error al subir avatar:", error);
        const errorMessage = getApiErrorMessage(error, "Error al subir el avatar");
        alert(`Error: ${errorMessage}`);
        // Revertir preview en caso de error
        setAvatarPreview(profile?.avatarUrl || null);
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      // Convertir formData a objeto JSON (el endpoint espera JSON, no FormData)
      // Enviar undefined en lugar de null para campos vacíos, o el valor si existe
      const dataToSend: {
        firstName?: string | null;
        lastName?: string | null;
        phone?: string | null;
        belt?: string | null;
      } = {};
      
      if (formData.firstName) dataToSend.firstName = formData.firstName;
      else dataToSend.firstName = null;
      
      if (formData.lastName) dataToSend.lastName = formData.lastName;
      else dataToSend.lastName = null;
      
      if (formData.phone) dataToSend.phone = formData.phone;
      else dataToSend.phone = null;
      
      if (formData.belt) dataToSend.belt = formData.belt;
      else dataToSend.belt = null;
      
      await API.patch("/users/profile", dataToSend);
      await loadProfile();
      setEditing(false);
    } catch (error: unknown) {
      console.error("Error al actualizar perfil:", error);
      const errorMessage = getApiErrorMessage(error, "Error al actualizar el perfil");
      alert(`Error: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-900 dark:text-gray-100">Cargando perfil...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600 dark:text-red-400">Error al cargar perfil</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 to-red-900 p-6 text-white shadow-martial sm:p-8">
        <div className="flex flex-col items-center text-center">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar" className="size-32 rounded-full border-4 border-white/80 object-cover shadow-xl" />
          ) : (
            <div className="grid size-32 place-items-center rounded-full border-4 border-white/40 bg-white/10 text-6xl shadow-xl">👤</div>
          )}
          <h1 className="mt-4 text-3xl font-bold tracking-tight">{profile.username}</h1>
          <p className="mt-1 text-sm text-red-50">{profile.email}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-red-800">{profile.belt || "Sin cinturón"}</span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-bold text-white">{profile.role === "ALUMNO" ? "Alumno" : profile.role}</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Columna izquierda: Avatar */}
        <div className="md:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col items-center">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="mb-4 size-40 rounded-full border-4 border-red-700 object-cover dark:border-red-500"
                />
              ) : (
                <div className="mb-4 flex size-40 items-center justify-center rounded-full bg-slate-100 text-6xl dark:bg-slate-800">
                  👤
                </div>
              )}
              
              <h2 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">{profile.username}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{profile.email}</p>
              
              {editing && (
                <div className="w-full space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                    className="w-full text-sm text-slate-900 file:mr-4 file:rounded-lg file:border-0 file:bg-red-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-red-700 hover:file:bg-red-100 disabled:opacity-50 dark:text-white dark:file:bg-red-950/40 dark:file:text-red-300"
                  />
                  {uploadingAvatar && (
                    <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                      Subiendo imagen...
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 w-full">
                <div className="text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    profile.role === 'ADMIN' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                    profile.role === 'INSTRUCTOR' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' :
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                  }`}>
                    {profile.role === 'ADMIN' ? '👑 Admin' :
                     profile.role === 'INSTRUCTOR' ? '🥋 Instructor' :
                     '🎓 Alumno'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: Información */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Información Personal</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="min-h-11 rounded-lg bg-red-700 px-4 py-2 font-semibold text-white transition hover:bg-red-900 dark:bg-red-600 dark:hover:bg-red-500"
                >
                  ✏️ Editar
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Nombre</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="min-h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-slate-950 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-red-500 dark:focus:ring-red-950/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Apellidos</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="min-h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-slate-950 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-red-500 dark:focus:ring-red-950/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="min-h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-slate-950 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-red-500 dark:focus:ring-red-950/40"
                  />
                </div>
                {(profile.role === 'INSTRUCTOR' || profile.role === 'ADMIN') && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Cinturón</label>
                    <select
                      value={formData.belt}
                      onChange={(e) => setFormData({ ...formData, belt: e.target.value })}
                      className="min-h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-slate-950 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-red-500 dark:focus:ring-red-950/40"
                    >
                      <option value="">Selecciona cinturón</option>
                      {BELTS.map((belt) => (
                        <option key={belt} value={belt}>
                          {belt}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Solo instructores pueden editar cinturones
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        firstName: profile.firstName || "",
                        lastName: profile.lastName || "",
                        phone: profile.phone || "",
                        belt: profile.belt || "",
                      });
                    }}
                    className="min-h-11 flex-1 rounded-lg border-2 border-slate-200 px-4 py-2 font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="min-h-11 flex-1 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700"
                  >
                    💾 Guardar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Nombre</label>
                  <p className="text-lg text-gray-900 dark:text-white">{profile.firstName || "No especificado"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Apellidos</label>
                  <p className="text-lg text-gray-900 dark:text-white">{profile.lastName || "No especificado"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Teléfono</label>
                  <p className="text-lg text-gray-900 dark:text-white">{profile.phone || "No especificado"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Cinturón</label>
                  <p className="text-lg text-gray-900 dark:text-white">
                    {profile.belt || "No especificado"}
                    {profile.role === 'ALUMNO' && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        (Solo tu instructor puede modificarlo)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Zona peligrosa */}
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 dark:border-red-900/70 dark:bg-red-950/20">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">⚠️ Zona Peligrosa</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Una vez elimines tu cuenta, no hay vuelta atrás. Todos tus datos se eliminarán permanentemente.
            </p>
            <DeleteAccountButton />
          </div>
        </div>
      </div>
    </div>
  );
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { error?: string; details?: { message?: string }[] } } }).response;
    return response?.data?.error || response?.data?.details?.[0]?.message || fallback;
  }
  return fallback;
}

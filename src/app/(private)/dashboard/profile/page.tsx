"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import API from "@/lib/api";
import DeleteAccountButton from "@/components/profile/DeleteAccountButton";

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
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
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
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", avatarFile);
      formData.append("type", "avatar");

      const res = await API.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAvatarPreview(res.data.url);
      setAvatarFile(null);
      await loadProfile();
      alert("Avatar actualizado correctamente");
    } catch (error) {
      console.error("Error al subir avatar:", error);
      alert("Error al subir el avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    try {
      await API.patch("/users/profile", formData);
      await loadProfile();
      setEditing(false);
      alert("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      alert("Error al actualizar el perfil");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Cargando perfil...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">Error al cargar perfil</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna izquierda: Avatar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex flex-col items-center">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-40 h-40 rounded-full object-cover border-4 border-blue-500 mb-4"
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center text-6xl mb-4">
                  👤
                </div>
              )}
              
              <h2 className="text-xl font-bold mb-1">{profile.username}</h2>
              <p className="text-sm text-gray-600 mb-4">{profile.email}</p>
              
              <div className="w-full space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="w-full text-sm"
                />
                {avatarFile && (
                  <button
                    onClick={handleUploadAvatar}
                    disabled={uploadingAvatar}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {uploadingAvatar ? "Subiendo..." : "Subir Avatar"}
                  </button>
                )}
              </div>

              <div className="mt-4 w-full">
                <div className="text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    profile.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                    profile.role === 'INSTRUCTOR' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
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
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Información Personal</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  ✏️ Editar
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Apellidos</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {(profile.role === 'INSTRUCTOR' || profile.role === 'ADMIN') && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Cinturón</label>
                    <select
                      value={formData.belt}
                      onChange={(e) => setFormData({ ...formData, belt: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecciona cinturón</option>
                      <option value="Blanco">Blanco</option>
                      <option value="Blanco-Amarillo">Blanco-Amarillo</option>
                      <option value="Amarillo">Amarillo</option>
                      <option value="Amarillo-Naranja">Amarillo-Naranja</option>
                      <option value="Naranja">Naranja</option>
                      <option value="Naranja-Verde">Naranja-Verde</option>
                      <option value="Verde">Verde</option>
                      <option value="Verde-Azul">Verde-Azul</option>
                      <option value="Azul">Azul</option>
                      <option value="Azul-Rojo">Azul-Rojo</option>
                      <option value="Rojo">Rojo</option>
                      <option value="Negro">Negro</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                  >
                    💾 Guardar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Nombre</label>
                  <p className="text-lg">{profile.firstName || "No especificado"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Apellidos</label>
                  <p className="text-lg">{profile.lastName || "No especificado"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Teléfono</label>
                  <p className="text-lg">{profile.phone || "No especificado"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Cinturón</label>
                  <p className="text-lg">
                    {profile.belt || "No especificado"}
                    {profile.role === 'ALUMNO' && (
                      <span className="text-xs text-gray-500 ml-2">
                        (Solo tu instructor puede modificarlo)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Zona peligrosa */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ Zona Peligrosa</h2>
            <p className="text-gray-700 mb-4">
              Una vez elimines tu cuenta, no hay vuelta atrás. Todos tus datos se eliminarán permanentemente.
            </p>
            <DeleteAccountButton />
          </div>
        </div>
      </div>
    </div>
  );
}

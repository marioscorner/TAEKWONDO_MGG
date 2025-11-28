"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Friends } from "@/lib/friends";
import API from "@/lib/api";

type Friend = {
  id: number;
  friend: {
    id: number;
    username: string;
    email: string;
  };
};

export default function CreateGroupPage() {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [groupImage, setGroupImage] = useState<File | null>(null);
  const [groupImagePreview, setGroupImagePreview] = useState<string | null>(null);
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [error, setError] = useState("");

  // Cargar amigos al montar
  useState(() => {
    const loadFriends = async () => {
      try {
        const res = await Friends.list({ page_size: 100 });
        const friendsList = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setFriends(friendsList);
      } catch (error) {
        console.error("Error al cargar amigos:", error);
        setError("Error al cargar lista de amigos");
      } finally {
        setLoadingFriends(false);
      }
    };
    loadFriends();
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no puede superar los 5MB");
        return;
      }
      setGroupImage(file);
      setGroupImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const toggleFriend = (friendId: number) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      setError("El nombre del grupo es obligatorio");
      return;
    }

    if (selectedFriends.length < 2) {
      setError("Debes seleccionar al menos 2 amigos para crear un grupo");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Subir imagen primero si existe
      let imageUrl = null;
      if (groupImage) {
        const formData = new FormData();
        formData.append("file", groupImage);
        formData.append("type", "group");
        
        const uploadRes = await API.post("/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadRes.data.url;
      }

      // Crear grupo
      const res = await API.post("/chat/conversations", {
        is_group: true,
        name: groupName,
        group_image_url: imageUrl,
        users: selectedFriends,
      });

      router.push(`/dashboard/chats/${res.data.id}`);
    } catch (error: any) {
      console.error("Error al crear grupo:", error);
      setError(error.response?.data?.error || "Error al crear el grupo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Volver
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6">Crear Grupo</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre del grupo */}
        <div>
          <label htmlFor="groupName" className="block text-sm font-medium mb-2">
            Nombre del grupo *
          </label>
          <input
            id="groupName"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Ej: Equipo de competencia"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={50}
          />
        </div>

        {/* Imagen del grupo */}
        <div>
          <label htmlFor="groupImage" className="block text-sm font-medium mb-2">
            Imagen del grupo (opcional)
          </label>
          <div className="flex items-center gap-4">
            {groupImagePreview && (
              <img
                src={groupImagePreview}
                alt="Preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
              />
            )}
            <div className="flex-1">
              <input
                id="groupImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Máximo 5MB. Formatos: JPG, PNG, GIF
              </p>
            </div>
          </div>
        </div>

        {/* Seleccionar amigos */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Seleccionar participantes * (mínimo 2)
          </label>
          {loadingFriends ? (
            <div className="text-center py-4 text-gray-500">Cargando amigos...</div>
          ) : friends.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No tienes amigos todavía. Añade amigos para crear grupos.
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg max-h-80 overflow-y-auto">
              {friends.map((f) => (
                <label
                  key={f.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedFriends.includes(f.friend.id)}
                    onChange={() => toggleFriend(f.friend.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="font-medium">{f.friend.username}</span>
                </label>
              ))}
            </div>
          )}
          <p className="text-sm text-gray-600 mt-2">
            Seleccionados: {selectedFriends.length}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || selectedFriends.length < 2}
            className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando..." : "Crear Grupo"}
          </button>
        </div>
      </form>
    </div>
  );
}


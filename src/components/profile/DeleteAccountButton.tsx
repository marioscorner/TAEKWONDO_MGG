"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

export default function DeleteAccountButton() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      setError('Debes escribir "DELETE" para confirmar');
      return;
    }

    if (!password) {
      setError("Debes introducir tu contraseña");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await API.delete("/users/delete-account", {
        data: {
          password,
          confirm: "DELETE",
        },
      });

      // Limpiar token y redirigir
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      router.push("/login?deleted=true");
    } catch (error: any) {
      console.error("Error al eliminar cuenta:", error);
      setError(
        error.response?.data?.error || "Error al eliminar la cuenta"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
      >
        🗑️ Eliminar Cuenta
      </button>

      {/* Modal de confirmación */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              ⚠️ Eliminar Cuenta
            </h2>
            
            <div className="mb-6 space-y-2 text-gray-700 dark:text-gray-300">
              <p className="font-semibold">Esta acción es irreversible.</p>
              <p className="text-sm">Se eliminarán:</p>
              <ul className="text-sm list-disc list-inside space-y-1 ml-2">
                <li>Tu perfil y toda tu información personal</li>
                <li>Todas tus conversaciones y mensajes</li>
                <li>Tus amigos y solicitudes</li>
                <li>Todo tu progreso y datos</li>
              </ul>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  Contraseña *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Introduce tu contraseña"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  Escribe &quot;DELETE&quot; para confirmar *
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setPassword("");
                  setConfirmText("");
                  setError("");
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium disabled:opacity-50 text-gray-900 dark:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loading || !password || confirmText !== "DELETE"}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Eliminando..." : "Eliminar Definitivamente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


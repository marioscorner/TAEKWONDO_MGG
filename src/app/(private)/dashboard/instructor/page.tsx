"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { BELTS, getBeltBadgeClass } from "@/lib/belt-colors";

type Student = {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  belt?: string;
  createdAt: string;
};

type Stats = {
  totalStudents: number;
  totalInstructors: number;
  unreadConversations: number;
};

export default function InstructorPanelPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingBelt, setEditingBelt] = useState<{ studentId: number; currentBelt: string; username: string } | null>(null);
  const [beltUpdateStatus, setBeltUpdateStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    // Verificar que el usuario sea INSTRUCTOR o ADMIN
    if (user && user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, router]);

  const loadData = async () => {
    try {
      // Cargar estudiantes
      const studentsRes = await API.get('/instructor/students');
      setStudents(studentsRes.data.results || studentsRes.data);

      // Cargar estadísticas
      const statsRes = await API.get('/instructor/stats');
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.firstName && s.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.lastName && s.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN')) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600 dark:text-red-400">
          Acceso denegado. Solo instructores y administradores pueden acceder.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-900 dark:text-white">Cargando panel de instructor...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">🥋 Panel de Instructor</h1>
        <p className="text-gray-600 dark:text-gray-400">Gestiona tus alumnos y consulta estadísticas</p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalStudents}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Alumnos</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.totalInstructors}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Instructores</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.unreadConversations}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Conversaciones sin leer</div>
          </div>
        </div>
      )}

      {/* Buscador de alumnos */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">👨‍🎓 Mis Alumnos</h2>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre, username o email..."
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />

        {filteredStudents.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No se encontraron alumnos' : 'No tienes alumnos todavía'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Username</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Cinturón</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Registro</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{student.username}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {student.firstName || student.lastName
                        ? `${student.firstName || ''} ${student.lastName || ''}`.trim()
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{student.email}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setEditingBelt({
                            studentId: student.id,
                            currentBelt: student.belt || 'Blanco',
                            username: student.username
                          });
                        }}
                        className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity ${getBeltBadgeClass(student.belt)}`}
                        title="Click para cambiar cinturón"
                      >
                        {student.belt || 'Sin cinturón'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(student.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push(`/dashboard/chats`)}
                        className="px-3 py-1 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white text-sm rounded transition-colors"
                      >
                        💬 Chat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">⚡ Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/dashboard/chats/create-group')}
            className="px-6 py-4 bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg font-medium text-left"
          >
            👥 Crear Grupo de Clase
          </button>
          <button
            onClick={() => router.push('/dashboard/friends')}
            className="px-6 py-4 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-medium text-left"
          >
            🤝 Gestionar Amigos
          </button>
          <button
            onClick={() => router.push('/dashboard/profile')}
            className="px-6 py-4 bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-600 text-white rounded-lg font-medium text-left"
          >
            👤 Mi Perfil
          </button>
        </div>
      </div>

      {/* Modal de cambio de cinturón */}
      {editingBelt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Cambiar Cinturón
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Alumno: <span className="font-semibold text-gray-900 dark:text-white">{editingBelt.username}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Cinturón actual: <span className={`font-semibold px-2 py-0.5 rounded text-xs ${getBeltBadgeClass(editingBelt.currentBelt)}`}>
                {editingBelt.currentBelt}
              </span>
            </p>
            {beltUpdateStatus && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                beltUpdateStatus.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}>
                {beltUpdateStatus.message}
              </div>
            )}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nuevo cinturón:
              </label>
              <select
                id="belt-select"
                defaultValue={editingBelt.currentBelt}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {BELTS.map((belt) => (
                  <option key={belt} value={belt}>
                    {belt}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  const select = document.getElementById('belt-select') as HTMLSelectElement;
                  const newBelt = select.value;
                  try {
                    await API.patch(`/instructor/students/${editingBelt.studentId}/belt`, { belt: newBelt });
                    setBeltUpdateStatus({ type: 'success', message: 'Cinturón actualizado correctamente' });
                    await loadData();
                    setTimeout(() => {
                      setEditingBelt(null);
                      setBeltUpdateStatus(null);
                    }, 1000);
                  } catch (error: any) {
                    setBeltUpdateStatus({ type: 'error', message: error.response?.data?.error || 'Error al actualizar cinturón' });
                  }
                }}
                className="flex-1 px-4 py-2 bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={() => setEditingBelt(null)}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

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
  totalConversations: number;
  totalMessages: number;
};

export default function InstructorPanelPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalStudents}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Alumnos</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.totalInstructors}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Instructores</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.totalConversations}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Conversaciones</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.totalMessages}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Mensajes</div>
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
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        student.belt === 'Negro' ? 'bg-black text-white' :
                        student.belt === 'Rojo' ? 'bg-red-500 text-white' :
                        student.belt === 'Azul-Rojo' ? 'bg-gradient-to-r from-blue-500 to-red-500 text-white' :
                        student.belt === 'Azul' ? 'bg-blue-500 text-white' :
                        student.belt === 'Verde-Azul' ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' :
                        student.belt === 'Verde' ? 'bg-green-500 text-white' :
                        student.belt === 'Naranja-Verde' ? 'bg-gradient-to-r from-orange-500 to-green-500 text-white' :
                        student.belt === 'Naranja' ? 'bg-orange-500 text-white' :
                        student.belt === 'Amarillo-Naranja' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                        student.belt === 'Amarillo' ? 'bg-yellow-400 text-gray-800' :
                        student.belt === 'Blanco-Amarillo' ? 'bg-gradient-to-r from-gray-100 to-yellow-400 text-gray-800' :
                        student.belt === 'Blanco' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {student.belt || 'Sin cinturón'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(student.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/chats`)}
                          className="px-3 py-1 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white text-sm rounded transition-colors"
                        >
                          💬 Chat
                        </button>
                        <button
                          onClick={async () => {
                            const newBelt = prompt(`Cambiar cinturón de ${student.username}\nCinturón actual: ${student.belt || 'Sin cinturón'}\n\nNuevo cinturón:`);
                            if (newBelt) {
                              try {
                                await API.patch(`/instructor/students/${student.id}/belt`, { belt: newBelt });
                                alert('Cinturón actualizado correctamente');
                                await loadData();
                              } catch (error: any) {
                                alert(error.response?.data?.error || 'Error al actualizar cinturón');
                              }
                            }
                          }}
                          className="px-3 py-1 bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-600 text-white text-sm rounded transition-colors"
                        >
                          🥋 Cambiar
                        </button>
                      </div>
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
    </div>
  );
}


"use client";
import { useEffect, useState } from "react";
import API from "@/lib/api";
import { Friends } from "@/lib/friends";

type FriendReq = {
  id: number;
  from_user: { id: number; username: string } | null;
  to_user: { id: number; username: string } | null;
  status: string;
};

type Friend = { 
  id: number; 
  username: string;
  friend?: {
    id: number;
    username: string;
  };
};

type SearchUser = {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
};

export default function FriendsPage() {
  const [requests, setRequests] = useState<FriendReq[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Buscador de usuarios
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Filtro de amigos
  const [friendFilter, setFriendFilter] = useState("");

  const reload = async () => {
    try {
      const [reqs, frs] = await Promise.all([
        API.get("/friends/requests/mine", { params: { box: "incoming" } }),
        API.get("/friends"),
      ]);
      
      // Las respuestas vienen paginadas con { results: [...] }
      const requestsList = Array.isArray(reqs.data) ? reqs.data : (reqs.data?.results || []);
      const friendsList = Array.isArray(frs.data) ? frs.data : (frs.data?.results || []);
      
      setRequests(requestsList);
      
      // Los amigos vienen como array de objetos con { friend: {...} }
      const friendsFormatted = friendsList.map((f: any) => f.friend || f);
      setFriends(friendsFormatted);
    } catch (error) {
      console.error("Error al cargar amigos:", error);
      setRequests([]);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const act = (id: number, action: "accept" | "reject") =>
    API.post(`/friends/requests/${id}/${action}`).then(reload);

  // Buscar usuarios
  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearching(true);
    try {
      const res = await API.get("/users/search", { params: { q: query } });
      setSearchResults(res.data.results || []);
      setShowResults(true);
    } catch (error) {
      console.error("Error al buscar:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Enviar solicitud
  const sendRequest = async (userId: number) => {
    try {
      await Friends.send(userId, "¡Hola! Me gustaría agregarte como amigo.");
      alert("Solicitud enviada correctamente");
      setSearchQuery("");
      setSearchResults([]);
      setShowResults(false);
      await reload();
    } catch (error: any) {
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert("Error al enviar solicitud");
      }
    }
  };

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="px-6 sm:px-8">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
        {/* Buscador de usuarios */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Buscar usuarios</h2>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Busca por nombre de usuario o email..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            {searching && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>

          {/* Resultados de búsqueda */}
          {showResults && (
            <div className="mt-4 space-y-3">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  No se encontraron usuarios
                </div>
              ) : (
                searchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{user.username}</div>
                      {(user.firstName || user.lastName) && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user.firstName} {user.lastName}
                        </div>
                      )}
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                        user.role === 'INSTRUCTOR' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {user.role === 'INSTRUCTOR' ? 'Instructor' : user.role === 'ADMIN' ? 'Administrador' : 'Alumno'}
                      </span>
                    </div>
                    <button
                      onClick={() => sendRequest(user.id)}
                      className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                    >
                      Enviar solicitud
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        {/* Lista de amigos y solicitudes */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Mis Amigos</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Gestiona solicitudes y consulta tu lista de amigos.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Solicitudes</h2>
              <div className="space-y-3">
                {loading && <p className="text-sm text-gray-600 dark:text-gray-400">Cargando…</p>}
                {!loading && requests.length === 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">No hay solicitudes pendientes.</p>
                )}
                {requests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                    <div className="text-sm">
                      <span className="font-semibold text-gray-900 dark:text-white">{req.from_user?.username}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="px-3 py-1.5 bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 text-white text-sm rounded-lg transition-colors" 
                        onClick={() => act(req.id, "accept")}
                      >
                        ✓ Aceptar
                      </button>
                      <button 
                        className="px-3 py-1.5 bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white text-sm rounded-lg transition-colors" 
                        onClick={() => act(req.id, "reject")}
                      >
                        ✗ Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Tu lista</h2>
              
              {/* Filtro de amigos */}
              <input
                type="text"
                value={friendFilter}
                onChange={(e) => setFriendFilter(e.target.value)}
                placeholder="Buscar en tus amigos..."
                className="w-full px-3 py-2 mb-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              
              {loading && <p className="text-sm text-gray-600 dark:text-gray-400">Cargando…</p>}
              {!loading && friends.length === 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">Aún no tienes amigos.</p>
              )}
              <div className="space-y-3">
                {friends
                  .filter(f => {
                    const username = f.username || f.friend?.username || '';
                    return username.toLowerCase().includes(friendFilter.toLowerCase());
                  })
                  .sort((a, b) => {
                    const usernameA = (a.username || a.friend?.username || '').toLowerCase();
                    const usernameB = (b.username || b.friend?.username || '').toLowerCase();
                    return usernameA.localeCompare(usernameB);
                  })
                  .map((f) => {
                    const friendUsername = f.username || f.friend?.username;
                    const friendId = f.friend?.id || f.id;
                    return (
                      <div key={f.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                        <div className="font-medium text-sm text-gray-900 dark:text-white">{friendUsername}</div>
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              try {
                                // Crear conversación 1:1
                                const res = await API.post('/chat/conversations', {
                                  is_group: false,
                                  users: [friendId]
                                });
                                // Redirigir al chat
                                window.location.href = `/dashboard/chats/${res.data.id}`;
                              } catch (error) {
                                alert('Error al crear chat');
                              }
                            }}
                            className="px-3 py-1.5 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white text-xs rounded-lg transition-colors"
                          >
                            💬 Chat
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`¿Eliminar a ${friendUsername} de tus amigos?`)) {
                                try {
                                  await API.post(`/friends/unfriend/${friendId}`);
                                  await reload();
                                } catch (error) {
                                  alert('Error al eliminar amigo');
                                }
                              }
                            }}
                            className="px-3 py-1.5 bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 text-white text-xs rounded-lg transition-colors"
                          >
                            Eliminar
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`¿Bloquear a ${friendUsername}?`)) {
                                try {
                                  await Friends.block(friendId);
                                  await reload();
                                } catch (error) {
                                  alert('Error al bloquear usuario');
                                }
                              }
                            }}
                            className="px-3 py-1.5 bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white text-xs rounded-lg transition-colors"
                          >
                            Bloquear
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

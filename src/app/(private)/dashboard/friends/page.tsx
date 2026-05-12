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
    role: string;
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

type FriendApiItem = Friend & { friend?: Friend["friend"] };

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    return response?.data?.error || fallback;
  }
  return fallback;
}

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
      const friendsFormatted = (friendsList as FriendApiItem[]).map((f) => f.friend || f);
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
    } catch (error: unknown) {
      alert(getApiErrorMessage(error, "Error al enviar solicitud"));
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
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 to-red-900 p-6 text-white shadow-martial sm:p-8">
        <div className="mb-3 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-red-100">Comunidad</div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Amigos y solicitudes</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-red-50">Busca compañeros, acepta solicitudes y abre conversaciones de entrenamiento.</p>
      </div>
      <div className="flex flex-col gap-6">
        {/* Buscador de usuarios */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <h2 className="mb-4 text-2xl font-bold text-slate-950 dark:text-white">Buscar usuarios</h2>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Busca por nombre de usuario o email..."
              className="min-h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-red-500 dark:focus:ring-red-950/40"
            />
            {searching && (
              <div className="absolute right-3 top-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
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
                  <div key={user.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40 sm:flex-row sm:items-center sm:justify-between">
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
                            'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-200'
                      }`}>
                        {user.role === 'INSTRUCTOR' ? 'Instructor' : user.role === 'ADMIN' ? 'Administrador' : 'Alumno'}
                      </span>
                    </div>
                    <button
                      onClick={() => sendRequest(user.id)}
                      className="min-h-11 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-900 dark:bg-red-600 dark:hover:bg-red-500"
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
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <h1 className="mb-2 text-3xl font-bold text-slate-950 dark:text-white">Mis amigos</h1>
          <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
            Gestiona solicitudes y consulta tu lista de amigos.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="mb-3 text-xl font-bold text-slate-950 dark:text-white">Solicitudes</h2>
              <div className="space-y-3">
                {loading && <p className="text-sm text-gray-600 dark:text-gray-400">Cargando…</p>}
                {!loading && requests.length === 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">No hay solicitudes pendientes.</p>
                )}
                {requests.map((req) => (
                  <div key={req.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40 sm:flex-row sm:items-center sm:justify-between">
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
              <h2 className="mb-3 text-xl font-bold text-slate-950 dark:text-white">Tu lista</h2>
              
              {/* Filtro de amigos */}
              <input
                type="text"
                value={friendFilter}
                onChange={(e) => setFriendFilter(e.target.value)}
                placeholder="Buscar en tus amigos..."
                className="mb-3 min-h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-red-500 dark:focus:ring-red-950/40"
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
                    const friendRole = f.friend?.role;
                    const isInstructorOrAdmin = friendRole === 'INSTRUCTOR' || friendRole === 'ADMIN';
                    
                    return (
                      <div key={f.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-sm text-gray-900 dark:text-white">{friendUsername}</div>
                          {isInstructorOrAdmin && (
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                              friendRole === 'ADMIN' 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                            }`}>
                              {friendRole === 'ADMIN' ? '👑 Admin' : '🥋 Instructor'}
                            </span>
                          )}
                        </div>
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
                              } catch {
                                alert('Error al crear chat');
                              }
                            }}
                            className="rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-900 dark:bg-red-600 dark:hover:bg-red-500"
                          >
                            💬 Chat
                          </button>
                          {isInstructorOrAdmin ? (
                            <button
                              disabled
                              title="No puedes eliminar a un instructor o administrador"
                              className="px-3 py-1.5 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-xs rounded-lg cursor-not-allowed"
                            >
                              🔒 Protegido
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={async () => {
                                  if (confirm(`¿Eliminar a ${friendUsername} de tus amigos?`)) {
                                    try {
                                      await API.post(`/friends/unfriend/${friendId}`);
                                      await reload();
                                    } catch (error: unknown) {
                                      alert(getApiErrorMessage(error, 'Error al eliminar amigo'));
                                    }
                                  }
                                }}
                                className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-700"
                              >
                                Eliminar
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(`¿Bloquear a ${friendUsername}?`)) {
                                    try {
                                      await Friends.block(friendId);
                                      await reload();
                                    } catch {
                                      alert('Error al bloquear usuario');
                                    }
                                  }
                                }}
                                className="px-3 py-1.5 bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white text-xs rounded-lg transition-colors"
                              >
                                Bloquear
                              </button>
                            </>
                          )}
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

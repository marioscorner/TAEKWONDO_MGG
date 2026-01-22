// src/components/HeaderPrivate.tsx
"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import { getBeltTextColor, isFullBelt } from "@/lib/belt-colors";
import { useEffect, useState } from "react";
import API from "@/lib/api";

export default function HeaderPrivate() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [userBelt, setUserBelt] = useState<string | null>(null);

  useEffect(() => {
    // Cargar el cinturón del usuario desde el perfil
    const loadUserBelt = async () => {
      try {
        const res = await API.get("/users/profile");
        setUserBelt(res.data.belt);
      } catch (error) {
        console.error("Error al cargar cinturón:", error);
      }
    };
    
    if (user) {
      loadUserBelt();
    }
  }, [user]);

  // Obtener color del username según cinturón (solo si es cinturón completo)
  // En el header oscuro, necesitamos colores claros/brillantes
  const usernameColor = userBelt && isFullBelt(userBelt)
    ? (userBelt.startsWith('Negro') 
        ? 'text-white' 
        : userBelt === 'Rojo' 
          ? 'text-red-300' 
          : userBelt === 'Azul' 
            ? 'text-blue-300' 
            : userBelt === 'Verde' 
              ? 'text-green-300' 
              : userBelt === 'Naranja' 
                ? 'text-orange-300' 
                : userBelt === 'Amarillo' 
                  ? 'text-yellow-300' 
                  : 'text-blue-400')
    : 'text-blue-400';

  return (
    <header className="border-b bg-gray-900 text-white shadow-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Saludo al usuario donde estaba "Área privada" */}
        <div className="font-bold text-lg">
          {user ? (
            <span>Bienvenido, <span className={usernameColor || 'text-blue-400'}>{user.username}</span> 🥋</span>
          ) : (
            <span>Área privada 🥋</span>
          )}
        </div>
        
        {/* Menú de navegación */}
        <ul className="flex gap-4 text-sm font-medium items-center">
          <li><Link href="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link></li>
          <li><Link href="/dashboard/chats" className="hover:text-blue-400 transition-colors">Chats</Link></li>
          <li><Link href="/dashboard/friends" className="hover:text-blue-400 transition-colors">Amigos</Link></li>
          <li><Link href="/dashboard/profile" className="hover:text-blue-400 transition-colors">Perfil</Link></li>
          <li>
            <button
              onClick={toggleTheme}
              className="p-2 rounded hover:bg-gray-700 transition-colors"
              title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </li>
          {user && (
            <li>
              <button 
                onClick={logout} 
                className="bg-red-600 px-3 py-1.5 rounded hover:bg-red-700 transition-colors"
              >
                Cerrar sesión
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

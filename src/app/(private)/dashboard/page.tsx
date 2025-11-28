"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function DashboardHome() {
  const { user } = useAuth();
  
  return (
    <div className="px-6 sm:px-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Panel</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Bienvenido al área privada. Elige una sección:
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Panel de Instructor (solo para INSTRUCTOR y ADMIN) */}
            {(user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN') && (
              <Link 
                href="/dashboard/instructor" 
                className="flex flex-col items-center justify-center p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50"
              >
                <span className="text-4xl mb-3">🏆</span>
                <span className="font-semibold text-lg text-gray-900 dark:text-white">Panel Instructor</span>
              </Link>
            )}
            
            <Link 
              href="/dashboard/chats" 
              className="flex flex-col items-center justify-center p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all bg-white dark:bg-gray-800"
            >
              <span className="text-4xl mb-3">💬</span>
              <span className="font-semibold text-lg text-gray-900 dark:text-white">Chats</span>
            </Link>
            
            <Link 
              href="/dashboard/friends" 
              className="flex flex-col items-center justify-center p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 transition-all bg-white dark:bg-gray-800"
            >
              <span className="text-4xl mb-3">👥</span>
              <span className="font-semibold text-lg text-gray-900 dark:text-white">Amigos</span>
            </Link>
            
            <Link 
              href="/dashboard/friends/blocked" 
              className="flex flex-col items-center justify-center p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all bg-white dark:bg-gray-800"
            >
              <span className="text-4xl mb-3">🚫</span>
              <span className="font-semibold text-lg text-gray-900 dark:text-white">Bloqueados</span>
            </Link>
            
            <a 
              href="/docs" 
              className="flex flex-col items-center justify-center p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all bg-white dark:bg-gray-800"
            >
              <span className="text-4xl mb-3">📚</span>
              <span className="font-semibold text-lg text-gray-900 dark:text-white">Documentación</span>
            </a>
            
            <Link 
              href="/dashboard/profile" 
              className="flex flex-col items-center justify-center p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-all bg-white dark:bg-gray-800"
            >
              <span className="text-4xl mb-3">👤</span>
              <span className="font-semibold text-lg text-gray-900 dark:text-white">Perfil</span>
            </Link>
            
            <Link 
              href="/dashboard/temario" 
              className="flex flex-col items-center justify-center p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-yellow-500 dark:hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-all bg-white dark:bg-gray-800"
            >
              <span className="text-4xl mb-3">🥋</span>
              <span className="font-semibold text-lg text-gray-900 dark:text-white">Temario</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

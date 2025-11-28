"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function HeaderPublic() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 flex items-center border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 w-full">
        <div className="font-bold text-xl text-gray-900 dark:text-white">🥋 Taekwondo Mario Gutiérrez</div>
        <ul className="flex gap-4 text-sm font-medium items-center">
          <li><Link href="/" className="hover:underline text-gray-900 dark:text-white">Inicio</Link></li>
          <li><Link href="/about" className="hover:underline text-gray-900 dark:text-white">Sobre mí</Link></li>
          <li><Link href="/docs" className="hover:underline text-gray-900 dark:text-white">Docs</Link></li>
          <li><Link href="/login" className="hover:underline text-gray-900 dark:text-white">Login</Link></li>
          <li>
            <button
              onClick={toggleTheme}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}

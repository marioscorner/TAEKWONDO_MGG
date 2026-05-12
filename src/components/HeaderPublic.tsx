"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function HeaderPublic() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex h-16 items-center border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 w-full">
        <div className="truncate text-base font-bold text-slate-950 dark:text-white sm:text-xl">🥋 Taekwondo Mario Gutiérrez</div>
        <ul className="flex items-center gap-2 text-sm font-semibold sm:gap-4">
          <li><Link href="/" className="text-slate-900 hover:text-red-700 dark:text-white dark:hover:text-red-300">Inicio</Link></li>
          <li><Link href="/about" className="hidden text-slate-900 hover:text-red-700 dark:text-white dark:hover:text-red-300 sm:inline">Sobre mí</Link></li>
          <li><Link href="/docs" className="hidden text-slate-900 hover:text-red-700 dark:text-white dark:hover:text-red-300 sm:inline">Docs</Link></li>
          <li><Link href="/login" className="rounded-lg bg-red-700 px-3 py-2 text-white transition hover:bg-red-900">Login</Link></li>
          <li>
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 transition-colors hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300"
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

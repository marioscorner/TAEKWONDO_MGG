"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, FileText, Home, LogOut, MessageCircle, Moon, Shield, Sun, Upload, User, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

const mainItems = [
  { href: "/dashboard/temario", label: "Temario", icon: BookOpen },
  { href: "/dashboard/chats", label: "Chat", icon: MessageCircle },
  { href: "/dashboard/documents", label: "Documentos", icon: FileText },
  { href: "/dashboard", label: "Panel", icon: Home, exact: true },
  { href: "/dashboard/friends", label: "Amigos", icon: Users },
  { href: "/dashboard/profile", label: "Perfil", icon: User },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950 px-4 py-5 text-slate-200 lg:flex">
      <Link href="/dashboard" className="mb-8 flex items-center gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="grid size-11 place-items-center rounded-xl bg-red-700 text-xl shadow-martial">🥋</div>
        <div>
          <div className="text-sm font-bold leading-tight text-white">Taekwondo MGG</div>
          <div className="text-xs text-slate-400">Do, disciplina y progreso</div>
        </div>
      </Link>

      <div className="mb-4 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Sesión</div>
        <div className="mt-1 truncate text-sm font-semibold text-white">{user?.username}</div>
        <div className="text-xs text-red-300">{user?.role === "ALUMNO" ? "Alumno" : user?.role}</div>
      </div>

      <nav className="space-y-1">
        {mainItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-red-700 text-white shadow-martial"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {(user?.role === "INSTRUCTOR" || user?.role === "ADMIN") && (
        <div className="mt-6 border-t border-slate-800 pt-5">
          <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Instructor</div>
          <Link
            href="/dashboard/instructor"
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
              pathname === "/dashboard/instructor"
                ? "bg-red-700 text-white shadow-martial"
                : "text-slate-300 hover:bg-slate-900 hover:text-white"
            )}
          >
            <Shield className="size-5" aria-hidden="true" />
            Alumnos
          </Link>
          <Link
            href="/dashboard/instructor/documents"
            className={cn(
              "mt-1 flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
              pathname.startsWith("/dashboard/instructor/documents")
                ? "bg-red-700 text-white shadow-martial"
                : "text-slate-300 hover:bg-slate-900 hover:text-white"
            )}
          >
            <Upload className="size-5" aria-hidden="true" />
            Documentos
          </Link>
        </div>
      )}

      <div className="mt-auto space-y-2 border-t border-slate-800 pt-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-900 hover:text-white"
        >
          {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          Cambiar tema
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex min-h-11 w-full items-center gap-3 rounded-xl bg-red-700 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-900"
        >
          <LogOut className="size-5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FileText, Home, MessageCircle, Moon, Sun, User, Users } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard/temario", label: "Temario", icon: BookOpen },
  { href: "/dashboard/chats", label: "Chat", icon: MessageCircle },
  { href: "/dashboard/documents", label: "Docs", icon: FileText },
  { href: "/dashboard", label: "Panel", icon: Home, exact: true },
  { href: "/dashboard/friends", label: "Amigos", icon: Users },
  { href: "/dashboard/profile", label: "Perfil", icon: User },
];

export default function BottomTabNavigation() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-10px_30px_-24px_rgba(15,23,42,0.7)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">
      <div className="mx-auto flex h-16 max-w-3xl gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex min-h-11 min-w-14 flex-1 flex-col items-center justify-center rounded-xl text-[11px] font-semibold transition-colors",
                active
                  ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
              )}
            >
              <Icon className="mb-0.5 size-5" aria-hidden="true" />
              <span>{tab.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={toggleTheme}
          className="flex min-h-11 min-w-14 flex-1 flex-col items-center justify-center rounded-xl text-[11px] font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
          aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {theme === "dark" ? <Sun className="mb-0.5 size-5" /> : <Moon className="mb-0.5 size-5" />}
          <span>Tema</span>
        </button>
      </div>
    </nav>
  );
}

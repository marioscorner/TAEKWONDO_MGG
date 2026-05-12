"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, MessageCircle, Shield, User, Users } from "lucide-react";

export default function DashboardHome() {
  const { user } = useAuth();
  const isInstructor = user?.role === "INSTRUCTOR" || user?.role === "ADMIN";
  const actions = [
    { href: "/dashboard/temario", title: "Temario", desc: "Materiales y técnicas por cinturón", icon: BookOpen, stat: "Prioritario" },
    { href: "/dashboard/chats", title: "Chat", desc: "Mensajes con compañeros e instructores", icon: MessageCircle, stat: "Polling 5s" },
    { href: "/dashboard/friends", title: "Amigos", desc: "Solicitudes y contactos de clase", icon: Users, stat: "Comunidad" },
    { href: "/dashboard/profile", title: "Perfil", desc: "Datos personales y cinturón actual", icon: User, stat: "Cuenta" },
  ];
  
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-red-950 to-red-800 p-6 text-white shadow-martial sm:p-8">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-red-100">
            Dojang digital
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Bienvenido, {user?.username}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-red-50 sm:text-base">
            Accede rápido a tus materiales y mantén la comunicación con tu comunidad de entrenamiento.
          </p>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
            <div className="text-xs text-red-100">Foco del día</div>
            <div className="mt-1 font-bold">Temario y técnica</div>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
            <div className="text-xs text-red-100">Comunicación</div>
            <div className="mt-1 font-bold">Chat activo</div>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
            <div className="text-xs text-red-100">Rol</div>
            <div className="mt-1 font-bold">{user?.role === "ALUMNO" ? "Alumno" : user?.role}</div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-red-900"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="grid size-12 place-items-center rounded-2xl bg-red-50 text-red-700 transition-colors group-hover:bg-red-700 group-hover:text-white dark:bg-red-950/40 dark:text-red-300">
                  <Icon className="size-6" />
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{action.stat}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">{action.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{action.desc}</p>
            </Link>
          );
        })}
      </section>

      {isInstructor && (
        <Link href="/dashboard/instructor" className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950 transition hover:border-amber-300 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
          <Shield className="size-7" />
          <div>
            <div className="font-bold">Panel de instructor</div>
            <div className="text-sm opacity-80">Gestiona alumnos, cinturones y estadísticas.</div>
          </div>
        </Link>
      )}
    </div>
  );
}

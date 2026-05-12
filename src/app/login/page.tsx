import { LoginForm } from "@/components/login-form";
import { Suspense } from "react";

export const metadata = {
  title: "Login | Taekwondo",
  description: "Inicia sesión en tu cuenta de Taekwondo Mario Gutiérrez",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 via-white to-red-50 p-6 dark:from-slate-950 dark:via-slate-950 dark:to-red-950/30 md:p-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-red-700 text-2xl text-white shadow-martial">🥋</div>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Taekwondo MGG</h1>
        </div>
        <Suspense fallback={<div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">Cargando formulario...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

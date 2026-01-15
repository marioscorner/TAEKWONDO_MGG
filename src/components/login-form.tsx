// src/components/login-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const search = useSearchParams();
  const redirectTo = search.get("redirectTo") || "/dashboard";
  const registered = search.get("registered");
  const { login } = useAuth();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (registered === "true") {
      setSuccess("¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.");
    }
  }, [registered]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setPending(true);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");

    if (!email || !password) {
      setError("Por favor completa todos los campos");
      setPending(false);
      return;
    }

    const ok = await login(email, password);
    setPending(false);

    if (ok) {
      router.replace(redirectTo);
    } else {
      setError("Email o contraseña incorrectos");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-6">
            {/* Success message */}
            {success && (
              <div className="p-3 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm">
                {success}
              </div>
            )}

            {/* Email */}
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                disabled={pending}
              />
            </div>

            {/* Password */}
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <a
                  href="/reset-password"
                  className="text-xs text-blue-600 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                disabled={pending}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Submit button */}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>

            {/* Register links */}
            <div className="space-y-2">
              <div className="text-center text-sm">
                ¿No tienes una cuenta?{" "}
                <a href="/register" className="text-blue-600 hover:underline dark:text-blue-400">
                  Regístrate
                </a>
              </div>
              
              <div className="text-center text-sm">
                ¿Eres instructor?{" "}
                <a href="/register/instructor" className="text-blue-600 hover:underline dark:text-blue-400">
                  Regístrate aquí
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

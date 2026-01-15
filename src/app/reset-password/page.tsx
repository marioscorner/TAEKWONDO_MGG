// src/app/reset-password/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RequestResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await API.post("/auth/password/request-reset", { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al solicitar recuperación");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle className="text-green-600">✅ Email enviado</CardTitle>
            <CardDescription>
              Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.
              Revisa tu bandeja de entrada (y la carpeta de spam).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/login")} className="w-full">
              Volver al login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader>
          <CardTitle>🔑 Recuperar contraseña</CardTitle>
          <CardDescription>
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enviando..." : "Enviar enlace de recuperación"}
            </Button>

            <div className="text-center text-sm">
              <a href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
                Volver al login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

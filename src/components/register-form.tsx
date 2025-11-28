"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/lib/auth";

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    // Validaciones básicas
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (username.length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres");
      setLoading(false);
      return;
    }

    try {
      // Llamar al endpoint de registro
      await registerUser({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
      });

      setSuccess(true);
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 2000);
    } catch (err: any) {
      console.error("Error en registro:", err);
      
      // Mostrar error específico del servidor
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.status === 400) {
        setError("El email o nombre de usuario ya está registrado");
      } else {
        setError("Error al crear la cuenta. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-green-600">¡Cuenta creada!</CardTitle>
          <CardDescription>
            Tu cuenta ha sido creada exitosamente. Redirigiendo al login...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle>Crear cuenta</CardTitle>
        <CardDescription>
          Completa el formulario para registrarte en la plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Nombre de usuario */}
          <div>
            <Label htmlFor="username">
              Nombre de usuario <span className="text-red-500">*</span>
            </Label>
            <Input
              id="username"
              name="username"
              placeholder="usuario123"
              required
              minLength={3}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 3 caracteres, sin espacios</p>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
              disabled={loading}
            />
          </div>

          {/* Nombre (opcional) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Mario"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Apellidos</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Gutiérrez"
                disabled={loading}
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <Label htmlFor="password">
              Contraseña <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
          </div>

          {/* Confirmar contraseña */}
          <div>
            <Label htmlFor="confirmPassword">
              Confirmar contraseña <span className="text-red-500">*</span>
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Botón submit */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </Button>

          {/* Link a login */}
          <div className="mt-4 text-center text-sm">
            ¿Ya tienes cuenta?{" "}
            <a href="/login" className="underline underline-offset-4 text-blue-600 hover:text-blue-700">
              Inicia sesión
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// src/components/profile/ProfileForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getProfile, updateProfile } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ProfileData = {
  email: string;
  username: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  belt?: string;
  birthDate?: string;
};

export default function ProfileForm() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const res = await getProfile();
      setProfile(res.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al cargar el perfil' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      phone: formData.get('phone') as string,
      belt: formData.get('belt') as string,
      birthDate: formData.get('birthDate') as string,
    };

    try {
      await updateProfile(data);
      await loadProfile();
      // Actualización silenciosa - sin mensaje de éxito
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar el perfil' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Cargando perfil...</div>;
  }

  if (!profile) {
    return <div className="p-6 text-center text-red-600">No se pudo cargar el perfil</div>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Mi Perfil</CardTitle>
        <CardDescription>Actualiza tu información personal</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información no editable */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Email</Label>
              <Input value={profile.email} disabled />
            </div>
            <div>
              <Label>Nombre de usuario</Label>
              <Input value={profile.username} disabled />
            </div>
            <div>
              <Label>Rol</Label>
              <Input value={profile.role} disabled />
            </div>
          </div>

          <hr className="my-4" />

          {/* Información editable */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                name="firstName"
                defaultValue={profile.firstName || ''}
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Apellidos</Label>
              <Input
                id="lastName"
                name="lastName"
                defaultValue={profile.lastName || ''}
                placeholder="Tus apellidos"
              />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={profile.phone || ''}
                placeholder="+34 600 000 000"
              />
            </div>
            <div>
              <Label htmlFor="belt">Cinturón</Label>
              <Input
                id="belt"
                name="belt"
                defaultValue={profile.belt || ''}
                placeholder="Ej: Negro 1º Dan"
              />
            </div>
            <div>
              <Label htmlFor="birthDate">Fecha de nacimiento</Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                defaultValue={profile.birthDate ? profile.birthDate.split('T')[0] : ''}
              />
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


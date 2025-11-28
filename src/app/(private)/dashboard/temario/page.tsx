"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import API from "@/lib/api";
import { getBeltLevel, getBeltBadgeClass, BELTS } from "@/lib/belt-colors";
import Link from "next/link";

type UserProfile = {
  belt?: string;
  firstName?: string;
  lastName?: string;
};

type TemarioItem = {
  title: string;
  description: string;
  videoUrl?: string;
  pdfUrl?: string;
};

// Temario completo por cinturón
const TEMARIO_BY_BELT: Record<string, TemarioItem[]> = {
  'Blanco': [
    {
      title: 'Posiciones básicas',
      description: 'Aprende las posiciones fundamentales del Taekwondo: Chunbi Sogi, Ap Sogi, Ap Kubi.',
    },
    {
      title: 'Golpes básicos de mano',
      description: 'Técnica de puño básico (Momtong Jireugi) y bloqueos simples.',
    },
    {
      title: 'Patadas básicas',
      description: 'Ap Chagui (patada frontal) - técnica fundamental.',
    },
  ],
  'Blanco-Amarillo': [
    {
      title: 'Perfeccionar técnicas de Blanco',
      description: 'Repaso y mejora de posiciones, golpes y patadas básicas.',
    },
    {
      title: 'Introducción a Dollyo Chagui',
      description: 'Patada circular básica - movimiento inicial.',
    },
  ],
  'Amarillo': [
    {
      title: 'Poomsae Taegeuk Il Jang',
      description: 'Primera forma oficial de Taekwondo WTF.',
    },
    {
      title: 'Dollyo Chagui completo',
      description: 'Dominio de la patada circular a media altura.',
    },
    {
      title: 'Bloqueos avanzados',
      description: 'Are Makki, Momtong Makki, Olgul Makki.',
    },
  ],
  'Amarillo-Naranja': [
    {
      title: 'Transición a Naranja',
      description: 'Perfeccionar Taegeuk Il Jang y preparar Taegeuk Yi Jang.',
    },
    {
      title: 'Yeop Chagui',
      description: 'Introducción a la patada lateral.',
    },
  ],
  'Naranja': [
    {
      title: 'Poomsae Taegeuk Yi Jang',
      description: 'Segunda forma oficial.',
    },
    {
      title: 'Combinaciones de patadas',
      description: 'Ap Chagui + Dollyo Chagui en secuencia.',
    },
    {
      title: 'Trabajo de fuerza',
      description: 'Ejercicios para potencia de patadas.',
    },
  ],
  'Naranja-Verde': [
    {
      title: 'Transición a Verde',
      description: 'Perfeccionar formas previas y añadir velocidad.',
    },
    {
      title: 'Dwi Chagui básico',
      description: 'Introducción a la patada hacia atrás.',
    },
  ],
  'Verde': [
    {
      title: 'Poomsae Taegeuk Sam Jang',
      description: 'Tercera forma oficial.',
    },
    {
      title: 'Combate (Kyorugi) básico',
      description: 'Introducción al combate deportivo con protecciones.',
    },
    {
      title: 'Defensa personal',
      description: 'Técnicas de autodefensa aplicadas.',
    },
  ],
  'Verde-Azul': [
    {
      title: 'Transición a Azul',
      description: 'Perfeccionar tres primeras formas.',
    },
    {
      title: 'Patadas saltando',
      description: 'Introducción a Twio Ap Chagui (patada frontal saltando).',
    },
  ],
  'Azul': [
    {
      title: 'Poomsae Taegeuk Sa Jang',
      description: 'Cuarta forma oficial.',
    },
    {
      title: 'Técnicas de competición',
      description: 'Estrategia de combate deportivo.',
    },
    {
      title: 'Rompimientos básicos',
      description: 'Técnica de rompimiento de tablas con mano y pie.',
    },
  ],
  'Azul-Rojo': [
    {
      title: 'Transición a Rojo',
      description: 'Dominar las cuatro primeras formas con precisión.',
    },
    {
      title: 'Patadas giratorias',
      description: 'Bandal Chagui, Dwi Huryeo Chagui.',
    },
  ],
  'Rojo': [
    {
      title: 'Poomsae Taegeuk Oh Jang',
      description: 'Quinta forma oficial.',
    },
    {
      title: 'Combate avanzado',
      description: 'Técnicas de contraataque y timing.',
    },
    {
      title: 'Preparación a Negro',
      description: 'Repaso completo de todas las técnicas fundamentales.',
    },
  ],
  'Negro': [
    {
      title: 'Poomsae Koryo',
      description: 'Primera forma de cinturón negro.',
    },
    {
      title: 'Filosofía del Taekwondo',
      description: 'Profundizar en los valores y principios.',
    },
    {
      title: 'Enseñanza',
      description: 'Preparación para enseñar a alumnos de grados inferiores.',
    },
    {
      title: 'Técnicas avanzadas',
      description: 'Patadas giratorias, saltando, y combinaciones complejas.',
    },
  ],
};

export default function TemarioPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await API.get("/users/profile");
      setProfile(res.data);
    } catch (error) {
      console.error("Error al cargar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Cargando temario...</div>
      </div>
    );
  }

  const userBelt = profile?.belt || 'Blanco';
  const userLevel = getBeltLevel(userBelt);
  const temarioItems = TEMARIO_BY_BELT[userBelt] || TEMARIO_BY_BELT['Blanco'];

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block"
        >
          ← Volver al Dashboard
        </Link>
        <h1 className="text-4xl font-bold mb-2">🥋 Temario de Taekwondo</h1>
        <p className="text-gray-600">
          Contenido específico para tu nivel actual
        </p>
      </div>

      {/* Cinturón actual */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Tu Cinturón Actual</h2>
            <p className="text-gray-600 mb-4">
              {profile?.firstName} {profile?.lastName || user?.username}
            </p>
          </div>
          <div>
            <span className={`px-6 py-3 rounded-lg text-xl font-bold ${getBeltBadgeClass(userBelt)}`}>
              {userBelt}
            </span>
          </div>
        </div>
      </div>

      {/* Temario para tu nivel */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">📚 Contenido para Cinturón {userBelt}</h2>
        <div className="space-y-4">
          {temarioItems.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
            >
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600 mb-3">{item.description}</p>
              <div className="flex gap-2">
                {item.videoUrl && (
                  <a
                    href={item.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                  >
                    📹 Ver Video
                  </a>
                )}
                {item.pdfUrl && (
                  <a
                    href={item.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
                  >
                    📄 Descargar PDF
                  </a>
                )}
                {!item.videoUrl && !item.pdfUrl && (
                  <span className="text-sm text-gray-500 italic">
                    Contenido disponible en clases presenciales
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progreso general */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-6">🎯 Tu Progreso</h2>
        <div className="space-y-3">
          {BELTS.map((belt, index) => {
            const isPassed = index < userLevel;
            const isCurrent = index === userLevel;
            const isNext = index === userLevel + 1;
            
            return (
              <div
                key={belt}
                className={`flex items-center gap-4 p-3 rounded-lg ${
                  isCurrent ? 'bg-blue-50 border-2 border-blue-500' :
                  isPassed ? 'bg-green-50 border border-green-200' :
                  isNext ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-gray-50 border border-gray-200'
                }`}
              >
                <span className={`px-4 py-2 rounded text-sm font-bold ${getBeltBadgeClass(belt)}`}>
                  {belt}
                </span>
                <div className="flex-1">
                  {isCurrent && <span className="text-blue-600 font-semibold">← Tu nivel actual</span>}
                  {isPassed && <span className="text-green-600">✓ Completado</span>}
                  {isNext && <span className="text-yellow-600">→ Próximo objetivo</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nota para alumnos */}
      {user?.role === 'ALUMNO' && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Tu instructor actualizará tu cinturón cuando completes todos los requisitos y superes el examen correspondiente.
          </p>
        </div>
      )}
    </div>
  );
}

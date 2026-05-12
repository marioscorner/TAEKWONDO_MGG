"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import API from "@/lib/api";
import { getBeltLevel, getBeltBadgeClass, BELTS } from "@/lib/belt-colors";
import { BookOpen, CheckCircle2, Lock, PlayCircle } from "lucide-react";

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
        <div className="text-center text-gray-900 dark:text-white">Cargando temario...</div>
      </div>
    );
  }

  const userBelt = profile?.belt || 'Blanco';
  const userLevel = getBeltLevel(userBelt);
  // Si es un cinturón negro, usar el temario genérico de "Negro"
  const beltKey = userBelt.startsWith('Negro') ? 'Negro' : userBelt;
  const temarioItems = TEMARIO_BY_BELT[beltKey] || TEMARIO_BY_BELT['Blanco'];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 to-red-900 p-6 text-white shadow-martial sm:p-8">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
          <BookOpen className="size-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Temario de Taekwondo</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-red-50 sm:text-base">
          Materiales organizados para tu cinturón actual. Enfócate en completar cada técnica antes de avanzar.
        </p>
      </div>

      {/* Cinturón actual */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Tu cinturón actual</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {profile?.firstName} {profile?.lastName || user?.username}
            </p>
          </div>
          <div>
            <span className={`inline-flex rounded-xl px-5 py-3 text-lg font-bold shadow-sm ${getBeltBadgeClass(userBelt)}`}>
              {userBelt}
            </span>
          </div>
        </div>
      </div>

      {/* Temario para tu nivel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Contenido para {userBelt}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Clases presenciales como base, material digital como refuerzo.</p>
          </div>
          <div className="hidden rounded-full bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-red-700 dark:bg-red-950/40 dark:text-red-300 sm:block">
            Actual
          </div>
        </div>
        <div className="space-y-4">
          {temarioItems.map((item, index) => (
            <div
              key={index}
              className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-red-200 hover:bg-white dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-red-900 dark:hover:bg-slate-900"
            >
              <div className="mt-1 grid size-10 shrink-0 place-items-center rounded-xl bg-red-700 text-white">
                <PlayCircle className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">{item.title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.videoUrl && (
                  <a
                    href={item.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-red-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-900 dark:bg-red-600 dark:hover:bg-red-500"
                  >
                    📹 Ver Video
                  </a>
                )}
                {item.pdfUrl && (
                  <a
                    href={item.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    📄 Descargar PDF
                  </a>
                )}
                {!item.videoUrl && !item.pdfUrl && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-800">
                    <Lock className="size-3.5" />
                    Contenido disponible en clases presenciales
                  </span>
                )}
              </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progreso general */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Tu progreso</h2>
        <div className="mt-6 space-y-3">
          {BELTS.map((belt, index) => {
            const isPassed = index < userLevel;
            const isCurrent = index === userLevel;
            const isNext = index === userLevel + 1;
            
            return (
              <div
                key={belt}
                className={`flex items-center gap-4 rounded-xl p-3 ${
                  isCurrent ? 'border-2 border-red-600 bg-red-50 dark:border-red-500 dark:bg-red-950/30' :
                  isPassed ? 'border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20' :
                  isNext ? 'border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20' :
                  'border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40'
                }`}
              >
                <span className={`px-4 py-2 rounded text-sm font-bold ${getBeltBadgeClass(belt)}`}>
                  {belt}
                </span>
                <div className="flex-1">
                  {isCurrent && <span className="font-semibold text-red-700 dark:text-red-300">Nivel actual</span>}
                  {isPassed && <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="size-4" /> Completado</span>}
                  {isNext && <span className="text-amber-700 dark:text-amber-300">Próximo objetivo</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nota para alumnos */}
      {user?.role === 'ALUMNO' && (
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Nota:</strong> Tu instructor actualizará tu cinturón cuando completes todos los requisitos y superes el examen correspondiente.
          </p>
        </div>
      )}
    </div>
  );
}

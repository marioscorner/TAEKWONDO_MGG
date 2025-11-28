# 📸 GUÍA PARA AÑADIR FOTOS AL CARRUSEL

## 🎯 Objetivo
Añadir fotos de taekwondo y personales al carrusel de la página "Sobre mí".

---

## 📁 PASO 1: Preparar las Fotos

### **Recomendaciones:**

**Tamaño:**
- Ancho ideal: 800px - 1200px
- Alto ideal: 800px - 1000px
- Formato: Cuadrado o vertical funciona mejor

**Formato:**
- JPG o JPEG (recomendado para fotos)
- PNG (si tiene transparencias)
- WebP (más ligero, si está disponible)

**Peso:**
- Máximo 500KB por foto
- Comprimir con herramientas como:
  - [TinyPNG](https://tinypng.com/)
  - [Compressor.io](https://compressor.io/)
  - Photoshop/GIMP (exportar para web)

---

## 📂 PASO 2: Guardar las Fotos

1. **Ubicación:** Carpeta `public/` en la raíz del proyecto

```
TAEKWONDO_MGG/
  public/
    mario.jpeg              ← Ya existe
    tkd_main.jpg           ← Ya existe
    
    // Añadir tus nuevas fotos aquí:
    taekwondo-competicion.jpg
    taekwondo-entrenamiento.jpg
    taekwondo-poomsae.jpg
    personal-musica.jpg
    personal-lectura.jpg
    // ... más fotos
```

2. **Nombres sugeridos:**
   - `taekwondo-1.jpg`, `taekwondo-2.jpg`, etc.
   - `competicion-2015.jpg`, `campeonato-madrid.jpg`
   - `personal-hobbies.jpg`, `personal-eventos.jpg`

---

## 🔧 PASO 3: Actualizar el Código

Abrir el archivo: `src/app/about/page.tsx`

**Buscar esta sección (líneas 9-12):**

```typescript
const photos = [
  { src: profile, alt: "Mario - Instructor de Taekwondo" },
  // Añadir más fotos aquí cuando estén listas
];
```

**Reemplazar con tus fotos:**

```typescript
const photos = [
  { src: profile, alt: "Mario - Instructor de Taekwondo" },
  { src: "/taekwondo-competicion.jpg", alt: "Mario en competición nacional 2020" },
  { src: "/taekwondo-entrenamiento.jpg", alt: "Entrenando con alumnos" },
  { src: "/taekwondo-poomsae.jpg", alt: "Demostración de Poomsae" },
  { src: "/personal-musica.jpg", alt: "Mario tocando la guitarra" },
  { src: "/personal-lectura.jpg", alt: "Disfrutando de la lectura" },
  // Añade todas las fotos que quieras
];
```

---

## 📝 EJEMPLO COMPLETO

```typescript
"use client";

import Image from "next/image";
import profile from "../../../public/mario.jpeg";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function About() {
  // 👇 ACTUALIZAR ESTE ARRAY
  const photos = [
    { 
      src: profile, 
      alt: "Mario Gutiérrez - Instructor de Taekwondo" 
    },
    { 
      src: "/taekwondo-competicion-2020.jpg", 
      alt: "Competición Nacional de Taekwondo 2020" 
    },
    { 
      src: "/taekwondo-entrenamiento-alumnos.jpg", 
      alt: "Entrenando con mis alumnos en el Dojang" 
    },
    { 
      src: "/taekwondo-poomsae-demo.jpg", 
      alt: "Demostración de Poomsae Koryo" 
    },
    { 
      src: "/taekwondo-medallas.jpg", 
      alt: "Medallas obtenidas en competiciones" 
    },
    { 
      src: "/personal-musica.jpg", 
      alt: "Tocando la guitarra - uno de mis hobbies" 
    },
    { 
      src: "/personal-naturaleza.jpg", 
      alt: "Disfrutando de la naturaleza" 
    },
    { 
      src: "/personal-lectura.jpg", 
      alt: "Momentos de lectura y aprendizaje" 
    },
  ];

  // ... resto del código (no cambiar)
}
```

---

## ✅ CHECKLIST DE FOTOS SUGERIDAS

### **Fotos de Taekwondo:**
- [ ] En competición (con dobok y protecciones)
- [ ] Entrenando alumnos
- [ ] Haciendo poomsaes
- [ ] Con medallas/trofeos
- [ ] En exámenes de cinturón
- [ ] Con otros maestros/instructores
- [ ] Rompimientos (tablas, etc.)

### **Fotos Personales:**
- [ ] Tocando algún instrumento (si aplica)
- [ ] Leyendo
- [ ] En eventos/viajes
- [ ] Con amigos/familia
- [ ] Practicando otros hobbies
- [ ] En la naturaleza
- [ ] Momentos casuales

---

## 🎨 CONSEJOS DE COMPOSICIÓN

### **Variedad:**
- Alterna entre fotos de taekwondo y personales
- Mezcla fotos de acción y fotos posadas
- Incluye primeros planos y fotos de grupo

### **Calidad:**
- Fotos bien iluminadas
- Evita fotos borrosas
- Buena resolución (no pixeladas)

### **Cantidad:**
- Mínimo: 3-5 fotos
- Ideal: 6-8 fotos
- Máximo: 10-12 fotos (para no hacer el carrusel muy largo)

---

## 🚀 DESPUÉS DE AÑADIR LAS FOTOS

1. **Guardar el archivo** `src/app/about/page.tsx`

2. **Verificar en el navegador:**
   - El servidor se recarga automáticamente
   - Ir a: `http://localhost:3000/about`
   - Ver el carrusel con las nuevas fotos

3. **Probar funcionalidad:**
   - ✅ Navegación con flechas funciona
   - ✅ Puntos de paginación funcionan
   - ✅ Autoplay funciona (cambia cada 5 segundos)
   - ✅ Se ve bien en móvil y desktop

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **La foto no aparece:**
- Verifica que el archivo esté en `public/`
- Verifica que el nombre coincida EXACTAMENTE (mayúsculas/minúsculas)
- Las rutas en `public/` empiezan con `/` (ej: `/foto.jpg`)

### **La foto se ve distorsionada:**
- Añade `object-fit: cover` en className
- Ya está configurado por defecto en el código

### **La foto pesa mucho y carga lento:**
- Comprímela con TinyPNG o similar
- Objetivo: < 500KB por foto

### **Quiero cambiar el orden:**
- Solo reordena las líneas en el array `photos`

---

## 📱 PREVIEW

Así se verá el carrusel con múltiples fotos:

```
┌─────────────────────────────────────┐
│                                     │
│         [< Foto Actual >]           │
│                                     │
│          ● ○ ○ ○ ○ ○                │ ← Navegación
│                                     │
└─────────────────────────────────────┘
```

- Flechas izquierda/derecha para navegar
- Puntos abajo muestran posición actual
- Autoplay cada 5 segundos

---

## 🎉 ¡LISTO!

Una vez añadidas las fotos:
1. Se mostrarán en el carrusel automáticamente
2. Los usuarios podrán navegar por todas
3. El mensaje "📸 Más fotos próximamente" desaparecerá

---

**¿Necesitas ayuda?** Consulta el archivo `IMPLEMENTACION_LANDING_ABOUT.md` para más detalles técnicos.


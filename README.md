# 🥋 Taekwondo Mario Gutiérrez - Plataforma Web

Aplicación web full-stack para la escuela de Taekwondo de Mario Gutiérrez en Madrid. Sistema completo con autenticación, chat en tiempo real, gestión de amigos y contenido educativo.

## 🚀 Stack Tecnológico

### Frontend
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Radix UI** (componentes accesibles)

### Backend (Integrado en Next.js)
- **Next.js API Routes** (Backend completo)
- **Prisma ORM** (Base de datos)
- **PostgreSQL** (Recomendado) o MySQL
- **JWT Authentication** (con jose)
- **bcrypt** (hash de contraseñas)
- **Zod** (validación de datos)

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o pnpm
- PostgreSQL (o MySQL)

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd TAEKWONDO_MGG
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y configúralo:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores:

```env
# Database
DATABASE_URL="postgresql://usuario:password@localhost:5432/taekwondo_db"

# JWT Secrets (¡CAMBIA ESTOS EN PRODUCCIÓN!)
JWT_SECRET="tu-secret-super-seguro-cambiar-en-produccion"
JWT_REFRESH_SECRET="otro-secret-diferente-para-refresh-tokens"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Configurar la base de datos

```bash
# Genera el cliente de Prisma
npm run db:generate

# Ejecuta las migraciones (crea las tablas)
npm run db:push

# O si prefieres usar migraciones versionadas:
npm run db:migrate
```

### 5. (Opcional) Explorar la base de datos

```bash
npm run db:studio
```

Esto abrirá Prisma Studio en `http://localhost:5555`

### 6. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
TAEKWONDO_MGG/
├── prisma/
│   └── schema.prisma          # Schema de base de datos
├── src/
│   ├── app/
│   │   ├── api/               # 🔥 BACKEND (API Routes)
│   │   │   ├── auth/          # Login, registro, logout, refresh
│   │   │   ├── users/         # Perfil de usuario
│   │   │   ├── chat/          # Conversaciones y mensajes
│   │   │   ├── friends/       # Sistema de amistades
│   │   │   └── health/        # Health check
│   │   ├── (private)/         # Rutas protegidas
│   │   │   └── dashboard/     # Panel privado
│   │   └── ...                # Páginas públicas
│   ├── components/            # Componentes React
│   ├── context/               # Context API (Auth)
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilidades
│   │   ├── api.ts            # Cliente HTTP (Axios)
│   │   ├── auth.ts           # Servicios de autenticación
│   │   ├── chat.ts           # Servicios de chat
│   │   ├── friends.ts        # Servicios de amigos
│   │   ├── prisma.ts         # Cliente Prisma
│   │   ├── auth-helpers.ts   # JWT, bcrypt helpers
│   │   └── validations.ts    # Schemas Zod
│   ├── server/                # Lógica del servidor
│   │   └── middleware/        # Middleware de autenticación
│   └── types/                 # TypeScript types
└── ...
```

## 🎯 Funcionalidades Principales

### ✅ Completadas

- ✅ Autenticación completa (registro, login, logout, refresh token)
- ✅ Gestión de perfil de usuario
- ✅ Sistema de roles (ADMIN, INSTRUCTOR, ALUMNO)
- ✅ Sistema de amistades
- ✅ Solicitudes de amistad
- ✅ Bloqueo de usuarios
- ✅ Chat 1:1 (HTTP)
- ✅ Chats grupales (HTTP)
- ✅ Mensajes con paginación
- ✅ Marcar conversaciones como leídas
- ✅ Contador de mensajes no leídos
- ✅ Documentación pública
- ✅ Página de información (Sobre mí)
- ✅ Health check endpoint

### 🚧 Por Implementar

- 🚧 WebSocket real-time para chat (actualmente funciona con HTTP polling)
- 🚧 Notificaciones push
- 🚧 Verificación de email
- 🚧 Reset de contraseña por email
- 🚧 Búsqueda de usuarios
- 🚧 Subida de imágenes de perfil
- 🚧 Edición y eliminación de mensajes
- 🚧 Reacciones a mensajes
- 🚧 Tests automatizados

## 🔐 API Endpoints

### Auth
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh` - Refrescar token

### Users
- `GET /api/users/profile` - Obtener perfil
- `PUT /api/users/profile` - Actualizar perfil

### Chat
- `GET /api/chat/conversations` - Listar conversaciones
- `POST /api/chat/conversations` - Crear conversación
- `GET /api/chat/conversations/:id` - Obtener conversación
- `GET /api/chat/conversations/:id/messages` - Listar mensajes
- `POST /api/chat/conversations/:id/messages` - Enviar mensaje
- `POST /api/chat/conversations/:id/read` - Marcar como leída

### Friends
- `GET /api/friends` - Listar amigos
- `POST /api/friends/unfriend/:id` - Eliminar amistad
- `POST /api/friends/requests` - Enviar solicitud
- `GET /api/friends/requests/mine` - Mis solicitudes
- `POST /api/friends/requests/:id/accept` - Aceptar solicitud
- `POST /api/friends/requests/:id/reject` - Rechazar solicitud
- `POST /api/friends/requests/:id/cancel` - Cancelar solicitud
- `POST /api/friends/block` - Bloquear usuario
- `DELETE /api/friends/block/:id` - Desbloquear usuario
- `GET /api/friends/blocked` - Listar bloqueados

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en el dashboard
3. Añade una base de datos PostgreSQL (Vercel Postgres, Supabase, Railway, etc.)
4. Deploy automático ✨

### Railway / Render

Similar a Vercel, configura las variables de entorno y conecta tu base de datos.

## 📝 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build para producción
npm run start        # Iniciar en producción
npm run lint         # Linter

npm run db:generate  # Generar cliente Prisma
npm run db:push      # Sincronizar schema con BD (sin migraciones)
npm run db:migrate   # Crear y ejecutar migraciones
npm run db:studio    # Abrir Prisma Studio
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y está protegido por derechos de autor.

## 👤 Autor

**Mario Gutiérrez**
- Instructor de Taekwondo
- Madrid, España

---

¡Hecho con ❤️ y 🥋 por la comunidad de Taekwondo!

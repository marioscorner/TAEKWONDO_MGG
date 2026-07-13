# Taekwondo Mario Gutierrez - Plataforma Web

Aplicacion web full-stack para la escuela de Taekwondo de Mario Gutierrez en Madrid. Incluye area publica, autenticacion, dashboard privado, chat en tiempo real, gestion de amistades, recursos educativos, perfiles de usuario y herramientas para instructores.

## Stack Tecnologico

### Frontend

- **Next.js 15.5** con App Router
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 3.4** con variables CSS y modo oscuro por clase
- **shadcn/ui** con primitivas **Radix UI** para componentes accesibles
- **class-variance-authority**, **clsx** y **tailwind-merge** para variantes y clases CSS
- **Lucide React** para iconografia
- **React Day Picker** para calendarios
- **Swiper** para carruseles
- **Axios** para cliente HTTP con refresh automatico de tokens

### Backend

- **Next.js Route Handlers** como backend integrado en App Router
- **Node.js 20** en Docker
- **Servidor Node personalizado** (`server.js`) para Next.js + Socket.IO
- **Socket.IO 4.8** para chat en tiempo real, escritura y eventos de lectura
- **Prisma ORM 6.19**
- **PostgreSQL**
- **JWT** con `jose`
- **bcrypt** para hash de contrasenas
- **Zod** para validacion de datos
- **Nodemailer** para emails SMTP de recuperacion de contrasena

### Infraestructura y Herramientas

- **Docker** y **Docker Compose**
- **PostgreSQL 16 Alpine** en compose local y produccion
- **Nginx** como reverse proxy con HTTPS y soporte WebSocket
- **Let's Encrypt** para certificados SSL
- **ESLint 9** con flat config y reglas de Next.js
- **PostCSS** y **Autoprefixer**
- **ts-node** para scripts administrativos

## Requisitos Previos

- Node.js 20 recomendado
- npm
- PostgreSQL o Docker Compose para levantar la base de datos local

## Instalacion

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

Copia el archivo de ejemplo y rellena los valores:

```bash
cp .env.example .env.local
```

Variables principales:

```env
# Base de datos PostgreSQL
DATABASE_URL="postgresql://usuario:password@host:5432/database?schema=public"

# JWT
JWT_SECRET="tu-secret-super-seguro-y-largo"
JWT_REFRESH_SECRET="otro-secret-diferente-y-largo"

# URL publica de la aplicacion
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# SMTP para recuperacion de contrasena
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM="Taekwondo Mario Gutierrez <tu-email@gmail.com>"

# Registro de instructores
INSTRUCTOR_SECRET_PASSWORD="tu-contrasena-secreta"
```

### 4. Levantar PostgreSQL local con Docker

```bash
docker compose -f docker-compose.local.yml up -d
```

### 5. Preparar la base de datos

```bash
npm run db:migrate:deploy
npm run db:generate
```

Para crear una nueva migracion durante desarrollo:

```bash
npm run db:migrate -- --name nombre_del_cambio
```

### 6. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicacion queda disponible en [http://localhost:3000](http://localhost:3000).

## Scripts Disponibles

```bash
npm run dev                # Ejecutar servidor Node + Next.js + Socket.IO
npm run build              # Build de produccion
npm run start              # Iniciar servidor en produccion
npm run lint               # Linter

npm run db:generate        # Generar Prisma Client
npm run db:push            # Sincronizar schema sin migracion (uso puntual)
npm run db:migrate         # Crear y aplicar migraciones en desarrollo
npm run db:migrate:deploy  # Aplicar migraciones en produccion
npm run db:migrate:status  # Ver estado de migraciones
npm run db:studio          # Abrir Prisma Studio

npm run create-superuser   # Crear usuario ADMIN por consola
```

## Estructura del Proyecto

```text
TAEKWONDO_MGG/
├── prisma/
│   └── schema.prisma             # Modelos PostgreSQL y relaciones
├── public/
│   └── uploads/                  # Imagenes y documentos subidos
├── scripts/
│   └── create-superuser.ts       # Script para crear usuarios ADMIN
├── src/
│   ├── app/
│   │   ├── api/                  # Backend con Route Handlers
│   │   │   ├── auth/             # Login, registro, refresh, logout, password reset
│   │   │   ├── chat/             # Conversaciones, mensajes y lectura
│   │   │   ├── documents/        # Listado, subida y borrado de documentos
│   │   │   ├── friends/          # Amistades, solicitudes y bloqueos
│   │   │   ├── instructor/       # Dashboard, alumnos, estadisticas y cinturones
│   │   │   ├── upload/           # Subida de imagenes
│   │   │   ├── users/            # Perfil, busqueda y eliminacion de cuenta
│   │   │   └── health/           # Health check de aplicacion y BD
│   │   ├── (private)/dashboard/  # Rutas protegidas
│   │   ├── about/                # Pagina publica sobre el instructor
│   │   ├── docs/                 # Recursos publicos/documentacion
│   │   ├── login/                # Inicio de sesion
│   │   ├── register/             # Registro de alumnos e instructores
│   │   └── reset-password/       # Recuperacion de contrasena
│   ├── components/               # Componentes React
│   ├── context/                  # AuthContext
│   ├── hooks/                    # Hooks, incluido chat Socket.IO
│   ├── lib/                      # API client, Prisma, auth, socket, email y servicios
│   ├── server/middleware/        # Middleware de autenticacion y roles
│   └── types/                    # Tipos TypeScript
├── nginx/
│   └── nginx.conf                # Reverse proxy HTTPS y WebSocket
├── Dockerfile                    # Imagen multi-stage de produccion
├── docker-compose.yml            # Produccion con app, PostgreSQL y Nginx
├── docker-compose.local.yml      # PostgreSQL local
└── server.js                     # Servidor Node custom con Socket.IO
```

## Funcionalidades Principales

### Completadas

- Autenticacion completa con registro, login, logout y refresh token.
- Roles `ADMIN`, `INSTRUCTOR` y `ALUMNO`.
- Registro de instructores protegido por contrasena secreta.
- Creacion de superusuario ADMIN por script.
- Perfil de usuario con datos personales, cinturon y avatar.
- Eliminacion de cuenta con confirmacion y validacion de contrasena.
- Recuperacion de contrasena por email mediante SMTP.
- Amistades bidireccionales, solicitudes, cancelacion, rechazo y aceptacion.
- Bloqueo y desbloqueo de usuarios.
- Busqueda de usuarios autenticada.
- Chat 1:1 y chats grupales.
- Chat en tiempo real con Socket.IO y fallback de polling.
- Indicadores de escritura y eventos de lectura en conversaciones.
- Mensajes paginados y contador de no leidos.
- Restriccion de chat 1:1 a usuarios amigos y no bloqueados.
- Subida de imagenes para avatar y grupos.
- Documentos educativos: listado, busqueda, subida y borrado.
- Permisos de documentos para instructores y administradores.
- Dashboard de instructor con estadisticas.
- Gestion de alumnos por instructor/administrador.
- Actualizacion de cinturones de alumnos.
- Paginas publicas: inicio, sobre mi, documentacion y health page.
- Health check API con verificacion de base de datos.
- Modo oscuro en la interfaz.
- Dockerizacion con PostgreSQL, aplicacion y Nginx/HTTPS.

### Pendiente o Parcial

- Verificacion de email: hay campos de modelo y UI parcial, pero faltan endpoints backend dedicados.
- Notificaciones push.
- Edicion y eliminacion logica de mensajes desde UI/API dedicada.
- Reacciones a mensajes.
- Tests automatizados.

## API Endpoints

### Auth

- `POST /api/auth/register` - Registro de alumno
- `POST /api/auth/register/instructor` - Registro de instructor con clave secreta
- `POST /api/auth/login` - Iniciar sesion
- `POST /api/auth/logout` - Cerrar sesion y revocar refresh token
- `POST /api/auth/refresh` - Refrescar tokens
- `POST /api/auth/password/request-reset` - Solicitar recuperacion de contrasena
- `POST /api/auth/password/reset` - Confirmar nueva contrasena con token

### Users

- `GET /api/users/profile` - Obtener perfil
- `PUT /api/users/profile` - Actualizar perfil
- `PATCH /api/users/profile` - Actualizar perfil
- `GET /api/users/search?q=<query>` - Buscar usuarios
- `DELETE /api/users/delete-account` - Eliminar cuenta autenticada

### Uploads

- `POST /api/upload/image` - Subir imagen de avatar o grupo

### Chat

- `GET /api/chat/conversations` - Listar conversaciones
- `POST /api/chat/conversations` - Crear conversacion 1:1 o grupal
- `GET /api/chat/conversations/:id` - Obtener conversacion
- `GET /api/chat/conversations/:id/messages` - Listar mensajes paginados
- `POST /api/chat/conversations/:id/messages` - Enviar mensaje
- `POST /api/chat/conversations/:id/read` - Marcar como leida
- `DELETE /api/chat/conversations/:id/read` - Marcar como no leida

### Eventos Socket.IO

- `conversation:join` - Unirse a una sala de conversacion
- `conversation:leave` - Salir de una sala de conversacion
- `message.new` - Recibir mensaje nuevo
- `typing:start` - Usuario escribiendo
- `typing:stop` - Usuario dejo de escribir
- `conversation:read` - Conversacion marcada como leida

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

### Documents

- `GET /api/documents` - Listar documentos publicos con busqueda y paginacion
- `GET /api/documents/:id` - Obtener documento
- `DELETE /api/documents/:id` - Eliminar documento autorizado
- `POST /api/documents/upload` - Subir documento como instructor o admin

### Instructor

- `GET /api/instructor/stats` - Estadisticas del dashboard de instructor
- `GET /api/instructor/students` - Listar alumnos
- `PATCH /api/instructor/students/:id/belt` - Actualizar cinturon de alumno

### Health

- `GET /api/health` - Estado de aplicacion y conexion a base de datos

## Modelo de Datos

El proyecto usa Prisma con PostgreSQL y estos modelos principales:

- `User` con rol, perfil, cinturon, avatar y estado de email.
- `RefreshToken` para sesiones renovables y revocacion en logout.
- `PasswordResetToken` para recuperacion de contrasena con expiracion.
- `Conversation`, `ConversationParticipant` y `Message` para chat.
- `Document` para recursos educativos subidos por instructores/admins.
- `Friendship`, `FriendRequest` y `BlockedUser` para relaciones sociales.

## Deploy

### Docker Compose en Produccion

El despliegue principal esta preparado con Docker Compose:

```bash
docker compose up -d --build
```

Servicios incluidos:

- `postgres`: PostgreSQL 16 Alpine con healthcheck y volumen persistente.
- `app`: Next.js ejecutado con `server.js`, Prisma y Socket.IO.
- `nginx`: reverse proxy HTTPS con soporte para WebSocket.

### Variables de Produccion

Configura como minimo:

- `POSTGRES_PASSWORD`
- `POSTGRES_USER`
- `POSTGRES_DB`
- `DATABASE_URL` si no usas la generada por compose
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `INSTRUCTOR_SECRET_PASSWORD`

### Nginx y SSL

`nginx/nginx.conf` redirige HTTP a HTTPS, usa certificados de Let's Encrypt y reenvia correctamente WebSocket mediante los headers `Upgrade` y `Connection`.

El despliegue recomendado para la version actual es Docker/VPS o un proveedor que permita ejecutar `node server.js` con WebSocket.

## Licencia

Este proyecto es privado y esta protegido por derechos de autor.

## Autor

**Mario Gutierrez**

- Instructor de Taekwondo
- Madrid, Espana

---

Hecho por la comunidad de Taekwondo Mario Gutierrez.

# 📋 CHANGELOG

Todos los cambios notables del proyecto serán documentados en este archivo.

---

## [2.0.0] - 2025-11-28

### 🎉 **Versión Mayor - Sistema de Cinturones y Panel Instructor**

### ✨ Añadido

#### **Sistema de Cinturones Completo**
- **12 niveles de cinturones** incluyendo medios cinturones:
  - Blanco → Blanco-Amarillo → Amarillo → Amarillo-Naranja → Naranja → Naranja-Verde → Verde → Verde-Azul → Azul → Azul-Rojo → Rojo → Negro
- **Colores personalizados** para cada cinturón
- **Gradientes visuales** para medios cinturones
- **Color del username** en el header según cinturón (solo cinturones completos)
- Librería de utilidades: `src/lib/belt-colors.ts`

#### **Control de Permisos de Cinturones**
- **Solo INSTRUCTOR y ADMIN** pueden editar cinturones
- Los alumnos solo pueden VER su cinturón actual
- Mensaje informativo para alumnos: "Solo tu instructor puede modificarlo"
- Endpoint seguro: `PATCH /api/instructor/students/[id]/belt`

#### **Panel de Instructor Mejorado**
- **Botón "🥋 Cambiar"** para modificar cinturón de cada alumno
- Vista mejorada con colores y gradientes de cinturones
- Integración completa con el sistema de permisos
- Validaciones en backend

#### **Página de Temario Personalizada** 📚
- Nueva ruta: `/dashboard/temario`
- **Contenido específico** según nivel de cinturón actual
- **Progreso visual** de todos los cinturones
- Indicadores: Completados ✓ | Actual ← | Próximo →
- Temario detallado para cada nivel:
  - Técnicas por cinturón
  - Poomsaes correspondientes
  - Enlaces a videos y PDFs (preparado para contenido futuro)

#### **Sistema de Avatares** 👤
- Subida de imágenes de perfil (máx 5MB)
- Almacenamiento en `public/uploads/`
- Preview antes de subir
- Endpoint: `POST /api/upload/image`
- Integración en perfil y header

#### **Grupos con Imagen** 👥
- Creación de grupos con imagen personalizada
- UI completa en `/dashboard/chats/create-group`
- Selección múltiple de participantes
- Preview de imagen del grupo
- Almacenamiento en `public/uploads/`

#### **Botón Eliminar Cuenta** 🗑️
- Modal de confirmación con doble verificación
- Requiere contraseña del usuario
- Requiere escribir "DELETE" para confirmar
- Advertencias sobre pérdida de datos
- Componente: `src/components/profile/DeleteAccountButton.tsx`

#### **Script Crear Superuser** 👑
- Comando: `npm run create-superuser`
- Creación interactiva de administradores
- Script ubicado en `scripts/create-superuser.ts`
- Hasheo automático de contraseña
- Email verificado por defecto

#### **Documentación**
- `GUIA_NUEVAS_FUNCIONALIDADES.md` - Guía completa de nuevas features
- `GIT_PUSH_INSTRUCTIONS.md` - Instrucciones para push a GitHub
- Este CHANGELOG actualizado

### 🔧 Modificado

#### **Base de Datos**
- Campo `User.avatarUrl` añadido
- Campo `Conversation.groupImageUrl` añadido
- Migración aplicada con `npm run db:push`

#### **Header Privado**
- Username ahora tiene color según cinturón
- Carga dinámica del cinturón del usuario
- Mejoras visuales

#### **Perfil de Usuario**
- Selector de cinturón solo visible para INSTRUCTOR/ADMIN
- 12 opciones de cinturones disponibles
- Mensaje informativo para alumnos
- Sección de subida de avatar mejorada

#### **Panel de Instructor**
- Tabla de alumnos con colores de cinturón mejorados
- Botón para cambiar cinturón directamente
- Gradientes para medios cinturones
- Mejor experiencia de usuario

#### **Dashboard Principal**
- Botón "Temario" ahora lleva a `/dashboard/temario`
- Panel de instructor visible para roles correctos
- Mejoras en la disposición de botones

### 🐛 Corregido
- **Barra de búsqueda duplicada** en `/dashboard/chats` eliminada
- Ahora solo hay una barra con botón "Crear Grupo" al lado
- Correcciones en la validación de permisos
- Mejoras en el manejo de errores

### 🔒 Seguridad
- Validación de roles en cambio de cinturones
- Solo INSTRUCTOR/ADMIN pueden modificar cinturones de alumnos
- Protección de endpoints sensibles
- Confirmación doble para eliminación de cuenta

### 📊 Estadísticas
- **8 archivos nuevos** creados
- **10 archivos** modificados
- **~2,000 líneas** de código añadidas
- **3 endpoints** nuevos
- **2 páginas** nuevas
- **3 componentes** nuevos

---

## [1.0.0] - 2025-11-27

### 🎉 **Versión Inicial - Migración Completa a Next.js**

### ✨ Añadido

#### **Arquitectura Full-Stack**
- Migración completa de backend Python a Next.js API Routes
- Integración de frontend y backend en un solo proyecto
- Prisma ORM con PostgreSQL (Supabase)
- 30+ API Routes implementados

#### **Sistema de Autenticación**
- Registro de usuarios con validación
- Login con JWT (access + refresh tokens)
- Refresh automático de tokens
- Logout con revocación de tokens
- Sistema de roles: ADMIN, INSTRUCTOR, ALUMNO
- Protección de rutas privadas
- Middleware de autenticación

#### **Sistema de Chat**
- Conversaciones 1:1
- Grupos (backend completo)
- Mensajes en tiempo real (polling cada 2s)
- Indicador "escribiendo..."
- Auto-actualización de lista de chats (cada 5s)
- Contador de mensajes no leídos
- Marcar como leído
- Scroll automático
- Timestamps relativos
- Paginación de mensajes

#### **Sistema de Amigos**
- Enviar solicitudes de amistad
- Aceptar/Rechazar solicitudes
- Cancelar solicitudes enviadas
- Lista de amigos
- Eliminar amigos
- Bloquear usuarios
- Desbloquear usuarios
- Lista de bloqueados
- Buscador de usuarios

#### **Panel de Usuario**
- Ver perfil completo
- Editar información personal
- Campos: nombre, apellidos, teléfono, cinturón
- Navegación por dashboard

#### **Panel de Instructor** (Inicial)
- Vista de lista de alumnos
- Estadísticas básicas
- Acceso restringido a INSTRUCTOR/ADMIN

#### **UI/UX**
- Diseño responsive
- Dark mode funcional
- Loading states
- Mensajes de error
- Confirmaciones para acciones destructivas
- Hover effects
- Badges de roles
- Headers inteligentes (público/privado)

#### **Documentación**
- README.md
- SETUP.md
- ESTRUCTURA.md
- .env.example

### 🗄️ Base de Datos
- 8 modelos principales:
  - User
  - RefreshToken
  - Conversation
  - ConversationParticipant
  - Message
  - Friendship
  - FriendRequest
  - BlockedUser

### 🔒 Seguridad
- Passwords hasheadas con bcrypt (12 rounds)
- JWT con jose
- Validaciones con Zod
- Protección CSRF
- Sanitización de emails
- Validación de permisos por rol

### 📝 Scripts
- `npm run dev` - Desarrollo
- `npm run build` - Build para producción
- `npm run db:push` - Aplicar cambios de schema
- `npm run db:studio` - UI para ver BD
- `npm run db:generate` - Generar cliente Prisma

---

## Formato del Changelog

Este proyecto sigue [Semantic Versioning](https://semver.org/):
- **MAJOR** (X.0.0): Cambios incompatibles con versiones anteriores
- **MINOR** (0.X.0): Nueva funcionalidad compatible con versiones anteriores
- **PATCH** (0.0.X): Correcciones de bugs compatibles

### Tipos de cambios:
- ✨ **Añadido**: Nueva funcionalidad
- 🔧 **Modificado**: Cambios en funcionalidad existente
- 🐛 **Corregido**: Corrección de bugs
- 🗑️ **Eliminado**: Funcionalidad eliminada
- 🔒 **Seguridad**: Mejoras de seguridad
- 📚 **Documentación**: Solo cambios en documentación
- 🎨 **Estilo**: Cambios que no afectan funcionalidad (formato, etc.)
- ⚡ **Rendimiento**: Mejoras de rendimiento
- 🧪 **Tests**: Añadir o corregir tests

---

**Nota:** Este changelog se mantiene manualmente. Para ver todos los commits, usa `git log`.

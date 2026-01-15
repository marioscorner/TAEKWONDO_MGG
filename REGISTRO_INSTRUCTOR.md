# 🥋 Registro de Instructores - Documentación

**Fecha:** 14 Enero 2026  
**Estado:** ✅ Completado y funcional

---

## 🎯 Funcionalidad

Sistema especial de registro para instructores que requiere una contraseña secreta adicional. Los usuarios registrados a través de este sistema obtienen automáticamente:

- ✅ Rol: **INSTRUCTOR**
- ✅ Cinturón: **Negro** (por defecto)
- ✅ Amistad automática con **todos los alumnos existentes**

---

## 🔗 Rutas

### Frontend:
- **Registro de instructor:** `/register/instructor`
- **Registro normal (alumno):** `/register`

### API:
- **Endpoint de instructor:** `POST /api/auth/register/instructor`
- **Endpoint normal:** `POST /api/auth/register`

---

## 🔐 Contraseña Secreta

### ¿Qué es?

La contraseña secreta es una clave adicional que debe proporcionar el **administrador** del sistema a las personas que quieran registrarse como instructores. Esto evita que cualquiera pueda auto-asignarse el rol de instructor.

### Configuración:

Añade esta variable a tu archivo `.env.local`:

```env
INSTRUCTOR_SECRET_PASSWORD="tu-contraseña-secreta-aqui"
```

**Recomendaciones para la contraseña:**
- Usa algo único y difícil de adivinar
- Mínimo 8 caracteres
- Combina letras, números y símbolos
- Ejemplo: `TKD_Inst_2026!MG`

**⚠️ IMPORTANTE:** 
- Esta contraseña **NO** es la contraseña de la cuenta del instructor
- Es una contraseña **compartida** que conocen solo los administradores
- Cámbiala periódicamente por seguridad
- No la compartas públicamente

---

## 📋 Campos del Formulario

El formulario de registro de instructor incluye:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| **Contraseña Secreta** | password | ✅ Sí | La clave proporcionada por el admin |
| **Username** | text | ✅ Sí | Nombre de usuario único (mín. 3 caracteres) |
| **Email** | email | ✅ Sí | Email único del instructor |
| **Nombre** | text | ✅ Sí | Nombre real del instructor |
| **Apellidos** | text | ✅ Sí | Apellidos del instructor |
| **Contraseña** | password | ✅ Sí | Contraseña de la cuenta (mín. 6 caracteres) |
| **Confirmar contraseña** | password | ✅ Sí | Debe coincidir con la contraseña |

---

## 🎨 Características de la UI

### Diseño Distintivo:

- **Campo de contraseña secreta destacado:**
  - Borde azul
  - Fondo azul claro
  - Icono 🔐
  - Posicionado al principio del formulario

- **Mensajes claros:**
  - Explica que la contraseña la proporciona el administrador
  - Diferencia entre contraseña secreta y contraseña de cuenta

- **Links útiles:**
  - Link a registro normal (si te equivocaste de página)
  - Link a login (si ya tienes cuenta)

---

## 🔄 Flujo de Registro

### Paso 1: El administrador proporciona la contraseña secreta

El administrador comparte la contraseña secreta (ej: por email, WhatsApp, etc.) con la persona que se va a registrar como instructor.

### Paso 2: El instructor accede a la página

El instructor va a: `/register/instructor`

### Paso 3: Completa el formulario

El instructor completa todos los campos, incluyendo la contraseña secreta.

### Paso 4: Validación

El sistema valida:
- ✅ Contraseña secreta correcta
- ✅ Email y username no duplicados
- ✅ Contraseñas coinciden
- ✅ Todos los campos requeridos

### Paso 5: Creación de cuenta

Si todo es válido:
- Se crea el usuario con rol **INSTRUCTOR**
- Se asigna cinturón **Negro**
- Se crea amistad automática con todos los alumnos existentes
- Se redirige al login

### Paso 6: Inicio de sesión

El instructor inicia sesión con su username/email y su contraseña de cuenta (no la secreta).

---

## 🚨 Validaciones y Seguridad

### Backend:

- ✅ Verifica que `INSTRUCTOR_SECRET_PASSWORD` esté configurada
- ✅ Compara la contraseña secreta enviada con la del `.env`
- ✅ Valida todos los campos con Zod
- ✅ Hash de la contraseña de cuenta con bcrypt
- ✅ Sanitiza el email
- ✅ Verifica duplicados de email/username
- ✅ Retorna errores específicos (403 para contraseña secreta incorrecta)

### Frontend:

- ✅ Validación de longitud mínima
- ✅ Verificación de coincidencia de contraseñas
- ✅ Mensajes de error claros
- ✅ Estados de carga (disable buttons)
- ✅ Redirección automática después del registro

---

## 📊 Diferencias entre Registro Normal e Instructor

| Característica | Registro Normal | Registro Instructor |
|----------------|-----------------|---------------------|
| **Ruta** | `/register` | `/register/instructor` |
| **Endpoint** | `/api/auth/register` | `/api/auth/register/instructor` |
| **Contraseña secreta** | ❌ No requerida | ✅ Requerida |
| **Rol asignado** | `ALUMNO` | `INSTRUCTOR` |
| **Cinturón inicial** | `Blanco` | `Negro` |
| **Amistad automática** | Con instructores/admins | Con todos los alumnos |
| **Acceso libre** | ✅ Sí | ❌ No (requiere clave) |

---

## 🧪 Cómo Probar

### 1. Configurar la contraseña secreta

Edita tu `.env.local`:

```bash
INSTRUCTOR_SECRET_PASSWORD="MiPasswordSecreta123"
```

### 2. Reiniciar el servidor

```bash
npm run dev
```

### 3. Ir a la página de registro de instructor

```
http://localhost:3000/register/instructor
```

### 4. Completar el formulario

- Contraseña secreta: `MiPasswordSecreta123`
- Username: `instructor_test`
- Email: `instructor@test.com`
- Nombre: `Mario`
- Apellidos: `Gutiérrez`
- Contraseña: `password123`
- Confirmar: `password123`

### 5. Verificar en la base de datos

Verifica que el usuario se creó con rol `INSTRUCTOR`:

```sql
SELECT id, username, email, role, belt 
FROM "User" 
WHERE username = 'instructor_test';
```

### 6. Verificar amistades

Verifica que se crearon las amistades con alumnos:

```sql
SELECT COUNT(*) 
FROM "Friendship" 
WHERE "userId" = (SELECT id FROM "User" WHERE username = 'instructor_test');
```

### 7. Iniciar sesión

Ve a `/login` e inicia sesión con el nuevo instructor.

---

## ❌ Errores Comunes

### Error 403: "Contraseña secreta incorrecta"

**Causa:** La contraseña secreta no coincide con `INSTRUCTOR_SECRET_PASSWORD` en `.env.local`

**Solución:**
1. Verifica que la variable esté en `.env.local`
2. Verifica que no hay espacios extras
3. Reinicia el servidor después de cambiar `.env.local`

### Error 500: "Configuración de servidor incompleta"

**Causa:** `INSTRUCTOR_SECRET_PASSWORD` no está definida en `.env.local`

**Solución:**
1. Añade la variable a `.env.local`
2. Reinicia el servidor

### Error 400: "El email o nombre de usuario ya está registrado"

**Causa:** Ya existe un usuario con ese email o username

**Solución:**
- Usa un email y username diferentes
- O elimina el usuario duplicado de la BD

---

## 🔄 Cambiar la Contraseña Secreta

Si necesitas cambiar la contraseña secreta:

1. **Edita `.env.local`:**
   ```env
   INSTRUCTOR_SECRET_PASSWORD="nueva-contraseña-secreta-2026"
   ```

2. **Reinicia el servidor:**
   ```bash
   # Ctrl+C para detener
   npm run dev
   ```

3. **Comunica la nueva contraseña:**
   - Informa a las personas autorizadas
   - Usa canales seguros (no email público)

---

## 📂 Archivos Involucrados

### Backend:
```
src/app/api/auth/register/instructor/route.ts  (endpoint específico)
```

### Frontend:
```
src/app/register/instructor/page.tsx           (página)
src/components/instructor-register-form.tsx    (formulario)
```

### Configuración:
```
.env.local                                     (contraseña secreta)
CONFIGURACION_EMAIL.md                         (ejemplo de .env)
```

---

## 🎯 Casos de Uso

### Caso 1: Nuevo instructor se une al gimnasio

1. El administrador le da la contraseña secreta en persona
2. El instructor se registra en `/register/instructor`
3. Automáticamente puede ver y gestionar a todos los alumnos
4. Los alumnos lo ven en su lista de amigos protegidos

### Caso 2: Instructor olvidó su contraseña de cuenta

- **NO** necesita la contraseña secreta nuevamente
- Usa la función "¿Olvidaste tu contraseña?" en `/login`
- Restablece solo su contraseña de cuenta

### Caso 3: Cambio de contraseña secreta

- El admin cambia `INSTRUCTOR_SECRET_PASSWORD` en `.env.local`
- Solo afecta a **nuevos registros**
- Los instructores existentes NO se ven afectados

---

## 💡 Mejoras Futuras (Opcionales)

- [ ] Panel de admin para generar códigos de invitación únicos (en lugar de contraseña compartida)
- [ ] Límite de tiempo para códigos de invitación
- [ ] Registro de quién invitó a quién
- [ ] Email de notificación al admin cuando se registra un instructor
- [ ] Aprobación manual de instructores antes de activar la cuenta

---

## ✅ Checklist de Implementación

- [x] Endpoint `/api/auth/register/instructor` creado
- [x] Validación de contraseña secreta
- [x] Página `/register/instructor` creada
- [x] Formulario con campo de contraseña secreta
- [x] Asignación automática de rol INSTRUCTOR
- [x] Cinturón Negro por defecto
- [x] Amistad automática con alumnos
- [x] Link desde registro normal
- [x] Mensajes de error claros
- [x] Documentación completa
- [ ] Variable `INSTRUCTOR_SECRET_PASSWORD` configurada en `.env.local` (pendiente del usuario)

---

## 🔗 Links Relacionados

- **Registro normal:** `/register`
- **Login:** `/login`
- **Panel de instructor:** `/dashboard/instructor`
- **Documentación de email:** `CONFIGURACION_EMAIL.md`

---

**¡Sistema de registro de instructores completamente funcional!** 🎉

**Próximo paso:** Configura `INSTRUCTOR_SECRET_PASSWORD` en tu `.env.local` y prueba el registro.


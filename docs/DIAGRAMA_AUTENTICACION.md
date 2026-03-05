# Diagrama del proceso de autenticación

Este documento describe el flujo de autenticación del proyecto Taekwondo MGG mediante diagramas en Mermaid.

---

## 1. Registro de usuario

El usuario envía email, username, contraseña y nombre. El backend valida, comprueba que no exista el email/username, hashea la contraseña con bcrypt y crea el usuario. Si el rol es ALUMNO, se crean amistades automáticas con todos los INSTRUCTOR y ADMIN.

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Formulario Registro
    participant API as POST /api/auth/register
    participant DB as Base de datos

    U->>F: Completa formulario (email, username, password, nombre)
    F->>API: POST con datos
    API->>API: Validar (Zod registerSchema)
    API->>DB: findFirst(email O username)
    alt Email o username ya existe
        DB-->>API: existingUser
        API-->>F: 400 "Email o nombre de usuario ya está registrado"
    else No existe
        DB-->>API: null
        API->>API: hashPassword(password) [bcrypt]
        API->>DB: user.create(...)
        opt Si role === ALUMNO
            API->>DB: Crear amistades con INSTRUCTOR/ADMIN
        end
        DB-->>API: user creado
        API-->>F: 201 { message, user }
        F->>U: Redirigir a /login?registered=true
    end
```

---

## 2. Login

El usuario introduce email y contraseña. El backend busca el usuario, verifica la contraseña con bcrypt, genera un JWT de acceso (15 min) y un refresh token (7 días), guarda el refresh en la base de datos y devuelve usuario + tokens. El cliente guarda los tokens en `localStorage` y el usuario en el estado del `AuthContext`.

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as LoginForm
    participant Ctx as AuthContext
    participant API as POST /api/auth/login
    participant DB as Base de datos

    U->>F: Email + contraseña
    F->>Ctx: login(email, password)
    Ctx->>API: POST /auth/login { email, password }
    API->>API: Validar (loginSchema)
    API->>DB: findUnique(email)
    alt No existe usuario o contraseña incorrecta
        API-->>Ctx: 401 "Credenciales inválidas"
        Ctx-->>F: false
        F->>U: "Email o contraseña incorrectos"
    else Credenciales correctas
        API->>API: verifyPassword(password, user.password)
        API->>API: signAccessToken(userId, email, username, role) [JWT 15m]
        API->>API: signRefreshToken(userId) [JWT 7d]
        API->>DB: refreshToken.create(token, userId, expiresAt)
        API-->>Ctx: 200 { user, access, refresh }
        Ctx->>Ctx: saveTokens(access, refresh) → localStorage
        Ctx->>Ctx: setUser(user)
        Ctx-->>F: true
        F->>U: Redirigir a dashboard (o redirectTo)
    end
```

---

## 3. Recuperación de sesión al arrancar

Al cargar la aplicación, el `AuthProvider` intenta recuperar la sesión llamando a `GET /users/profile` con el access token en el header `Authorization`. Si la respuesta es correcta, se establece el usuario; si no hay token o falla, el usuario queda en `null`.

```mermaid
sequenceDiagram
    participant App as Aplicación
    participant Ctx as AuthContext (useEffect boot)
    participant API as GET /api/users/profile
    participant Auth as requireAuth / getUserFromRequest

    App->>Ctx: Montaje AuthProvider
    Ctx->>Ctx: loading = true
    Ctx->>API: GET /users/profile [Header: Authorization Bearer access]
    API->>Auth: getUserFromRequest(req)
    Auth->>Auth: verifyAccessToken(access)
    alt Token válido
        Auth-->>API: user (TokenPayload)
        API->>API: prisma.user.findUnique + datos perfil
        API-->>Ctx: 200 { user data }
        Ctx->>Ctx: setUser(user)
    else Sin token o token inválido/expirado
        Auth-->>API: null (o 401)
        API-->>Ctx: 401 o error
        Ctx->>Ctx: setUser(null)
    end
    Ctx->>Ctx: loading = false
```

---

## 4. Refresh de tokens (interceptor)

Cuando una petición API devuelve 401 (access token expirado), el interceptor de Axios intenta renovar los tokens con el refresh token. Si tiene éxito, guarda los nuevos y reintenta la petición original; si falla, limpia tokens y redirige a `/login`.

```mermaid
sequenceDiagram
    participant C as Cliente (componente)
    participant API as Axios / api.ts
    participant Backend as Cualquier API protegida
    participant Refresh as POST /api/auth/refresh
    participant DB as Base de datos

    C->>API: Petición (ej. GET /users/profile)
    API->>API: Interceptor: Añadir Authorization Bearer access
    API->>Backend: Request con access token
    Backend->>Backend: verifyAccessToken → expirado
    Backend-->>API: 401 No autenticado

    API->>API: Interceptor response: 401 y !_retry
    API->>API: _retry = true
    API->>Refresh: POST { refresh } (desde localStorage)
    Refresh->>Refresh: verifyRefreshToken(refresh)
    Refresh->>DB: findUnique(refreshToken), comprobar !revoked y !expired
    alt Token refresh válido
        Refresh->>DB: update revocado = true (token antiguo)
        Refresh->>Refresh: signAccessToken + signRefreshToken
        Refresh->>DB: refreshToken.create(nuevo)
        Refresh-->>API: 200 { access, refresh }
        API->>API: localStorage setItem access, refresh
        API->>API: originalRequest.headers.Authorization = Bearer newAccess
        API->>Backend: Reintentar petición original
        Backend-->>API: 200
        API-->>C: Respuesta correcta
    else Refresh inválido o expirado
        Refresh-->>API: 401
        API->>API: localStorage removeItem access, refresh
        API->>API: window.location.href = '/login'
    end
```

---

## 5. Logout

El usuario cierra sesión. El cliente envía el refresh token al backend para revocarlo en la base de datos y localmente elimina tokens y usuario del estado.

```mermaid
sequenceDiagram
    participant U as Usuario
    participant C as Componente
    participant Ctx as AuthContext
    participant API as POST api auth logout
    participant DB as Base de datos

    U->>C: Clic Cerrar sesión
    C->>Ctx: logout
    Ctx->>API: POST con refresh desde localStorage
    API->>DB: refreshToken updateMany revoked true
    DB-->>API: OK
    API-->>Ctx: 200
    Ctx->>Ctx: clearTokens removeItem access y refresh
    Ctx->>Ctx: setUser null
    Note over Ctx: Usuario deslogueado. Rutas privadas redirigen a login
```

---

## 6. Protección de rutas privadas (frontend)

Las rutas bajo el dashboard usan `PrivateRoute`. Si el usuario no está autenticado (y la carga inicial ha terminado), se redirige a `/login`.

```mermaid
flowchart TD
    A[Usuario accede a ruta privada] --> B{loading}
    B -->|Sí| C[Mostrar Cargando]
    B -->|No| D{user}
    D -->|No| E[Redirigir a login]
    D -->|Sí| F[Renderizar children]
```

---

## 7. Protección de rutas API (backend)

Las rutas API que requieren autenticación usan `requireAuth(req)`, que extrae el token del header `Authorization: Bearer <token>` y lo verifica con `verifyAccessToken`. Si no hay token o es inválido, responden 401.

```mermaid
flowchart TD
    A[Request a API protegida] --> B[requireAuth]
    B --> C{Header Authorization Bearer?}
    C -->|No| D[401 No autenticado]
    C -->|Sí| E[verifyAccessToken]
    E --> F{Token válido?}
    F -->|No| D
    F -->|Sí| G[TokenPayload: userId, email, username, role]
    G --> H{requireRole?}
    H -->|No| I[Continuar lógica del endpoint]
    H -->|Sí| J{Rol permitido?}
    J -->|No| K[403 Sin permisos]
    J -->|Sí| I
```

---

## 8. Recuperación de contraseña

Flujo en dos pasos: solicitud (envío de email con enlace) y confirmación (nueva contraseña con token).

### 8.1 Solicitud de reset

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Formulario "Olvidé mi contraseña"
    participant API as POST /api/auth/password/request-reset
    participant DB as Base de datos
    participant Mail as Servicio email

    U->>F: Introduce email
    F->>API: POST { email }
    API->>DB: findUnique(email)
    alt Usuario no existe
        API-->>F: 200 "Si el email existe, recibirás..."
    else Usuario existe
        API->>API: generateRandomToken(), expiresAt = now + 1h
        API->>DB: passwordResetToken.create(token, userId, expiresAt)
        API->>API: resetUrl = /reset-password/confirm?token=...
        API->>Mail: sendEmail(enlace reset)
        Mail-->>U: Email con enlace
        API-->>F: 200 "Si el email existe, recibirás..."
    end
```

### 8.2 Confirmación (nueva contraseña)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Formulario nueva contraseña
    participant API as POST /api/auth/password/reset
    participant DB as Base de datos

    U->>F: Token (query) + nueva contraseña
    F->>API: POST { token, newPassword }
    API->>DB: passwordResetToken.findUnique(token)
    alt No existe / usado / expirado
        API-->>F: 400 Mensaje de error
    else Token válido
        API->>API: hashPassword(newPassword)
        API->>DB: transaction: user.update(password), token.update(used: true)
        API-->>F: 200 "Contraseña actualizada"
        F->>U: Redirigir a /login
    end
```

---

## Resumen de componentes

| Componente | Ubicación | Función |
|------------|-----------|---------|
| **AuthContext** | `src/context/AuthContext.tsx` | Estado global user, login(), logout(), recuperación de sesión |
| **api (Axios)** | `src/lib/api.ts` | Interceptor: añade Bearer token, refresh en 401, redirección a login |
| **auth-helpers** | `src/lib/auth-helpers.ts` | hashPassword, verifyPassword, JWT sign/verify, getUserFromRequest |
| **requireAuth** | `src/server/middleware/auth.ts` | Middleware para rutas API; requireRole para comprobar rol |
| **PrivateRoute** | `src/components/PrivateRoute.tsx` | Redirige a /login si no hay user |
| **Login** | `src/app/api/auth/login/route.ts` | POST login, genera access + refresh, guarda refresh en BD |
| **Logout** | `src/app/api/auth/logout/route.ts` | POST revoca refresh token en BD |
| **Refresh** | `src/app/api/auth/refresh/route.ts` | POST intercambia refresh por nuevos access + refresh |
| **Register** | `src/app/api/auth/register/route.ts` | POST registro, bcrypt, amistades ALUMNO |
| **Request reset** | `src/app/api/auth/password/request-reset/route.ts` | POST genera token y envía email |
| **Reset** | `src/app/api/auth/password/reset/route.ts` | POST token + newPassword, actualiza contraseña |

---

## Tokens y almacenamiento

- **Access token**: JWT, 15 min, secret `JWT_SECRET`. Se envía en `Authorization: Bearer <access>`.
- **Refresh token**: JWT, 7 días, secret `JWT_REFRESH_SECRET`. Se guarda en BD (tabla `RefreshToken`) y en `localStorage`; se usa solo en `/auth/refresh` y `/auth/logout`.
- **Almacenamiento cliente**: `localStorage` con claves `access` y `refresh` (y opcionalmente `mock_user` si `NEXT_PUBLIC_USE_MOCK_AUTH=1`).

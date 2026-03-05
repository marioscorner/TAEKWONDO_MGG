# Diagrama de arquitectura del sistema

Arquitectura general del proyecto Taekwondo MGG: capas, tecnologías y flujo de datos en una única vista.

---

## Vista en una única imagen

![Diagrama de arquitectura del sistema](./arquitectura-sistema.png)

*Figura 1: Capas del sistema (Cliente → Next.js → Servicios → PostgreSQL + SMTP).*

---

## Vista general (Mermaid)

El siguiente diagrama Mermaid resume la arquitectura en un solo bloque. Debajo se incluye una **versión simplificada** para que quepa bien en una única imagen al exportar o en documentación.

```mermaid
flowchart TB
    subgraph CLIENTE["🖥️ Cliente (navegador)"]
        UI[React 19 + Next.js App Router]
        AUTH_CTX[AuthContext + estado user]
        AXIOS[Axios + interceptor JWT]
        UI --> AUTH_CTX
        AUTH_CTX --> AXIOS
    end

    subgraph NEXT["⚙️ Next.js (servidor)"]
        PAGES[Páginas: login, register, dashboard, amigos, chats, perfil, instructor, temario]
        API[API Routes REST]
        PAGES --> API
    end

    subgraph API_GRUPOS["API Routes"]
        AUTH_API[auth: login, logout, refresh, register, password reset]
        USERS_API[users: profile, search, delete-account]
        FRIENDS_API[friends: list, requests, block]
        CHAT_API[chat: conversations, messages]
        UPLOAD_API[upload: image]
        INSTRUCTOR_API[instructor: students, stats, belt]
        AUTH_API --> USERS_API
        USERS_API --> FRIENDS_API
        FRIENDS_API --> CHAT_API
    end

    subgraph SERVICIOS["Servicios"]
        PRISMA[Prisma ORM]
        JWT[jose JWT]
        BCRYPT[bcrypt]
        ZOD[Zod validación]
    end

    subgraph DATOS["Datos"]
        PG[(PostgreSQL)]
    end

    subgraph EXTERNO["Externo"]
        SMTP[Nodemailer SMTP - email reset]
    end

    CLIENTE -->|HTTPS| NEXT
    API --> API_GRUPOS
    API_GRUPOS --> SERVICIOS
    SERVICIOS --> PG
    AUTH_API --> SMTP
```

---

## Versión compacta (para una única imagen)

Diagrama simplificado en tres capas para exportar o incrustar como una sola figura.

```mermaid
flowchart LR
    subgraph Cliente
        A[React + App Router + AuthContext + Axios]
    end

    subgraph NextJS
        B[Páginas y API Routes]
        C[Prisma + JWT + bcrypt + Zod]
    end

    subgraph Persistencia
        D[(PostgreSQL)]
        E[SMTP]
    end

    A -->|HTTP/JSON| B
    B --> C
    C --> D
    C --> E
```

---

## Capas resumidas

| Capa | Contenido |
|------|-----------|
| **Cliente** | Next.js (React 19), App Router, AuthContext, Axios con interceptor de tokens, Tailwind, Radix UI |
| **Next.js servidor** | Páginas (públicas/privadas), API Routes bajo `/api/*` |
| **Lógica de negocio** | Validación Zod, Prisma, JWT (jose), bcrypt, requireAuth/requireRole |
| **Persistencia** | PostgreSQL, tabla RefreshToken, PasswordResetToken, User, etc. |
| **Externo** | Nodemailer (SMTP) para envío de emails de recuperación de contraseña |

---

## Flujo de una petición típica

1. **Usuario** interactúa con la UI (React).
2. **AuthContext** mantiene `user` y tokens en memoria; **Axios** añade `Authorization: Bearer <access>`.
3. La petición llega a **Next.js** (mismo origen): si es página, se renderiza; si es `/api/*`, se ejecuta el route handler.
4. El **route** valida con Zod, opcionalmente usa **requireAuth** (JWT), y usa **Prisma** para leer/escribir en **PostgreSQL**.
5. Si hace falta enviar email (reset contraseña), se llama a **Nodemailer** (SMTP).
6. La respuesta JSON vuelve al **cliente**; si es 401, el interceptor intenta **refresh** y reintenta.

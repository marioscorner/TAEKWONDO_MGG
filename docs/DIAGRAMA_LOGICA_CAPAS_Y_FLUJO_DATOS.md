# Logica por capas y flujo de datos

Documento que describe la arquitectura en capas del proyecto Taekwondo MGG y el flujo de datos entre cliente, servidor, realtime, base de datos y almacenamiento local.

---

## 1. Diagrama de logica por capas

```mermaid
flowchart TB
    subgraph CAPA_1["Capa 1: Presentacion"]
        P1[Paginas y componentes React]
        P2[Formularios, listas, chat UI]
        P3[AuthContext y ThemeContext]
    end

    subgraph CAPA_2["Capa 2: Cliente"]
        C1[Axios instance]
        C2[Interceptor JWT y refresh]
        C3[Socket.IO Client]
    end

    subgraph CAPA_3["Capa 3: Servidor Node"]
        S1[server.js]
        S2[Next.js App Router]
        S3[Socket.IO Server]
    end

    subgraph CAPA_4["Capa 4: Controladores"]
        A1[Route handlers GET POST PATCH DELETE]
        A2[requireAuth y requireRole]
        A3[Respuestas JSON]
    end

    subgraph CAPA_5["Capa 5: Logica de aplicacion"]
        L1[Validacion Zod]
        L2[Reglas de negocio]
        L3[Hash contrasena y JWT]
        L4[Gestion de archivos]
    end

    subgraph CAPA_6["Capa 6: Acceso a datos"]
        D1[Prisma Client]
        D2[Queries y transacciones]
    end

    subgraph CAPA_7["Capa 7: Persistencia y externos"]
        DB[(PostgreSQL)]
        FS[(public/uploads)]
        SMTP[SMTP Email]
    end

    CAPA_1 --> CAPA_2
    C1 --> C2
    C2 -->|HTTP JSON| S1
    C3 -->|WebSocket o polling fallback| S1
    S1 --> S2
    S1 --> S3
    S2 --> CAPA_4
    CAPA_4 --> CAPA_5
    CAPA_5 --> CAPA_6
    CAPA_6 --> DB
    L4 --> FS
    CAPA_5 -.-> SMTP
    S3 -->|Eventos chat| C3
```

---

## 2. Responsabilidades por capa

| Capa | Responsabilidad | Tecnologias / Ubicacion |
|------|-----------------|-------------------------|
| **Presentacion** | Mostrar UI, capturar acciones, mantener estado de sesion y tema | React, App Router, componentes en `src/app` y `src/components` |
| **Cliente** | Peticiones HTTP autenticadas, refresh de tokens y conexion realtime | Axios en `src/lib/api.ts`, Socket.IO Client en `src/hooks/useChatSocket.tsx` |
| **Servidor Node** | Ejecutar Next.js y Socket.IO sobre el mismo servidor HTTP | `server.js` |
| **Controladores** | Recibir requests, validar auth/rol y devolver JSON | Route Handlers en `src/app/api/**/route.ts`, `src/server/middleware/auth.ts` |
| **Logica de aplicacion** | Validar datos, aplicar reglas, hashear contraseñas, firmar/verificar JWT, gestionar uploads | Zod, bcrypt, jose, codigo dentro de handlers y libs |
| **Acceso a datos** | Leer y escribir en la base de datos | Prisma Client en `src/lib/prisma.ts` |
| **Persistencia y externos** | Guardar datos, guardar archivos y enviar correos | PostgreSQL, `public/uploads`, Nodemailer SMTP |

---

## 3. Flujo HTTP tipico

```mermaid
sequenceDiagram
    participant U as Usuario
    participant V as Vista React
    participant A as Axios
    participant R as Route Handler
    participant L as Logica
    participant P as Prisma
    participant DB as PostgreSQL

    U->>V: Interaccion
    V->>A: api.get / api.post
    A->>A: Añadir Authorization Bearer
    A->>R: Request HTTP
    R->>R: requireAuth / requireRole si procede
    R->>L: Validar body/query con Zod
    L->>L: Aplicar reglas de negocio
    L->>P: findUnique/create/update/delete
    P->>DB: SQL
    DB-->>P: Resultado
    P-->>L: Datos
    L-->>R: Payload de respuesta
    R-->>A: JSON
    A-->>V: data
    V-->>U: Actualizar UI
```

---

## 4. Flujo realtime de chat

```mermaid
sequenceDiagram
    participant V as Chat UI
    participant S as Socket.IO Client
    participant N as server.js + Socket.IO Server
    participant API as Route Handler mensajes
    participant DB as PostgreSQL

    V->>S: Conectar con access token
    S->>N: Handshake Socket.IO
    N->>N: Verificar JWT
    V->>S: conversation:join
    S->>N: Unirse a conversation:{id}
    V->>API: POST /api/chat/conversations/:id/messages
    API->>DB: Crear Message
    API-->>V: Mensaje creado
    API->>N: Emitir message.new a la sala
    N-->>S: message.new
    S-->>V: Actualizar chat
```

Socket.IO usa WebSocket cuando esta disponible y puede caer a polling como transporte de respaldo.

---

## 5. Flujo de uploads

```mermaid
sequenceDiagram
    participant V as UI
    participant R as Route Handler upload
    participant FS as public/uploads
    participant DB as PostgreSQL

    V->>R: POST multipart/form-data
    R->>R: requireAuth / requireRole
    R->>R: Validar tipo y tamaño
    R->>FS: Guardar archivo
    R->>DB: Guardar metadata si aplica
    R-->>V: URL publica /uploads/...
```

Los avatares, imagenes de grupo y documentos se almacenan localmente bajo `public/uploads`. En produccion ese directorio se monta como volumen Docker.

---

## 6. Reglas de la arquitectura

- La UI no accede directamente a Prisma ni a PostgreSQL.
- Las escrituras de negocio pasan por Route Handlers y validacion.
- Socket.IO se usa para eventos realtime, pero la persistencia de mensajes sigue pasando por la API y PostgreSQL.
- Los archivos se guardan en filesystem local y su URL/metadata se persiste cuando corresponde.
- Los servicios externos, como SMTP, se invocan desde la logica de aplicacion.

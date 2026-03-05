# Lógica por capas y flujo de datos

Documento que describe la **arquitectura en capas** del proyecto Taekwondo MGG y el **flujo de datos** entre ellas.

---

## 1. Diagrama de lógica por capas

El sistema se organiza en capas; cada una solo se comunica con la capa inferior (o con servicios externos). No se salta capas.

```mermaid
flowchart TB
    subgraph CAPA_1["Capa 1: Presentación"]
        direction TB
        P1[Páginas y componentes React]
        P2[Formularios, listas, chat UI]
        P3[AuthContext, estado global]
        P1 --> P2
        P2 --> P3
    end

    subgraph CAPA_2["Capa 2: Cliente HTTP"]
        direction TB
        C1[Axios instance]
        C2[Interceptor: añadir Bearer token]
        C3[Interceptor: refresh en 401]
        C1 --> C2
        C2 --> C3
    end

    subgraph CAPA_3["Capa 3: API / Controladores"]
        direction TB
        A1[Route handlers GET POST etc]
        A2[requireAuth y requireRole]
        A3[Respuestas JSON]
        A1 --> A2
        A2 --> A3
    end

    subgraph CAPA_4["Capa 4: Lógica de aplicación"]
        direction TB
        L1[Validación Zod]
        L2[Reglas de negocio]
        L3[Hash contraseña, JWT]
        L1 --> L2
        L2 --> L3
    end

    subgraph CAPA_5["Capa 5: Acceso a datos"]
        direction TB
        D1[Prisma Client]
        D2[Queries y transacciones]
        D1 --> D2
    end

    subgraph CAPA_6["Capa 6: Persistencia y externos"]
        direction LR
        DB[(PostgreSQL)]
        SMTP[SMTP Email]
    end

    CAPA_1 -->|Peticiones HTTP| CAPA_2
    CAPA_2 -->|JSON| CAPA_3
    CAPA_3 --> CAPA_4
    CAPA_4 --> CAPA_5
    CAPA_5 --> DB
    CAPA_4 -.->|Reset contraseña| SMTP
```

---

## 2. Responsabilidades por capa

| Capa | Responsabilidad | Tecnologías / Ubicación |
|------|-----------------|-------------------------|
| **Presentación** | Mostrar UI, capturar acciones del usuario, mantener estado de sesión (user) | React, App Router, AuthContext, componentes en `src/app`, `src/components` |
| **Cliente HTTP** | Enviar peticiones con credenciales, reintentar con refresh si 401 | Axios, `src/lib/api.ts` |
| **API / Controladores** | Recibir request, decidir si requiere auth/rol, delegar en lógica y devolver respuesta | Route handlers en `src/app/api/**/route.ts`, `src/server/middleware/auth.ts` |
| **Lógica de aplicación** | Validar entrada, aplicar reglas (ej. amistades ALUMNO), hashear contraseñas, firmar/verificar JWT | Zod, bcrypt, jose, código dentro de los route handlers |
| **Acceso a datos** | Leer y escribir en la base de datos de forma estructurada | Prisma, `src/lib/prisma.ts`, modelos en `prisma/schema.prisma` |
| **Persistencia y externos** | Almacenar datos y enviar correos | PostgreSQL, Nodemailer (SMTP) |

---

## 3. Flujo de datos (entrada: petición del usuario)

Flujo típico cuando el usuario hace una acción que requiere datos del servidor (por ejemplo ver perfil o enviar mensaje).

```mermaid
sequenceDiagram
    participant U as Usuario
    participant V as Vista
    participant A as Axios
    participant R as Route API
    participant L as Lógica
    participant P as Prisma
    participant DB as PostgreSQL

    U->>V: Interacción
    V->>V: Estado local o AuthContext
    V->>A: api.get o api.post
    A->>A: Añadir Authorization Bearer
    A->>R: Request HTTP
    R->>R: requireAuth si ruta protegida
    R->>L: Validar body con Zod
    L->>L: Reglas de negocio
    L->>P: findUnique create update etc
    P->>DB: SQL
    DB-->>P: Resultado
    P-->>L: Entidad o lista
    L-->>R: Datos para respuesta
    R-->>A: Response JSON
    A-->>V: res.data
    V-->>U: Actualizar UI
```

---

## 4. Flujo de datos (entrada: petición pública)

Páginas o APIs que no requieren autenticación (login, register, solicitar reset de contraseña).

```mermaid
flowchart LR
    A[Usuario en login o register] --> B[Formulario envía POST]
    B --> C[API Route recibe]
    C --> D[Zod valida body]
    D --> E[Lógica: hash o buscar usuario]
    E --> F[Prisma lee o escribe BD]
    F --> G[Opcional: enviar email]
    G --> H[Respuesta JSON]
    H --> B
```

---

## 5. Flujo de datos (resumen en una vista)

Diagrama único que resume capas y sentido del flujo de datos.

```mermaid
flowchart TB
    subgraph Entrada
        E1[Usuario]
        E2[Navegador]
    end

    subgraph Presentación
        P1[Vista React]
        P2[AuthContext]
    end

    subgraph Transporte
        T1[Axios + JWT en header]
    end

    subgraph Servidor
        S1[Route handler]
        S2[Validación y auth]
        S3[Prisma]
    end

    subgraph Salida
        O1[(PostgreSQL)]
        O2[SMTP]
    end

    E1 --> E2
    E2 --> P1
    P1 --> P2
    P2 --> T1
    T1 -->|Request| S1
    S1 --> S2
    S2 --> S3
    S3 --> O1
    S2 -.-> O2
    S3 -->|Response| S1
    S1 -->|JSON| T1
    T1 --> P1
    P1 --> E2
```

---

## 6. Reglas de la arquitectura en capas

- **Flujo descendente**: la presentación llama al cliente HTTP; el cliente HTTP llama a la API; la API usa lógica de aplicación; la lógica usa acceso a datos; el acceso a datos escribe o lee en persistencia.
- **Sin saltos**: la presentación no llama directamente a Prisma ni a la base de datos; siempre pasa por la API.
- **Datos de vuelta**: la respuesta fluye en sentido inverso (DB → Prisma → lógica → route → JSON → Axios → vista → usuario).
- **Excepciones**: la capa de lógica puede llamar a servicios externos (SMTP) sin pasar por la capa de acceso a datos cuando la operación no es persistencia (ej. envío de email).

Con esto se tiene una vista clara de la **lógica por capas** y del **flujo de datos** en el sistema.

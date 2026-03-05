# Diagrama Entidad-Relación del sistema

Diagrama ER del proyecto Taekwondo MGG: entidades, claves primarias (PK), claves foráneas (FK) y cardinalidades. Basado en el schema de Prisma (`prisma/schema.prisma`).

---

## Diagrama ER (Mermaid)

```mermaid
erDiagram
    USER ||--o{ REFRESH_TOKEN : "tiene"
    USER ||--o{ PASSWORD_RESET_TOKEN : "solicita"
    USER ||--o{ CONVERSATION_PARTICIPANT : "participa"
    USER ||--o{ MESSAGE : "envía"
    USER ||--o{ FRIENDSHIP_USER : "amigo origen"
    USER ||--o{ FRIENDSHIP_FRIEND : "amigo destino"
    USER ||--o{ FRIEND_REQUEST_FROM : "solicita"
    USER ||--o{ FRIEND_REQUEST_TO : "recibe"
    USER ||--o{ BLOCKED_USER_BLOCKER : "bloquea"
    USER ||--o{ BLOCKED_USER_BLOCKED : "es bloqueado"

    CONVERSATION ||--o{ CONVERSATION_PARTICIPANT : "incluye"
    CONVERSATION ||--o{ MESSAGE : "contiene"

    USER {
        int id PK "Autoincrement"
        string email UK "Único"
        string username UK "Único"
        string password
        enum role "ADMIN, INSTRUCTOR, ALUMNO"
        boolean emailVerified
        datetime createdAt
        datetime updatedAt
        string firstName
        string lastName
        string phone
        datetime birthDate
        string belt
        string avatarUrl
    }

    REFRESH_TOKEN {
        int id PK
        string token UK
        int userId FK "ref User.id"
        datetime expiresAt
        datetime createdAt
        boolean revoked
    }

    PASSWORD_RESET_TOKEN {
        int id PK
        string token UK
        int userId FK "ref User.id"
        datetime expiresAt
        boolean used
        datetime createdAt
    }

    CONVERSATION {
        int id PK
        string name
        boolean isGroup
        string groupImageUrl
        datetime createdAt
        datetime updatedAt
    }

    CONVERSATION_PARTICIPANT {
        int id PK
        int conversationId FK "ref Conversation.id"
        int userId FK "ref User.id"
        datetime joinedAt
        datetime lastReadAt
    }

    MESSAGE {
        int id PK
        text content
        int conversationId FK "ref Conversation.id"
        int senderId FK "ref User.id"
        datetime createdAt
        datetime editedAt
        boolean isDeleted
        string fileUrl
        string fileType
        string fileName
        int fileSize
    }

    FRIENDSHIP {
        int id PK
        int userId FK "ref User.id"
        int friendId FK "ref User.id"
        datetime createdAt
    }

    FRIEND_REQUEST {
        int id PK
        int fromUserId FK "ref User.id"
        int toUserId FK "ref User.id"
        string message
        enum status "PENDING, ACCEPTED, REJECTED, CANCELLED"
        datetime createdAt
        datetime updatedAt
    }

    BLOCKED_USER {
        int id PK
        int blockerId FK "ref User.id"
        int blockedId FK "ref User.id"
        datetime createdAt
    }

    REFRESH_TOKEN }o--|| USER : "pertenece a"
    PASSWORD_RESET_TOKEN }o--|| USER : "pertenece a"
    CONVERSATION_PARTICIPANT }o--|| CONVERSATION : "en"
    CONVERSATION_PARTICIPANT }o--|| USER : "es"
    MESSAGE }o--|| CONVERSATION : "en"
    MESSAGE }o--|| USER : "de"
    FRIENDSHIP }o--|| USER : "user"
    FRIENDSHIP }o--|| USER : "friend"
    FRIEND_REQUEST }o--|| USER : "fromUser"
    FRIEND_REQUEST }o--|| USER : "toUser"
    BLOCKED_USER }o--|| USER : "blocker"
    BLOCKED_USER }o--|| USER : "blocked"
```

En Mermaid, las relaciones con el mismo nombre de entidad se distinguen por el rol. Para evitar ambigüedad con **User** y las tablas que lo referencian dos veces (Friendship, FriendRequest, BlockedUser), abajo se muestra una versión simplificada por bloques funcionales.

---

## Diagrama ER simplificado por módulos

Misma estructura pero agrupada por área (autenticación, chat, amistades) para leer mejor en GitHub.

```mermaid
erDiagram
    %% ========== MÓDULO USUARIOS Y AUTENTICACIÓN ==========
    USER {
        int id PK
        string email UK
        string username UK
        string password
        enum role
        boolean emailVerified
        datetime createdAt
        datetime updatedAt
        string firstName
        string lastName
        string phone
        datetime birthDate
        string belt
        string avatarUrl
    }

    REFRESH_TOKEN {
        int id PK
        string token UK
        int userId FK
        datetime expiresAt
        boolean revoked
    }

    PASSWORD_RESET_TOKEN {
        int id PK
        string token UK
        int userId FK
        datetime expiresAt
        boolean used
    }

    USER ||--o{ REFRESH_TOKEN : "tiene"
    USER ||--o{ PASSWORD_RESET_TOKEN : "solicita reset"
    REFRESH_TOKEN }o--|| USER : "userId"
    PASSWORD_RESET_TOKEN }o--|| USER : "userId"

    %% ========== MÓDULO CHAT ==========
    CONVERSATION {
        int id PK
        string name
        boolean isGroup
        string groupImageUrl
        datetime createdAt
        datetime updatedAt
    }

    CONVERSATION_PARTICIPANT {
        int id PK
        int conversationId FK
        int userId FK
        datetime joinedAt
        datetime lastReadAt
    }

    MESSAGE {
        int id PK
        text content
        int conversationId FK
        int senderId FK
        datetime createdAt
        string fileUrl
        string fileType
    }

    USER ||--o{ CONVERSATION_PARTICIPANT : "participa"
    USER ||--o{ MESSAGE : "envía"
    CONVERSATION ||--o{ CONVERSATION_PARTICIPANT : "tiene"
    CONVERSATION ||--o{ MESSAGE : "contiene"
    CONVERSATION_PARTICIPANT }o--|| CONVERSATION : "conversationId"
    CONVERSATION_PARTICIPANT }o--|| USER : "userId"
    MESSAGE }o--|| CONVERSATION : "conversationId"
    MESSAGE }o--|| USER : "senderId"

    %% ========== MÓDULO AMISTADES ==========
    FRIENDSHIP {
        int id PK
        int userId FK
        int friendId FK
        datetime createdAt
    }

    FRIEND_REQUEST {
        int id PK
        int fromUserId FK
        int toUserId FK
        string message
        enum status
        datetime createdAt
    }

    BLOCKED_USER {
        int id PK
        int blockerId FK
        int blockedId FK
        datetime createdAt
    }

    USER ||--o{ FRIENDSHIP : "userId"
    USER ||--o{ FRIENDSHIP : "friendId"
    USER ||--o{ FRIEND_REQUEST : "fromUserId"
    USER ||--o{ FRIEND_REQUEST : "toUserId"
    USER ||--o{ BLOCKED_USER : "blockerId"
    USER ||--o{ BLOCKED_USER : "blockedId"
    FRIENDSHIP }o--|| USER : "userId"
    FRIENDSHIP }o--|| USER : "friendId"
    FRIEND_REQUEST }o--|| USER : "fromUserId"
    FRIEND_REQUEST }o--|| USER : "toUserId"
    BLOCKED_USER }o--|| USER : "blockerId"
    BLOCKED_USER }o--|| USER : "blockedId"
```

---

## Resumen de entidades, PK, FK y cardinalidades

| Entidad | Clave primaria | Claves foráneas | Cardinalidades |
|--------|----------------|-----------------|----------------|
| **User** | `id` | — | 1:N con RefreshToken, PasswordResetToken, ConversationParticipant, Message, Friendship (como user y friend), FriendRequest (from/to), BlockedUser (blocker/blocked) |
| **RefreshToken** | `id` | `userId` → User.id | N:1 User |
| **PasswordResetToken** | `id` | `userId` → User.id | N:1 User |
| **Conversation** | `id` | — | 1:N ConversationParticipant, 1:N Message |
| **ConversationParticipant** | `id` | `conversationId` → Conversation.id, `userId` → User.id | N:1 Conversation, N:1 User. UK(conversationId, userId) |
| **Message** | `id` | `conversationId` → Conversation.id, `senderId` → User.id | N:1 Conversation, N:1 User |
| **Friendship** | `id` | `userId` → User.id, `friendId` → User.id | N:1 User (origen), N:1 User (destino). UK(userId, friendId) |
| **FriendRequest** | `id` | `fromUserId` → User.id, `toUserId` → User.id | N:1 User (from), N:1 User (to). UK(fromUserId, toUserId) |
| **BlockedUser** | `id` | `blockerId` → User.id, `blockedId` → User.id | N:1 User (bloqueador), N:1 User (bloqueado). UK(blockerId, blockedId) |

---

## Notación de cardinalidad (Mermaid)

- `||--o{` : uno a muchos (0..n)
- `}o--||` : muchos a uno (n..1)
- `||--||` : uno a uno (1..1)
- **PK** = Primary Key  
- **FK** = Foreign Key  
- **UK** = Unique (atributo o par único en la BD)

En Prisma, todas las relaciones de estas tablas usan `onDelete: Cascade`: al borrar un User se eliminan sus RefreshToken, PasswordResetToken, participaciones, mensajes, amistades, solicitudes y bloqueos asociados.

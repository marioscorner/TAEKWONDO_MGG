# TAEKWONDO MGG - Codebase Architecture Analysis

**Project Type**: Full-Stack Web Application (Master's Thesis Project)  
**Analyzed Date**: May 12, 2026  
**Version**: 0.1.0

---

## 1. TECH STACK OVERVIEW

### Frontend
- **Framework**: Next.js 15.5.6 (App Router)
- **Language**: TypeScript 5 with strict mode
- **UI Library**: React 19.0.0
- **Styling**: Tailwind CSS 3.4.1 + PostCSS
- **UI Components**: 
  - Radix UI (react-label, react-slot)
  - Lucide React (icons)
  - react-day-picker (calendar)
  - Swiper 12.0.3 (carousel)
- **Validation**: Zod 3.24.1 (schemas)
- **HTTP Client**: Axios 1.8.0

### Backend
- **Runtime**: Node.js 20 (via Docker)
- **Framework**: Next.js 15.5.6 API Routes + Server Actions
- **ORM**: Prisma 6.19.0
- **Database**: PostgreSQL 16 (Docker)
- **Authentication**: JWT (jose 5.9.6) + bcrypt 5.1.1
- **Email**: Nodemailer 7.0.12 with Gmail SMTP

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx (Alpine)
- **SSL/TLS**: Let's Encrypt via Certbot
- **Development**: ESLint 9, ts-node 10.9.2

---

## 2. DATABASE SCHEMA (Prisma Models)

### Core Models

```
User
├── id (PK), email (UNIQUE), username (UNIQUE)
├── password, role (ADMIN|INSTRUCTOR|ALUMNO)
├── firstName, lastName, phone, birthDate
├── belt, avatarUrl
└── Relations: conversations, messages, friendships, blocked users, tokens

Role Enum: ADMIN | INSTRUCTOR | ALUMNO
```

### Authentication Models
```
RefreshToken
├── id, token (UNIQUE), userId (FK)
├── expiresAt, createdAt, revoked

PasswordResetToken
├── id, token (UNIQUE), userId (FK)
├── expiresAt, used, createdAt
```

### Chat & Messaging
```
Conversation
├── id, name?, isGroup (boolean)
├── groupImageUrl?
├── Relations: participants, messages

ConversationParticipant
├── id, conversationId (FK), userId (FK)
├── joinedAt, lastReadAt (for unread counting)
├── UNIQUE(conversationId, userId)

Message
├── id, content (TEXT), conversationId (FK), senderId (FK)
├── createdAt, editedAt?, isDeleted
├── fileUrl?, fileType?, fileName?, fileSize?
```

### Relationships
```
Friendship
├── id, userId (FK), friendId (FK)
├── createdAt
├── UNIQUE(userId, friendId)

FriendRequest
├── id, fromUserId (FK), toUserId (FK)
├── message?, status (PENDING|ACCEPTED|REJECTED|CANCELLED)
├── createdAt, updatedAt
├── UNIQUE(fromUserId, toUserId)

BlockedUser
├── id, blockerId (FK), blockedId (FK)
├── createdAt
├── UNIQUE(blockerId, blockedId)
```

---

## 3. POLLING IMPLEMENTATION (Real-Time Chat)

### Hook: `useChatSocket` (/src/hooks/useChatSocket.tsx)

**Strategy**: Intelligent polling instead of WebSocket (MVP-friendly, works without custom server)

```typescript
// Polling Interval: 2 seconds when chat is active
// Updates: conversation list every 5 seconds
```

**Key Features**:
- **Message Polling**: Fetches new messages every 2 seconds
  - Endpoint: GET `/api/chat/conversations/{id}/messages?page=1&page_size=50`
  - Tracks `lastMessageIdRef` to detect new messages
  - Auto-detects duplicate messages
  
- **Typing Indicators**: 
  - Local simulation (not server-persisted yet)
  - Auto-stop after 3 seconds
  - Events: `typing.start`, `typing.stop`

- **Read Receipts**:
  - POST `/chat/conversations/{id}/read` - marks as read
  - DELETE `/chat/conversations/{id}/read` - marks as unread
  - `ConversationParticipant.lastReadAt` tracks per-user

- **Event Types**:
  ```typescript
  type ChatEvent =
    | { event: "message.new"; message: Message }
    | { event: "conversation.read"; by: number; at: string }
    | { event: "typing.start"; by: number }
    | { event: "typing.stop"; by: number }
    | { event: "error"; detail?: string }
  ```

### Chat Detail Page Integration
- Location: `/src/app/(private)/dashboard/chats/[id]/page.tsx`
- Uses `useChatSocket` hook for real-time updates
- Auto-scrolls to newest messages
- Cursor-based pagination for loading older messages
- Falls back to simple page-based pagination if cursor unavailable

---

## 4. EXISTING CHAT/MESSAGING SYSTEM

### Features Implemented

#### Conversations
- **1:1 Chats**: Private conversations between two users
- **Group Chats**: Multi-user group conversations
- **Conversation List**: 
  - Ordered by most recent
  - Unread count badge
  - Last message preview
  - Participant information

#### Messages
- Text content (max 5000 chars)
- Timestamps (ISO format)
- Sender identification
- Read/unread tracking per conversation participant
- Auto-pagination: 30-50 messages per load
- Cursor-based pagination support for infinite scroll

#### Permissions
- Only friends can start 1:1 conversations
- No duplicate 1:1 conversations (auto-detect existing)
- Blocked users cannot interact

### API Endpoints - Chat

```
GET    /api/chat/conversations              → List user's conversations
POST   /api/chat/conversations              → Create conversation (1:1 or group)
GET    /api/chat/conversations/[id]         → Get conversation details
GET    /api/chat/conversations/[id]/messages → List messages (paginated)
POST   /api/chat/conversations/[id]/messages → Send message
POST   /api/chat/conversations/[id]/read    → Mark as read
DELETE /api/chat/conversations/[id]/read    → Mark as unread
```

### Frontend Chat Components
- `ChatList.tsx` - Lists conversations with unread badges
- Chat detail page with message display
- Message input with send button
- Typing indicators
- Scroll-to-bottom auto-scroll

---

## 5. DOCUMENT HANDLING CAPABILITIES

### Current Implementation

#### File Upload
- **Endpoint**: POST `/api/upload/image`
- **Accepted**: Image files only (images/* MIME type)
- **Max Size**: 5MB
- **Storage**: Local (`/public/uploads/`)
- **Naming**: `{type}-{userId}-{randomHash}.{ext}`

#### Avatar System
- User profile avatars
- Automatic database update on upload
- Public URL: `/uploads/{filename}`

#### Message Attachments (Schema Ready)
The `Message` model includes fields for future implementation:
```typescript
fileUrl?: string        // URL of attached file
fileType?: string       // 'image', 'document', 'video'
fileName?: string       // Original filename
fileSize?: number       // Size in bytes
```

#### Group Images
- Groups support custom image (`Conversation.groupImageUrl`)
- Similar upload mechanism

### Future Expansion Points
- Document upload (PDFs, videos)
- Image preview in messages
- Document share system for curriculum
- Video hosting integration

---

## 6. USER ROLES & PERMISSIONS

### Role Hierarchy

```
ADMIN
  ├── Full system access
  ├── All instructor features
  └── Can manage users and system

INSTRUCTOR
  ├── View all students
  ├── Change student belts
  ├── Initiate chat with students
  ├── View curriculum templates
  └── Access statistics

ALUMNO (Student)
  ├── View own profile
  ├── View own belt/curriculum
  ├── Chat with friends (request-based)
  ├── Manage friendships
  └── View other users' profiles
```

### Permission Checks

**Backend Middleware** (`/src/server/middleware/auth.ts`):
```typescript
requireAuth(req)        // Verify JWT token
requireRole(user, [...])  // Check allowed roles
```

**API Endpoints Protected By**:
- Authentication check via Bearer token
- Role-based access control where needed
- Instructor panel: `requireRole(user, ['INSTRUCTOR', 'ADMIN'])`

### Automatic Relationships
- New student auto-friends with all instructors/admins
- Ensures initial communication pathway

---

## 7. FRONTEND STRUCTURE

### App Router Organization
```
src/app/
├── (public)
│   ├── page.tsx                    // Landing page
│   ├── about/page.tsx             // About instructor
│   ├── login/page.tsx             // Login form
│   ├── register/page.tsx          // Student registration
│   ├── register/instructor/       // Instructor registration
│   └── reset-password/            // Password recovery
├── (private)/dashboard/           // Protected routes
│   ├── page.tsx                   // Dashboard home
│   ├── profile/page.tsx           // User profile
│   ├── chats/                     // Messaging
│   ├── friends/                   // Friendship management
│   ├── temario/page.tsx           // Curriculum per belt
│   ├── instructor/page.tsx        // Instructor panel
│   └── layout.tsx                 // Protected layout
├── api/
│   ├── auth/                      // Login, register, refresh
│   ├── chat/                      // Messaging API
│   ├── friends/                   // Friendship API
│   ├── users/                     // Profile, search
│   ├── instructor/                // Instructor actions
│   ├── upload/                    // File uploads
│   └── health/                    // Health check
└── layout.tsx                     // Root layout
```

### Component Architecture

**Layout Components**:
- `AppLayout.tsx` - Main layout wrapper
- `HeaderPrivate.tsx` - Authenticated user header (role-aware)
- `HeaderPublic.tsx` - Public header
- `Topbar.tsx` - Top navigation
- `SidebarNav.tsx` - Side navigation with icons
- `BottomTabNavigation.tsx` - Mobile bottom nav

**Feature Components**:
- `components/chats/ChatList.tsx` - Conversation list
- `components/friends/FriendsList.tsx` - Friend list
- `components/friends/FriendsRequests.tsx` - Incoming/outgoing requests
- `components/friends/BlockedList.tsx` - Blocked users
- `components/profile/ProfileForm.tsx` - Edit profile
- `components/profile/DeleteAccountButton.tsx` - Account deletion

**UI Components** (Radix-based primitives):
- Button, Input, Card, Label, Calendar
- Dark mode toggle
- Custom styling with Tailwind

**Auth Components**:
- LoginForm
- RegisterForm
- InstructorRegisterForm
- EmailVerifyBanner

### Styling
- **Dark Mode**: Client-side toggle with persistence
- **Responsive**: Mobile-first, breakpoints: 320px, 768px, 1280px+
- **CSS**: Tailwind + CSS Modules
- **Animations**: tailwindcss-animate library

### Context Providers
- `AuthContext.tsx` - User state, login/logout
- `ThemeContext.tsx` - Dark mode state

---

## 8. BACKEND API STRUCTURE

### API Routes Organization

#### Authentication
```
POST   /api/auth/register                 → Register user
POST   /api/auth/register/instructor      → Register instructor (secret key)
POST   /api/auth/login                    → Login, return JWT tokens
POST   /api/auth/logout                   → Revoke refresh token
POST   /api/auth/refresh                  → Get new access token
POST   /api/auth/password/request-reset   → Send reset email
POST   /api/auth/password/reset           → Confirm password reset
```

#### User Management
```
GET    /api/users/profile                 → Get authenticated user
PATCH  /api/users/profile                 → Update profile (name, phone, belt)
DELETE /api/users/profile                 → Delete account
GET    /api/users/search                  → Search users by username
POST   /api/upload/image                  → Upload avatar/group image
```

#### Friendship System
```
GET    /api/friends                       → List friends
POST   /api/friends/requests              → Send friend request
GET    /api/friends/requests/mine         → Get my requests (incoming/outgoing)
PATCH  /api/friends/requests/[id]/accept  → Accept request
PATCH  /api/friends/requests/[id]/reject  → Reject request
PATCH  /api/friends/requests/[id]/cancel  → Cancel sent request
DELETE /api/friends/unfriend/[id]         → Remove friend
POST   /api/friends/block                 → Block user
DELETE /api/friends/block/[id]            → Unblock user
GET    /api/friends/blocked               → List blocked users
```

#### Chat/Messaging
```
GET    /api/chat/conversations            → List conversations
POST   /api/chat/conversations            → Create conversation
GET    /api/chat/conversations/[id]       → Get conversation details
GET    /api/chat/conversations/[id]/messages  → Get messages (paginated)
POST   /api/chat/conversations/[id]/messages  → Send message
POST   /api/chat/conversations/[id]/read  → Mark as read
DELETE /api/chat/conversations/[id]/read  → Mark as unread
```

#### Instructor Functions
```
GET    /api/instructor/students           → List all students
PATCH  /api/instructor/students/[id]/belt → Change student's belt
GET    /api/instructor/stats              → System statistics
```

#### Health & Status
```
GET    /api/health                        → Health check
GET    /health                            → Health page (public)
```

### Data Validation

**Zod Schemas** (`/src/lib/validations.ts`):
```typescript
registerSchema          // Registration validation
loginSchema            // Login validation
updateProfileSchema    // Profile update
sendMessageSchema      // Chat messages (1-5000 chars)
createConversationSchema // Create conversations
sendFriendRequestSchema // Friend requests
blockUserSchema        // Block user
paginationSchema       // Pagination params
```

### Authentication Flow

1. **Registration**:
   - Hash password with bcrypt
   - Create user with default role
   - Return auth tokens

2. **Login**:
   - Verify credentials (bcrypt compare)
   - Generate 15m access token + 7d refresh token
   - Store refresh token in DB for revocation

3. **Token Refresh**:
   - Check refresh token validity in DB
   - Generate new access token
   - Extend refresh token TTL

4. **Logout**:
   - Mark refresh token as revoked
   - Client clears localStorage tokens

### Middleware Architecture

**Auth Middleware** (`requireAuth`):
```typescript
1. Extract Bearer token from Authorization header
2. Verify JWT signature & expiration
3. Return TokenPayload or 401 error
```

**Role Check Middleware** (`requireRole`):
```typescript
1. Verify user's role matches allowed list
2. Return 403 if unauthorized
```

---

## 9. KEY FILES MAPPING

### Critical Business Logic

| File | Purpose |
|------|---------|
| `/prisma/schema.prisma` | Database schema definition |
| `/src/lib/auth-helpers.ts` | JWT generation/verification, bcrypt |
| `/src/lib/validations.ts` | Zod schemas for all inputs |
| `/src/lib/chat.ts` | Chat API client functions |
| `/src/lib/belt-colors.ts` | Belt color/level utilities |
| `/src/hooks/useChatSocket.tsx` | Polling real-time chat logic |
| `/src/server/middleware/auth.ts` | API auth/role checks |
| `/src/context/AuthContext.tsx` | Global auth state |
| `/src/app/api/chat/conversations/route.ts` | Chat API implementation |
| `/src/app/(private)/dashboard/chats/[id]/page.tsx` | Chat UI with polling |

### Feature Pages

| Path | Features |
|------|----------|
| `/dashboard` | Home dashboard |
| `/dashboard/profile` | Edit user profile, avatar upload |
| `/dashboard/friends` | Friend list, requests, management |
| `/dashboard/friends/blocked` | Blocked users list |
| `/dashboard/chats` | Conversation list |
| `/dashboard/chats/[id]` | Chat detail with real-time polling |
| `/dashboard/temario` | Curriculum by belt level |
| `/dashboard/instructor` | Instructor panel - manage students, belts |

---

## 10. BELT SYSTEM

### Belt Levels (12 total)
1. Blanco (White)
2. Blanco-Amarillo (White-Yellow)
3. Amarillo (Yellow)
4. Amarillo-Naranja (Yellow-Orange)
5. Naranja (Orange)
6. Naranja-Verde (Orange-Green)
7. Verde (Green)
8. Verde-Azul (Green-Blue)
9. Azul (Blue)
10. Azul-Rojo (Blue-Red)
11. Rojo (Red)
12. Negro (Black) - with 5 Dan levels

### Curriculum (Temario)
- Personalized content per belt level
- Topics: Posiciones, Golpes, Patadas, Poomsaes, Combate
- Video/PDF links (prepared but not yet populated)
- Progress tracking visual indicators

### Management
- Instructors/Admins can change student belts
- Automatic updates to user profile
- Belt badges visible throughout UI

---

## 11. SECURITY FEATURES

### Authentication
- ✅ JWT with HS256
- ✅ Bcrypt password hashing (salt rounds: 10)
- ✅ Refresh token rotation (7 days)
- ✅ Token revocation on logout

### Data Protection
- ✅ Zod validation on frontend & backend
- ✅ Input sanitization (email.trim().toLowerCase())
- ✅ SQL injection prevention via Prisma ORM
- ✅ CORS headers configured

### User Privacy
- ✅ User search is public (username, name, role)
- ✅ Private messages (1:1 only with friends)
- ✅ Block system to prevent unwanted contact
- ✅ Account deletion with data cascade

---

## 12. SCALABILITY & EXTENSIBILITY POINTS

### Ready for Addition
1. **WebSocket** - Replace polling with Socket.io/Hotwire
2. **Push Notifications** - Browser notifications, email alerts
3. **File Uploads** - Documents, videos (schema ready)
4. **Video Integration** - YouTube embedding, streaming
5. **Admin Dashboard** - User management, analytics
6. **Calendar** - Class schedule, event management
7. **Attendance Tracking** - Class attendance records
8. **Progress Reports** - Detailed student progress
9. **Notifications Center** - Centralized notification hub
10. **Read-Only Mode** - Cursor pagination fully implemented

### Technical Debt/Future Improvements
- Typing indicator should be server-persisted (currently local-only)
- Message editing/deletion (UI only, needs backend)
- Message reactions (schema ready, needs implementation)
- File downloads for documents
- Image optimization pipeline
- Caching strategy (Redis)
- Rate limiting
- Request logging/auditing

---

## 13. DEPLOYMENT

### Docker Setup
- **Multi-stage build** for optimized image
- **PostgreSQL 16** with health checks
- **Nginx reverse proxy** with SSL
- **Certbot** for Let's Encrypt certificates
- **Environment-based config** (.env.local for dev, .env for prod)

### Environment Variables
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
NEXT_PUBLIC_API_URL=https://your-domain.com
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## 14. PROJECT STATISTICS

### Codebase Size
- Backend API: ~3,000 lines
- Frontend: ~3,500 lines
- Configuration: ~700 lines
- Documentation: ~2,000 lines
- **Total**: ~9,200+ lines of code

### Components & Features
- ✅ 35+ API Endpoints
- ✅ 9 Database Models
- ✅ 30+ React Components
- ✅ 2 Custom Hooks (useAuth, useChatSocket)
- ✅ 2 Context providers
- ✅ 10+ Zod schemas
- ✅ 100% core features complete

---

## 15. CRITICAL FILES FOR INTEGRATION

### For Adding New Features:

**Backend**:
1. Add model to `/prisma/schema.prisma`
2. Run `npm run db:migrate`
3. Create API route in `/src/app/api/[feature]/route.ts`
4. Add auth check with `requireAuth(req)`
5. Add Zod schema to `/src/lib/validations.ts`

**Frontend**:
1. Create component in `/src/components/[feature]/`
2. Add hooks if needed to `/src/hooks/`
3. Create page in `/src/app/(private)/dashboard/[feature]/`
4. Import and use API client from `/src/lib/[feature].ts`
5. Add types to `/src/types/[feature].ts`

**Shared**:
- Validation happens in `/src/lib/validations.ts`
- API client helper in `/src/lib/api.ts`
- Auth helpers in `/src/lib/auth-helpers.ts`

---

## Summary

The **Taekwondo MGG** project is a well-architected full-stack application using modern Next.js 15, TypeScript, and Prisma. The codebase demonstrates:

✅ **Solid Foundation**: Clear separation of concerns, type safety, validated schemas  
✅ **Real-Time Communication**: Intelligent polling system for MVP (easily upgradeable to WebSocket)  
✅ **Flexible Architecture**: Extensible models ready for documents, videos, notifications  
✅ **Security**: JWT auth, bcrypt hashing, role-based access control  
✅ **Production-Ready**: Docker containerization, database migrations, error handling  
✅ **User-Centric**: Three distinct user roles, friendship system, private messaging  

The project is ready for a poll system (voting/surveys) integration and document sharing features based on the existing patterns and infrastructure.


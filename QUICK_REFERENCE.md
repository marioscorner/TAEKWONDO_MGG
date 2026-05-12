# Quick Reference Guide - Taekwondo MGG Codebase

## Project Overview
- **Type**: Full-stack Next.js 15 application (TypeScript + React 19)
- **Database**: PostgreSQL 16 with Prisma ORM
- **Deployment**: Docker + Nginx + Let's Encrypt
- **Status**: 100% core features implemented, production-ready

---

## Key Technologies
- **Frontend**: Next.js 15, React 19, Tailwind CSS, Radix UI
- **Backend**: Node.js 20, Prisma 6.19, PostgreSQL 16
- **Auth**: JWT (jose) + bcrypt for passwords
- **Real-time**: Polling (2-second intervals) for chat
- **File Storage**: Local filesystem (`/public/uploads`)

---

## Architecture at a Glance

### Database Models (9 total)
```
User ← → RefreshToken, PasswordResetToken
User ← → Friendship, FriendRequest, BlockedUser
User ← → Conversation (via ConversationParticipant)
User ← → Message
Conversation ← → Message
```

### API Structure (35+ endpoints)
- **Auth**: `/api/auth/register|login|refresh|logout|password/...`
- **Chat**: `/api/chat/conversations|messages|read`
- **Friends**: `/api/friends|requests|block|blocked`
- **Users**: `/api/users/profile|search` + `/api/upload/image`
- **Instructor**: `/api/instructor/students|stats`

### Frontend Pages
```
Public:
  / (landing page)
  /about
  /login, /register, /register/instructor
  /reset-password, /verify-email

Private (Protected):
  /dashboard (home)
  /dashboard/profile (edit user)
  /dashboard/chats (messaging)
  /dashboard/friends (friendships)
  /dashboard/temario (curriculum)
  /dashboard/instructor (manage students)
```

---

## Core Features

### 1. Real-Time Chat (Polling-Based)
**File**: `/src/hooks/useChatSocket.tsx`
- Polls every 2 seconds for new messages
- Tracks unread count via `ConversationParticipant.lastReadAt`
- Supports 1:1 and group conversations
- Typing indicators (local simulation)

**Key Endpoints**:
```
GET  /api/chat/conversations/{id}/messages  (page_size=50)
POST /api/chat/conversations/{id}/messages
POST /api/chat/conversations/{id}/read      (mark as read)
```

### 2. User Roles & Permissions
```
ADMIN     → Full access
INSTRUCTOR → View students, change belts, chat, stats
ALUMNO    → View profile, chat with friends, view curriculum
```

**Auto-relationships**: New students automatically friend all instructors/admins

### 3. Belt System (12 levels)
- Color-coded progression
- Instructor can change student belts
- Personalized curriculum per belt
- Visual indicators throughout UI

### 4. File Uploads
**Endpoint**: `POST /api/upload/image`
- Avatar uploads (auto-updates user profile)
- Group images
- Max 5MB, images only
- Stored in `/public/uploads`
- Schema ready for documents/videos

### 5. Friendship System
```
FriendRequest → PENDING|ACCEPTED|REJECTED|CANCELLED
BlockedUser → Prevents all communication
```

---

## Key Files by Feature

### Authentication
| File | Purpose |
|------|---------|
| `src/lib/auth-helpers.ts` | JWT signing/verification, bcrypt hashing |
| `src/context/AuthContext.tsx` | Global auth state + login/logout |
| `src/server/middleware/auth.ts` | API route protection |
| `src/app/api/auth/login/route.ts` | Login endpoint |

### Chat
| File | Purpose |
|------|---------|
| `src/hooks/useChatSocket.tsx` | Polling logic (core real-time implementation) |
| `src/lib/chat.ts` | Chat API client functions |
| `src/components/chats/ChatList.tsx` | Conversation list UI |
| `src/app/api/chat/conversations/route.ts` | Conversations API |
| `src/app/(private)/dashboard/chats/[id]/page.tsx` | Chat detail page |

### Database
| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Complete data model |
| `src/lib/prisma.ts` | Prisma singleton |
| `prisma/migrations/` | Database version history |

### Validation & Types
| File | Purpose |
|------|---------|
| `src/lib/validations.ts` | Zod schemas for all endpoints |
| `src/types/auth.ts` | Auth type definitions |
| `src/types/chat.ts` | Chat types (Message, Conversation, etc.) |

### Utilities
| File | Purpose |
|------|---------|
| `src/lib/belt-colors.ts` | Belt colors, level mapping |
| `src/lib/api.ts` | Axios instance + interceptors |
| `src/lib/email.ts` | Email sending (Nodemailer) |
| `src/lib/friends.ts` | Friendship API client |

---

## Common Tasks

### Adding a New API Endpoint

1. **Schema** → `/src/lib/validations.ts`
   ```typescript
   export const newFeatureSchema = z.object({ /* fields */ });
   ```

2. **Route** → `/src/app/api/feature/route.ts`
   ```typescript
   import { requireAuth } from '@/server/middleware/auth';
   
   export async function POST(req: NextRequest) {
     const user = await requireAuth(req);
     if (user instanceof NextResponse) return user;
     
     // Your endpoint logic
   }
   ```

3. **Database** (if needed) → `/prisma/schema.prisma`
   ```
   model NewModel {
     // fields
   }
   ```
   Then: `npm run db:migrate`

4. **Client** → `/src/lib/[feature].ts`
   ```typescript
   export async function newFeature(data: T) {
     return API.post('/feature', data);
   }
   ```

5. **Component** → `/src/components/[feature]/NewComponent.tsx`
   ```typescript
   import { newFeature } from '@/lib/[feature]';
   // Use the API
   ```

### Adding a New Page

1. Create folder: `/src/app/(private)/dashboard/[feature]/`
2. Add `page.tsx` with `"use client"` for client components
3. Import `useAuth()` from context to protect/check permissions
4. Use API client from `/src/lib/`

### Updating Profile

```typescript
// Backend validation
updateProfileSchema // in validations.ts

// Endpoint
PATCH /api/users/profile

// Required fields
{ firstName?, lastName?, phone?, birthDate?, belt? }
```

---

## Authentication Flow

### Login
1. POST `/api/auth/login` with email + password
2. Backend: Hash password check → Generate tokens
3. Response: `{ user, access (15m), refresh (7d) }`
4. Client: Store in localStorage, set auth context

### Refresh Token
1. Timer: Access token expires in 15 minutes
2. POST `/api/auth/refresh` with refresh token
3. Check: Token in DB, not revoked, not expired
4. Response: New access token

### Logout
1. POST `/api/auth/logout` with refresh token
2. Mark token as revoked in DB
3. Client: Clear localStorage, clear context

---

## Real-Time Chat Deep Dive

### Polling Mechanism
```typescript
// useChatSocket.tsx
const pollMessages = useCallback(async () => {
  const response = await fetch(
    `/api/chat/conversations/{id}/messages?page=1&page_size=50`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  // Compare new messages with lastMessageIdRef
  // Fire event for each new message
  // Update lastMessageIdRef
}, [conversationId]);

// Poll every 2 seconds when chat is open
useEffect(() => {
  intervalRef.current = setInterval(pollMessages, 2000);
}, [conversationId, pollMessages]);
```

### Unread Counting
```typescript
// Backend: GET /api/chat/conversations
prisma.message.count({
  where: {
    conversationId: conv.id,
    createdAt: { gt: participant.lastReadAt || new Date(0) },
    senderId: { not: user.userId }
  }
})
```

### Read Status
```typescript
// Mark as read
POST /api/chat/conversations/{id}/read
→ Updates ConversationParticipant.lastReadAt = now()

// Automatically called when user opens conversation
// or receives new message from someone else
```

---

## Database Queries Reference

### Find User with Friends
```typescript
prisma.user.findUnique({
  where: { id: userId },
  include: {
    friends: { include: { friend: true } },
    friendOf: { include: { user: true } }
  }
});
```

### List Conversations with Unread Count
```typescript
const conversations = await prisma.conversation.findMany({
  where: { participants: { some: { userId } } },
  include: {
    participants: { include: { user: true } },
    messages: { orderBy: { createdAt: 'desc' }, take: 1 }
  }
});
```

### Count Unread Messages
```typescript
prisma.message.count({
  where: {
    conversationId,
    createdAt: { gt: participant.lastReadAt || new Date(0) },
    senderId: { not: userId }
  }
});
```

---

## Deployment Checklist

- [ ] `.env` configured with production values
- [ ] Database migrations run: `npm run db:migrate:deploy`
- [ ] Docker images built and pushed
- [ ] SSL certificates generated via Certbot
- [ ] Nginx config applied
- [ ] Health check passing: GET `/api/health`
- [ ] Email service configured (Gmail SMTP)

---

## Performance Tips

1. **Chat Performance**:
   - Increase polling interval if server load high (2s → 5s)
   - Reduce page_size if messages slow (50 → 30)
   - Consider Redis caching for active conversations

2. **Database**:
   - Indexes on foreign keys (already done in schema)
   - Monitor slow queries in logs
   - Consider read replicas for high traffic

3. **Frontend**:
   - Lazy load components with `React.lazy()`
   - Code splitting handled by Next.js automatically
   - Avatar images optimized (Tailwind CSS)

---

## Common Issues & Solutions

### Chat Not Updating
- Check polling interval in `useChatSocket.tsx`
- Verify JWT token is valid and stored in localStorage
- Check API response in browser DevTools

### Unread Count Wrong
- Check `ConversationParticipant.lastReadAt` in database
- Verify `markConversationRead` is called when opening chat
- Check message timestamps in ISO format

### Login Fails
- Verify bcrypt password hash in database
- Check JWT secrets in environment variables
- Verify email case-insensitivity: `email.toLowerCase()`

### Uploads Fail
- Check `/public/uploads` directory exists and is writable
- Verify file size < 5MB
- Check MIME type is `image/*`

---

## Useful Commands

```bash
# Development
npm run dev                      # Start dev server (http://localhost:3000)

# Database
npm run db:generate            # Generate Prisma client
npm run db:migrate             # Create migration
npm run db:migrate:deploy      # Apply migrations (production)
npm run db:studio              # Prisma visual editor
npm run db:push                # Push schema to DB (dev only)

# Build & Deploy
npm run build                  # Build for production
npm start                      # Run production server

# Linting
npm run lint                   # Run ESLint
```

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/db

# Authentication
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# API
NEXT_PUBLIC_API_URL=https://your-domain.com

# Email (Gmail)
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password-16-chars

# File Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_DIR=public/uploads
```

---

This reference covers the most important aspects of the codebase for development and maintenance. See `CODEBASE_ANALYSIS.md` for detailed architecture documentation.

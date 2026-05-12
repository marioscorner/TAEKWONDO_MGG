# Taekwondo MGG Upgrade Plan

## Goals

This upgrade focuses on three improvements:

1. Replace chat polling with Socket.IO real-time messaging.
2. Add global instructor document uploads so students can download files from a Documents tab.
3. Clean the repository by removing redundant Markdown, text, environment backup, and duplicate documentation files.

## Decisions

- Real-time transport: Socket.IO.
- File storage: local filesystem under `public/uploads/documents`.
- Document visibility: global for all authenticated students.
- Allowed document types: PDF, Word, Excel, text, and images.
- Student permissions: download only.
- Timeline: balanced 4-5 week rollout.

## Phase 0: Repository Cleanup

Remove redundant files from the root directory:

- `.env`
- `.env.local.backup`
- `ANALYSIS_SUMMARY.txt`
- `RESUMEN_FUNCIONALIDADES.txt`
- `TECNOLOGIAS_PROYECTO.txt`
- `SOLUCION_SMTP.md`
- `README-DOCKER.md`

Move retained setup guides into `docs/`:

- `CONFIGURACION_EMAIL.md` -> `docs/EMAIL_SETUP.md`
- `REGISTRO_INSTRUCTOR.md` -> `docs/INSTRUCTOR_REGISTRATION.md`
- `DATABASE_LOCAL.md` -> `docs/LOCAL_DATABASE_SETUP.md`

Keep these root docs as the main references:

- `README.md`
- `DEPLOY.md`
- `CHECKLIST.md`
- `CODEBASE_ANALYSIS.md`
- `QUICK_REFERENCE.md`
- `ANALYSIS_INDEX.md`
- `IMPLEMENTATION_PLAN.md`

## Phase 1: Database Changes

Add a `Document` model to `prisma/schema.prisma`:

```prisma
model Document {
  id             Int        @id @default(autoincrement())
  name           String     @db.VarChar(255)
  description    String?    @db.Text
  fileUrl        String
  fileName       String     @db.VarChar(255)
  fileSize       Int
  fileType       String     @db.VarChar(100)
  uploadedBy     Int
  visibility     Visibility @default(PUBLIC)
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  uploader User @relation(fields: [uploadedBy], references: [id], onDelete: Cascade)

  @@index([createdAt])
  @@index([uploadedBy])
  @@index([visibility])
}

enum Visibility {
  PUBLIC
  INSTRUCTOR_ONLY
}
```

Also add `uploadedDocuments Document[]` to `User`.

Optional chat status fields for later read/delivery indicators:

```prisma
enum MessageStatus {
  SENT
  DELIVERED
  READ
}
```

Add to `Message` when implementing delivery tracking:

```prisma
status      MessageStatus @default(SENT)
deliveredAt DateTime?
readAt      DateTime?
```

Migration command:

```bash
npm run db:migrate -- --name add_documents_and_realtime_support
```

## Phase 2: Socket.IO Chat

Install dependencies:

```bash
npm install socket.io socket.io-client
```

Create:

- `src/lib/socketServer.ts` for server event definitions, authentication, conversation rooms, and broadcast helpers.
- `src/hooks/useSocket.ts` to replace `src/hooks/useChatSocket.tsx` polling behavior.

Core events:

- `conversation:join`
- `conversation:leave`
- `message:new`
- `message:delivered`
- `message:read`
- `typing:start`
- `typing:stop`

Implementation notes:

- Keep REST endpoints as the source of truth for database writes.
- Emit Socket.IO events after successful message creation.
- Join each chat into `conversation:{id}` rooms.
- Keep polling fallback only if Socket.IO is unavailable during deployment.

## Phase 3: Document API

Create endpoints:

- `POST /api/documents/upload`
- `GET /api/documents`
- `GET /api/documents/[id]`
- `DELETE /api/documents/[id]`

Upload rules:

- Only `INSTRUCTOR` and `ADMIN` can upload.
- Students can only list and download public documents.
- Maximum size: 50 MB.
- Allowed MIME types: PDF, Word, Excel, text, JPEG, PNG, GIF.
- Store files under `public/uploads/documents/YYYY/MM/{random-name}.{ext}`.
- Save original filename, MIME type, size, uploader, and timestamps in the database.

Listing rules:

- Return public documents ordered by `createdAt desc`.
- Support pagination with `page` and `page_size`.
- Optional search by name or description.

Deletion rules:

- Uploader or admin only.
- Delete both database record and local file.

## Phase 4: Documents UI

Create components:

- `src/components/documents/DocumentUploader.tsx`
- `src/components/documents/DocumentsList.tsx`
- `src/components/documents/DocumentCard.tsx`

Create pages:

- `src/app/(private)/dashboard/documents/page.tsx`
- `src/app/(private)/dashboard/instructor/documents/page.tsx`

Navigation:

- Add `Documents` to the student dashboard navigation.
- Add `Manage Documents` or a documents section inside the instructor panel.

UI behavior:

- Show most recent documents first.
- Display file type, file size, upload date, and uploader.
- Students see only a download action.
- Instructors see upload and delete actions.

## Phase 5: Verification

Run before merge/deploy:

```bash
npm run lint
npm run build
npm run db:migrate:status
```

Manual test checklist:

- Instructor can upload PDF, Word, Excel, text, and image files.
- Uploaded documents appear first in the Documents tab.
- Student can download files.
- Student cannot upload or delete files.
- Instructor can delete own documents.
- Chat messages arrive without waiting for the old 2-second polling interval.
- Typing indicators start and stop correctly.
- Socket reconnect works after network interruption.

## Balanced Timeline

- Week 1: cleanup, schema, migration, Socket.IO foundation.
- Week 2: document API and local storage.
- Week 3: documents UI and navigation.
- Week 4: chat migration from polling to sockets.
- Week 5: testing, bug fixes, deployment documentation.

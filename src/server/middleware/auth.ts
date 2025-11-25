// src/server/middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, TokenPayload } from '@/lib/auth-helpers';

export type AuthenticatedRequest = NextRequest & {
  user: TokenPayload;
};

/**
 * Middleware helper para proteger rutas API
 * Uso:
 * 
 * export async function GET(req: NextRequest) {
 *   const user = await requireAuth(req);
 *   if (user instanceof NextResponse) return user; // Es un error
 *   
 *   // user está autenticado aquí
 * }
 */
export async function requireAuth(
  req: NextRequest
): Promise<TokenPayload | NextResponse> {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json(
      { error: 'No autenticado' },
      { status: 401 }
    );
  }

  return user;
}

/**
 * Middleware para verificar roles
 */
export function requireRole(
  user: TokenPayload,
  allowedRoles: Array<'ADMIN' | 'INSTRUCTOR' | 'ALUMNO'>
): NextResponse | null {
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: 'No tienes permisos para realizar esta acción' },
      { status: 403 }
    );
  }
  return null;
}


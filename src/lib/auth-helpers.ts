// src/lib/auth-helpers.ts
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcrypt';
import { NextRequest } from 'next/server';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-me');
const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret');

export type TokenPayload = {
  userId: number;
  email: string;
  username: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'ALUMNO';
};

// ============================================
// PASSWORD HASHING
// ============================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================
// JWT - ACCESS TOKEN
// ============================================

export async function signAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m') // Token de acceso corto
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as TokenPayload;
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
}

// ============================================
// JWT - REFRESH TOKEN
// ============================================

export async function signRefreshToken(payload: { userId: number }): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Refresh token más largo
    .sign(refreshSecret);
}

export async function verifyRefreshToken(token: string): Promise<{ userId: number }> {
  try {
    const { payload } = await jwtVerify(token, refreshSecret);
    return payload as { userId: number };
  } catch (error) {
    throw new Error('Refresh token inválido o expirado');
  }
}

// ============================================
// MIDDLEWARE HELPER
// ============================================

export async function getUserFromRequest(req: NextRequest): Promise<TokenPayload | null> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    return await verifyAccessToken(token);
  } catch {
    return null;
  }
}

// ============================================
// UTILITIES
// ============================================

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function generateRandomToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}


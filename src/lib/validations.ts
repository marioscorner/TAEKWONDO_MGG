// src/lib/validations.ts
import { z } from 'zod';

// ============================================
// AUTH SCHEMAS
// ============================================

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres').max(30),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const refreshTokenSchema = z.object({
  refresh: z.string().min(1, 'Refresh token requerido'),
});

// ============================================
// USER SCHEMAS
// ============================================

export const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  birthDate: z.string().datetime().optional(),
  belt: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

// ============================================
// CHAT SCHEMAS
// ============================================

export const createConversationSchema = z.object({
  is_group: z.boolean().default(false),
  name: z.string().optional(),
  users: z.array(z.number().int().positive()).min(1, 'Debes incluir al menos un usuario'),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'El mensaje no puede estar vacío').max(5000),
});

export const editMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

// ============================================
// FRIENDS SCHEMAS
// ============================================

export const sendFriendRequestSchema = z.object({
  to_user: z.number().int().positive(),
  message: z.string().max(500).optional(),
});

export const blockUserSchema = z.object({
  user_id: z.number().int().positive(),
});

// ============================================
// PAGINATION SCHEMAS
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(100).default(20),
});

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  page_size: z.coerce.number().int().positive().max(100).default(30),
});


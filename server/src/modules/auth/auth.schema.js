// src/modules/auth/auth.schema.js
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email tidak valid.'),
  password: z.string().min(8, 'Password minimal 8 karakter.'),
  nama_lengkap: z.string().min(2).max(150),
  nim: z.string().min(5).max(20),
  prodi_id: z.number().int().positive(),
  semester: z.number().int().min(1).max(14).default(1),
  ipk: z.number().min(0).max(4).default(0),
  no_telp: z.string().max(20).optional(),
  alamat: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Password baru minimal 8 karakter.'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email tidak valid.'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, 'Password minimal 8 karakter.'),
});

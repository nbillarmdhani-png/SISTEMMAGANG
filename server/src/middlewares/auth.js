// src/middlewares/auth.js
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import prisma from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

export async function authenticate(req, res, next) {
  try {
    let token = req.cookies?.token;
    
    // Fallback to Authorization header if no cookie
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      throw new AppError('Token autentikasi tidak ditemukan.', 401);
    }
    let payload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET);
    } catch {
      throw new AppError('Token tidak valid atau sudah kedaluwarsa.', 401);
    }

    // Cek akun masih aktif di database
    const user = await prisma.users.findUnique({ where: { id: payload.userId } });
    if (!user) throw new AppError('Akun tidak ditemukan.', 401);
    if (!user.is_active) throw new AppError('Akun ini dinonaktifkan.', 401);

    req.user = { id: user.id, role: user.role };
    next();
  } catch (err) {
    next(err);
  }
}

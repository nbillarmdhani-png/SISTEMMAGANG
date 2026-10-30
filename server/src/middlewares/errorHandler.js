// src/middlewares/errorHandler.js
import { AppError } from '../utils/AppError.js';

export function errorHandler(err, req, res, next) {
  // Prisma: unique constraint violation → 409
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Data sudah ada (konflik unik).',
      errors: err.meta?.target ? [{ field: err.meta.target.join(', '), message: 'Sudah digunakan' }] : null,
    });
  }

  // Prisma: FK constraint violation → 409
  if (err.code === 'P2003') {
    return res.status(409).json({
      success: false,
      message: 'Data masih digunakan oleh data lain.',
    });
  }

  // Prisma: record not found → 404
  if (err.code === 'P2025') {
    return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
  }

  // Zod validation error
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal.',
      errors: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  // Operational error (AppError)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  // Unknown error
  console.error('[ERROR]', err);
  const isDev = process.env.NODE_ENV === 'development';
  return res.status(500).json({
    success: false,
    message: 'Kesalahan internal server.',
    ...(isDev && { error: err.message, stack: err.stack }),
  });
}

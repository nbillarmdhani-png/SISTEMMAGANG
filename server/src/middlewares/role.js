// src/middlewares/role.js
import { AppError } from '../utils/AppError.js';

/**
 * Middleware otorisasi peran.
 * @param {...string} roles - peran yang diizinkan
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError('Belum terautentikasi.', 401));
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Anda tidak memiliki akses ke sumber daya ini.', 403));
    }
    next();
  };
}

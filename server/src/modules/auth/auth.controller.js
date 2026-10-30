// src/modules/auth/auth.controller.js
import * as authService from './auth.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export async function register(req, res, next) {
  try {
    const user = await authService.register(req.body);
    sendSuccess(res, user, 'Registrasi berhasil.', 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    
    // Set token as HttpOnly Cookie
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Remove token from response body to prevent storing in localStorage
    const { token: _token, ...userData } = result;
    sendSuccess(res, userData, 'Login berhasil.');
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    });
    sendSuccess(res, null, 'Logout berhasil.');
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    sendSuccess(res, null, 'Password berhasil diubah.');
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    await authService.forgotPassword(req.body.email);
    sendSuccess(res, null, 'Jika email terdaftar, link reset password telah dikirim.');
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    sendSuccess(res, null, 'Password berhasil direset. Silakan login kembali.');
  } catch (err) {
    next(err);
  }
}

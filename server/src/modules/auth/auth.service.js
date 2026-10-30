import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';
import { createResetToken, verifyAndConsumeToken } from '../../utils/resetTokenStore.js';

export async function register(data) {
  const { email, password, nama_lengkap, nim, prodi_id, semester, ipk, no_telp, alamat } = data;

  const hash = await bcrypt.hash(password, 12);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.users.create({
      data: { email, password: hash, role: 'mahasiswa' },
    });
    const mahasiswa = await tx.mahasiswa.create({
      data: { user_id: user.id, prodi_id, nim, nama_lengkap, semester, ipk, no_telp, alamat },
    });
    return { user, mahasiswa };
  });

  return { id: result.user.id, email: result.user.email, role: result.user.role };
}

export async function login(email, password) {
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) throw new AppError('Email atau password salah.', 401);
  if (!user.is_active) throw new AppError('Akun ini dinonaktifkan oleh admin.', 401);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError('Email atau password salah.', 401);

  const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  return { token, role: user.role, id: user.id };
}

export async function getMe(userId) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      is_active: true,
      created_at: true,
      mahasiswa: {
        include: {
          program_studi: true,
          mahasiswa_kompetensi: {
            include: { kompetensi: true },
          },
        },
      },
    },
  });
  if (!user) throw new AppError('Pengguna tidak ditemukan.', 404);
  return user;
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('Pengguna tidak ditemukan.', 404);

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new AppError('Password saat ini salah.', 400);

  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.users.update({ where: { id: userId }, data: { password: hash } });
}

/**
 * T-SEC-01: Lupa Kata Sandi
 * Menghasilkan token satu kali pakai dan mengirim link reset lewat konsol
 * (Untuk produksi: integrasikan Nodemailer / layanan SMTP)
 */
export async function forgotPassword(email) {
  const user = await prisma.users.findUnique({ where: { email } });
  // Selalu kembalikan pesan sukses untuk mencegah user enumeration
  if (!user) return;

  const token = createResetToken(user.id);
  const resetLink = `${env.CLIENT_URL}/reset-password?token=${token}`;

  // --- SMTP Placeholder ---
  // Ganti console.log di bawah dengan kode Nodemailer untuk produksi:
  // await transporter.sendMail({ to: email, subject: 'Reset Password', html: `...${resetLink}...` })
  console.info(`[RESET PASSWORD] Link untuk ${email}: ${resetLink}`);
}

export async function resetPassword(token, newPassword) {
  const userId = verifyAndConsumeToken(token);
  if (!userId) throw new AppError('Token tidak valid atau sudah kedaluwarsa.', 400);

  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.users.update({ where: { id: userId }, data: { password: hash } });
}

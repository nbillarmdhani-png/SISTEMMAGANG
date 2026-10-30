import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@magang.com';
  const password = 'AdminPassword123!';

  try {
    const existingAdmin = await prisma.users.findUnique({ where: { email } });
    if (existingAdmin) {
      console.log('✅ Akun Admin sudah ada:', email);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        role: 'admin',
        is_active: 1,
      },
    });

    console.log('✅ Berhasil membuat akun Admin!');
    console.log('=============================');
    console.log(`Email    : ${email}`);
    console.log(`Password : ${password}`);
    console.log('=============================');
  } catch (err) {
    console.error('❌ Gagal membuat admin:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

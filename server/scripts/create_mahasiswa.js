import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'mahasiswa@magang.com';
  const password = 'MahasiswaPassword123!';

  try {
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      console.log('✅ Akun Mahasiswa sudah ada:', email);
      return;
    }

    // Buat program studi dummy jika belum ada
    let prodi = await prisma.program_studi.findFirst();
    if (!prodi) {
      prodi = await prisma.program_studi.create({
        data: {
          kode_prodi: 'IF',
          nama_prodi: 'Teknik Informatika',
          fakultas: 'Fakultas Ilmu Komputer',
          jenjang: 'S1'
        }
      });
      console.log('✅ Berhasil membuat Program Studi dummy.');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Buat User (role mahasiswa)
    const user = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        role: 'mahasiswa',
        is_active: 1,
      },
    });

    // Buat Profil Mahasiswa
    await prisma.mahasiswa.create({
      data: {
        user_id: user.id,
        prodi_id: prodi.id,
        nim: '1234567890',
        nama_lengkap: 'Budi Mahasiswa',
        semester: 5,
        ipk: 3.75
      }
    });

    console.log('✅ Berhasil membuat akun Mahasiswa!');
    console.log('=============================');
    console.log(`Email    : ${email}`);
    console.log(`Password : ${password}`);
    console.log('=============================');
  } catch (err) {
    console.error('❌ Gagal membuat mahasiswa:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

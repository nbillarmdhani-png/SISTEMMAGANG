import fs from 'fs';
import { fileTypeFromFile } from 'file-type';
import { AppError } from './AppError.js';

/**
 * Memvalidasi *magic numbers* dari sebuah file untuk memastikan tipenya sesuai ekspektasi.
 * Menghapus file jika tipe tidak sesuai.
 * 
 * @param {string} filePath - Path absolut file
 * @param {string[]} allowedMimeTypes - Array of allowed mimetypes
 * @returns {Promise<void>}
 */
export async function validateFileMagicNumber(filePath, allowedMimeTypes) {
  try {
    const meta = await fileTypeFromFile(filePath);
    
    if (!meta || !allowedMimeTypes.includes(meta.mime)) {
      // Hapus file secara sinkron/asinkron jika tidak valid
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw new AppError(`Isi file tidak sesuai dengan ekstensi / tipe yang diizinkan (Terdeteksi: ${meta?.mime || 'unknown'})`, 400);
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    
    // Fallback error, misalnya file tidak bisa dibaca
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new AppError('Terjadi kesalahan saat memvalidasi isi file.', 500);
  }
}

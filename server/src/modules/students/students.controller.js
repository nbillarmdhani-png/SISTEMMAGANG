import * as studentsService from './students.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { AppError } from '../../utils/AppError.js';
import { validateFileMagicNumber } from '../../utils/fileValidator.js';
import { ALLOWED_CV_TYPES, ALLOWED_IMAGE_TYPES } from '../../utils/constants.js';
import path from 'path';
import fs from 'fs';
import { env } from '../../config/env.js';

export async function getProfile(req, res, next) {
  try {
    const profile = await studentsService.getProfile(req.user.id);
    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const updated = await studentsService.updateProfile(req.user.id, req.body);
    sendSuccess(res, updated, 'Profil berhasil diperbarui.');
  } catch (err) {
    next(err);
  }
}

export async function uploadCV(req, res, next) {
  try {
    if (!req.file) throw new AppError('File CV tidak ditemukan.', 400);
    await validateFileMagicNumber(req.file.path, ALLOWED_CV_TYPES);
    
    const cv_path = req.file.filename; // You might want to store relative path like 'cv/filename.pdf'
    const updated = await studentsService.updateFiles(req.user.id, { cv_path: `cv/${cv_path}` });
    sendSuccess(res, updated, 'CV berhasil diunggah.');
  } catch (err) {
    next(err);
  }
}

export async function uploadPhoto(req, res, next) {
  try {
    if (!req.file) throw new AppError('File foto tidak ditemukan.', 400);
    await validateFileMagicNumber(req.file.path, ALLOWED_IMAGE_TYPES);
    
    const foto = req.file.filename;
    const updated = await studentsService.updateFiles(req.user.id, { foto: `photo/${foto}` });
    sendSuccess(res, updated, 'Foto berhasil diunggah.');
  } catch (err) {
    next(err);
  }
}

export async function getFile(req, res, next) {
  try {
    const { type, filename } = req.params;
    if (!['cv', 'photo'].includes(type)) throw new AppError('Tipe file tidak valid.', 400);

    const safeFilename = path.basename(filename);
    const filePath = path.resolve(env.UPLOAD_DIR, type, safeFilename);

    if (!fs.existsSync(filePath)) {
      throw new AppError('File tidak ditemukan.', 404);
    }

    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
}

export async function getCompetencies(req, res, next) {
  try {
    const competencies = await studentsService.getCompetencies(req.user.id);
    sendSuccess(res, competencies);
  } catch (err) {
    next(err);
  }
}

export async function addCompetency(req, res, next) {
  try {
    const comp = await studentsService.addCompetency(req.user.id, req.body);
    sendSuccess(res, comp, 'Kompetensi berhasil ditambahkan/diperbarui.', 201);
  } catch (err) {
    next(err);
  }
}

export async function deleteCompetency(req, res, next) {
  try {
    const kompetensiId = parseInt(req.params.kompetensiId, 10);
    if (isNaN(kompetensiId)) throw new AppError('ID Kompetensi tidak valid.', 400);
    
    await studentsService.deleteCompetency(req.user.id, kompetensiId);
    sendSuccess(res, null, 'Kompetensi berhasil dihapus.');
  } catch (err) {
    next(err);
  }
}

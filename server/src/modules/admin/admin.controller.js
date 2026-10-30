import * as adminService from './admin.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getStats(req, res, next) {
  try {
    const data = await adminService.getStats();
    sendSuccess(res, data);
  } catch (err) { next(err); }
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUsers(req, res, next) {
  try {
    const data = await adminService.getUsers();
    sendSuccess(res, data);
  } catch (err) { next(err); }
}

export async function updateUserStatus(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { is_active } = req.body;
    await adminService.updateUserStatus(id, is_active);
    sendSuccess(res, null, 'Status pengguna diperbarui.');
  } catch (err) { next(err); }
}

// ─── Companies ───────────────────────────────────────────────────────────────

export async function getCompanies(req, res, next) {
  try {
    const data = await adminService.getCompanies();
    sendSuccess(res, data);
  } catch (err) { next(err); }
}

export async function createCompany(req, res, next) {
  try {
    const data = await adminService.createCompany(req.body);
    sendSuccess(res, data, 'Mitra berhasil ditambahkan.', 201);
  } catch (err) { next(err); }
}

export async function updateCompany(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await adminService.updateCompany(id, req.body);
    sendSuccess(res, data, 'Mitra berhasil diperbarui.');
  } catch (err) { next(err); }
}

export async function deleteCompany(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    await adminService.deleteCompany(id);
    sendSuccess(res, null, 'Mitra berhasil dihapus.');
  } catch (err) { next(err); }
}

// ─── Positions ────────────────────────────────────────────────────────────────

export async function getPositions(req, res, next) {
  try {
    const data = await adminService.getPositions();
    sendSuccess(res, data);
  } catch (err) { next(err); }
}

export async function getPositionById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await adminService.getPositionById(id);
    sendSuccess(res, data);
  } catch (err) { next(err); }
}

export async function createPosition(req, res, next) {
  try {
    const data = await adminService.createPosition(req.body);
    sendSuccess(res, data, 'Posisi berhasil ditambahkan.', 201);
  } catch (err) { next(err); }
}

export async function updatePosition(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await adminService.updatePosition(id, req.body);
    sendSuccess(res, data, 'Posisi berhasil diperbarui.');
  } catch (err) { next(err); }
}

export async function deletePosition(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    await adminService.deletePosition(id);
    sendSuccess(res, null, 'Posisi berhasil dihapus.');
  } catch (err) { next(err); }
}

// ─── Competencies ─────────────────────────────────────────────────────────────

export async function getCompetencies(req, res, next) {
  try {
    const data = await adminService.getCompetencies();
    sendSuccess(res, data);
  } catch (err) { next(err); }
}

export async function createCompetency(req, res, next) {
  try {
    const data = await adminService.createCompetency(req.body);
    sendSuccess(res, data, 'Kompetensi berhasil ditambahkan.', 201);
  } catch (err) { next(err); }
}

export async function updateCompetency(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await adminService.updateCompetency(id, req.body);
    sendSuccess(res, data, 'Kompetensi berhasil diperbarui.');
  } catch (err) { next(err); }
}

export async function deleteCompetency(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    await adminService.deleteCompetency(id);
    sendSuccess(res, null, 'Kompetensi berhasil dihapus.');
  } catch (err) { next(err); }
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(req, res, next) {
  try {
    const data = await adminService.getCategories();
    sendSuccess(res, data);
  } catch (err) { next(err); }
}

export async function createCategory(req, res, next) {
  try {
    const data = await adminService.createCategory(req.body);
    sendSuccess(res, data, 'Kategori berhasil ditambahkan.', 201);
  } catch (err) { next(err); }
}

export async function updateCategory(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await adminService.updateCategory(id, req.body);
    sendSuccess(res, data, 'Kategori berhasil diperbarui.');
  } catch (err) { next(err); }
}

export async function deleteCategory(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    await adminService.deleteCategory(id);
    sendSuccess(res, null, 'Kategori berhasil dihapus.');
  } catch (err) { next(err); }
}

// ─── Study Programs ───────────────────────────────────────────────────────────

export async function getStudyPrograms(req, res, next) {
  try {
    const data = await adminService.getStudyPrograms();
    sendSuccess(res, data);
  } catch (err) { next(err); }
}

export async function createStudyProgram(req, res, next) {
  try {
    const data = await adminService.createStudyProgram(req.body);
    sendSuccess(res, data, 'Program studi berhasil ditambahkan.', 201);
  } catch (err) { next(err); }
}

export async function updateStudyProgram(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await adminService.updateStudyProgram(id, req.body);
    sendSuccess(res, data, 'Program studi berhasil diperbarui.');
  } catch (err) { next(err); }
}

export async function deleteStudyProgram(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    await adminService.deleteStudyProgram(id);
    sendSuccess(res, null, 'Program studi berhasil dihapus.');
  } catch (err) { next(err); }
}

// ─── Applications ─────────────────────────────────────────────────────────────

export async function getApplications(req, res, next) {
  try {
    const data = await adminService.getApplications();
    sendSuccess(res, data);
  } catch (err) { next(err); }
}

export async function updateApplicationStatus(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await adminService.updateApplicationStatus(id, req.body);
    sendSuccess(res, result, 'Status lamaran diperbarui.');
  } catch (err) { next(err); }
}

export async function exportApplicationsCSV(req, res, next) {
  try {
    const csv = await adminService.exportApplicationsCSV();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="lamaran-${Date.now()}.csv"`);
    res.send('\uFEFF' + csv); // BOM for Excel UTF-8
  } catch (err) { next(err); }
}

import * as applicationsService from './applications.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export async function getApplications(req, res, next) {
  try {
    const data = await applicationsService.getApplications(req.user.id);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

export async function apply(req, res, next) {
  try {
    const lamaran = await applicationsService.apply(req.user.id, req.body);
    sendSuccess(res, lamaran, 'Lamaran berhasil dikirim.', 201);
  } catch (err) {
    next(err);
  }
}

export async function cancelApplication(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const lamaran = await applicationsService.cancelApplication(req.user.id, id);
    sendSuccess(res, lamaran, 'Lamaran dibatalkan.');
  } catch (err) {
    next(err);
  }
}

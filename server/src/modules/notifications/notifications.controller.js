import * as notificationsService from './notifications.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export async function getNotifications(req, res, next) {
  try {
    const data = await notificationsService.getNotifications(req.user.id);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    await notificationsService.markAsRead(req.user.id, id);
    sendSuccess(res, null, 'Notifikasi ditandai dibaca.');
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    await notificationsService.markAllAsRead(req.user.id);
    sendSuccess(res, null, 'Semua notifikasi ditandai dibaca.');
  } catch (err) {
    next(err);
  }
}

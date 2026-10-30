import * as recommendationsService from './recommendations.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export async function getRecommendations(req, res, next) {
  try {
    const data = await recommendationsService.getRecommendations(req.user.id);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

export async function refreshRecommendations(req, res, next) {
  try {
    const data = await recommendationsService.refreshRecommendations(req.user.id);
    sendSuccess(res, data, 'Rekomendasi berhasil diperbarui.');
  } catch (err) {
    next(err);
  }
}

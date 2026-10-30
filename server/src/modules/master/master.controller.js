import * as masterService from './master.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export async function getStudyPrograms(req, res, next) {
  try {
    const data = await masterService.getStudyPrograms();
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

export async function getCompetencies(req, res, next) {
  try {
    const data = await masterService.getCompetencies();
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

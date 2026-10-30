import * as positionsService from './positions.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export async function getPositions(req, res, next) {
  try {
    const { data, meta } = await positionsService.getPositions(req.query);
    sendSuccess(res, data, 'OK', 200, meta);
  } catch (err) {
    next(err);
  }
}

export async function getPositionById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await positionsService.getPositionById(id);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

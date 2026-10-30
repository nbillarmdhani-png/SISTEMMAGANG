import * as chatbotService from './chatbot.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export async function createSession(req, res, next) {
  try {
    const session = await chatbotService.createSession(req.user.id);
    sendSuccess(res, session, 'Sesi dimulai.', 201);
  } catch (err) {
    next(err);
  }
}

export async function getSession(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await chatbotService.getSessionById(req.user.id, id);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await chatbotService.sendMessage(req.user.id, id, req.body.message);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function confirmSkills(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    await chatbotService.confirmSkills(req.user.id, id, req.body.items);
    sendSuccess(res, null, 'Kompetensi berhasil dikonfirmasi.');
  } catch (err) {
    next(err);
  }
}

export async function cancelSession(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    await chatbotService.cancelSession(req.user.id, id);
    sendSuccess(res, null, 'Sesi dibatalkan.');
  } catch (err) {
    next(err);
  }
}

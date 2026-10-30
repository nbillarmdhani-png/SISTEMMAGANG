import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { authorize } from '../../middlewares/role.js';
import { validate } from '../../middlewares/validate.js';
import { chatLimiter } from '../../middlewares/rateLimit.js';
import { messageSchema, confirmSchema } from './chatbot.schema.js';
import * as ctrl from './chatbot.controller.js';

const router = Router();

router.use(authenticate, authorize('mahasiswa'));

router.post('/', ctrl.createSession);
router.get('/:id', ctrl.getSession);
router.post('/:id/messages', chatLimiter, validate(messageSchema), ctrl.sendMessage);
router.post('/:id/confirm', validate(confirmSchema), ctrl.confirmSkills);
router.post('/:id/cancel', ctrl.cancelSession);

export default router;

import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import * as ctrl from './notifications.controller.js';

const router = Router();

router.use(authenticate); // Semua role punya notifikasi

router.get('/', ctrl.getNotifications);
router.patch('/read-all', ctrl.markAllAsRead);
router.patch('/:id/read', ctrl.markAsRead);

export default router;

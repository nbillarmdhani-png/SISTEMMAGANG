import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { authorize } from '../../middlewares/role.js';
import * as ctrl from './recommendations.controller.js';

const router = Router();

router.use(authenticate, authorize('mahasiswa'));

router.get('/', ctrl.getRecommendations);
router.post('/refresh', ctrl.refreshRecommendations);

export default router;

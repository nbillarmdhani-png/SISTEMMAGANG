import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import * as ctrl from './positions.controller.js';

const router = Router();

router.use(authenticate); // asumsi bisa diakses mahasiswa

router.get('/', ctrl.getPositions);
router.get('/:id', ctrl.getPositionById);

export default router;

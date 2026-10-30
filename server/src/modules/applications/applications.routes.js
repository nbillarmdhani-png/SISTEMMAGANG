import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { authorize } from '../../middlewares/role.js';
import { validate } from '../../middlewares/validate.js';
import { createApplicationSchema } from './applications.schema.js';
import * as ctrl from './applications.controller.js';

const router = Router();

router.use(authenticate, authorize('mahasiswa'));

router.get('/', ctrl.getApplications);
router.post('/', validate(createApplicationSchema), ctrl.apply);
router.patch('/:id/cancel', ctrl.cancelApplication);

export default router;

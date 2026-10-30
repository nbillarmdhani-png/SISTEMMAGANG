import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { authorize } from '../../middlewares/role.js';
import { validate } from '../../middlewares/validate.js';
import { uploadCV, uploadPhoto } from '../../middlewares/upload.js';
import { updateStudentSchema, addCompetencySchema } from './students.schema.js';
import * as ctrl from './students.controller.js';

const router = Router();

// Semua rute ini butuh autentikasi dan role mahasiswa
router.use(authenticate, authorize('mahasiswa'));

router.get('/me', ctrl.getProfile);
router.put('/me', validate(updateStudentSchema), ctrl.updateProfile);

router.post('/me/cv', uploadCV, ctrl.uploadCV);
router.post('/me/photo', uploadPhoto, ctrl.uploadPhoto);

router.get('/me/competencies', ctrl.getCompetencies);
router.post('/me/competencies', validate(addCompetencySchema), ctrl.addCompetency);
router.delete('/me/competencies/:kompetensiId', ctrl.deleteCompetency);

// Files (Secure)
router.get('/files/:type/:filename', authenticate, ctrl.getFile);

export default router;

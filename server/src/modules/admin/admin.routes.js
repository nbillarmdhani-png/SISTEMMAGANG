import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { authorize } from '../../middlewares/role.js';
import { validate } from '../../middlewares/validate.js';
import {
  updateApplicationStatusSchema,
  updateUserStatusSchema,
  companySchema,
  positionSchema,
  updatePositionSchema,
  competencySchema,
  categorySchema,
  studyProgramSchema,
} from './admin.schema.js';
import * as ctrl from './admin.controller.js';

const router = Router();

// Semua route admin membutuhkan autentikasi + role admin
router.use(authenticate, authorize('admin'));

// Stats
router.get('/stats', ctrl.getStats);

// Users
router.get('/users', ctrl.getUsers);
router.patch('/users/:id', validate(updateUserStatusSchema), ctrl.updateUserStatus);

// Companies (Mitra)
router.get('/companies', ctrl.getCompanies);
router.post('/companies', validate(companySchema), ctrl.createCompany);
router.put('/companies/:id', validate(companySchema.partial()), ctrl.updateCompany);
router.delete('/companies/:id', ctrl.deleteCompany);

// Positions (Lowongan)
router.get('/positions', ctrl.getPositions);
router.get('/positions/:id', ctrl.getPositionById);
router.post('/positions', validate(positionSchema), ctrl.createPosition);
router.put('/positions/:id', validate(updatePositionSchema), ctrl.updatePosition);
router.delete('/positions/:id', ctrl.deletePosition);

// Competencies
router.get('/competencies', ctrl.getCompetencies);
router.post('/competencies', validate(competencySchema), ctrl.createCompetency);
router.put('/competencies/:id', validate(competencySchema.partial()), ctrl.updateCompetency);
router.delete('/competencies/:id', ctrl.deleteCompetency);

// Categories
router.get('/competency-categories', ctrl.getCategories);
router.post('/competency-categories', validate(categorySchema), ctrl.createCategory);
router.put('/competency-categories/:id', validate(categorySchema.partial()), ctrl.updateCategory);
router.delete('/competency-categories/:id', ctrl.deleteCategory);

// Study Programs
router.get('/study-programs', ctrl.getStudyPrograms);
router.post('/study-programs', validate(studyProgramSchema), ctrl.createStudyProgram);
router.put('/study-programs/:id', validate(studyProgramSchema.partial()), ctrl.updateStudyProgram);
router.delete('/study-programs/:id', ctrl.deleteStudyProgram);

// Applications (Lamaran)
router.get('/applications', ctrl.getApplications);
router.get('/applications/export', ctrl.exportApplicationsCSV);
router.patch('/applications/:id', validate(updateApplicationStatusSchema), ctrl.updateApplicationStatus);

export default router;

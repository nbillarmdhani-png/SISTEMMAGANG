import { Router } from 'express';
import * as ctrl from './master.controller.js';

// Catatan: endpoint master sebaiknya dipecah menjadi router sesuai root-nya di app.js
// Namun karena kita taruh di satu module, kita bisa export router-nya
// Kita akan me-mount ini di app.js nanti

export const studyProgramRouter = Router();
studyProgramRouter.get('/', ctrl.getStudyPrograms);

export const competencyRouter = Router();
competencyRouter.get('/', ctrl.getCompetencies);

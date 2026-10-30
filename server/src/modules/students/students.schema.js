import { z } from 'zod';

export const updateStudentSchema = z.object({
  nama_lengkap: z.string().min(2).max(150),
  semester: z.number().int().min(1).max(14),
  ipk: z.number().min(0).max(4),
  no_telp: z.string().max(20).optional(),
  alamat: z.string().optional(),
  porto_url: z.string().url().optional().or(z.literal('')),
});

export const addCompetencySchema = z.object({
  kompetensi_id: z.number().int().positive(),
  level: z.enum(['pemula', 'menengah', 'mahir']),
  bukti_url: z.string().url().optional().or(z.literal('')),
});

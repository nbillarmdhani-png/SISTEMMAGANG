import { z } from 'zod';

export const createApplicationSchema = z.object({
  lowongan_id: z.number().int().positive(),
  surat_pengantar: z.string().optional(),
  sumber_rekomendasi: z.boolean().default(false),
});

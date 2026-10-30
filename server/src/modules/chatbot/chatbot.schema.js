import { z } from 'zod';

export const messageSchema = z.object({
  message: z.string().min(1).max(500),
});

export const confirmSchema = z.object({
  items: z.array(z.object({
    id: z.number().int().positive(), // ID chatbot_kompetensi_terdeteksi
    level: z.enum(['pemula', 'menengah', 'mahir']),
  })),
});

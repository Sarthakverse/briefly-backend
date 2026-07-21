import { z } from 'zod';

export const createMeetingSchema = z.object({
  title: z.string().min(1),
  adapterId: z.string().uuid(),
  releaseId: z.string().uuid(),
  enhancementId: z.string().uuid(),
});
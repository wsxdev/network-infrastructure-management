import { z } from 'zod';

export const acknowledgeAlertSchema = z.object({
  notes: z.string().max(250).optional()
});

import { z } from 'nestjs-zod/z';

import { buildPageSchema } from 'src/pagination/schemas/page.schema';
import { Activity } from './activity.schema';

export const activitiesPageSchema = buildPageSchema(Activity);

export const ActivitiesPage = activitiesPageSchema.brand('ActivitiesPage');
export type ActivitiesPage = z.infer<typeof activitiesPageSchema>;

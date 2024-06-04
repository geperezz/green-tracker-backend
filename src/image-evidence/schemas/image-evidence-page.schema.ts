import { z } from 'nestjs-zod/z';

import { buildPageSchema } from 'src/pagination/schemas/page.schema';
import { ImageEvidence } from './image-evidence.schema';

export const ImageEvidencePageSchema = buildPageSchema(ImageEvidence);

export const ImageEvidencePage =
  ImageEvidencePageSchema.brand('ImageEvidencePage');
export type ImageEvidencePage = z.infer<typeof ImageEvidencePage>;

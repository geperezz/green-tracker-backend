import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';
import { EvidenceFeedbackUniqueTrait } from '../schemas/evidence-feedback-unique-trait.schema';

export const evidenceFeedbackUniqueTraitDtoSchema = EvidenceFeedbackUniqueTrait;

type InferredEvidenceFeedbackUniqueTraitDto = z.infer<
  typeof evidenceFeedbackUniqueTraitDtoSchema
>;

export class EvidenceFeedbackUniqueTraitDto extends createZodDto(
  evidenceFeedbackUniqueTraitDtoSchema,
) {
  activityId: InferredEvidenceFeedbackUniqueTraitDto['activityId'] = super
    .activityId;
  evidenceNumber: InferredEvidenceFeedbackUniqueTraitDto['evidenceNumber'] =
    super.evidenceNumber;
  feedback: InferredEvidenceFeedbackUniqueTraitDto['feedback'] = super.feedback;
}


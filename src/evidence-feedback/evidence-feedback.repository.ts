import { Inject, Injectable } from '@nestjs/common';
import { SQL, and, count, eq } from 'drizzle-orm';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { evidenceFeedbackTable } from './evidence-feedback.table';
import { PaginationOptions } from 'src/pagination/schemas/pagination-options.schema';
import { EvidenceFeedbackCreation } from './schemas/evidence-feedback-creation.schema';
import { EvidenceFeedback } from './schemas/evidence-feedback.schema';

export abstract class CriteriaRepositoryError extends Error {}
export class CriterionNotFoundError extends CriteriaRepositoryError {}

@Injectable()
export class EvidenceFeedbackRepository {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
  ) {}

  async createEvidenceFeedback(
    creationData: EvidenceFeedbackCreation,
    transaction?: DrizzleTransaction,
  ): Promise<EvidenceFeedback> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.createEvidenceFeedback(creationData, transaction);
      });
    }

    const [createdEvidenceFeedback] = await transaction
      .insert(evidenceFeedbackTable)
      .values(creationData)
      .returning();

    return EvidenceFeedback.parse(createdEvidenceFeedback);
  }

  
}

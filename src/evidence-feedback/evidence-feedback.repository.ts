import { Inject, Injectable } from '@nestjs/common';
import { SQL, and, eq } from 'drizzle-orm';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { evidenceFeedbackTable } from './evidence-feedback.table';
import { EvidenceFeedbackCreation } from './schemas/evidence-feedback-creation.schema';
import { EvidenceFeedback } from './schemas/evidence-feedback.schema';
import { EvidenceFeedbackUniqueTrait } from './schemas/evidence-feedback-unique-trait.schema';
import { EvidenceUniqueTrait } from 'src/evidence/schemas/evidence-unique-trait.schema';
import { EvidenceFeedbackReplacement } from './schemas/evidence-feedback-replacement.schema';
import { ActivityUniqueTrait } from 'src/activities/schemas/activity-unique-trait.schema';

export abstract class EvidenceFeedbackRepositoryError extends Error {}
export class EvidenceFeedbackNotFoundError extends EvidenceFeedbackRepositoryError {}

@Injectable()
export class EvidenceFeedbackRepository {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
  ) {}

  async create(
    creationData: EvidenceFeedbackCreation,
    transaction?: DrizzleTransaction,
  ): Promise<EvidenceFeedback> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.create(creationData, transaction);
      });
    }

    const [createdEvidenceFeedback] = await transaction
      .insert(evidenceFeedbackTable)
      .values(creationData)
      .returning();

    return EvidenceFeedback.parse(createdEvidenceFeedback);
  }

  async findOne(
    uniqueTrait: EvidenceFeedbackUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<EvidenceFeedback | null> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findOne(uniqueTrait, transaction);
      });
    }

    const [foundEvidenceFeedback = null] = await transaction
      .select()
      .from(evidenceFeedbackTable)
      .where(this.transformUniqueTraitToWhereConditions(uniqueTrait));

    if (!foundEvidenceFeedback) {
      return null;
    }
    return EvidenceFeedback.parse(foundEvidenceFeedback);
  }

  async update(
    uniqueTrait: EvidenceFeedbackUniqueTrait,
    updateData: EvidenceFeedbackReplacement,
    transaction?: DrizzleTransaction,
  ): Promise<EvidenceFeedback> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.update(uniqueTrait, updateData, transaction);
      });
    }

    const [updatedEvidenceFeedback = null] = await transaction
      .update(evidenceFeedbackTable)
      .set(updateData)
      .where(this.transformUniqueTraitToWhereConditions(uniqueTrait))
      .returning();

    if (!updatedEvidenceFeedback) {
      throw new EvidenceFeedbackNotFoundError();
    }

    return EvidenceFeedback.parse(updatedEvidenceFeedback);
  }

  async delete(
    uniqueTrait: EvidenceFeedbackUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<EvidenceFeedback> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.delete(uniqueTrait, transaction);
      });
    }

    const [deletedEvidenceFeedback = null] = await transaction
      .delete(evidenceFeedbackTable)
      .where(this.transformUniqueTraitToWhereConditions(uniqueTrait))
      .returning();

    if (!deletedEvidenceFeedback) {
      throw new EvidenceFeedbackNotFoundError();
    }

    return EvidenceFeedback.parse(deletedEvidenceFeedback);
  }

  async deleteAllInActivity(
    activityUniqueTrait: ActivityUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<EvidenceFeedback[]> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.deleteAllInActivity(activityUniqueTrait, transaction);
      });
    }

    const deletedEvidenceFeedback = await transaction
      .delete(evidenceFeedbackTable)
      .where(eq(evidenceFeedbackTable.activityId, activityUniqueTrait.id))
      .returning();

    if (!deletedEvidenceFeedback) {
      throw new EvidenceFeedbackNotFoundError();
    }

    return await Promise.all(
      deletedEvidenceFeedback.map((feedback) =>
        EvidenceFeedback.parse(feedback),
      ),
    );
  }

  async findAll(
    evidenceUniqueTrait: EvidenceUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<EvidenceFeedback[]> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findAll(evidenceUniqueTrait, transaction);
      });
    }

    const foundEvidenceFeedback = await transaction
      .select()
      .from(evidenceFeedbackTable)
      .where(
        and(
          eq(evidenceFeedbackTable.activityId, evidenceUniqueTrait.activityId),
          eq(
            evidenceFeedbackTable.evidenceNumber,
            evidenceUniqueTrait.evidenceNumber,
          ),
        ),
      );

    return await Promise.all(
      foundEvidenceFeedback.map((feedback) => EvidenceFeedback.parse(feedback)),
    );
  }

  private transformUniqueTraitToWhereConditions(
    uniqueTrait: EvidenceFeedbackUniqueTrait,
  ): SQL | undefined {
    return and(
      eq(evidenceFeedbackTable.activityId, uniqueTrait.activityId),
      eq(evidenceFeedbackTable.evidenceNumber, uniqueTrait.evidenceNumber),
      eq(evidenceFeedbackTable.feedback, uniqueTrait.feedback),
    );
  }
}

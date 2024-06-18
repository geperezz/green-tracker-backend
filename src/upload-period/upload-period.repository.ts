import { Body, Inject, Injectable } from '@nestjs/common';
import { count, eq } from 'drizzle-orm';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { uploadPeriodTable } from './upload-period.table';
import { UploadPeriodReplacementDto } from './dtos/upload-period-replacement.dto';
import { UploadPeriodDto } from './dtos/upload-period.dto';
import { UploadPeriod } from './schemas/upload-period.schema';

export abstract class UploadPeriodRepositoryError extends Error {}
export class UploadPeriodNotFoundError extends UploadPeriodRepositoryError {}

@Injectable()
export class UploadPeriodRepository {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
  ) {}

  async create(
    creationData: UploadPeriodDto,
    transaction?: DrizzleTransaction,
  ): Promise<UploadPeriodDto> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [createdUploadPeriod] = await transaction
          .insert(uploadPeriodTable)
          .values(creationData)
          .returning();

        return UploadPeriodDto.create(createdUploadPeriod);
      },
    );
  }

  async findAll(
    transaction?: DrizzleTransaction,
  ): Promise<UploadPeriodDto | null> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [foundUploadPeriod = null] = await transaction
          .select()
          .from(uploadPeriodTable);

        if (!foundUploadPeriod) {
          return null;
        }
        return UploadPeriod.parse(foundUploadPeriod);
      },
    );
  }

  async replace(
    replacementData: UploadPeriodReplacementDto,
    transaction?: DrizzleTransaction,
  ): Promise<UploadPeriod> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [replacedUploadPeriod = null] = await transaction
          .update(uploadPeriodTable)
          .set(replacementData)
          .returning();
        if (!replacedUploadPeriod) {
          throw new UploadPeriodNotFoundError();
        }

        return UploadPeriod.parse(replacedUploadPeriod);
      },
    );
  }
}

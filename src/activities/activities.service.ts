import { Inject, Injectable } from '@nestjs/common';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { PaginationOptions } from 'src/pagination/schemas/pagination-options.schema';
import { ActivityCreation } from './schemas/activity-creation.schema';
import { ActivityUniqueTrait } from './schemas/activity-unique-trait.schema';
import { ActivityReplacement } from './schemas/activity-replacement.schema';
import { ActivityCreationDto } from './dtos/activity-creation.dto';
import { ActivityUniqueTraitDto } from './dtos/activity-unique-trait.dto';
import { ActivityDto } from './dtos/activity.dto';
import {
  ActivitiesRepository,
  ActivityNotFoundError as ActivityNotFoundRepositoryError,
} from './activities.repository';
import { ActivitiesPageDto } from './dtos/activities-page.dto';
import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { ActivityReplacementDto } from './dtos/activity-replacement.dto';
import { EvidenceService } from 'src/evidence/evidence.service';
import { ActivityUniqueTraitDto as EvidenceActivityUniqueTraitDto } from 'src/evidence/dtos/activity-unique-trait.dto';
import { ActivityFiltersDto } from './dtos/activity-filters.dto';
import { ActivityFilters } from './schemas/activity-filters.schema';
import { UnitsService } from 'src/units/units.service';
import { MailerService } from '@nestjs-modules/mailer';
import { UploadPeriodService } from 'src/upload-period/upload-period.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Activity } from './schemas/activity.schema';
import { activitiesTable } from './activities.table';
import { and, eq } from 'drizzle-orm';
import { evidenceTable } from 'src/evidence/evidence.table';
import { evidenceFeedbackTable } from 'src/evidence-feedback/evidence-feedback.table';
import { ActivityWithEvidencesAndFeedbacks } from './schemas/activity-evidence-feedback.schema';
import { UserUniqueTrait } from 'src/users/schemas/user-unique-trait.schema';
import { ActivityWithEvidencesAndFeedbacksDto } from './dtos/activity-evidence-feedback.dto';
import { EvidenceFeedbackRepository } from 'src/evidence-feedback/evidence-feedback.repository';
import { EvidenceUniqueTrait } from 'src/evidence/schemas/evidence-unique-trait.schema';
import { EvidenceFeedback } from 'src/evidence-feedback/schemas/evidence-feedback.schema';
import { EvidenceFeedbackDto } from 'src/evidence-feedback/dtos/evidence-feedback.dto';

export abstract class ActivitiesServiceError extends Error {}
export class ActivityNotFoundError extends ActivitiesServiceError {}

@Injectable()
export class ActivitiesService {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
    private readonly activitiesRepository: ActivitiesRepository,
    private readonly evidenceService: EvidenceService,
    private readonly evidenceFeedbackRepository: EvidenceFeedbackRepository,
    private readonly unitsService: UnitsService,
    private readonly mailerService: MailerService,
    private readonly uploadPeriodService: UploadPeriodService,
  ) {}

  async create(
    activityCreationDto: ActivityCreationDto,
    transaction?: DrizzleTransaction,
  ): Promise<ActivityDto> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.create(activityCreationDto, transaction);
      });
    }

    const activity = await this.activitiesRepository.create(
      ActivityCreation.parse(activityCreationDto),
      transaction,
    );

    return ActivityDto.create({ ...activity, evidence: [] });
  }

  async findOne(
    activityUniqueTraitDto: ActivityUniqueTraitDto,
    filters: ActivityFiltersDto,
    transaction?: DrizzleTransaction,
  ): Promise<ActivityWithEvidencesAndFeedbacksDto | null> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findOne(activityUniqueTraitDto, filters, transaction);
      });
    }

    const activity = await this.activitiesRepository.findOne(
      ActivityUniqueTrait.parse(activityUniqueTraitDto),
      ActivityFilters.parse(filters),
      transaction,
    );
    if (!activity) {
      return null;
    }

    const evidences = await this.evidenceService.findAll(
      EvidenceActivityUniqueTraitDto.create({ activityId: activity.id }),
      transaction,
    );

    const evidenceWithFeedbacks = await Promise.all(
      evidences.map(async (evidence) => {
        const feedbacks = await this.evidenceFeedbackRepository.findAll(
          EvidenceUniqueTrait.parse({
            activityId: activityUniqueTraitDto.id,
            evidenceNumber: evidence.evidenceNumber,
          }),
        );

        return {
          ...evidence,
          feedbacks: feedbacks.map((feedback) => ({
            ...feedback,
          })),
        };
      }),
    );

    return ActivityWithEvidencesAndFeedbacksDto.create({
      ...activity,
      evidences: evidenceWithFeedbacks,
    });
  }

  async findPage(
    paginationOptionsDto: PaginationOptionsDto,
    filters: ActivityFiltersDto,
    transaction?: DrizzleTransaction,
  ): Promise<ActivitiesPageDto> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findPage(paginationOptionsDto, filters, transaction);
      });
    }

    const activitySchemasPage = await this.activitiesRepository.findPage(
      PaginationOptions.parse(paginationOptionsDto),
      ActivityFilters.parse(filters),
      transaction,
    );

    const activityDtosPage = {
      ...activitySchemasPage,
      items: await Promise.all(
        activitySchemasPage.items.map(async (activity) => {
          const evidence = await this.evidenceService.findAll(
            EvidenceActivityUniqueTraitDto.create({
              activityId: activity.id,
            }),
            transaction,
          );
          return ActivityDto.create({ ...activity, evidence });
        }),
      ),
    };

    return activityDtosPage;
  }

  async replace(
    activityUniqueTraitDto: ActivityUniqueTraitDto,
    activityReplacementDto: ActivityReplacementDto,
    transaction?: DrizzleTransaction,
  ): Promise<ActivityDto> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.replace(
          activityUniqueTraitDto,
          activityReplacementDto,
          transaction,
        );
      });
    }

    try {
      const newActivity = await this.activitiesRepository.replace(
        ActivityUniqueTrait.parse(activityUniqueTraitDto),
        ActivityReplacement.parse(activityReplacementDto),
        transaction,
      );

      const evidence = await this.evidenceService.findAll(
        EvidenceActivityUniqueTraitDto.create({
          activityId: newActivity.id,
        }),
        transaction,
      );

      const feedback = await this.evidenceService.findAll(
        EvidenceActivityUniqueTraitDto.create({
          activityId: newActivity.id,
        }),
        transaction,
      );

      return ActivityDto.create({ ...newActivity, evidence });
    } catch (error) {
      if (error instanceof ActivityNotFoundRepositoryError) {
        throw new ActivityNotFoundError();
      }
      throw error;
    }
  }

  async delete(
    activityUniqueTraitDto: ActivityUniqueTraitDto,
    filters: ActivityFiltersDto,
    transaction?: DrizzleTransaction,
  ): Promise<ActivityDto> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.delete(activityUniqueTraitDto, filters, transaction);
      });
    }

    try {
      const evidence = await this.evidenceService.findAll(
        EvidenceActivityUniqueTraitDto.create({
          activityId: activityUniqueTraitDto.id,
        }),
        transaction,
      );

      const activity = await this.activitiesRepository.delete(
        ActivityUniqueTrait.parse(activityUniqueTraitDto),
        ActivityFilters.parse(filters),
        transaction,
      );

      return ActivityDto.create({ ...activity, evidence });
    } catch (error) {
      if (error instanceof ActivityNotFoundRepositoryError) {
        throw new ActivityNotFoundError();
      }
      throw error;
    }
  }

  async findAllCurrent(
    filters: ActivityFiltersDto,
    transaction?: DrizzleTransaction,
  ): Promise<Activity[]> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findAllCurrent(filters, transaction);
      });
    }

    const uploadPeriod = await this.uploadPeriodService.findAll(transaction);
    if (!uploadPeriod) return [];

    const parsedFilters = ActivityFilters.parse(filters);
    return await this.activitiesRepository.findMany(
      ActivityFilters.parse({
        ...parsedFilters,
        uploadTimestamp: {
          eq: parsedFilters.uploadTimestamp,
          gte: new Date(uploadPeriod.startTimestamp),
          lte: new Date(uploadPeriod.endTimestamp),
        },
      }),
      transaction,
    );
  }

  async findAllWithFeedbacks(
    unitUniqueTrait: UserUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<ActivityWithEvidencesAndFeedbacksDto[]> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findAllWithFeedbacks(unitUniqueTrait, transaction);
      });
    }

    const activities = await transaction
      .select()
      .from(activitiesTable)
      .where(eq(activitiesTable.unitId, unitUniqueTrait.id));
    if (!activities) return [];

    const TactivitiesWithEvidenceAndFeedbacks = await Promise.all(
      activities.map(async (activity) => {
        const activityWithEvidenceAndFeedbacks = await this.findOne(
          ActivityUniqueTraitDto.create({ id: activity.id }),
          ActivityFiltersDto.create({}),
        );
        return activityWithEvidenceAndFeedbacks;
      }),
    );

    return TactivitiesWithEvidenceAndFeedbacks.filter(
      (activity) => activity !== null,
    ) as ActivityWithEvidencesAndFeedbacksDto[];
  }

  async deleteAllFeedbacks(
    activityUniqueTraitDto: ActivityUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<EvidenceFeedbackDto[]> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.deleteAllFeedbacks(
          activityUniqueTraitDto,
          transaction,
        );
      });
    }

    return await this.evidenceFeedbackRepository.deleteAllInActivity(
      ActivityUniqueTrait.parse(activityUniqueTraitDto),
      transaction,
    );
  }

  @Cron(CronExpression.EVERY_WEEK)
  async sendPreDeadlineReminder() {
    try {
      if (!(await this.uploadPeriodService.isCurrentUploadPeriodLastMonth()))
        return;

      const uploadPeriod = await this.uploadPeriodService.findAll();
      if (!uploadPeriod) return;

      const unitsWithoutActivitiesEmails: string[] = [];
      const units = await this.unitsService.findAll();

      for (const unit of units) {
        const activities = await this.findAllCurrent(
          ActivityFilters.parse({ unitId: unit.id }),
        );

        if (!activities.length) {
          unitsWithoutActivitiesEmails.push(unit.email);
        }
      }

      if (!unitsWithoutActivitiesEmails.length) return;

      await this.mailerService.sendMail({
        to: unitsWithoutActivitiesEmails,
        subject: `Recuerde subir sus actividades - GreenTracker`,
        template: './endReminder',
        context: {
          unit: 'unidad',
          endTimestamp: uploadPeriod.endTimestamp.toLocaleDateString('es-ES'),
        },
        attachments: [
          {
            filename: 'logo.png',
            path: 'src/templates/assets/logo.png',
            cid: 'logo',
          },
        ],
      });
    } catch (error) {
      throw new Error(
        'An unexpected situation ocurred while sending the before deadline reminder emails',
        error,
      );
    }
  }
}

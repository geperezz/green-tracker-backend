import { Inject, Injectable } from '@nestjs/common';

const docx = require('docx');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Header,
  HeadingLevel,
  AlignmentType,
} = docx;

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { PaginationOptions } from 'src/pagination/schemas/pagination-options.schema';
import { CriterionCreation } from './schemas/criterion-creation.schema';
import { Criterion } from './schemas/criterion.schema';
import { CriteriaPage } from './schemas/criteria-page.schema';
import { CriterionReplacement } from './schemas/criterion-replacement.schema';
import { CriterionUniqueTrait } from './schemas/criterion-unique-trait.schema';
import { CriterionFilters } from './schemas/criterion-filters.schema';
import { CriterionUpdate } from './schemas/criterion-update.schema';
import { ActivitiesService } from 'src/activities/activities.service';
import { ActivityFilters } from 'src/activities/schemas/activity-filters.schema';
import { UnitsService } from 'src/units/units.service';
import { EvidenceService } from 'src/evidence/evidence.service';
import { ActivityUniqueTraitDto } from 'src/evidence/dtos/activity-unique-trait.dto';
import { CriteriaRepository } from './criteria.repository';

export abstract class CriteriaRepositoryError extends Error {}
export class CriterionNotFoundError extends CriteriaRepositoryError {}

@Injectable()
export class CriteriaService {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
    private readonly criteriaRepository: CriteriaRepository,
    private readonly activitiesService: ActivitiesService,
    private readonly unitsService: UnitsService,
    private readonly evidenceService: EvidenceService,
  ) {}

  async createCriterion(
    creationData: CriterionCreation,
    transaction?: DrizzleTransaction,
  ): Promise<Criterion> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.createCriterion(creationData, transaction);
      });
    }

    return await this.criteriaRepository.createCriterion(
      creationData,
      transaction,
    );
  }

  async findCriterion(
    uniqueTrait: CriterionUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<Criterion | null> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findCriterion(uniqueTrait, transaction);
      });
    }

    return await this.criteriaRepository.findCriterion(
      uniqueTrait,
      transaction,
    );
  }

  async findCriteriaPage(
    paginationOptions: PaginationOptions,
    filters?: CriterionFilters,
    transaction?: DrizzleTransaction,
  ): Promise<CriteriaPage> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findCriteriaPage(
          paginationOptions,
          filters,
          transaction,
        );
      });
    }

    return await this.criteriaRepository.findCriteriaPage(
      paginationOptions,
      filters,
      transaction,
    );
  }

  async findManyCriteria(
    filters?: CriterionFilters,
    transaction?: DrizzleTransaction,
  ): Promise<Criterion[]> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findManyCriteria(filters, transaction);
      });
    }

    return await this.criteriaRepository.findManyCriteria(filters, transaction);
  }

  async updateCriterion(
    uniqueTrait: CriterionUniqueTrait,
    updateData: CriterionUpdate,
    transaction?: DrizzleTransaction,
  ): Promise<Criterion> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.updateCriterion(uniqueTrait, updateData, transaction);
      });
    }

    return await this.criteriaRepository.updateCriterion(
      uniqueTrait,
      updateData,
      transaction,
    );
  }

  async replaceCriterion(
    uniqueTrait: CriterionUniqueTrait,
    replacementData: CriterionReplacement,
    transaction?: DrizzleTransaction,
  ): Promise<Criterion> {
    return await this.criteriaRepository.replaceCriterion(
      uniqueTrait,
      replacementData,
      transaction,
    );
  }

  async deleteCriterion(
    uniqueTrait: CriterionUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<Criterion> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.deleteCriterion(uniqueTrait, transaction);
      });
    }

    return await this.criteriaRepository.deleteCriterion(
      uniqueTrait,
      transaction,
    );
  }

  async generateReport(
    uniqueTrait: CriterionUniqueTrait,
  ): Promise<Buffer | null> {
    const criterion = await this.findCriterion(uniqueTrait);
    if (!criterion || !criterion.categoryName) return null;

    //cuando se vaya a main, revisar
    const build = async () => {
      let paragraphArray = [];

      const units = await this.unitsService.findAll();
      for (const unit of units) {
        paragraphArray.push(
          new Paragraph({
            text: `Unidad: ${unit.name} - Actividades`,
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
          }),
        );
        const activities = await this.activitiesService.findAllCurrent(
          ActivityFilters.parse({
            categoryName: criterion?.categoryName,
            unitId: unit.id,
          }),
        );
        for (const activity of activities) {
          paragraphArray.push(
            new Paragraph({
              text: `Actividad: ${activity.name}`,
              heading: HeadingLevel.HEADING_3,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Resumen: ',
                  bold: true,
                }),
                new TextRun({
                  text: activity.summary,
                }),
              ],
            }),
            new Paragraph({
              text: `Evidencias:`,
              heading: HeadingLevel.HEADING_4,
              alignment: AlignmentType.CENTER,
            }),
          );
          const evidences = await this.evidenceService.findAll(
            ActivityUniqueTraitDto.create({ activityId: activity.id }),
          );
          for (const evidence of evidences) {
            paragraphArray.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Descripción: ',
                    bold: true,
                  }),
                  new TextRun({
                    text: evidence.description,
                  }),
                ],
              }),
            );
          }
        }
      }
      return paragraphArray;
    };

    const doc = new Document({
      sections: [
        {
          properties: {},
          headers: {
            default: new Header({
              children: [new Paragraph('Reporte - Criterio 1')],
            }),
          },
          children: [
            new Paragraph({
              text: 'Reporte - Criterio 1',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            ...(await build()),
          ],
        },
      ],
    });

    return Packer.toBuffer(doc);
  }
}

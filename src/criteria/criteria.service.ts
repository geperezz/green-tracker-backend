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
  ExternalHyperlink,
  ImageRun,
} = docx;
import { readFileSync } from 'fs';

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
import { paragraphStyles } from 'src/templates/report/report-styles';
import { header } from 'src/templates/report/header';
import { imageResize } from 'src/templates/report/image-resize';
import { IndicatorsRepository } from 'src/indicators/indicators.repository';
import { IndicatorUniqueTrait } from 'src/indicators/schemas/indicator-unique-trait.schema';

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
    private readonly indicatorsRepository: IndicatorsRepository,
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
    const indicator = await this.indicatorsRepository.findOne(
      IndicatorUniqueTrait.parse({ index: criterion.indicatorIndex }),
    );

    const url = process.env.URL_BACKEND;

    const dictionary = {
      link: 'enlace',
      image: 'imagen',
      document: 'archivo',
    };

    const build = async () => {
      let paragraphArray = [];

      const units = await this.unitsService.findAll();
      for (const unit of units) {
        paragraphArray.push(
          new Paragraph({ text: '' }),
          new Paragraph({
            text: `Unidad: ${unit.name}`,
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
        //if unit has no activities, dont show in report
        if (!activities.length) paragraphArray.pop();
        for (const activity of activities) {
          paragraphArray.push(
            new Paragraph({
              text: `Actividad: ${activity.name}`,
              heading: HeadingLevel.HEADING_3,
              alignment: AlignmentType.LEFT,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: '\tResumen: ',
                  bold: true,
                }),
                new TextRun({
                  text: activity.summary,
                }),
              ],
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
              text: `\tEvidencias:`,
              heading: HeadingLevel.HEADING_4,
              alignment: AlignmentType.LEFT,
            }),
          );
          const evidences = await this.evidenceService.findAll(
            ActivityUniqueTraitDto.create({ activityId: activity.id }),
          );
          if (!evidences.length) {
            paragraphArray.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: '\t\tNo hay evidencias para esta actividad.',
                  }),
                ],
              }),
            );
          }
          for (const evidence of evidences) {
            paragraphArray.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: '\t\tTipo de evidencia: ',
                    bold: true,
                  }),
                  new TextRun({
                    text: dictionary[evidence.type],
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: '\t\tDescripción: ',
                    bold: true,
                  }),
                  new TextRun({
                    text: evidence.description,
                  }),
                ],
              }),
            );

            //if it is an external link, show as is. Else, show with current URL_BACKEND
            const link =
              evidence.type == 'link'
                ? evidence.link
                : `${url}${evidence.link}`;
            paragraphArray.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: '\t\tEnlace: ',
                    bold: true,
                  }),
                  new ExternalHyperlink({
                    children: [
                      new TextRun({
                        text: link,
                        style: 'Hyperlink',
                      }),
                    ],
                    link: link,
                  }),
                ],
              }),
            );

            if (evidence.type == 'image') {
              const [width, height] = imageResize(`dist${evidence.link}`);
              if (evidence.linkToRelatedResource) {
                paragraphArray.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: '\t\tEnlace relacionado: ',
                        bold: true,
                      }),
                      new ExternalHyperlink({
                        children: [
                          new TextRun({
                            text: evidence.linkToRelatedResource,
                            style: 'Hyperlink',
                          }),
                        ],
                        link: evidence.linkToRelatedResource,
                      }),
                    ],
                  }),
                );
              }
              paragraphArray.push(
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new ImageRun({
                      data: readFileSync(`dist${evidence.link}`),
                      transformation: {
                        width: width,
                        height: height,
                      },
                    }),
                  ],
                }),
              );
            }
            //evidences divider
            paragraphArray.push(
              new Paragraph({
                text: '',
              }),
              new Paragraph({
                text: '',
                border: {
                  top: {
                    color: 'auto',
                    space: 1,
                    style: 'single',
                    size: 6,
                  },
                },
              }),
            );
          }
        }
      }
      return paragraphArray;
    };

    const doc = new Document({
      styles: {
        paragraphStyles: paragraphStyles,
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1552,
                right: 1020,
                bottom: 1020,
                left: 1020,
              },
            },
          },
          headers: {
            default: new Header({
              children: header,
            }),
          },
          children: [
            new Paragraph({
              text: `Template for Evidence(s)`,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: `UI GreenMetric Questionnaire`,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'University	:	Andres Bello Guayana Catholic University',
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Country		:	Venezuela',
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Web Address	:	',
                }),
                new ExternalHyperlink({
                  children: [
                    new TextRun({
                      text: 'http://guayanaweb.ucab.edu.ve/',
                      style: 'Hyperlink',
                    }),
                  ],
                  link: 'http://guayanaweb.ucab.edu.ve/',
                }),
              ],
            }),
            new Paragraph({ text: '' }),
            new Paragraph({ text: '' }),
            new Paragraph({
              text: `[${uniqueTrait.indicatorIndex}] ${indicator?.englishName}`,
              heading: HeadingLevel.HEADING_2,
              alignment: AlignmentType.LEFT,
            }),
            new Paragraph({
              text: ``,
            }),
            new Paragraph({
              text: `[${uniqueTrait.indicatorIndex}.${uniqueTrait.subindex}] ${criterion.englishName}`,
              heading: HeadingLevel.HEADING_2,
              alignment: AlignmentType.LEFT,
            }),
            new Paragraph({
              text: `Reporte`,
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

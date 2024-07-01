import { Inject, Injectable } from '@nestjs/common';
import { SQL, and, count, eq } from 'drizzle-orm';

const docx = require('docx');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  saveAs,
  Header,
  HeadingLevel,
  AlignmentType,
} = docx;
import * as fs from 'fs';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { criteriaTable } from './criteria.table';
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

export abstract class CriteriaRepositoryError extends Error {}
export class CriterionNotFoundError extends CriteriaRepositoryError {}

@Injectable()
export class CriteriaRepository {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
    //quitar y pasar al service
    private readonly activitiesService: ActivitiesService,
    private readonly unitsService: UnitsService,
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

    const [createdCriterion] = await transaction
      .insert(criteriaTable)
      .values(creationData)
      .returning();

    return Criterion.parse(createdCriterion);
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
    const [foundCriterion = null] = await transaction
      .select()
      .from(criteriaTable)
      .where(this.transformUniqueTraitToWhereConditions(uniqueTrait));

    if (!foundCriterion) {
      return null;
    }
    return Criterion.parse(foundCriterion);
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

    const filteredCriteriaQuery = transaction
      .select()
      .from(criteriaTable)
      .where(this.transformFiltersToWhereConditions(filters))
      .as('filtered_criteria');

    const nonValidatedCriteriaPage = await transaction
      .select()
      .from(filteredCriteriaQuery)
      .limit(paginationOptions.itemsPerPage)
      .offset(
        paginationOptions.itemsPerPage * (paginationOptions.pageIndex - 1),
      );
    const criteriaPage = nonValidatedCriteriaPage.map((criterion) =>
      Criterion.parse(criterion),
    );

    const [{ criteriaCount }] = await transaction
      .select({
        criteriaCount: count(),
      })
      .from(filteredCriteriaQuery);

    return CriteriaPage.parse({
      items: criteriaPage,
      ...paginationOptions,
      pageCount: Math.ceil(criteriaCount / paginationOptions.itemsPerPage),
      itemCount: criteriaCount,
    });
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

    const nonValidatedEvidence = await transaction
      .select()
      .from(criteriaTable)
      .where(this.transformFiltersToWhereConditions(filters));

    return nonValidatedEvidence.map((criterion) => Criterion.parse(criterion));
  }

  private transformFiltersToWhereConditions(
    filters?: CriterionFilters,
  ): SQL | undefined {
    return and(
      filters?.indicatorIndex
        ? eq(criteriaTable.indicatorIndex, filters.indicatorIndex)
        : undefined,
      filters?.subindex
        ? eq(criteriaTable.subindex, filters.subindex)
        : undefined,
      filters?.englishName
        ? eq(criteriaTable.englishName, filters.englishName)
        : undefined,
      filters?.spanishAlias
        ? eq(criteriaTable.spanishAlias, filters.spanishAlias)
        : undefined,
      filters?.categoryName
        ? eq(criteriaTable.categoryName, filters.categoryName)
        : undefined,
    );
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

    const [updatedCriterion = null] = await transaction
      .update(criteriaTable)
      .set(updateData)
      .where(this.transformUniqueTraitToWhereConditions(uniqueTrait))
      .returning();
    if (!updatedCriterion) {
      throw new CriterionNotFoundError();
    }

    return Criterion.parse(updatedCriterion);
  }

  async replaceCriterion(
    uniqueTrait: CriterionUniqueTrait,
    replacementData: CriterionReplacement,
    transaction?: DrizzleTransaction,
  ): Promise<Criterion> {
    return await this.updateCriterion(
      uniqueTrait,
      CriterionUpdate.parse(replacementData),
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

    const [deletedCriterion = null] = await transaction
      .delete(criteriaTable)
      .where(this.transformUniqueTraitToWhereConditions(uniqueTrait))
      .returning();
    if (!deletedCriterion) {
      throw new CriterionNotFoundError();
    }

    return Criterion.parse(deletedCriterion);
  }

  async generate(uniqueTrait: CriterionUniqueTrait): Promise<Buffer | null> {
    const criterion = await this.findCriterion(uniqueTrait);
    console.log(criterion);
    console.log('es cat'+criterion?.categoryName);

    const units = await this.unitsService

    if (!criterion || !criterion.categoryName) return null;
    const activities = await this.activitiesService.findAllCurrent(
      ActivityFilters.parse({ categoryName: criterion?.categoryName }),
    );
    console.log(activities);

    const buildActivitiesParagraphs = () => {
      let paragraphArray = [];
      for (var i = 0; i < activities.length; i++) {
        paragraphArray.push(
          new Paragraph({
            text: `Actividad: ${activities[i].name}`,
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Resumen: ',
                bold: true,
              }),
              new TextRun({
                text: activities[i].summary,
              }),
            ],
          }),
        );
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
            ...buildActivitiesParagraphs(),
          ],
        },
      ],
    });

    /*Packer.toBlob(doc).then((blob: Blob) => {
      // saveAs from FileSaver will download the file
      saveAs(blob, "example.docx");
    });

    
    return blob*/

    Packer.toBuffer(doc).then((buffer: Buffer) => {
      fs.writeFileSync('My Document.docx', buffer);
    });

    // Used to export the file into a .docx file
    return Packer.toBuffer(doc);
  }

  private transformUniqueTraitToWhereConditions(
    uniqueTrait: CriterionUniqueTrait,
  ): SQL | undefined {
    return and(
      eq(criteriaTable.indicatorIndex, uniqueTrait.indicatorIndex),
      eq(criteriaTable.subindex, uniqueTrait.subindex),
    );
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { CriteriaRepository } from './criteria.repository';
import { CriterionUniqueTraitDto } from './dtos/criterion-unique-trait.dto';
import { CriterionDto } from './dtos/criterion.dto';
import { CriterionUniqueTrait } from './schemas/criterion-unique-trait.schema';
import { Criterion } from './schemas/criterion.schema';
import { CriteriaFilters } from './schemas/criteria-filters.schema';
import { CategoryUniqueTraitDto } from './dtos/category-unique-trait.dto';

@Injectable()
export class CriteriaService {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
    private readonly criteriaRepository: CriteriaRepository,
  ) {}

  async findOne(
    criterionUniqueTraitDto: CriterionUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<CriterionDto | null> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const criterion = await this.criteriaRepository.findOne(
          CriterionUniqueTrait.parse(criterionUniqueTraitDto),
          transaction,
        );
        if (!criterion) {
          return null;
        }

        return Criterion.parse(criterion);
      },
    );
  }

  async findAll(
    categoryUniqueTraitDto: CategoryUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ) {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const criteria = await this.criteriaRepository.findAll(
          CriteriaFilters.parse({
            categoryName: categoryUniqueTraitDto.categoryName,
          }),
          transaction,
        );

        return await Promise.all(
          criteria.map(async (criterion) => {
            return Criterion.parse(criterion);
          }),
        );
      },
    );
  }
}

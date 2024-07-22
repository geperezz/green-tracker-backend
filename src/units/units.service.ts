import { Inject, Injectable } from '@nestjs/common';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { UnitCreationDto } from './dtos/unit-creation.dto';
import { UnitUniqueTraitDto } from './dtos/unit-unique-trait.dto';
import { UnitDto } from './dtos/unit.dto';
import { UnitsPageDto } from './dtos/units-page.dto';
import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { UnitReplacementDto } from './dtos/unit-replacement.dto';
import { UserAlreadyExistsError, UsersService } from 'src/users/users.service';
import { UserCreationDto } from 'src/users/dtos/user-creation.dto';
import { UserUniqueTraitDto } from 'src/users/dtos/user-unique-trait.dto';
import { UserFiltersDto } from 'src/users/dtos/user-filters.dto';
import { UserReplacementDto } from 'src/users/dtos/user-replacement.dto';
import { RecommendedCategoriesRepository } from 'src/recommended-categories/recommended-categories.repository';
import { RecommendedCategoryCreation } from 'src/recommended-categories/schemas/recommended-category-creation.schema';
import { RecommendedCategoryFilters } from 'src/recommended-categories/schemas/recommended-category-filters.schema';
import { ActivitiesRepository } from 'src/activities/activities.repository';
import { ActivityFilters } from 'src/activities/schemas/activity-filters.schema';
import { UserDto } from 'src/users/dtos/user.dto';

export abstract class UnitsServiceError extends Error {}
export class UnitNotFoundError extends UnitsServiceError {}
export class UnitAlreadyExistsError extends UnitsServiceError {}

@Injectable()
export class UnitsService {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
    private readonly usersService: UsersService,
    private readonly recommendedCategoriesRepository: RecommendedCategoriesRepository,
    private readonly activitiesRepository: ActivitiesRepository,
  ) {}

  async create(
    unitCreationDto: UnitCreationDto,
    transaction?: DrizzleTransaction,
  ): Promise<UnitDto> {
    try {
      return await (transaction ?? this.drizzleClient).transaction(
        async (transaction) => {
          const unitAsUser = await this.usersService.create(
            UserCreationDto.create({ ...unitCreationDto, role: 'unit' }),
            transaction,
          );

          const recommendedCategories =
            unitCreationDto.recommendedCategories.length > 0
              ? await this.recommendedCategoriesRepository.createMany(
                  unitCreationDto.recommendedCategories.map(
                    (recommendedCategory) => {
                      return RecommendedCategoryCreation.parse({
                        ...recommendedCategory,
                        unitId: unitAsUser.id,
                      });
                    },
                  ),
                  transaction,
                )
              : [];

          return UnitDto.create({
            ...unitAsUser,
            recommendedCategories,
            contributedCategories: [],
          });
        },
      );
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        throw new UnitAlreadyExistsError(
          error.message.replace('un usuario', 'una unidad'),
          { cause: error },
        );
      }
      throw error;
    }
  }

  async findOne(
    unitUniqueTraitDto: UnitUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<UnitDto | null> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [unitAsUser = null] = await this.usersService.findAll(
          UserFiltersDto.create({
            id: unitUniqueTraitDto.id,
            role: 'unit',
          }),
          transaction,
        );
        if (!unitAsUser) {
          return null;
        }

        const recommendedCategories =
          await this.recommendedCategoriesRepository.findAll(
            RecommendedCategoryFilters.parse({ unitId: unitUniqueTraitDto.id }),
            transaction,
          );

        const contributedActivities = await this.activitiesRepository.findMany(
          ActivityFilters.parse({ unitId: unitAsUser.id }),
          transaction,
        );
        const contributedCategories = contributedActivities.map(
          ({ indicatorIndex, categoryName }) => ({
            indicatorIndex,
            categoryName,
          }),
        );

        return UnitDto.create({
          ...unitAsUser,
          recommendedCategories,
          contributedCategories,
        });
      },
    );
  }

  async findPage(
    paginationOptionsDto: PaginationOptionsDto,
    transaction?: DrizzleTransaction,
  ): Promise<UnitsPageDto> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const unitsAsUsersPage = await this.usersService.findPage(
          paginationOptionsDto,
          UserFiltersDto.create({ role: 'unit' }),
          transaction,
        );

        const unitDtosPage = {
          ...unitsAsUsersPage,
          items: await Promise.all(
            unitsAsUsersPage.items.map(async (unitAsUser) => {
              const recommendedCategories =
                await this.recommendedCategoriesRepository.findAll(
                  RecommendedCategoryFilters.parse({ unitId: unitAsUser.id }),
                  transaction,
                );

              const contributedActivities =
                await this.activitiesRepository.findMany(
                  ActivityFilters.parse({ unitId: unitAsUser.id }),
                  transaction,
                );
              const contributedCategories = contributedActivities.map(
                ({ indicatorIndex, categoryName }) => ({
                  indicatorIndex,
                  categoryName,
                }),
              );

              return UnitDto.create({
                ...unitAsUser,
                recommendedCategories,
                contributedCategories,
              });
            }),
          ),
        };

        return unitDtosPage;
      },
    );
  }

  async findAll(transaction?: DrizzleTransaction): Promise<UnitDto[]> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const unitsAsUsers = await this.usersService.findAll(
          UserFiltersDto.create({ role: 'unit' }),
          transaction,
        );

        return await Promise.all(
          unitsAsUsers.map(async (unitAsUser) => {
            const recommendedCategories =
              await this.recommendedCategoriesRepository.findAll(
                RecommendedCategoryFilters.parse({ unitId: unitAsUser.id }),
                transaction,
              );

            const contributedActivities =
              await this.activitiesRepository.findMany(
                ActivityFilters.parse({ unitId: unitAsUser.id }),
                transaction,
              );
            const contributedCategories = contributedActivities.map(
              ({ indicatorIndex, categoryName }) => ({
                indicatorIndex,
                categoryName,
              }),
            );

            return UnitDto.create({
              ...unitAsUser,
              recommendedCategories,
              contributedCategories,
            });
          }),
        );
      },
    );
  }

  async replace(
    unitUniqueTraitDto: UnitUniqueTraitDto,
    unitReplacementDto: UnitReplacementDto,
    transaction?: DrizzleTransaction,
  ): Promise<UnitDto> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        if (!(await this.findOne(unitUniqueTraitDto))) {
          throw new UnitNotFoundError();
        }

        let newUnit: UserDto;
        try {
          newUnit = await this.usersService.replace(
            UserUniqueTraitDto.create(unitUniqueTraitDto),
            UserReplacementDto.create({
              ...unitReplacementDto,
              role: 'unit',
            }),
            transaction,
          );
        } catch (error) {
          if (error instanceof UserAlreadyExistsError) {
            throw new UnitAlreadyExistsError(
              error.message.replace('un usuario', 'una unidad'),
              { cause: error },
            );
          }
          throw error;
        }

        await this.recommendedCategoriesRepository.deleteMany(
          RecommendedCategoryFilters.parse({
            unitId: newUnit.id,
          }),
          transaction,
        );

        const recommendedCategories =
          unitReplacementDto.recommendedCategories.length > 0
            ? await this.recommendedCategoriesRepository.createMany(
                unitReplacementDto.recommendedCategories.map(
                  (recommendedCategory) => {
                    return RecommendedCategoryCreation.parse({
                      ...recommendedCategory,
                      unitId: newUnit.id,
                    });
                  },
                ),
                transaction,
              )
            : [];

        const contributedActivities = await this.activitiesRepository.findMany(
          ActivityFilters.parse({ unitId: newUnit.id }),
          transaction,
        );
        const contributedCategories = contributedActivities.map(
          ({ indicatorIndex, categoryName }) => ({
            indicatorIndex,
            categoryName,
          }),
        );

        return UnitDto.create({
          ...newUnit,
          recommendedCategories,
          contributedCategories,
        });
      },
    );
  }

  async delete(
    unitUniqueTraitDto: UnitUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<UnitDto> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        if (!(await this.findOne(unitUniqueTraitDto))) {
          throw new UnitNotFoundError();
        }

        const recommendedCategories =
          await this.recommendedCategoriesRepository.findAll(
            RecommendedCategoryFilters.parse({ unitId: unitUniqueTraitDto.id }),
            transaction,
          );

        const contributedActivities = await this.activitiesRepository.findMany(
          ActivityFilters.parse({ unitId: unitUniqueTraitDto.id }),
          transaction,
        );
        const contributedCategories = contributedActivities.map(
          ({ indicatorIndex, categoryName }) => ({
            indicatorIndex,
            categoryName,
          }),
        );

        const unit = await this.usersService.delete(
          UserUniqueTraitDto.create(unitUniqueTraitDto),
          transaction,
        );

        return UnitDto.create({
          ...unit,
          recommendedCategories,
          contributedCategories,
        });
      },
    );
  }
}

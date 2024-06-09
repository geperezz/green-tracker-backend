import { Inject, Injectable } from '@nestjs/common';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { UnitCreationDto } from './dtos/unit-creation.dto';
import { UnitUniqueTraitDto } from './dtos/unit-unique-trait.dto';
import { UnitDto } from './dtos/unit.dto';
import { UnitsPageDto } from './dtos/units-page.dto';
import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { UnitReplacementDto } from './dtos/unit-replacement.dto';
import { UsersService } from 'src/users/users.service';
import { UserCreationDto } from 'src/users/dtos/user-creation.dto';
import { UserUniqueTraitDto } from 'src/users/dtos/user-unique-trait.dto';
import { UserFiltersDto } from 'src/users/dtos/user-filters.dto';
import { UserReplacementDto } from 'src/users/dtos/user-replacement.dto';

export abstract class UnitsServiceError extends Error {}
export class UnitNotFoundError extends UnitsServiceError {}

@Injectable()
export class UnitsService {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
    private readonly usersService: UsersService,
  ) {}

  async create(
    unitCreationDto: UnitCreationDto,
    transaction?: DrizzleTransaction,
  ): Promise<UnitDto> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const unitAsUser = await this.usersService.create(
          UserCreationDto.create({ ...unitCreationDto, role: 'unit' }),
          transaction,
        );

        return UnitDto.create(unitAsUser);
      },
    );
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
        return UnitDto.create(unitAsUser);
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
          items: unitsAsUsersPage.items.map((unitAsUser) =>
            UnitDto.create(unitAsUser),
          ),
        };

        return unitDtosPage;
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

        const newUnit = await this.usersService.replace(
          UserUniqueTraitDto.create(unitUniqueTraitDto),
          UserReplacementDto.create({
            ...unitReplacementDto,
            role: 'unit',
          }),
          transaction,
        );
        return UnitDto.create(newUnit);
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

        const unit = await this.usersService.delete(
          UserUniqueTraitDto.create(unitUniqueTraitDto),
          transaction,
        );
        return UnitDto.create(unit);
      },
    );
  }
}

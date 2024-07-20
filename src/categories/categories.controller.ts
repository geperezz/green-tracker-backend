import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CategoryNotFoundError } from './categories.repository';
import { CategoryCreationDto } from './dtos/category-creation.dto';
import { CategoryDto } from './dtos/category.dto';
import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { CategoriesPageDto } from './dtos/categories-page.dto';
import { CategoryReplacementDto } from './dtos/category-replacement.dto';
import { CategoryUniqueTraitDto } from './dtos/category-unique-trait.dto';
import { LoggedInAs } from 'src/auth/logged-in-as.decorator';
import { CategoryIndicatorIndexDto } from './dtos/category-indicator-index.dto';
import {
  CategoriesService,
  CategoryAlreadyExistsError,
  CriterionNotFoundError,
} from './categories.service';

@Controller('/indicators/:indicatorIndex/categories/')
@ApiTags('Categories')
@LoggedInAs('superadmin', 'admin')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async createCategory(
    @Param()
    indicatorIndexDto: CategoryIndicatorIndexDto,
    @Body()
    creationDataDto: CategoryCreationDto,
  ): Promise<CategoryDto> {
    try {
      return await this.categoriesService.createCategory(
        indicatorIndexDto,
        creationDataDto,
      );
    } catch (error) {
      if (error instanceof CriterionNotFoundError) {
        throw new BadRequestException('Criterion not found', {
          description: `Trying to put into the category a criterion that does not exist. There is no criterion no. ${error.criterionSubindex} for the indicator no. ${indicatorIndexDto.indicatorIndex}`,
          cause: error,
        });
      }
      if (error instanceof CategoryAlreadyExistsError) {
        throw new BadRequestException(error.message, { cause: error.cause });
      }
      throw error;
    }
  }

  @Get('/:name/')
  @LoggedInAs('unit')
  async findCategory(
    @Param()
    uniqueTraitDto: CategoryUniqueTraitDto,
  ): Promise<CategoryDto> {
    const category = await this.categoriesService.findCategory(uniqueTraitDto);

    if (!category) {
      throw new NotFoundException(
        'Category not found',
        `There is no category named ${uniqueTraitDto.name} for the indicator no. ${uniqueTraitDto.indicatorIndex}`,
      );
    }

    return category;
  }

  @Get()
  @LoggedInAs('unit')
  async findCategoriesPage(
    @Param()
    indicatorIndexDto: CategoryIndicatorIndexDto,
    @Query()
    paginationOptionsDto: PaginationOptionsDto,
  ): Promise<CategoriesPageDto> {
    return await this.categoriesService.findCategoriesPage(
      indicatorIndexDto,
      paginationOptionsDto,
    );
  }

  @Put('/:name/')
  async replaceCategory(
    @Param()
    uniqueTraitDto: CategoryUniqueTraitDto,
    @Body()
    replacementDataDto: CategoryReplacementDto,
  ): Promise<CategoryDto> {
    try {
      return await this.categoriesService.replaceCategory(
        uniqueTraitDto,
        replacementDataDto,
      );
    } catch (error) {
      if (error instanceof CategoryNotFoundError) {
        throw new NotFoundException('Category not found', {
          description: `There is no category named ${uniqueTraitDto.name} for the indicator no. ${uniqueTraitDto.indicatorIndex}`,
          cause: error,
        });
      }
      if (error instanceof CriterionNotFoundError) {
        throw new BadRequestException('Criterion not found', {
          description: `Trying to put into the category a criterion that does not exist. There is no criterion no. ${error.criterionSubindex} for the indicator no. ${uniqueTraitDto.indicatorIndex}`,
          cause: error,
        });
      }

      throw error;
    }
  }

  @Delete('/:name/')
  async deleteCategory(
    @Param()
    uniqueTraitDto: CategoryUniqueTraitDto,
  ): Promise<CategoryDto> {
    try {
      return await this.categoriesService.deleteCategory(uniqueTraitDto);
    } catch (error) {
      if (error instanceof CategoryNotFoundError) {
        throw new NotFoundException('Category not found', {
          description: `There is no category named ${uniqueTraitDto.name} for the indicator no. ${uniqueTraitDto.indicatorIndex}`,
          cause: error,
        });
      }

      throw error;
    }
  }
}

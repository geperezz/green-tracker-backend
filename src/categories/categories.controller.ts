import {
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

import {
  CategoryNotFoundError,
  CategoriesRepository,
} from './categories.repository';
import { CategoryCreationDto } from './dtos/category-creation.dto';
import { CategoryDto } from './dtos/category.dto';
import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { CategoriesPageDto } from './dtos/categories-page.dto';
import { CategoryReplacementDto } from './dtos/category-replacement.dto';
import { CategoryUniqueTraitDto } from './dtos/category-unique-trait.dto';
import { CategoryCreation } from './schemas/category-creation.schema';
import { PaginationOptions } from 'src/pagination/schemas/pagination-options.schema';
import { CategoryUniqueTrait } from './schemas/category-unique-trait.schema';
import { LoggedInAs } from 'src/auth/logged-in-as.decorator';
import { CategoryReplacement } from './schemas/category-replacement.schema';

@Controller('/categories/')
@ApiTags('Categories')
@LoggedInAs('superadmin', 'admin')
export class CategoriesController {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  @Post()
  async create(
    @Body()
    creationDataDto: CategoryCreationDto,
  ): Promise<CategoryDto> {
    const createdCategorySchema = await this.categoriesRepository.create(
      CategoryCreation.parse(creationDataDto),
    );
    return CategoryDto.fromSchema(createdCategorySchema);
  }

  @Get('/:indicatorIndex/:name')
  @LoggedInAs('unit')
  async findOne(
    @Param()
    categoryUniqueTraitDto: CategoryUniqueTraitDto,
  ): Promise<CategoryDto> {
    const categorySchema = await this.categoriesRepository.findOne(
      CategoryUniqueTrait.parse(categoryUniqueTraitDto),
    );

    if (!categorySchema) {
      throw new NotFoundException(
        'Category not found',
        `There is no category with indicator ${categoryUniqueTraitDto.indicatorIndex} and name ${categoryUniqueTraitDto.name}`,
      );
    }

    return CategoryDto.fromSchema(categorySchema);
  }

  @Get()
  @LoggedInAs('unit')
  async findPage(
    @Query()
    paginationOptionsDto: PaginationOptionsDto,
  ): Promise<CategoriesPageDto> {
    const categorySchemasPage = await this.categoriesRepository.findPage(
      PaginationOptions.parse(paginationOptionsDto),
    );

    const categoryDtosPage = {
      ...categorySchemasPage,
      items: categorySchemasPage.items.map((categorySchema) =>
        CategoryDto.fromSchema(categorySchema),
      ),
    };

    return categoryDtosPage;
  }

  @Put('/:indicatorIndex/:name')
  async replace(
    @Param()
    categoryUniqueTraitDto: CategoryUniqueTraitDto,
    @Body()
    replacementDataDto: CategoryReplacementDto,
  ): Promise<CategoryDto> {
    try {
      const newCategorySchema = await this.categoriesRepository.replace(
        CategoryUniqueTrait.parse(categoryUniqueTraitDto),
        CategoryReplacement.parse(replacementDataDto),
      );

      return CategoryDto.fromSchema(newCategorySchema);
    } catch (error) {
      if (error instanceof CategoryNotFoundError) {
        throw new NotFoundException('Category not found', {
          description: `There is no category with indicator ${categoryUniqueTraitDto.indicatorIndex} and name ${categoryUniqueTraitDto.name}`,
          cause: error,
        });
      }

      throw error;
    }
  }

  @Delete('/:indicatorIndex/:name')
  async delete(
    @Param()
    categoryUniqueTraitDto: CategoryUniqueTraitDto,
  ): Promise<CategoryDto> {
    try {
      const deletedCategorySchema = await this.categoriesRepository.delete(
        CategoryUniqueTrait.parse(categoryUniqueTraitDto),
      );

      return CategoryDto.fromSchema(deletedCategorySchema);
    } catch (error) {
      if (error instanceof CategoryNotFoundError) {
        throw new NotFoundException('Category not found', {
          description: `There is no category with indicator ${categoryUniqueTraitDto.indicatorIndex} and name ${categoryUniqueTraitDto.name}`,
          cause: error,
        });
      }

      throw error;
    }
  }
}

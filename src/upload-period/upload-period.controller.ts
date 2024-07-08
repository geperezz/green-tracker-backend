import { Body, Controller, Get, NotFoundException, Put } from '@nestjs/common';
import { UploadPeriodReplacementDto } from './dtos/upload-period-replacement.dto';
import { UploadPeriodDto } from './dtos/upload-period.dto';
import { UploadPeriodRepository } from './upload-period.repository';
import { uploadPeriodReplacement } from './schemas/upload-period-replacement.schema';
import { ApiTags } from '@nestjs/swagger';
import { LoggedInAs } from 'src/auth/logged-in-as.decorator';

@ApiTags('Upload Period')
@Controller('upload-period')
export class UploadPeriodController {
  constructor(
    private readonly uploadPeriodRepository: UploadPeriodRepository,
  ) {}

  @Get()
  @LoggedInAs('any')
  async find(): Promise<UploadPeriodDto> {
    const uploadPeriod = await this.uploadPeriodRepository.findAll();

    if (!uploadPeriod) {
      throw new NotFoundException(
        'UploadPeriod not found',
        `There is no UploadPeriod`,
      );
    }

    return uploadPeriod;
  }

  @Put()
  @LoggedInAs('admin', 'superadmin')
  async replace(
    @Body()
    replacementDataDto: UploadPeriodReplacementDto,
  ): Promise<UploadPeriodDto> {
    try {
      const newUploadPeriodSchema = await this.uploadPeriodRepository.replace(
        uploadPeriodReplacement.parse(replacementDataDto),
      );

      return UploadPeriodDto.create(newUploadPeriodSchema);
    } catch (error) {
      throw error;
    }
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Header,
  StreamableFile,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { LoggedInAs } from 'src/auth/logged-in-as.decorator';

@Controller('reports')
@LoggedInAs('superadmin', 'admin')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @LoggedInAs('superadmin')
  @Get(':criteria')
  @Header('Content-Disposition', `attachment; filename="example.docx"`)
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )
  async findAll(@Param('criteria') criteria: string, @Res({ passthrough: true }) response: Response) {
    //return this.reportsService.generate(criteria);
    //return await this.reportsService.generate(criteria);
    const file = await this.reportsService.generate(criteria);
    return new StreamableFile(file);
  }
}

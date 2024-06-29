import { Controller, Get, Res } from '@nestjs/common';
import { DocService } from './doc.service.js';
import { Response } from 'express';

import { LoggedInAs } from 'src/auth/logged-in-as.decorator';

@Controller('doc')
@LoggedInAs('superadmin', 'admin')
export class DocController {
  constructor(private readonly docService: DocService) {}
  @Get('generate')
@LoggedInAs('superadmin', 'admin')

  async generateDocument(@Res() res: Response) {
    const buffer = await this.docService.generateDocument();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename=MyDocument.docx',
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}

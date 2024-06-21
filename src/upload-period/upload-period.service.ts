import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailerService } from '@nestjs-modules/mailer';
import { UnitsService } from 'src/units/units.service';
import { UploadPeriodRepository } from './upload-period.repository';
import { UploadPeriodDto } from './dtos/upload-period.dto';
import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { UploadPeriod } from './schemas/upload-period.schema';
import { uploadPeriodTable } from './upload-period.table';

@Injectable()
export class UploadPeriodService {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
    private readonly mailerService: MailerService,
    private readonly unitsService: UnitsService,
    private readonly uploadPeriodRepository: UploadPeriodRepository,
  ) {}

  //Check if today is inside uploadPeriod last month
  async isCurrentUploadPeriodLastMonth() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const uploadPeriod = await this.uploadPeriodRepository.findAll();
      if (!uploadPeriod) return false;

      const endTimestamp = new Date(uploadPeriod.endTimestamp);
      endTimestamp.setHours(0, 0, 0, 0);

      const remainingDays =
        (endTimestamp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

      const isLastMonth = remainingDays <= 31;
      return isLastMonth;
    } catch (error) {
      throw new Error(
        'An unexpected situation ocurred checking the uploadPeriod',
        error,
      );
    }
  }

  async create(
    creationData: UploadPeriodDto,
    transaction?: DrizzleTransaction,
  ): Promise<UploadPeriodDto> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const createdUploadPeriod = await this.uploadPeriodRepository.create(
          creationData,
          transaction,
        );
        return createdUploadPeriod;
      },
    );
  }

  async findAll(transaction?: DrizzleTransaction): Promise<UploadPeriodDto> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const foundUploadPeriod =
          await this.uploadPeriodRepository.findAll(transaction);

        return UploadPeriod.parse(foundUploadPeriod);
      },
    );
  }

  async replace(
    creationData: UploadPeriodDto,
    transaction?: DrizzleTransaction,
  ): Promise<UploadPeriodDto> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const createdUploadPeriod =
          await this.uploadPeriodRepository.create(creationData, transaction);
        return createdUploadPeriod;
      },
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async sendReminders() {
    const today = new Date().setHours(0, 0, 0, 0);
    try {
      const uploadPeriod = await this.uploadPeriodRepository.findAll();
      if (!uploadPeriod) return;

      if (today != new Date(uploadPeriod.startTimestamp).setHours(0, 0, 0, 0))
        return;

      const units = await this.unitsService.findPage({ itemsPerPage: 1000 });
      if (!units) return;

      units.items.forEach(async (unit) => {
        await this.mailerService.sendMail({
          to: unit.email,
          subject: `Inicio de periodo - GreenTracker`,
          template: './startReminder',
          context: {
            unit: unit.name,
            startTimestamp:
              uploadPeriod.startTimestamp.toLocaleDateString('es-ES'),
            endTimestamp: uploadPeriod.endTimestamp.toLocaleDateString('es-ES'),
          },
          attachments: [
            {
              filename: 'logo.png',
              path: 'src/templates/assets/logo.png',
              cid: 'logo',
            },
          ],
        });
      });
    } catch (error) {
      throw new Error(
        'An unexpected situation ocurred while sending the period start reminder emails',
        error,
      );
    }
  }
}

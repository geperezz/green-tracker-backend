import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { UploadPeriodDto } from './dtos/upload-period.dto';
import { uploadPeriodTable } from './upload-period.table';
import { eq } from 'drizzle-orm';
import { UploadPeriod } from './schemas/upload-period.schema';
import { MailerService } from '@nestjs-modules/mailer';
import { UnitsService } from 'src/units/units.service';

@Injectable()
export class UploadPeriodService {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
    private readonly mailerService: MailerService,
    private readonly unitsService: UnitsService,
  ) {}

  async findOne(
    transaction?: DrizzleTransaction,
  ): Promise<UploadPeriodDto | null> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [foundUploadPeriod = null] = await transaction
          .select()
          .from(uploadPeriodTable);

        if (!foundUploadPeriod) {
          return null;
        }
        return UploadPeriod.parse(foundUploadPeriod);
      },
    );
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async sendReminders() {
    const today = new Date().setHours(0, 0, 0, 0);
    try {
      const uploadPeriod = await this.findOne();
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
            startTimestamp: uploadPeriod.startTimestamp.toLocaleDateString('es-ES'),
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
        console.log('vivo');
      });
    } catch (error) {
      throw new Error(
        'An unexpected situation ocurred while sending the period start reminder emails',
      );
    }
  }
}

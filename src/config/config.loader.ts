import { ZodError, z } from 'nestjs-zod/z';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import { fromError } from 'zod-validation-error';
import { userCreationDtoSchema } from 'src/users/dtos/user-creation.dto';
import { uploadPeriodDtoSchema } from 'src/upload-period/dtos/upload-period.dto';

const configSchema = z.object({
  APP_PORT: z.coerce.number().min(0),
  POSTGRES_USER: z.string().trim().min(1),
  POSTGRES_USER_PASSWORD: z.string().trim().min(1),
  POSTGRES_HOST: z.string().trim().min(1),
  POSTGRES_PORT: z.string().trim().min(1),
  POSTGRES_DATABASE_NAME: z.string().trim().min(1),
  POSTGRES_DATABASE_URL: z.string().url(),
  SUPERADMIN_ID: userCreationDtoSchema.shape.id,
  SUPERADMIN_NAME: userCreationDtoSchema.shape.name,
  SUPERADMIN_EMAIL: userCreationDtoSchema.shape.email,
  SUPERADMIN_PASSWORD: userCreationDtoSchema.shape.password,
  AUTHENTICATION_TOKEN_SECRET: z.string().trim().min(1),
  AUTHENTICATION_TOKEN_EXPIRES_IN: z.string().trim().min(1),
  UPLOAD_PERIOD_ID: uploadPeriodDtoSchema.shape.id,
  URL_BACKEND: z.string().trim().min(1),
});

export type Config = z.infer<typeof configSchema>;

export function loadConfigFromEnvFile(envFilePath: string): Config {
  try {
    const { parsed: envFileVariables } = dotenvExpand.expand(
      dotenv.config({
        path: envFilePath,
      }),
    );
    return configSchema.parse(envFileVariables);
  } catch (error) {
    if (error instanceof ZodError) {
      throw fromError(error, { prefix: 'Invalid environment configuration' });
    }
    throw error;
  }
}

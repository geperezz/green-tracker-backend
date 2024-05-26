import { ZodError, z } from 'nestjs-zod/z';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import { fromError } from 'zod-validation-error';

const configSchema = z.object({
  APP_PORT: z.coerce.number().min(0),
  POSTGRES_USER: z.string().trim().min(1),
  POSTGRES_USER_PASSWORD: z.string().trim().min(1),
  POSTGRES_HOST: z.string().trim().min(1),
  POSTGRES_PORT: z.string().trim().min(1),
  POSTGRES_DATABASE_NAME: z.string().trim().min(1),
  POSTGRES_DATABASE_URL: z.string().url(),
  SUPERADMIN_ID: z.string().uuid().trim().min(1),
  SUPERADMIN_PASSWORD: z.string().trim().min(1),
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

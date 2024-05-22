import { defineConfig } from 'drizzle-kit';

import { loadConfigFromEnvFile } from 'src/config/config.loader';

const envVariables = loadConfigFromEnvFile('.env');

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/**/*.table.ts',
  out: './drizzle/',
  dbCredentials: {
    url: envVariables.POSTGRES_DATABASE_URL,
  },
});

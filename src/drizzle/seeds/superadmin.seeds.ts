import { UserCreationDto } from 'src/users/dtos/user-creation.dto';
import { loadConfigFromEnvFile } from 'src/config/config.loader';

const envVariables = loadConfigFromEnvFile('.env');

export const superadminSeeds: (UserCreationDto)[] = [
  {
    id: envVariables.SUPERADMIN_ID,
    password: envVariables.SUPERADMIN_PASSWORD,
    role: 'superadmin',
  },
];

import { UserCreationDto } from 'src/users/dtos/user-creation.dto';

export const superadminSeeds: (UserCreationDto)[] = [
  {
    password: 'johndoe',
    role: 'superadmin',
  },
];

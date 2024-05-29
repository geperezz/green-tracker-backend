import { SetMetadata, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { User } from 'src/users/schemas/user.schema';

export const LoggedInAs = (
  ...roles: [User['role'], ...User['role'][]] | ['any']
) => applyDecorators(SetMetadata('allowedRoles', roles), ApiBearerAuth());

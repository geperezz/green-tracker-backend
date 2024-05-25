import { z } from 'nestjs-zod/z';
import { userSchema } from './user.schema'; 

export const userCreationSchema = userSchema; 

export type UserCreation = z.infer<typeof userSchema>; 

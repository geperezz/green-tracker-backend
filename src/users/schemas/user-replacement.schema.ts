import { z } from 'nestjs-zod/z';
import { userCreationSchema } from './user-creation.schema'; 

export const userReplacementSchema = userCreationSchema; 

export type UserReplacement = z.infer<typeof userReplacementSchema>; 

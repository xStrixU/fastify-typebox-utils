import type { TypeBoxFastifySchema } from './types';

export const createTypeBoxFastifySchema = <T extends TypeBoxFastifySchema>(
  schema: T
): T => schema;

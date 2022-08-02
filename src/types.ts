import type { Static, TSchema } from '@sinclair/typebox';
import type {
  FastifyReply,
  FastifySchema,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
  RequestGenericInterface,
  RouteHandlerMethod,
} from 'fastify';

type LastIndex<T extends readonly any[]> = ((...t: T) => void) extends (
  x: any,
  ...r: infer R
) => void
  ? Exclude<keyof T, keyof R>
  : never;

type ReplaceLastParam<TParams extends readonly any[], TReplace> = {
  [K in keyof TParams]: K extends LastIndex<TParams> ? TReplace : TParams[K];
};

type ReplaceLast<F, TReplace> = F extends (...args: infer T) => infer R
  ? (...args: ReplaceLastParam<T, TReplace>) => R
  : never;

export type TypeBoxFastifySchema = Partial<
  Record<keyof Omit<FastifySchema, 'response'>, TSchema>
> & {
  response?: { [statusCode: number]: TSchema };
};

type TypeBoxRequestGenericInterface<T extends TypeBoxFastifySchema> = {
  [P in keyof T as Capitalize<Lowercase<P & string>> &
    keyof RequestGenericInterface]: T[P] extends TSchema ? Static<T[P]> : never;
};

type TypeBoxSchemaFastifyReply<Schema extends TSchema> = Omit<
  FastifyReply,
  'code' | 'status' | 'send'
> & {
  send(response: Static<Schema>): void;
};

type TypeBoxDefaultFastifyReply<
  Schema extends { [statusCode: string]: TSchema }
> = Omit<FastifyReply, 'code' | 'status' | 'send'> & {
  code<Code extends keyof Schema>(
    code: Code
  ): TypeBoxSchemaFastifyReply<Schema[Code]>;
  status<Status extends keyof Schema>(
    status: Status
  ): TypeBoxSchemaFastifyReply<Schema[Status]>;
  send(
    response: Schema[200] extends TSchema ? Static<Schema[200]> : never
  ): void;
};

type TypeBoxNeverFastifyReply = Omit<
  FastifyReply,
  'code' | 'status' | 'send'
> & {
  code(code: never): TypeBoxNeverFastifyReply;
  status(status: never): TypeBoxNeverFastifyReply;
  send(response: never): void;
};

type TypeBoxFastifyReply<Schema extends TypeBoxFastifySchema> =
  Schema['response'] extends { [status: number]: TSchema }
    ? TypeBoxDefaultFastifyReply<Schema['response']>
    : TypeBoxNeverFastifyReply;

export type TypeBoxRouteHandlerMethod<Schema extends TypeBoxFastifySchema> =
  ReplaceLast<
    RouteHandlerMethod<
      RawServerDefault,
      RawRequestDefaultExpression<RawServerDefault>,
      RawReplyDefaultExpression<RawServerDefault>,
      TypeBoxRequestGenericInterface<Schema>
    >,
    TypeBoxFastifyReply<Schema>
  >;

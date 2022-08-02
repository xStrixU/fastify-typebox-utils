# @xstrixu/fastify-typebox-utils

Utility types and functions for easier [Fastify](https://www.fastify.io/) integration with [TypeBox](https://github.com/sinclairzx81/typebox).

## Contents

- [Install](#install)
  - [npm](#npm)
  - [yarn](#yarn)
- [Create schema](#create-schema)
- [Route handler method](#route-handler-method)
- [License](#license)

## Install

### npm

```bash
npm install @xstrixu/fastify-typebox-utils
```

### yarn

```bash
yarn add @xstrixu/fastify-typebox-utils
```

## Create schema

You can easily create TypeBox fastify schema with the `createTypeBoxFastifySchema` function. The advantage of this approach is that this is fully typed with `FastifySchema`.

```ts
// schemas.ts

import { Type } from '@sinclair/typebox';
import { createTypeBoxFastifySchema } from '@xstrixu/fastify-typebox-utils';

export const fooSchema = createTypeBoxFastifySchema({
  body: Type.Object({
    foo: Type.String(),
    bar: Type.Number(),
    baz: Type.Boolean(),
  }),
  response: {
    200: Type.Object({
      message: Type.String(),
    }),
    400: Type.Number(),
  },
});
```

## Route handler method

You can use the `TypeBoxRouteHandlerMethod` type to automatically set the correct `request` and `reply` parameter types based on the provided schema.

```ts
// handlers.ts

import { fooSchema } from './schemas';

import type { TypeBoxRouteHandlerMethod } from '@xstrixu/fastify-typebox-utils';

export const fooHandler: TypeBoxRouteHandlerMethod<typeof fooSchema> = (
  request,
  reply
) => {
  const { foo, bar, baz } = request.body; // { foo: string; bar: number; baz: boolean; }

  console.log(`foo: ${foo}, bar: ${bar}, baz: ${baz}`);

  reply.send({
    message: 'Everything is fine!',
  }); // works, by default it uses response[200]

  reply.send('abc'); // error: incorrect payload for 200 status code

  reply.status(201).send(1); // error: 201 status code is not defined

  reply.status(400).send(123); // works

  reply.status(400).send('abc'); // error: incorrect payload for 400 status code
};
```

## License

MIT License, see [LICENSE](LICENSE).

# universal-autorouter

An universal plugin that scans the file system and automatically loads to a server all routes in a target directory.

Inspired by [elysia-autoload](https://github.com/kravetsone/elysia-autoload) package and compatible with [Node.js](https://nodejs.org) and [Bun](https://bun.sh) runtimes.

## ⚙️ Install

```sh
yarn add universal-autorouter
```

## 📖 Usage

### Register the Plugin (example with [Hono](https://hono.dev))

```ts
// /app.ts
import path from 'node:path'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import autoloadRoutes from 'universal-autorouter'

const app = new Hono()

await autoloadRoutes(app, {
  // Pattern to scan route files
  pattern: '**/*.ts',
  // Prefix to add to routes
  prefix: '/api',
  // Source directory of route files: use "relative" path
  routesDir: path.resolve(import.meta.dirname, 'api')
})

const port = +(process.env.PORT || 3000)

serve({
  fetch: app.fetch,
  port
}, () => console.log(`Server running at http://localhost:${port}`))
```

### Create a Route

```ts
// /routes/index.ts
import type { Context } from 'hono'

export default (c: Context) => {
  return c.text('Hello World!')
}
```

### Directory Structure

Guide on how `universal-autorouter` matches routes:

```
├── app.ts
├── routes
│   ├── index.ts         // index routes
│   ├── posts
│   │   ├── index.ts
│   │   └── [id].ts      // dynamic params
│   ├── likes
│   │   └── [...].ts     // wildcard
│   ├── domains
│   │   ├── @[...]       // wildcard with @ prefix
│   │   │   └── index.ts
│   ├── frontend
│   │   └── index.tsx    // usage of tsx extension
│   ├── events
│   │   ├── (post).ts    // dynamic method
│   │   └── (get).ts
│   └── users.ts
└── package.json
```

- `/routes/index.ts` → GET `/`
- `/routes/posts/index.ts` → GET `/posts`
- `/routes/posts/[id].ts` → GET `/posts/:id`
- `/routes/users.ts` → GET `/users`
- `/routes/likes/[...].ts` → GET `/likes/*`
- `/routes/domains/@[...]/index.ts` → GET `/domains/@*`
- `/routes/frontend/index.tsx` → GET `/frontend`
- `/routes/events/(post).ts` → POST `/events`
- `/routes/events/(get).ts` → GET `/events`

### Options

| Key               | Type            | Default                        | Description                                                                      |
| ----------------- | --------------- | ------------------------------ | -------------------------------------------------------------------------------- |
| pattern?          | string          | `**/*.{ts,tsx,js,jsx,mjs,cjs}` | [Glob patterns](https://en.wikipedia.org/wiki/Glob_(programming))                |
| prefix?           | string          | ` `                            | Prefix to be added to each route                                                 |
| routesDir?        | string          | `./routes`                     | The folder where routes are located (use a *relative* path)                      |
| defaultMethod?    | Method | string | `get`                          | Default method to use when the route filename doesn't use the (<METHOD>) pattern |
| viteDevServer?    | ViteDevServer   | _undefined_                    | Developer server instance of [Vite](https://vite.dev) to use SSR module loader   |
| skipNoRoutes?     | boolean         | `false`                        | Skip the throw error when no routes are found                                    |
| skipImportErrors? | boolean         | `false`                        | Skip the import errors with the `default export` of a rotue file                 |

## License

This project is licensed under the [MIT License](LICENSE).

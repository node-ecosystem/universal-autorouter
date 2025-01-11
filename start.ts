import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'

import autoloadRoutes from './src/index'

const app = new Hono()

await autoloadRoutes(app, {
  pattern: '**/*.ts',
  // prefix: '/api',
  routesDir: 'test/routes'
})

app.use(logger())

const port = +(process.env.PORT || 3000)

serve({
  fetch: app.fetch,
  port
}, () => console.log(`Server running at http://localhost:${port}`))

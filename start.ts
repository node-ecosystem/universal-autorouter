import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'

import { autoloadRoutes } from './src/index'

const port = +(process.env.PORT || 3000)

const app = new Hono()

autoloadRoutes(
  app,
  {
    pattern: '**/*.ts',
    // prefix: '/api',
    routesDir: './test/routes'
  }
)

app.use(logger())

serve(
  {
    fetch: app.fetch,
    port
  },
  () => console.log(`Server running at http://localhost:${port}`)
)

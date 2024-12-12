// routes/users/[id].ts

import type { Context } from 'hono'

export default (c: Context) => {
  return c.text('Hello World!')
}

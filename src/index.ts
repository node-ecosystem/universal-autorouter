import fs from 'node:fs'
import { pathToFileURL } from 'node:url'

import { sortRoutesByParams, transformToRoute } from './utils'

const DEFAULT_ROUTES_DIR = './routes'
const DEFAULT_PATTERN = '**/*.{ts,tsx,mjs,js,jsx,cjs}'

type Method = 'get' | 'post' | 'put' | 'delete' | 'options' | 'patch' | 'all'

type App = {
  [method in Method]: (route: string, handler: (req: any, res: any) => void) => void
}

type ViteDevServer = {
  ssrLoadModule: (url: string, opts?: { fixStacktrace?: boolean }) => Promise<Record<string, any>>
}

type AutoloadRoutesOptions = {
  /**
   * Pattern to search files of routes
   * @example pattern only .ts files
   * ```ts
   * pattern: '**\/*.ts'
   * ```
   * @default '**\/*.{ts,tsx,mjs,js,jsx,cjs}'
   */
  pattern?: string
  /**
   * Prefix to add to routes
   * @example prefix for APIs
   * ```ts
   * prefix: '/api'
   * ```
   * @default ''
   */
  prefix?: string
  /**
   * Directory to search routes
   * @default '/routes'
   */
  routesDir?: string
  /**
   * Vite dev server instance
   * @default undefined
   */
  vite?: ViteDevServer
  /**
   * Skip the throw error when no routes are found
   * @default false
   */
  skipNoRoutes?: boolean
  /**
   * Skip the import errors with the `default export` of a rotue file
   * @default false
   */
  skipImportErrors?: boolean
}

export const autoloadRoutes = async (app: App, {
  pattern = DEFAULT_PATTERN,
  prefix = '',
  routesDir = DEFAULT_ROUTES_DIR,
  vite,
  skipNoRoutes = false,
  skipImportErrors = false
}: AutoloadRoutesOptions) => {
  if (!fs.existsSync(routesDir)) {
    throw new Error(`Directory ${routesDir} doesn't exist`)
  }

  if (!fs.statSync(routesDir).isDirectory()) {
    throw new Error(`${routesDir} isn't a directory`)
  }

  const files = typeof Bun === 'undefined'
    ? fs.globSync(pattern, { cwd: routesDir })
    : await Array.fromAsync((new Bun.Glob(pattern)).scan({ cwd: routesDir }))

  if (files.length === 0 && !skipNoRoutes) {
    throw new Error(`No matches found in ${routesDir} (you can disable this error with 'skipFailGlob' option to true)`)
  }

  for (const file of sortRoutesByParams(files)) {
    const universalFile = file.replaceAll('\\', '/')
    const filePath = pathToFileURL(`${routesDir}/${universalFile}`).href
    const { default: importedRoute } = await (vite
      ? vite.ssrLoadModule(filePath, { fixStacktrace: true })
      : import(filePath))

    if (!importedRoute && !skipImportErrors) {
      throw new Error(`${filePath} doesn't have default export (you can disable this error with 'skipImportErrors' option to true)`)
    }

    if (typeof importedRoute === 'function') {
      const matchedFile = universalFile.match(/\/?\((.*?)\)/)
      const method = matchedFile ? matchedFile[1] as Method : 'get'
      const route = `${prefix}/${transformToRoute(universalFile)}`
      app[method](route, importedRoute)
    } else {
      console.warn(`Exported function of ${filePath} is not a function`)
    }
  }

  return app
}

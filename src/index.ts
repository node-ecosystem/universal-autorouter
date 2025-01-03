import fs from 'node:fs'
import path from 'node:path'

import { sortRoutesByParams, transformToRoute } from './utils'
import { pathToFileURL } from 'node:url'

const DEFAULT_PATTERN = '**/*.{ts,tsx,mjs,js,jsx,cjs}'
const DEFAULT_ROUTES_DIR = './routes'
const DEFAULT_METHOD = 'get'

type Method = 'get' | 'post' | 'put' | 'delete' | 'options' | 'patch' | 'all'

type App<T> = Record<Method | string, ((route: string, handler: (req: unknown, res: unknown) => void) => void) | any> & T

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
   * Default method to use when the route filename doesn't use the (<METHOD>) pattern
   * @default 'get'
   */
  defaultMethod?: Method | string
  /**
   * Vite dev server instance
   * @default undefined
   */
  viteDevServer?: ViteDevServer
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

export default async <T>(app: App<T>, {
  pattern = DEFAULT_PATTERN,
  prefix = '',
  routesDir = DEFAULT_ROUTES_DIR,
  defaultMethod = DEFAULT_METHOD,
  viteDevServer,
  skipNoRoutes = false,
  skipImportErrors = false
}: AutoloadRoutesOptions): Promise<App<T>> => {
  const entryDir = path.isAbsolute(routesDir) ? routesDir : path.resolve(process.cwd(), routesDir)
  if (!fs.existsSync(entryDir)) {
    throw new Error(`Directory ${entryDir} doesn't exist`)
  }

  if (!fs.statSync(entryDir).isDirectory()) {
    throw new Error(`${entryDir} isn't a directory`)
  }

  const files = typeof Bun === 'undefined'
    ? fs.globSync(pattern, { cwd: entryDir })
    : await Array.fromAsync((new Bun.Glob(pattern)).scan({ cwd: entryDir }))

  if (files.length === 0 && !skipNoRoutes) {
    throw new Error(`No matches found in ${entryDir} (you can disable this error with 'skipFailGlob' option to true)`)
  }

  for (const file of sortRoutesByParams(files)) {
    // Fix windows slashes
    const endFilepath = file.replaceAll('\\', '/')
    const fullFilepath = `${entryDir}/${endFilepath}`
    const { default: importedRoute } = await (viteDevServer
      ? viteDevServer.ssrLoadModule(fullFilepath, { fixStacktrace: true })
      // fix ERR_UNSUPPORTED_ESM_URL_SCHEME import error on Windows
      : import(pathToFileURL(fullFilepath).href))

    if (!importedRoute && !skipImportErrors) {
      throw new Error(`${fullFilepath} doesn't have default export (you can disable this error with 'skipImportErrors' option to true)`)
    }

    if (typeof importedRoute === 'function') {
      const matchedFile = endFilepath.match(/\/?\((.*?)\)/)
      const method = matchedFile ? matchedFile[1] as Method : defaultMethod
      const route = `${prefix}/${transformToRoute(endFilepath)}`
      app[method](route, importedRoute)
    } else {
      console.warn(`Exported function of ${fullFilepath} is not a function`)
    }
  }

  return app
}

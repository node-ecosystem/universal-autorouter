const countParams = (filepath: string): number => {
  return (filepath.match(/\[(.*?)\]/gu) || []).length
}

/**
 * Sorts routes by the number of parameters in ascending order.
 * ['/user/[id]', '/user/name'] → ['/user/name', '/user/[id]']
 */
export const sortRoutesByParams = (routes: string[]): string[] => {
  return routes.sort((a, b) => countParams(a) - countParams(b))
}

export const transformToRoute = (filepath: string): string => {
  return filepath
    // Clean the url extensions
    .replace(/\.(ts|tsx|mjs|js|jsx|cjs)$/u, '')
    // ALREADY DONE BEFORE
    // Fix windows slashes
    // .replaceAll('\\', '/')
    // Handle wild card based routes
    // users/[...id]/profile.ts → users/*/profile
    .replaceAll(/\[\.\.\..*?\]/gu, '*')
    // Handle generic square bracket based routes
    // users/[id]/index.ts → users/:id
    .replaceAll(/\[(.+?)\]/gu, (_: string, match: string) => `:${match}`)
    // Remove optional parameters
    .replace(/\/?\((.*?)\)/, '')
    // Handle the case when multiple parameters are present in one file
    // users/[id]-[name].ts → users/:id-:name
    // users/[id]-[name]/[age].ts → users/:id-:name/:age
    .replaceAll(']-[', '-:')
    .replaceAll(']/', '/')
    .replaceAll(/\[|\]/gu, '')
    // Remove index from end of path
    .replace(/\/?index$/, '')
}

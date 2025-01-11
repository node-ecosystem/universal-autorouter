// https://github.com/kravetsone/elysia-autoload/blob/main/tests/index.test.ts
import { describe, test } from 'node:test'
import { deepStrictEqual, strictEqual } from 'assert'

import { sortRoutesByParams, filepathToRoute } from '../src/utils'

describe('Path to URL', () => {
  test('/index.ts → ', () => {
    strictEqual(filepathToRoute('/index.ts'), '')
  })
  test('/posts/index.ts → /posts', () => {
    strictEqual(filepathToRoute(('/posts/index.ts')), '/posts')
  })
  test('/posts/[id].ts → /posts/:id', () => {
    strictEqual(filepathToRoute('/posts/[id].ts'), '/posts/:id')
  })
  test('/users.ts → /users', () => {
    strictEqual(filepathToRoute('/users.ts'), '/users')
  })
  test('/likes/[...].ts → /likes/*', () => {
    strictEqual(filepathToRoute('/likes/[...].ts'), '/likes/*')
  })
  test('/domains/@[...]/index.ts → /domains/@*', () => {
    strictEqual(filepathToRoute('/domains/@[...]/index.ts'), '/domains/@*')
  })
  test('/frontend/index.tsx → /frontend', () => {
    strictEqual(filepathToRoute('/frontend/index.tsx'), '/frontend')
  })
  test('/events/(post).ts → /events', () => {
    strictEqual(filepathToRoute('/events/(post).ts'), '/events')
  })
  test('/(post)/events.ts → /events', () => {
    strictEqual(filepathToRoute('/(post)/events.ts'), '/events')
  })
  test('(post).ts → ', () => {
    strictEqual(filepathToRoute('(post).ts'), '')
  })
})

describe('sortByNestedParams', () => {
  test('Place routes with params to the end of array', () => {
    deepStrictEqual(
      sortRoutesByParams([
        '/index.ts',
        '/likes/test.ts',
        '/domains/[test]/some.ts',
        '/domains/[test]/[some].ts',
        '/likes/[...].ts',
        '/posts/some.ts',
        '/posts/[id].ts'
      ]),
      [
        '/index.ts',
        '/likes/test.ts',
        '/posts/some.ts',
        '/domains/[test]/some.ts',
        '/likes/[...].ts',
        '/posts/[id].ts',
        '/domains/[test]/[some].ts'
      ]
    )
  })
})

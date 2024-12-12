// https://github.com/kravetsone/elysia-autoload/blob/main/tests/index.test.ts
import { describe, test } from 'node:test'
import { deepStrictEqual, strictEqual } from 'assert'

import { sortRoutesByParams, transformToRoute } from '../src/utils'

describe('Path to URL', () => {
  test('/index.ts → ', () => {
    strictEqual(transformToRoute('/index.ts'), '')
  })
  test('/posts/index.ts → /posts', () => {
    strictEqual(transformToRoute(('/posts/index.ts')), '/posts')
  })
  test('/posts/[id].ts → /posts/:id', () => {
    strictEqual(transformToRoute('/posts/[id].ts'), '/posts/:id')
  })
  test('/users.ts → /users', () => {
    strictEqual(transformToRoute('/users.ts'), '/users')
  })
  test('/likes/[...].ts → /likes/*', () => {
    strictEqual(transformToRoute('/likes/[...].ts'), '/likes/*')
  })
  test('/domains/@[...]/index.ts → /domains/@*', () => {
    strictEqual(transformToRoute('/domains/@[...]/index.ts'), '/domains/@*')
  })
  test('/frontend/index.tsx → /frontend', () => {
    strictEqual(transformToRoute('/frontend/index.tsx'), '/frontend')
  })
  test('/events/(post).ts → /events', () => {
    strictEqual(transformToRoute('/events/(post).ts'), '/events')
  })
  test('/(post)/events.ts → /events', () => {
    strictEqual(transformToRoute('/(post)/events.ts'), '/events')
  })
  test('(post).ts → ', () => {
    strictEqual(transformToRoute('(post).ts'), '')
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

import { readdirSync, readFileSync } from 'node:fs'
import { join, sep } from 'node:path'

// Typed routes are off (app.json has no experiments.typedRoutes), so every route string in src/app
// is a plain string tsc can't check. This scans for the literal forms the app uses and asserts each
// one resolves to a real route file, so a renamed screen or a typo'd route fails here instead of
// landing on the not-found screen at runtime.
const APP_DIR = join(__dirname, '../../app')

const PATTERNS = {
  route: /\broute:\s*(['"])(\/[^'"]*)\1/g,
  router: /\brouter\.(?:push|replace|navigate)\(\s*(['"])(\/[^'"]*)\1/g,
  href: /\bhref(?:=\{?|:)\s*(['"])(\/[^'"]*)\1/g
}

const sourceFiles = readdirSync(APP_DIR, { encoding: 'utf8', recursive: true }).filter((file) => /\.[jt]sx?$/.test(file))

const references = sourceFiles.flatMap((file) => {
  const source = readFileSync(join(APP_DIR, file), 'utf8')
  return Object.entries(PATTERNS).flatMap(([kind, pattern]) => [...source.matchAll(pattern)].map((match) => ({ file, kind, literal: match[2] })))
})

const isGroup = (segment: string) => /^\(.+\)$/.test(segment)

// Each route file's URL segments: 'demos/core.tsx' -> ['demos', 'core'], '(tabs)/index.tsx' ->
// ['(tabs)']. _layout and +not-found (and any other _/+ file) aren't navigable routes.
const routes = sourceFiles
  .map((file) => file.replace(/\.[jt]sx?$/, '').split(sep))
  .filter((segments) => !segments.some((segment) => /^[_+]/.test(segment)))
  .map((segments) => (segments.at(-1) === 'index' ? segments.slice(0, -1) : segments))

// A group in the route file's path is transparent ('/' matches (tabs)/index.tsx), but a group the
// literal names explicitly ('/(tabs)') has to actually be in that path. A dynamic segment ([id])
// accepts any one literal segment, and a catch-all ([...rest]) accepts whatever remains.
const matches = (literal: string[], route: string[]): boolean => {
  if (route.length === 0) return literal.length === 0
  if (isGroup(route[0]) && literal[0] !== route[0]) return matches(literal, route.slice(1))
  if (/^\[\.\.\..+\]$/.test(route[0])) return literal.length > 0
  if (/^\[.+\]$/.test(route[0])) return literal.length > 0 && matches(literal.slice(1), route.slice(1))
  return literal[0] === route[0] && matches(literal.slice(1), route.slice(1))
}

// One literal per pattern, so a broken regex fails here rather than silently matching nothing in
// src/app. Kept independent of the app's own screens, so trimming the demos never breaks it.
const FIXTURE = "route: '/a'\nrouter.push('/b')\n<Link href='/c' />"

describe('route literals', () => {
  it.each(Object.entries(PATTERNS))('the %s pattern finds its literal', (_, pattern) => {
    expect([...FIXTURE.matchAll(pattern)]).toHaveLength(1)
  })

  it('finds at least one in src/app', () => {
    expect(references.length).toBeGreaterThan(0)
  })

  it.each(references)('$literal ($file) resolves to a route file', ({ literal }) => {
    const segments = literal.split(/[?#]/)[0].split('/').filter(Boolean)
    expect(routes.some((route) => matches(segments, route))).toBe(true)
  })
})

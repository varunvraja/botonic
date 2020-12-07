import * as url from 'url'

export const isBrowser = () => {
  return typeof window !== 'undefined' && !window.process
}

export const isNode = () => {
  return !isBrowser() && typeof process !== 'undefined'
}

export const isMobile = (mobileBreakpoint = 460) => {
  if (isBrowser()) {
    const w = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    )
    if (w < mobileBreakpoint) {
      return true
    }
  }
  return false
}
export function isFunction(o) {
  return typeof o === 'function'
}

export const params2queryString = params =>
  Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')

// Joins path segments.  Preserves initial "/" and resolves ".." and "."
// Does not support using ".." to go above/outside the root.
// This means that join("foo", "../../bar") will not resolve to "../bar"
export const join = (...segments) => {
  // Split the inputs into a list of path commands.
  let parts = []
  for (let i = 0, l = segments.length; i < l; i++) {
    parts = parts.concat(segments[i].split('/'))
  }
  // Interpret the path commands to get the new resolved path.
  const newParts = []
  for (let i = 0, l = parts.length; i < l; i++) {
    const part = parts[i]
    // Remove leading and trailing slashes
    // Also remove "." segments
    if (!part || part === '.') continue
    // Interpret ".." to pop the last segment
    if (part === '..') newParts.pop()
    // Push new path segments.
    else newParts.push(part)
  }
  // Preserve the initial slash if there was one.
  if (parts[0] === '') newParts.unshift('')
  // Turn back into a single string path.
  return newParts.join('/') || (newParts.length ? '/' : '.')
}

// A simple function to get the dirname of a path
// Trailing slashes are ignored. Leading slash is preserved.
export const dirname = path => join(path, '..')

/**
 * @return {Iterable<[string, string]>}
 */
export function getURLSearchParams(pathParams) {
  if (isBrowser()) return new URLSearchParams(pathParams).entries()
  if (isNode()) return new url.URLSearchParams(pathParams)
  throw new Error('Unexpected process type. Not recognized as browser nor node')
}

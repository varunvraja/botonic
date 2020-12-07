import { isNode } from '@botonic/core'

export const isDev = process.env.NODE_ENV === 'development'
export const isProd = process.env.NODE_ENV === 'production'

export const staticAsset = path => {
  try {
    if (isNode()) {
      return path
    }
    const scriptBase = document.querySelector(
      'script[src$="webchat.botonic.js"]'
    )
    if (!scriptBase) {
      throw new Error('webchat.botonic.js not found in dom')
    }
    const scriptBaseURL = scriptBase.getAttribute('src')
    if (!scriptBaseURL) {
      throw new Error('no src attribute found ')
    }
    const scriptName = scriptBaseURL.split('/').pop()
    const basePath = scriptBaseURL.replace('/' + scriptName, '/')
    return basePath + path
  } catch (e) {
    console.error(`Could not resolve path: '${path}'`, e)
    return path
  }
}

export const resolveImage = src => {
  if (isURL(src)) return src
  return staticAsset(src)
}

export const isURL = urlPath => {
  // @stephenhay (38 chars) from: https://mathiasbynens.be/demo/url-regex
  const pattern = new RegExp(/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/)
  return !!pattern.test(urlPath)
}

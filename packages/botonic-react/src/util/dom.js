export const getBotonicScrollableContent = () => {
  return document.getElementById('botonic-scrollable-content')
}

export const getScrollableArea = () => {
  const getArea = area => {
    const botonicScrollableContent = getBotonicScrollableContent()
    const scrollableArea =
      botonicScrollableContent &&
      botonicScrollableContent.getElementsByClassName(area)[0]
    return scrollableArea
  }
  return {
    full: getArea('simplebar-content'),
    visible: getArea('simplebar-content-wrapper'),
  }
}

export const scrollToBottom = ({ timeout = 200, behavior = 'smooth' } = {}) => {
  const frame = getScrollableArea().visible
  if (frame) {
    setTimeout(
      () => frame.scrollTo({ top: frame.scrollHeight, behavior: behavior }),
      timeout
    )
  }
}

export const getWebchatElement = () =>
  document.getElementById('botonic-webchat')

export const setWebchatElementHeight = newHeight => {
  getWebchatElement().style.height = newHeight
}

export const BROWSER = Object.freeze({
  CHROME: 'chrome',
  CHROMIUM: 'chromium',
  FIREFOX: 'firefox', // Firefox 1.0+
  SAFARI: 'safari', // Safari 3.0+
  IE: 'ie', // Internet Explorer 6-11
  EDGE: 'edge', // Edge 20+
  OPERA: 'opera', // Opera 8.0+
  OTHER: 'other',
})

export function getBrowser(userAgent) {
  // as per https://stackoverflow.com/a/9851769/145289
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent
  // Order of ifs is important
  if (
    // eslint-disable-next-line no-undef
    (!!window.opr && !!opr.addons) ||
    !!window.opera ||
    navigator.userAgent.indexOf(' OPR/') >= 0
  ) {
    return BROWSER.OPERA
  }
  if (typeof InstallTrigger !== 'undefined') {
    return BROWSER.FIREFOX
  }

  if (
    /constructor/i.test(window.HTMLElement) ||
    (function (p) {
      return p.toString() === '[object SafariRemoteNotification]'
    })(
      !window['safari'] ||
        // eslint-disable-next-line no-undef
        (typeof safari !== 'undefined' && safari.pushNotification)
    )
  ) {
    return BROWSER.SAFARI
  }

  if (/*@cc_on!@*/ false || !!document.documentMode) {
    return BROWSER.IE
  }

  if (window.StyleMedia) {
    return BROWSER.EDGE
  }

  if (
    !!window.chrome &&
    (!!window.chrome.webstore || !!window.chrome.runtime)
  ) {
    if (navigator.userAgent.indexOf('Edg') != -1) {
      return BROWSER.EDGE
    }
    return BROWSER.CHROME
  }

  return BROWSER.OTHER
}

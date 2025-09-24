import { UAParser } from 'ua-parser-js';

/**
 * Detects and returns a normalized platform identifier string based on the
 * current user's operating system and browser.
 *
 * @returns {string} A compact string uniquely identifying the OS and browser.
 */
export function getPlatform(): string {
  const uap = UAParser(navigator.userAgent);
  let osVersion = uap.os.version;
  if (osVersion == null) {
    osVersion = '';
  }
  let browserVersion = uap.browser.major;
  if (browserVersion == null) {
    browserVersion = '';
  }

  let platform = uap.os.name + osVersion + '_' + uap.browser.name + browserVersion;
  platform = platform.replace(/\s/g, '');

  return platform;
}

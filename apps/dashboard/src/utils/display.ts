import { getPlatform } from './user';

/**
 * Returns the appropriate bullet character based on the user's platform,
 * following Firefox's convention:
 * - Windows: BLACK CIRCLE (●) U+25CF
 * - Mac/Android: BULLET (•) U+2022
 *
 * @returns {string} The platform-appropriate bullet character
 */
export function getPlatformBullet(): string {
  const platform = getPlatform().toLowerCase();

  if (platform.includes('windows')) {
    return '●';
  }

  return '•';
}

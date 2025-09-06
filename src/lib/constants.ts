/**
 * Shared constants for localStorage keys and other application constants
 * This prevents duplication and maintains consistency across the application
 */

// localStorage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
} as const

// Theme constants
export const THEME_STORAGE_KEY = 'ui-theme'
export const DEFAULT_THEME = 'system'

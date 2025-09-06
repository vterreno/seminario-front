import { useCallback } from 'react'
import { STORAGE_KEYS } from '@/lib/constants'
import { getStorageItem, setStorageItem, removeStorageItem } from './use-local-storage'

/**
 * Centralized token management hook with proper error handling
 * This replaces direct localStorage access throughout the application
 */
export function useTokenManagement() {
  // Get access token with error handling
  const getAccessToken = useCallback((): string | null => {
    const token = getStorageItem(STORAGE_KEYS.ACCESS_TOKEN, null)
    return token
  }, [])

  // Get refresh token with error handling
  const getRefreshToken = useCallback((): string | null => {
    const token = getStorageItem(STORAGE_KEYS.REFRESH_TOKEN, null)
    return token
  }, [])

  // Set access token with error handling
  const setAccessToken = useCallback((token: string): void => {
    setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, token)
  }, [])

  // Set refresh token with error handling
  const setRefreshToken = useCallback((token: string): void => {
    setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, token)
  }, [])

  // Remove access token
  const removeAccessToken = useCallback((): void => {
    removeStorageItem(STORAGE_KEYS.ACCESS_TOKEN)
  }, [])

  // Remove refresh token
  const removeRefreshToken = useCallback((): void => {
    removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN)
  }, [])

  // Clear all tokens
  const clearAllTokens = useCallback((): void => {
    removeAccessToken()
    removeRefreshToken()
  }, [removeAccessToken, removeRefreshToken])

  // Check if user has valid tokens
  const hasTokens = useCallback((): boolean => {
    const accessToken = getAccessToken()
    return Boolean(accessToken)
  }, [getAccessToken])

  return {
    getAccessToken,
    getRefreshToken,
    setAccessToken,
    setRefreshToken,
    removeAccessToken,
    removeRefreshToken,
    clearAllTokens,
    hasTokens,
  }
}

import { useState, useEffect } from 'react'

/**
 * Custom hook for safe localStorage access with error handling
 * @param key - The localStorage key
 * @param initialValue - Default value if key doesn't exist or parsing fails
 * @returns [value, setValue, removeValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, () => void] {
  // Get initial value from localStorage with error handling
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      if (item === null) {
        return initialValue
      }
      return JSON.parse(item)
    } catch (error) {
      console.warn(`Error parsing localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Set value with error handling
  const setValue = (value: T) => {
    try {
      setStoredValue(value)
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  // Remove value from localStorage
  const removeValue = () => {
    try {
      setStoredValue(initialValue)
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue, removeValue]
}

/**
 * Safe JSON parsing with error handling
 * @param value - String to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed value or fallback
 */
export function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (value === null) {
    return fallback
  }
  
  try {
    return JSON.parse(value)
  } catch (error) {
    console.warn('Error parsing JSON:', error)
    return fallback
  }
}

/**
 * Safe localStorage getter with error handling
 * @param key - localStorage key
 * @param fallback - Fallback value if key doesn't exist or parsing fails
 * @returns Parsed value or fallback
 */
export function getStorageItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key)
    return safeJsonParse(item, fallback)
  } catch (error) {
    console.warn(`Error accessing localStorage key "${key}":`, error)
    return fallback
  }
}

/**
 * Safe localStorage setter with error handling
 * @param key - localStorage key
 * @param value - Value to store
 */
export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error)
  }
}

/**
 * Safe localStorage remover with error handling
 * @param key - localStorage key to remove
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error)
  }
}

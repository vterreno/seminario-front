// Utility functions for formatting identification numbers

export type IdentificationType = 'CUIT' | 'DNI' | 'CUIL' | 'PASAPORTE' | 'OTRO' | 'NONE'

/**
 * Format CUIT/CUIL number as XX-XXXXXXXX-X
 * @param value - The input value
 * @returns Formatted CUIT/CUIL
 */
export const formatCUIT = (value: string): string => {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '')
  
  // Limit to 11 digits
  const truncated = numbers.substring(0, 11)
  
  // Apply formatting
  if (truncated.length <= 2) {
    return truncated
  } else if (truncated.length <= 10) {
    return `${truncated.substring(0, 2)}-${truncated.substring(2)}`
  } else {
    return `${truncated.substring(0, 2)}-${truncated.substring(2, 10)}-${truncated.substring(10)}`
  }
}

/**
 * Format DNI number as XX.XXX.XXX
 * @param value - The input value
 * @returns Formatted DNI
 */
export const formatDNI = (value: string): string => {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '')
  
  // Limit to 8 digits
  const truncated = numbers.substring(0, 8)
  
  // Apply formatting
  if (truncated.length <= 2) {
    return truncated
  } else if (truncated.length <= 5) {
    return `${truncated.substring(0, 2)}.${truncated.substring(2)}`
  } else {
    return `${truncated.substring(0, 2)}.${truncated.substring(2, 5)}.${truncated.substring(5)}`
  }
}

/**
 * Remove formatting from identification number
 * @param value - The formatted value
 * @returns Clean numeric string
 */
export const cleanIdentificationNumber = (value: string): string => {
  return value.replace(/\D/g, '')
}

/**
 * Format identification number based on type
 * @param value - The input value
 * @param type - The identification type
 * @returns Formatted identification number
 */
export const formatIdentificationNumber = (value: string, type: IdentificationType): string => {
  switch (type) {
    case 'CUIT':
    case 'CUIL':
      return formatCUIT(value)
    case 'DNI':
      return formatDNI(value)
    case 'PASAPORTE':
    case 'OTRO':
      // For passport and other types, just remove spaces and limit length
      return value.replace(/\s+/g, ' ').trim().substring(0, 20)
    default:
      return value
  }
}

/**
 * Get placeholder text based on identification type
 * @param type - The identification type
 * @returns Placeholder text with example
 */
export const getIdentificationPlaceholder = (type: IdentificationType): string => {
  switch (type) {
    case 'CUIT':
      return 'Ej: 20-12345678-9'
    case 'CUIL':
      return 'Ej: 27-12345678-4'
    case 'DNI':
      return 'Ej: 45.087.944'
    case 'PASAPORTE':
      return 'Ej: ABC123456'
    case 'OTRO':
      return 'Ingrese el número'
    default:
      return ''
  }
}

/**
 * Validate identification number format
 * @param value - The identification number
 * @param type - The identification type
 * @returns Validation result
 */
export const validateIdentificationNumber = (value: string, type: IdentificationType): { isValid: boolean, message?: string } => {
  if (!value || value.trim() === '') {
    return { isValid: true } // Empty is valid (handled by required validation)
  }

  const cleanValue = cleanIdentificationNumber(value)

  switch (type) {
    case 'CUIT':
    case 'CUIL':
      if (cleanValue.length !== 11) {
        return { isValid: false, message: `El ${type} debe tener 11 dígitos` }
      }
      // Basic CUIT/CUIL validation - first two digits should be valid
      const firstTwo = parseInt(cleanValue.substring(0, 2))
      if (type === 'CUIT' && ![20, 23, 24, 27, 30, 33, 34].includes(firstTwo)) {
        return { isValid: false, message: 'CUIT inválido - debe comenzar con 20, 23, 24, 27, 30, 33 o 34' }
      }
      if (type === 'CUIL' && ![20, 23, 24, 27].includes(firstTwo)) {
        return { isValid: false, message: 'CUIL inválido - debe comenzar con 20, 23, 24 o 27' }
      }
      return { isValid: true }
    
    case 'DNI':
      if (cleanValue.length < 7 || cleanValue.length > 8) {
        return { isValid: false, message: 'El DNI debe tener entre 7 y 8 dígitos' }
      }
      return { isValid: true }
    
    case 'PASAPORTE':
      if (value.length < 6 || value.length > 20) {
        return { isValid: false, message: 'El pasaporte debe tener entre 6 y 20 caracteres' }
      }
      return { isValid: true }
    
    case 'OTRO':
      if (value.length > 20) {
        return { isValid: false, message: 'Máximo 20 caracteres' }
      }
      return { isValid: true }
    
    default:
      return { isValid: true }
  }
}

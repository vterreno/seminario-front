/**
 * Formatea un número como moneda argentina (ARS)
 * @param amount - El monto a formatear
 * @returns String formateado como "1.234,56"
 */
export function formatCurrency(amount: number | string): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

/**
 * Convierte un string de moneda formateado a número
 * @param formattedAmount - String como "1.234,56"
 * @returns Número decimal
 */
export function parseCurrency(formattedAmount: string): number {
  if (!formattedAmount) return 0;
  
  // Remover puntos (separadores de miles) y reemplazar coma por punto decimal
  const cleanAmount = formattedAmount
    .replace(/\./g, '')
    .replace(',', '.');
  
  return parseFloat(cleanAmount) || 0;
}

/**
 * Valida si un string tiene formato de moneda válido
 * @param value - String a validar
 * @returns boolean
 */
export function isValidCurrencyFormat(value: string): boolean {
  // Permite formatos como: 1234,56 o 1.234,56 o 1234 o 1.234
  const currencyRegex = /^(\d{1,3}(\.\d{3})*|\d+)(,\d{1,2})?$/;
  return currencyRegex.test(value);
}

/**
 * Formatea mientras el usuario escribe (para inputs controlados)
 * @param value - Valor actual del input
 * @param previousValue - Valor anterior para detectar si se está borrando
 * @returns String formateado
 */
export function formatCurrencyInput(value: string, previousValue?: string): string {
  // Si está vacío, devolver vacío
  if (!value) return '';
  
  // Remover todo excepto números y comas
  let cleanValue = value.replace(/[^\d,]/g, '');
  
  // Solo permitir una coma
  const commaIndex = cleanValue.indexOf(',');
  if (commaIndex !== -1) {
    cleanValue = cleanValue.substring(0, commaIndex + 1) + 
                 cleanValue.substring(commaIndex + 1).replace(/,/g, '');
  }
  
  // Limitar decimales a 2 dígitos
  if (commaIndex !== -1 && cleanValue.length > commaIndex + 3) {
    cleanValue = cleanValue.substring(0, commaIndex + 3);
  }
  
  // Separar parte entera y decimal
  const [integerPart, decimalPart] = cleanValue.split(',');
  
  // Formatear parte entera con puntos como separadores de miles
  let formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Reconstruir el valor
  return decimalPart !== undefined ? `${formattedInteger},${decimalPart}` : formattedInteger;
}
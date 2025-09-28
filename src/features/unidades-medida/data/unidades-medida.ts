import { faker } from '@faker-js/faker'
import { UnidadMedida } from './schema'

// Set a fixed seed for consistent data generation
faker.seed(67890)

const unidadesComunes = [
  { nombre: 'Unidad', abreviatura: 'un', aceptaDecimales: false },
  { nombre: 'Kilogramo', abreviatura: 'kg', aceptaDecimales: true },
  { nombre: 'Litro', abreviatura: 'l', aceptaDecimales: true },
  { nombre: 'Metro', abreviatura: 'm', aceptaDecimales: true },
  { nombre: 'Metro cuadrado', abreviatura: 'm²', aceptaDecimales: true },
  { nombre: 'Metro cúbico', abreviatura: 'm³', aceptaDecimales: true },
  { nombre: 'Gramo', abreviatura: 'g', aceptaDecimales: true },
  { nombre: 'Mililitro', abreviatura: 'ml', aceptaDecimales: true },
  { nombre: 'Centímetro', abreviatura: 'cm', aceptaDecimales: true },
  { nombre: 'Pieza', abreviatura: 'pz', aceptaDecimales: false },
]

export const unidadesMedida: UnidadMedida[] = Array.from({ length: 50 }, (_, index) => {
  if (index < unidadesComunes.length) {
    // Usar unidades comunes para los primeros elementos
    const unidadComun = unidadesComunes[index]
    return {
      id: index + 1,
      nombre: unidadComun.nombre,
      abreviatura: unidadComun.abreviatura,
      aceptaDecimales: unidadComun.aceptaDecimales,
      empresa_id: faker.number.int({ min: 1, max: 5 }),
      created_at: faker.date.past().toISOString(),
      updated_at: faker.date.recent().toISOString(),
      deleted_at: null,
    }
  } else {
    // Generar unidades aleatorias para el resto
    return {
      id: index + 1,
      nombre: faker.commerce.product(),
      abreviatura: faker.string.alpha({ length: { min: 2, max: 4 } }).toLowerCase(),
      aceptaDecimales: faker.datatype.boolean(),
      empresa_id: faker.number.int({ min: 1, max: 5 }),
      created_at: faker.date.past().toISOString(),
      updated_at: faker.date.recent().toISOString(),
      deleted_at: null,
    }
  }
})
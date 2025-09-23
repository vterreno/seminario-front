import { faker } from '@faker-js/faker'
import { Empresa } from './schema'

// Set a fixed seed for consistent data generation
faker.seed(12345)

export const empresas: Empresa[] = Array.from({ length: 50 }, (_, index) => ({
  id: index + 1,
  name: faker.company.name(),
  estado: faker.datatype.boolean(0.8), // 80% activas
  created_at: faker.date.past().toISOString(),
  updated_at: faker.date.recent().toISOString(),
  deleted_at: null,
}))

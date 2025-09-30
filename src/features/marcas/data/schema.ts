import { z } from 'zod'

// Schema para Marca del backend (para mapeo desde API)
export const marcaBackendSchema = z.object({
    id: z.number(),
    nombre: z.string(),
    descripcion: z.string().optional(),
    empresa_id: z.number(),
    empresa: z.object({
        id: z.number(),
        name: z.string()
    }).optional(),
    estado: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
    deleted_at: z.string().optional().nullable(),
})

export type MarcaBackend = z.infer<typeof marcaBackendSchema>

// Schema principal de la marca (para frontend)
export const marcaSchema = z.object({
    id: z.number(),
    nombre: z.string(),
    descripcion: z.string().optional(),
    empresa_id: z.number(),
    empresa: z.object({
        id: z.number(),
        name: z.string()
    }).optional(),
    estado: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
    deleted_at: z.string().optional().nullable(),
})

export type Marca = z.infer<typeof marcaSchema>

// Schema para el formulario
export const marcaFormSchema = z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre no puede exceder 100 caracteres'),
    descripcion: z.string().optional().or(z.literal('')),
    estado: z.boolean(),
})

export type MarcaForm = z.infer<typeof marcaFormSchema>

// Schema para el formulario cuando es superadmin (incluye empresa_id)
export const marcaFormSuperAdminSchema = z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre no puede exceder 100 caracteres'),
    descripcion: z.string().optional().or(z.literal('')),
    empresa_id: z.number().min(1, 'Debe seleccionar una empresa'),
    estado: z.boolean(),
})

export type MarcaFormSuperAdmin = z.infer<typeof marcaFormSuperAdminSchema>

// Definición para crear marca
export const createMarcaSchema = z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre no puede exceder 100 caracteres'),
    descripcion: z.string().optional(),
})

export type CreateMarca = z.infer<typeof createMarcaSchema>

// Definición para actualizar marca
export const updateMarcaSchema = z.object({
    id: z.number(),
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre no puede exceder 100 caracteres'),
    descripcion: z.string().optional(),
    estado: z.boolean(),
})

export type UpdateMarca = z.infer<typeof updateMarcaSchema>

// Funciones de utilidad para validación y transformación
export const validateMarca = (data: unknown): Marca => {
    return marcaSchema.parse(data)
}

export const validateMarcaBackend = (data: unknown): MarcaBackend => {
    return marcaBackendSchema.parse(data)
}

export const validateMarcaForm = (data: unknown): MarcaForm => {
    return marcaFormSchema.parse(data)
}

export const validateCreateMarca = (data: unknown): CreateMarca => {
    return createMarcaSchema.parse(data)
}

export const validateUpdateMarca = (data: unknown): UpdateMarca => {
    return updateMarcaSchema.parse(data)
}

// Función de transformación de backend a frontend
export const mapBackendMarcaToFrontend = (backendMarca: MarcaBackend): Marca => {
    const empresaInfo = backendMarca.empresa ? {
        id: backendMarca.empresa.id,
        name: backendMarca.empresa.name
    } : undefined;

    return {
        id: backendMarca.id,
        nombre: backendMarca.nombre,
        descripcion: backendMarca.descripcion || '',
        empresa_id: backendMarca.empresa_id,
        empresa: empresaInfo,
        estado: backendMarca.estado,
        created_at: backendMarca.created_at,
        updated_at: backendMarca.updated_at,
        deleted_at: backendMarca.deleted_at
    };
}

// Función de transformación de frontend a backend (si es necesaria)
export const mapFrontendMarcaToBackend = (frontendMarca: Marca): MarcaBackend => {
    return {
        id: frontendMarca.id,
        nombre: frontendMarca.nombre,
        descripcion: frontendMarca.descripcion,
        empresa_id: frontendMarca.empresa_id,
        empresa: frontendMarca.empresa,
        estado: frontendMarca.estado,
        created_at: frontendMarca.created_at,
        updated_at: frontendMarca.updated_at,
        deleted_at: frontendMarca.deleted_at
    };
}

// Funciones de utilidad para operaciones comunes
export const isMarcaActiva = (marca: Marca): boolean => {
    return marca.estado && !marca.deleted_at
}

export const formatMarcaCreationDate = (marca: Marca): string => {
    return new Date(marca.created_at).toLocaleDateString('es-ES')
}

export const formatMarcaUpdateDate = (marca: Marca): string => {
    return new Date(marca.updated_at).toLocaleDateString('es-ES')
}

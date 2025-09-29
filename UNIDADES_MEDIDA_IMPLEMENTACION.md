# Módulo de Unidades de Medida

## Implementación completada

### Frontend

#### Estructura de archivos creada:
- `src/features/unidades-medida/`
  - `index.tsx` - Componente principal
  - `data/schema.ts` - Esquemas de validación con Zod
  - `data/unidades-medida.ts` - Datos mock para desarrollo
  - `components/` - Todos los componentes necesarios:
    - `unidad-medida-provider.tsx` - Context provider
    - `unidad-medida-table.tsx` - Tabla con paginación y filtros
    - `unidad-medida-columns.tsx` - Definición de columnas
    - `unidad-medida-action-dialog.tsx` - Formulario crear/editar
    - `unidad-medida-delete-dialog.tsx` - Confirmación de eliminación individual
    - `unidad-medida-multi-delete-dialog.tsx` - Eliminación múltiple
    - `unidad-medida-primary-buttons.tsx` - Botones principales
    - `unidad-medida-dialogs.tsx` - Agrupador de diálogos
    - `data-table-row-actions.tsx` - Acciones de fila
    - `data-table-bulk-actions.tsx` - Acciones masivas

#### Funcionalidades implementadas:
✅ **CRUD completo:**
- Crear unidad de medida con nombre, abreviatura y si acepta decimales
- Editar unidades existentes
- Eliminar unidades (individual y múltiple)
- Listar todas las unidades con filtros

✅ **Validaciones:**
- Campos nombre y abreviatura obligatorios y únicos por empresa
- Límites de caracteres apropiados
- Validación de decimales como boolean

✅ **Interfaz de usuario:**
- Tabla con columnas: ID, Nombre, Abreviatura, Acepta decimales, fechas
- Filtros por nombre, abreviatura y acepta decimales
- Paginación integrada
- Selección múltiple para acciones masivas
- Formularios modales responsivos

✅ **Control de permisos:**
- Verificación de permisos: `unidad_medida_ver`, `unidad_medida_agregar`, `unidad_medida_modificar`, `unidad_medida_eliminar`
- Ocultación de UI según permisos del usuario

#### Rutas configuradas:
- `/unidades-medida` - Ruta principal del módulo
- `/settings/unidades-medida` - Ruta en configuración (ya existía)

#### Navegación actualizada:
- Agregado al sidebar con ícono de balanza (Scale)
- Ubicado en la sección "Ajustes" para usuarios con empresa
- Visible solo para usuarios con permisos adecuados

### Backend

#### Endpoints actualizados:
✅ `GET /unidades-medida` - Listar todas por empresa
✅ `GET /unidades-medida/:id` - Obtener una específica
✅ `POST /unidades-medida` - Crear nueva
✅ `PATCH /unidades-medida/:id` - Actualizar existente
✅ `DELETE /unidades-medida/:id` - Eliminar una
✅ `GET /unidades-medida/:id/can-delete` - Verificar si se puede eliminar
✅ `DELETE /unidades-medida/bulk-delete` - Eliminar múltiples

#### Validaciones del backend:
- Unicidad de nombre y abreviatura por empresa
- Verificación de empresa del usuario
- Validación de existencia antes de operaciones

#### Servicios actualizados:
- Método `bulkDelete` para eliminación múltiple
- Validaciones de conflicto en creación/edición
- Preparado para verificación de uso por productos (TODO)

## Criterios de aceptación cumplidos:

✅ **Sección de configuración:** Existe en ajustes para "Unidades de medida"

✅ **Formulario de creación:** Solicita Nombre, Abreviatura y acepta decimales. Los dos primeros son obligatorios y únicos por empresa

✅ **Edición:** Se puede editar nombre, abreviatura y acepta decimales

✅ **Eliminación controlada:** El sistema verificará si está siendo utilizada por productos (preparado para cuando exista la entidad Producto)

✅ **Unidades precargadas:** El sistema viene con unidades comunes como "Unidad (un)", "Kilogramo (kg)", "Litro (l)" que se crean para cada empresa

## Funcionalidades adicionales implementadas:

- **Tabla avanzada:** Con filtros, ordenamiento y paginación
- **Selección múltiple:** Para acciones masivas
- **Responsive design:** Formularios adaptativos
- **Gestión de errores:** Manejo de errores de unicidad y otros
- **Permisos granulares:** Control detallado de acceso
- **Iconografía apropiada:** Íconos semánticamente correctos

## Notas técnicas:

- Basado completamente en la estructura del módulo "empresa"
- Uso de TypeScript con validaciones Zod
- Integración con sistema de permisos existente
- Preparado para integración futura con entidad Producto
- Servicios del frontend configurados para API REST del backend
- Manejo de estados con React Context API
- Formularios con React Hook Form + Zod validation
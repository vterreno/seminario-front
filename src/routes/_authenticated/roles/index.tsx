import { Roles } from '@/features/roles';
import { roles } from '@/features/users/data/data';
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod';

// Definimos un schema mínimo para permisos
const permissionSchema = z.object({
    id: z.number(),
    nombre: z.string(),
});

export const roleSearchSchema = z.object({
    page: z.number().optional().catch(1),
    pageSize: z.number().optional().catch(10),

    // Filtros opcionales
    nombre: z.string().optional().catch(''),               // nombre del rol
    permissions: z.array(permissionSchema).optional().catch([]), // array de permisos
});

export const Route = createFileRoute('/_authenticated/roles/')({
    validateSearch: roleSearchSchema,
    component: Roles,
})

function RouteComponent() {
    return <div>Hello "/_authenticated/roles/"!</div>
}

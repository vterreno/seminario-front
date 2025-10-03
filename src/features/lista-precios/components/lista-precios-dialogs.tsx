import { useListaPreciosContext } from './lista-precios-provider'
import { ListaPreciosActionDialog } from './lista-precios-action-dialog'
import { ListaPreciosDeleteDialog } from './lista-precios-delete-dialog'
import { ManagePreciosDialog } from './manage-precios-dialog'

interface ListaPreciosDialogsProps {
    onSuccess?: () => void
}

export function ListaPreciosDialogs({ onSuccess }: ListaPreciosDialogsProps) {
    const {
        selectedLista,
        isManagePreciosDialogOpen,
        setIsManagePreciosDialogOpen,
        isSuperAdmin,
        userEmpresaId,
    } = useListaPreciosContext()

    return (
        <>
            <ListaPreciosActionDialog mode="add" onSuccess={onSuccess} />
            <ListaPreciosActionDialog mode="edit" onSuccess={onSuccess} />
            <ListaPreciosDeleteDialog onSuccess={onSuccess} />
            <ManagePreciosDialog
                lista={selectedLista}
                isOpen={isManagePreciosDialogOpen}
                onClose={() => setIsManagePreciosDialogOpen(false)}
                onSuccess={onSuccess}
                empresaId={selectedLista?.empresa_id || userEmpresaId}
                isSuperAdmin={isSuperAdmin}
            />
        </>
    )
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Employee } from '@/lib/types'

interface DeleteEmployeeDialogProps {
  employee: Employee | null
  open: boolean
  pending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteEmployeeDialog({
  employee,
  open,
  pending,
  onOpenChange,
  onConfirm,
}: DeleteEmployeeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Deactivate employee?</DialogTitle>
          <DialogDescription>
            {employee ? (
              <>
                <strong>{employee.fullName}</strong> will be deactivated and
                removed from the list. Their record is preserved by a soft
                delete and can be restored by an administrator.
              </>
            ) : (
              'This record will be deactivated.'
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? 'Deactivating…' : 'Deactivate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
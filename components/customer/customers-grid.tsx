"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Mail, Pencil, Phone, Trash2, Users } from "lucide-react"
import { toast } from "sonner"

import { deleteCustomer } from "@/lib/actions"
import type { CustomerRow } from "@/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CustomerFormDialog } from "@/components/customer/customer-form-dialog"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function CustomersGrid({ customers }: { customers: CustomerRow[] }) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()
  const [target, setTarget] = React.useState<CustomerRow | null>(null)

  function handleDelete() {
    if (!target) return
    const id = target.id
    startTransition(async () => {
      const res = await deleteCustomer(id)
      if (res.ok) {
        toast.success("Customer deleted")
        setTarget(null)
        router.refresh()
      } else {
        toast.error(res.error ?? "Could not delete customer")
      }
    })
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {customers.map((customer) => (
          <Card key={customer.id} className="group relative gap-0 p-5">
            <div className="flex items-start justify-between gap-2 pr-9">
              <div className="flex size-10 items-center justify-center rounded-2xl border bg-muted/50 text-primary">
                <Users className="size-5" />
              </div>
            </div>

            <h3 className="mt-4 truncate font-heading text-base font-semibold">
              {customer.name}
            </h3>
            <div className="mt-1.5 flex flex-col gap-1 text-xs text-muted-foreground">
              {customer.email && (
                <span className="inline-flex items-center gap-1.5 truncate">
                  <Mail className="size-3.5 shrink-0" /> {customer.email}
                </span>
              )}
              {customer.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="size-3.5 shrink-0" /> {customer.phone}
                </span>
              )}
              {!customer.email && !customer.phone && (
                <span className="text-muted-foreground/70">No contact details</span>
              )}
            </div>

            {customer.billing_address && (
              <p className="mt-3 line-clamp-2 border-t pt-3 text-xs text-muted-foreground">
                {customer.billing_address}
              </p>
            )}

            <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 pointer-coarse:opacity-100">
              <CustomerFormDialog
                customer={customer}
                trigger={
                  <Button variant="ghost" size="icon-sm" aria-label="Edit customer">
                    <Pencil className="size-4" />
                  </Button>
                }
              />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Delete customer"
                onClick={() => setTarget(customer)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!target} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this customer?</DialogTitle>
            <DialogDescription>
              “{target?.name}” will be removed. Existing invoices keep their snapshotted
              billing details and are not affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={pending}>
              Delete customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

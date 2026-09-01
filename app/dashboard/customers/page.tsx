import type { Metadata } from "next"
import { Plus, Users } from "lucide-react"

import { getCustomers } from "@/lib/queries"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { CustomersGrid } from "@/components/customer/customers-grid"
import { CustomerFormDialog } from "@/components/customer/customer-form-dialog"

export const metadata: Metadata = { title: "Customers" }

export default async function CustomersPage() {
  const customers = await getCustomers()

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The clients you bill. Their details are snapshotted onto each invoice.
          </p>
        </div>
        <CustomerFormDialog
          trigger={
            <Button>
              <Plus className="size-4" /> New customer
            </Button>
          }
        />
      </div>

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Add the clients you sell to, then create invoices for them in a couple of clicks."
          action={
            <CustomerFormDialog
              trigger={
                <Button>
                  <Plus className="size-4" /> Add your first customer
                </Button>
              }
            />
          }
        />
      ) : (
        <CustomersGrid customers={customers} />
      )}
    </div>
  )
}

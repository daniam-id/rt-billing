import { EmptyState } from '@/components/ui';

export default function InvoicesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Invoices & Rates</h1>
        <p className="text-xs text-text-secondary">Manage bill types and pricing</p>
      </div>
      <div className="bg-canvas border border-border rounded-md">
        <EmptyState
          title="Bill type management is read-only in MVP"
          hint="Edit rates directly in the database or extend the API."
        />
      </div>
    </div>
  );
}

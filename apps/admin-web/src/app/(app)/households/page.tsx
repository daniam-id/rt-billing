'use client';

import { useHouseholds } from '@/hooks/useHouseholds';
import { HouseholdTable } from '@/components/HouseholdTable';

export default function HouseholdsPage() {
  const { data = [], isLoading } = useHouseholds();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Households</h1>
        <p className="text-xs text-text-secondary">Manage resident data, status, and contact info</p>
      </div>
      <HouseholdTable households={data} loading={isLoading} />
    </div>
  );
}

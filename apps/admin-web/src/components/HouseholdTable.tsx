'use client';

import { useState } from 'react';
import { Household, HouseholdInput, useCreateHousehold, useDeleteHousehold, useUpdateHousehold } from '@/hooks/useHouseholds';
import { Badge, Button, Input, Select, Td, Th } from './ui';
import { Modal } from './ui/Modal';

interface Props {
  households: Household[];
  loading?: boolean;
}

interface FormState {
  houseNumber: string;
  headOfFamily: string;
  phone: string;
  address: string;
  status: 'Active' | 'Vacant';
  notes: string;
}

const emptyForm: FormState = {
  houseNumber: '',
  headOfFamily: '',
  phone: '',
  address: '',
  status: 'Active',
  notes: '',
};

function HouseholdForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
  error,
}: {
  initial: FormState;
  onSubmit: (input: HouseholdInput) => void;
  onCancel: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<FormState>(initial);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      houseNumber: form.houseNumber.trim(),
      headOfFamily: form.headOfFamily.trim(),
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      status: form.status,
      notes: form.notes.trim() || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">House Number</label>
          <Input value={form.houseNumber} onChange={(e) => setForm({ ...form, houseNumber: e.target.value })} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Status</label>
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'Active' | 'Vacant' })}>
            <option value="Active">Active</option>
            <option value="Vacant">Vacant</option>
          </Select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">Head of Family</label>
        <Input value={form.headOfFamily} onChange={(e) => setForm({ ...form, headOfFamily: e.target.value })} required />
      </div>
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">Phone</label>
        <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">Address</label>
        <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      </div>
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">Notes</label>
        <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  );
}

export function HouseholdTable({ households, loading }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Household | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const create = useCreateHousehold();
  const update = useUpdateHousehold();
  const remove = useDeleteHousehold();

  function handleCreate(input: HouseholdInput) {
    setFormError(null);
    create.mutate(input, {
      onSuccess: () => setCreateOpen(false),
      onError: (e: unknown) => setFormError((e as Error).message),
    });
  }

  function handleUpdate(input: HouseholdInput) {
    if (!editing) return;
    setFormError(null);
    update.mutate(
      { id: editing.id, input },
      {
        onSuccess: () => setEditing(null),
        onError: (e: unknown) => setFormError((e as Error).message),
      }
    );
  }

  function handleDelete(h: Household) {
    if (!confirm(`Delete household ${h.houseNumber} (${h.headOfFamily})? This will fail if any bill records exist.`)) return;
    remove.mutate(h.id);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-secondary">{households.length} household(s) registered</p>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>+ Add Household</Button>
      </div>

      <div className="bg-canvas border border-border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <Th>House No.</Th>
                <Th>Head of Family</Th>
                <Th>Phone</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><Td colSpan={5} className="text-center text-text-muted py-8">Loading…</Td></tr>
              )}
              {!loading && households.length === 0 && (
                <tr><Td colSpan={5} className="text-center text-text-muted py-8">No households yet. Click "Add Household" to start.</Td></tr>
              )}
              {households.map((h) => (
                <tr key={h.id} className="hover:bg-surface">
                  <Td className="font-mono">{h.houseNumber}</Td>
                  <Td>{h.headOfFamily}</Td>
                  <Td className="font-mono text-xs text-text-secondary">{h.phone ?? '—'}</Td>
                  <Td>
                    {h.status === 'Active'
                      ? <Badge variant="active">Active</Badge>
                      : <Badge variant="vacant">Vacant</Badge>}
                  </Td>
                  <Td className="text-right">
                    <div className="inline-flex gap-2">
                      <Button variant="secondary" onClick={() => setEditing(h)}>Edit</Button>
                      <Button variant="danger" onClick={() => handleDelete(h)} disabled={remove.isPending}>Delete</Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Household">
        <HouseholdForm
          initial={emptyForm}
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
          submitting={create.isPending}
          error={formError}
        />
      </Modal>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit Household">
        {editing && (
          <HouseholdForm
            initial={{
              houseNumber: editing.houseNumber,
              headOfFamily: editing.headOfFamily,
              phone: editing.phone ?? '',
              address: editing.address ?? '',
              status: editing.status,
              notes: editing.notes ?? '',
            }}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            submitting={update.isPending}
            error={formError}
          />
        )}
      </Modal>
    </div>
  );
}

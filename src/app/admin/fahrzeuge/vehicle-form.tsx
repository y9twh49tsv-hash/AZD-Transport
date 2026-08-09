'use client';

import { useState, useTransition } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Field, Input, Select, Textarea } from '@/components/ui/input';
import { saveVehicle, type ActionResult } from '@/app/admin/actions';
import { VEHICLE_STATUSES, vehicleStatusLabels } from '@/lib/shipment-status';

export type VehicleValues = {
  id?: string;
  plate: string;
  make: string;
  model: string;
  grossWeightKg: string;
  payloadKg: string;
  cargoVolumeM3: string;
  status: string;
  notes: string;
};

const empty = (): VehicleValues => ({
  plate: '',
  make: '',
  model: '',
  grossWeightKg: '',
  payloadKg: '',
  cargoVolumeM3: '',
  status: 'available',
  notes: '',
});

export function VehicleForm({ initial }: { initial?: VehicleValues }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<VehicleValues>(initial ?? empty());
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof VehicleValues>(key: K, value: VehicleValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setResult(null);
    startTransition(async () => {
      const response = await saveVehicle({
        ...values,
        grossWeightKg: values.grossWeightKg || undefined,
        cargoVolumeM3: values.cargoVolumeM3 || undefined,
      });
      setResult(response);
      if (response.ok && !initial) {
        setValues(empty());
        setOpen(false);
      }
    });
  }

  if (!open) {
    return (
      <Button size={initial ? 'sm' : 'md'} variant={initial ? 'outline' : 'primary'} onClick={() => setOpen(true)}>
        {!initial && <Plus aria-hidden />}
        {initial ? 'Bearbeiten' : 'Neues Fahrzeug'}
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">{initial ? 'Fahrzeug bearbeiten' : 'Neues Fahrzeug'}</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-secondary"
          aria-label="Schließen"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Kennzeichen" htmlFor="v-plate" required>
          <Input
            id="v-plate"
            value={values.plate}
            onChange={(e) => set('plate', e.target.value.toUpperCase())}
            placeholder="F-MC 1234"
            required
          />
        </Field>
        <Field label="Status" htmlFor="v-status">
          <Select id="v-status" value={values.status} onChange={(e) => set('status', e.target.value)}>
            {VEHICLE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {vehicleStatusLabels[s]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Hersteller" htmlFor="v-make">
          <Input id="v-make" value={values.make} onChange={(e) => set('make', e.target.value)} placeholder="Mercedes-Benz" />
        </Field>
        <Field label="Modell" htmlFor="v-model">
          <Input id="v-model" value={values.model} onChange={(e) => set('model', e.target.value)} placeholder="Sprinter 519" />
        </Field>
        <Field label="Zulässiges Gesamtgewicht (kg)" htmlFor="v-gross">
          <Input
            id="v-gross"
            inputMode="decimal"
            value={values.grossWeightKg}
            onChange={(e) => set('grossWeightKg', e.target.value)}
            placeholder="5500"
          />
        </Field>
        <Field label="Nutzlast (kg)" htmlFor="v-payload" required>
          <Input
            id="v-payload"
            inputMode="decimal"
            value={values.payloadKg}
            onChange={(e) => set('payloadKg', e.target.value)}
            placeholder="1200"
            required
          />
        </Field>
        <Field label="Laderaum (m³)" htmlFor="v-volume">
          <Input
            id="v-volume"
            inputMode="decimal"
            value={values.cargoVolumeM3}
            onChange={(e) => set('cargoVolumeM3', e.target.value)}
            placeholder="17"
          />
        </Field>
      </div>

      <Field label="Notizen" htmlFor="v-notes" className="mt-4">
        <Textarea id="v-notes" rows={2} value={values.notes} onChange={(e) => set('notes', e.target.value)} />
      </Field>

      {result && (
        <Alert tone={result.ok ? 'success' : 'error'} className="mt-4">
          {result.ok ? (result.message ?? 'Gespeichert.') : result.error}
        </Alert>
      )}

      <div className="mt-5 flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          Speichern
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Abbrechen
        </Button>
      </div>
    </form>
  );
}

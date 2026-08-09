'use client';

import { useState, useTransition } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Field, Input, Select, Textarea } from '@/components/ui/input';
import { saveTrip, type ActionResult } from '@/app/admin/actions';
import { citiesByCountry, countryLabels, type CountryCode } from '@/config/regions';
import { TRIP_STATUSES, tripStatusLabels } from '@/lib/shipment-status';
import { todayIso } from '@/lib/utils';

type Option = { id: string; label: string };

export type TripFormValues = {
  id?: string;
  code: string;
  originCountry: CountryCode;
  originCity: string;
  destinationCountry: CountryCode;
  destinationCity: string;
  departureDate: string;
  plannedArrivalDate: string;
  vehicleId: string;
  driverId: string;
  status: string;
  maxPayloadKg: string;
  notes: string;
};

const emptyTrip = (): TripFormValues => ({
  code: `TRIP-${new Date().getFullYear()}-`,
  originCountry: 'DE',
  originCity: 'frankfurt-am-main',
  destinationCountry: 'MA',
  destinationCity: 'nador',
  departureDate: todayIso(7),
  plannedArrivalDate: todayIso(12),
  vehicleId: '',
  driverId: '',
  status: 'PLANNED',
  maxPayloadKg: '',
  notes: '',
});

export function TripForm({
  vehicles,
  drivers,
  initial,
  onDone,
}: {
  vehicles: Option[];
  drivers: Option[];
  initial?: TripFormValues;
  onDone?: () => void;
}) {
  const [open, setOpen] = useState(!!initial);
  const [values, setValues] = useState<TripFormValues>(initial ?? emptyTrip());
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof TripFormValues>(key: K, value: TripFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function setCountry(side: 'origin' | 'destination', value: CountryCode) {
    const other: CountryCode = value === 'DE' ? 'MA' : 'DE';
    setValues((prev) => ({
      ...prev,
      ...(side === 'origin'
        ? {
            originCountry: value,
            originCity: citiesByCountry(value)[0]?.slug ?? '',
            destinationCountry: other,
            destinationCity: citiesByCountry(other)[0]?.slug ?? '',
          }
        : {
            destinationCountry: value,
            destinationCity: citiesByCountry(value)[0]?.slug ?? '',
            originCountry: other,
            originCity: citiesByCountry(other)[0]?.slug ?? '',
          }),
    }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setResult(null);
    startTransition(async () => {
      const response = await saveTrip({
        ...values,
        maxPayloadKg: values.maxPayloadKg || undefined,
      });
      setResult(response);
      if (response.ok) {
        setValues(emptyTrip());
        setOpen(false);
        onDone?.();
      }
    });
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus aria-hidden />
        Neue Tour
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">{initial ? 'Tour bearbeiten' : 'Neue Tour anlegen'}</h2>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onDone?.();
          }}
          className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-secondary"
          aria-label="Schließen"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tour-ID" htmlFor="trip-code" hint="z. B. TRIP-2026-001" required>
          <Input
            id="trip-code"
            value={values.code}
            onChange={(e) => set('code', e.target.value.toUpperCase())}
            required
            className="font-mono"
          />
        </Field>

        <Field label="Status" htmlFor="trip-status">
          <Select id="trip-status" value={values.status} onChange={(e) => set('status', e.target.value)}>
            {TRIP_STATUSES.map((status) => (
              <option key={status} value={status}>
                {tripStatusLabels[status]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Startland" htmlFor="trip-origin-country">
          <Select
            id="trip-origin-country"
            value={values.originCountry}
            onChange={(e) => setCountry('origin', e.target.value as CountryCode)}
          >
            {(['DE', 'MA'] as CountryCode[]).map((c) => (
              <option key={c} value={c}>
                {countryLabels[c]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Zielland" htmlFor="trip-destination-country">
          <Select
            id="trip-destination-country"
            value={values.destinationCountry}
            onChange={(e) => setCountry('destination', e.target.value as CountryCode)}
          >
            {(['DE', 'MA'] as CountryCode[]).map((c) => (
              <option key={c} value={c}>
                {countryLabels[c]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Startstadt" htmlFor="trip-origin-city">
          <Select
            id="trip-origin-city"
            value={values.originCity}
            onChange={(e) => set('originCity', e.target.value)}
          >
            {citiesByCountry(values.originCountry).map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Zielstadt" htmlFor="trip-destination-city">
          <Select
            id="trip-destination-city"
            value={values.destinationCity}
            onChange={(e) => set('destinationCity', e.target.value)}
          >
            {citiesByCountry(values.destinationCountry).map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Abfahrt" htmlFor="trip-departure" required>
          <Input
            id="trip-departure"
            type="date"
            value={values.departureDate}
            onChange={(e) => set('departureDate', e.target.value)}
            required
          />
        </Field>

        <Field label="Geplante Ankunft" htmlFor="trip-arrival">
          <Input
            id="trip-arrival"
            type="date"
            value={values.plannedArrivalDate}
            onChange={(e) => set('plannedArrivalDate', e.target.value)}
          />
        </Field>

        <Field label="Fahrzeug" htmlFor="trip-vehicle">
          <Select
            id="trip-vehicle"
            value={values.vehicleId}
            onChange={(e) => set('vehicleId', e.target.value)}
          >
            <option value="">Noch offen</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Fahrer" htmlFor="trip-driver">
          <Select
            id="trip-driver"
            value={values.driverId}
            onChange={(e) => set('driverId', e.target.value)}
          >
            <option value="">Noch offen</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Max. Nutzlast (kg)"
          htmlFor="trip-payload"
          hint="Leer lassen, um die Nutzlast des Fahrzeugs zu übernehmen."
        >
          <Input
            id="trip-payload"
            inputMode="decimal"
            value={values.maxPayloadKg}
            onChange={(e) => set('maxPayloadKg', e.target.value)}
            placeholder="1200"
          />
        </Field>
      </div>

      <Field label="Notizen" htmlFor="trip-notes" className="mt-4">
        <Textarea
          id="trip-notes"
          rows={2}
          value={values.notes}
          onChange={(e) => set('notes', e.target.value)}
        />
      </Field>

      {result && (
        <Alert tone={result.ok ? 'success' : 'error'} className="mt-4">
          {result.ok ? (result.message ?? 'Gespeichert.') : result.error}
        </Alert>
      )}

      <div className="mt-5 flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          Tour speichern
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setOpen(false);
            onDone?.();
          }}
        >
          Abbrechen
        </Button>
      </div>
    </form>
  );
}

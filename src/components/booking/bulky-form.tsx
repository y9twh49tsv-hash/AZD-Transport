'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Checkbox, Field, Input, Select, Textarea } from '@/components/ui/input';
import { PhotoUpload, type UploadedPhoto } from '@/components/booking/photo-upload';
import { bulkyRequestSchema, type BulkyRequestInput } from '@/lib/validation';
import { citiesByCountry, countryFlags, countryLabels, type CountryCode } from '@/config/regions';
import { createBulkyRequest } from '@/app/(site)/sperrgut/actions';
import { useT } from '@/lib/i18n/client';

const COMMON_ITEMS = [
  'Waschmaschine',
  'Kühlschrank',
  'Fahrrad',
  'Möbel',
  'Autoteile',
  'Fernseher',
  'Kinderwagen',
  'Sonstiges',
];

export type BulkyDefaults = {
  originCountry?: CountryCode;
  originCity?: string;
  destinationCountry?: CountryCode;
  destinationCity?: string;
  approxWeightKg?: number;
};

export function BulkyForm({ defaults }: { defaults?: BulkyDefaults }) {
  const t = useT();
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const form = useForm<BulkyRequestInput>({
    resolver: zodResolver(bulkyRequestSchema),
    mode: 'onTouched',
    defaultValues: {
      originCountry: defaults?.originCountry ?? 'DE',
      originCity: defaults?.originCity ?? 'frankfurt-am-main',
      destinationCountry: defaults?.destinationCountry ?? 'MA',
      destinationCity: defaults?.destinationCity ?? 'nador',
      itemType: '',
      itemDescription: '',
      approxWeightKg: defaults?.approxWeightKg ?? undefined,
      lengthCm: undefined,
      widthCm: undefined,
      heightCm: undefined,
      contactFirstName: '',
      contactLastName: '',
      phone: '',
      email: '',
      pickupRequested: false,
      notes: '',
      photoPaths: [],
      prohibitedConfirmed: undefined,
    } as never,
  });

  const { register, watch, setValue, formState } = form;
  const errors = formState.errors;
  const originCountry = watch('originCountry');
  const destinationCountry = watch('destinationCountry');

  function handleCountryChange(side: 'origin' | 'destination', value: CountryCode) {
    const other: CountryCode = value === 'DE' ? 'MA' : 'DE';
    if (side === 'origin') {
      setValue('originCountry', value);
      setValue('originCity', citiesByCountry(value)[0]?.slug ?? '');
      setValue('destinationCountry', other);
      setValue('destinationCity', citiesByCountry(other)[0]?.slug ?? '');
    } else {
      setValue('destinationCountry', value);
      setValue('destinationCity', citiesByCountry(value)[0]?.slug ?? '');
      setValue('originCountry', other);
      setValue('originCity', citiesByCountry(other)[0]?.slug ?? '');
    }
  }

  function onSubmit(data: BulkyRequestInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await createBulkyRequest({
        ...data,
        photoPaths: photos.map((p) => p.path),
      });

      if (result.ok) {
        setReference(result.reference);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      setServerError(result.error);
    });
  }

  if (reference) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-primary-muted">
          <CheckCircle2 className="size-8 text-primary" aria-hidden />
        </span>
        <h2 className="mt-6 text-3xl font-bold tracking-tight">{t('bulky.successTitle')}</h2>
        <p className="mt-3 text-base text-muted-foreground">{t('bulky.successHint')}</p>

        <div className="surface mt-8 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Deine Referenz
          </p>
          <p className="mt-2 font-mono text-2xl font-bold text-primary">{reference}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Sobald wir deine Fotos geprüft haben, bekommst du von uns einen Festpreis — per E-Mail
            und auf Wunsch telefonisch. Erst wenn du zusagst, entsteht eine Sendung.
          </p>
        </div>

        <Link href="/" className="mt-6 inline-block">
          <Button variant="outline">Zur Startseite</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>
      {/* Photos first — that is what actually determines the price */}
      <section className="surface p-5 sm:p-7">
        <h2 className="text-xl font-semibold tracking-tight">Fotos deines Gegenstands</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Am besten von vorne und von der Seite, mit etwas Abstand. Je klarer die Fotos, desto
          genauer unser Preis.
        </p>
        <div className="mt-5">
          <PhotoUpload photos={photos} onChange={setPhotos} disabled={pending} />
        </div>
      </section>

      {/* Item */}
      <section className="surface space-y-5 p-5 sm:p-7">
        <h2 className="text-xl font-semibold tracking-tight">Was soll transportiert werden?</h2>

        <Field label="Gegenstand" htmlFor="item-type" error={errors.itemType?.message} required>
          <Input
            id="item-type"
            list="common-items"
            placeholder="z. B. Waschmaschine"
            aria-invalid={!!errors.itemType}
            {...register('itemType')}
          />
          <datalist id="common-items">
            {COMMON_ITEMS.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </Field>

        <Field
          label="Beschreibung"
          htmlFor="item-description"
          error={errors.itemDescription?.message}
          hint="Marke, Zustand, Verpackung — alles, was uns hilft."
        >
          <Textarea
            id="item-description"
            rows={3}
            placeholder="Bosch Serie 6, in Originalverpackung"
            {...register('itemDescription')}
          />
        </Field>

        <Field
          label="Ungefähres Gewicht in kg"
          htmlFor="approx-weight"
          error={errors.approxWeightKg?.message}
          hint="Eine Schätzung reicht — wir wiegen bei der Abholung nach."
          required
        >
          <Input
            id="approx-weight"
            type="text"
            inputMode="decimal"
            placeholder="z. B. 75"
            aria-invalid={!!errors.approxWeightKg}
            {...register('approxWeightKg')}
          />
        </Field>

        <fieldset>
          <legend className="field-label">Maße in cm</legend>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Länge" htmlFor="length" error={errors.lengthCm?.message}>
              <Input id="length" type="number" inputMode="numeric" min={1} placeholder="60" {...register('lengthCm')} />
            </Field>
            <Field label="Breite" htmlFor="width" error={errors.widthCm?.message}>
              <Input id="width" type="number" inputMode="numeric" min={1} placeholder="60" {...register('widthCm')} />
            </Field>
            <Field label="Höhe" htmlFor="height" error={errors.heightCm?.message}>
              <Input id="height" type="number" inputMode="numeric" min={1} placeholder="85" {...register('heightCm')} />
            </Field>
          </div>
        </fieldset>
      </section>

      {/* Route */}
      <section className="surface space-y-5 p-5 sm:p-7">
        <h2 className="text-xl font-semibold tracking-tight">Von wo nach wo?</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('common.from')} htmlFor="b-origin-country" required>
            <Select
              id="b-origin-country"
              value={originCountry}
              onChange={(e) => handleCountryChange('origin', e.target.value as CountryCode)}
            >
              {(['DE', 'MA'] as CountryCode[]).map((c) => (
                <option key={c} value={c}>
                  {countryFlags[c]} {countryLabels[c]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('common.to')} htmlFor="b-destination-country" required>
            <Select
              id="b-destination-country"
              value={destinationCountry}
              onChange={(e) => handleCountryChange('destination', e.target.value as CountryCode)}
            >
              {(['DE', 'MA'] as CountryCode[]).map((c) => (
                <option key={c} value={c}>
                  {countryFlags[c]} {countryLabels[c]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Abholort" htmlFor="b-origin-city" error={errors.originCity?.message} required>
            <Select id="b-origin-city" {...register('originCity')}>
              {citiesByCountry(originCountry).map((city) => (
                <option key={city.slug} value={city.slug}>
                  {city.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Zielort" htmlFor="b-destination-city" error={errors.destinationCity?.message} required>
            <Select id="b-destination-city" {...register('destinationCity')}>
              {citiesByCountry(destinationCountry).map((city) => (
                <option key={city.slug} value={city.slug}>
                  {city.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Checkbox
          label={
            <>
              <span className="font-medium">Abholung gewünscht</span>
              <span className="block text-muted-foreground">
                Bei Sperrgut kalkulieren wir die Abholung individuell in den Festpreis ein.
              </span>
            </>
          }
          {...register('pickupRequested')}
        />
      </section>

      {/* Contact */}
      <section className="surface space-y-5 p-5 sm:p-7">
        <h2 className="text-xl font-semibold tracking-tight">Wie erreichen wir dich?</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Vorname" htmlFor="b-first" error={errors.contactFirstName?.message} required>
            <Input id="b-first" autoComplete="given-name" aria-invalid={!!errors.contactFirstName} {...register('contactFirstName')} />
          </Field>
          <Field label="Nachname" htmlFor="b-last" error={errors.contactLastName?.message} required>
            <Input id="b-last" autoComplete="family-name" aria-invalid={!!errors.contactLastName} {...register('contactLastName')} />
          </Field>
          <Field label="Telefonnummer" htmlFor="b-phone" error={errors.phone?.message} required>
            <Input
              id="b-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+49 176 1234567"
              aria-invalid={!!errors.phone}
              {...register('phone')}
            />
          </Field>
          <Field
            label="E-Mail"
            htmlFor="b-email"
            error={errors.email?.message}
            hint="Für dein Angebot — empfohlen."
          >
            <Input id="b-email" type="email" inputMode="email" autoComplete="email" {...register('email')} />
          </Field>
        </div>

        <Field label="Anmerkungen" htmlFor="b-notes" error={errors.notes?.message}>
          <Textarea id="b-notes" rows={3} placeholder="Bitte im Erdgeschoss abholen" {...register('notes')} />
        </Field>

        <Checkbox
          label={
            <>
              Ich bestätige, dass die Sendung keine verbotenen oder nicht deklarierten Waren
              enthält.{' '}
              <Link href="/verbotene-waren" target="_blank" className="font-medium text-primary underline">
                Liste ansehen
              </Link>
            </>
          }
          error={errors.prohibitedConfirmed?.message}
          {...register('prohibitedConfirmed')}
        />
      </section>

      {serverError && (
        <Alert tone="error" title="Anfrage nicht möglich">
          {serverError}
        </Alert>
      )}

      <Button type="submit" size="lg" block disabled={pending} className="sm:w-auto">
        {pending ? 'Wird gesendet …' : 'Anfrage senden'}
        {!pending && <Send aria-hidden />}
      </Button>
    </form>
  );
}

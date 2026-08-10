'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  FileText,
  Package,
  PackageSearch,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Checkbox, Field, Input, Select, Textarea } from '@/components/ui/input';
import { bookingSchema, type BookingInput } from '@/lib/validation';
import { calculatePrice, formatCents, formatWeight } from '@/lib/pricing';
import { pricingConfig } from '@/config/pricing';
import {
  citiesByCountry,
  cityName,
  countryFlags,
  countryLabels,
  type CountryCode,
} from '@/config/regions';
import { prohibitedShortList } from '@/config/prohibited-items';
import { cn, todayIso } from '@/lib/utils';
import { whatsappShareLink } from '@/lib/notifications/whatsapp';
import { createBooking } from '@/app/(site)/buchen/actions';
import { useT } from '@/lib/i18n/client';


/** Which fields must be valid before the user may move to the next step. */
const STEP_FIELDS: Record<number, FieldPath<BookingInput>[]> = {
  0: [
    'originCountry',
    'originCity',
    'destinationCountry',
    'destinationCity',
    'shipmentType',
    'weightKg',
    'pieceCount',
    'contentType',
    'description',
    'pickupRequested',
    'pickupDate',
  ],
  1: [
    'senderFirstName',
    'senderLastName',
    'senderPhone',
    'senderEmail',
    'senderAddress',
    'senderPostalCode',
    'senderCity',
    'senderCountry',
  ],
  2: [
    'recipientFirstName',
    'recipientLastName',
    'recipientPhone',
    'recipientAddress',
    'recipientCity',
    'recipientCountry',
  ],
  3: ['detailsConfirmed', 'prohibitedConfirmed', 'termsAccepted'],
};

/**
 * Plain German names for the error summary on the last step.
 *
 * Without them a rejected field shows only its message, and a message can be
 * as unhelpful as "Invalid input" — leaving someone staring at a form where
 * every visible field looks correct, because the offending one lives two steps
 * back and is not on screen.
 */
const FIELD_LABELS: Partial<Record<FieldPath<BookingInput>, string>> = {
  originCountry: 'Startland',
  originCity: 'Abholstadt',
  destinationCountry: 'Zielland',
  destinationCity: 'Zielstadt',
  shipmentType: 'Art der Sendung',
  weightKg: 'Gewicht',
  pieceCount: 'Gepäckstücke',
  contentType: 'Art des Inhalts',
  description: 'Beschreibung',
  pickupRequested: 'Abholung',
  pickupDate: 'Abholdatum',
  senderFirstName: 'Vorname (Absender)',
  senderLastName: 'Nachname (Absender)',
  senderPhone: 'Telefon (Absender)',
  senderEmail: 'E-Mail (Absender)',
  senderAddress: 'Adresse (Absender)',
  senderPostalCode: 'PLZ (Absender)',
  senderCity: 'Stadt (Absender)',
  senderCountry: 'Land (Absender)',
  recipientFirstName: 'Vorname (Empfänger)',
  recipientLastName: 'Nachname (Empfänger)',
  recipientPhone: 'Telefon (Empfänger)',
  recipientAddress: 'Adresse (Empfänger)',
  recipientCity: 'Stadt (Empfänger)',
  recipientCountry: 'Land (Empfänger)',
  detailsConfirmed: 'Bestätigung der Angaben',
  prohibitedConfirmed: 'Bestätigung zu verbotenen Waren',
  termsAccepted: 'Versandbedingungen',
};

/** In welchem Schritt das Feld steht — für den Sprung dorthin. */
function stepOfField(field: string): number {
  for (const [step, fields] of Object.entries(STEP_FIELDS)) {
    if ((fields as string[]).includes(field)) return Number(step);
  }
  return 0;
}

export type BookingDefaults = Partial<
  Pick<
    BookingInput,
    | 'originCountry'
    | 'originCity'
    | 'destinationCountry'
    | 'destinationCity'
    | 'weightKg'
    | 'shipmentType'
  >
> & { pickupRequested?: boolean };

export function BookingForm({ defaults }: { defaults?: BookingDefaults }) {
  const t = useT();
  const [step, setStep] = useState(0);

  // Innerhalb der Komponente: auf Modulebene würde die Beschriftung einmal beim
  // Laden ausgewertet und bliebe in der damals geltenden Sprache stehen.
  const STEPS = [
    { id: 'shipment', label: t('booking.stepShipment') },
    { id: 'sender', label: t('booking.stepSender') },
    { id: 'recipient', label: t('booking.stepRecipient') },
    { id: 'confirm', label: t('booking.stepConfirm') },
  ] as const;
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ trackingNumber: string; totalCents: number } | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  const form = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    mode: 'onTouched',
    defaultValues: {
      originCountry: defaults?.originCountry ?? 'DE',
      originCity: defaults?.originCity ?? 'frankfurt-am-main',
      destinationCountry: defaults?.destinationCountry ?? 'MA',
      destinationCity: defaults?.destinationCity ?? 'nador',
      shipmentType: defaults?.shipmentType ?? 'standard',
      weightKg: defaults?.weightKg ?? undefined,
      pieceCount: 1,
      contentType: '',
      description: '',
      pickupRequested: defaults?.pickupRequested ?? false,
      pickupDate: '',
      senderFirstName: '',
      senderLastName: '',
      senderPhone: '',
      senderEmail: '',
      senderAddress: '',
      senderPostalCode: '',
      senderCity: '',
      senderCountry: defaults?.originCountry ?? 'DE',
      recipientFirstName: '',
      recipientLastName: '',
      recipientPhone: '',
      recipientAddress: '',
      recipientCity: '',
      recipientCountry: defaults?.destinationCountry ?? 'MA',
      detailsConfirmed: undefined,
      prohibitedConfirmed: undefined,
      termsAccepted: undefined,
    } as never,
  });

  const values = form.watch();
  const errors = form.formState.errors;

  const price = useMemo(
    () =>
      calculatePrice({
        weightKg: Number(values.weightKg) || 0,
        pickupRequested: !!values.pickupRequested,
        shipmentType: values.shipmentType ?? 'standard',
      }),
    [values.weightKg, values.pickupRequested, values.shipmentType],
  );

  async function goNext() {
    const valid = await form.trigger(STEP_FIELDS[step]);
    if (!valid) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function onSubmit(data: BookingInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await createBooking(data);
      if (result.ok) {
        setSuccess({ trackingNumber: result.trackingNumber, totalCents: price.totalCents });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      setServerError(result.error);
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          form.setError(field as FieldPath<BookingInput>, { message });
        }
      }
    });
  }

  if (success) {
    return <BookingSuccess {...success} />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        {/* Stepper */}
        <ol className="mb-8 flex items-center gap-1.5" aria-label="Fortschritt">
          {STEPS.map((s, index) => (
            <li key={s.id} className="flex flex-1 flex-col gap-1.5">
              <span
                className={cn(
                  'h-1.5 rounded-full transition-colors',
                  index <= step ? 'bg-primary' : 'bg-input',
                )}
              />
              <span
                className={cn(
                  'text-[0.7rem] font-medium sm:text-xs',
                  index === step ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {s.label}
              </span>
            </li>
          ))}
        </ol>

        <div className="surface p-5 sm:p-7">
          {step === 0 && <ShipmentStep form={form} price={price} />}
          {step === 1 && <SenderStep form={form} />}
          {step === 2 && <RecipientStep form={form} />}
          {step === 3 && <ConfirmStep form={form} price={price} />}

          {serverError && (
            <Alert tone="error" title="Buchung nicht möglich" className="mt-6">
              {serverError}
            </Alert>
          )}

          {step === 3 && Object.keys(errors).length > 0 && (
            <Alert tone="error" title="Bitte prüfe deine Angaben" className="mt-6">
              <ul className="list-disc space-y-1 pl-5">
                {Object.entries(errors)
                  .slice(0, 6)
                  .map(([field, error]) => {
                    const label = FIELD_LABELS[field as FieldPath<BookingInput>];
                    const targetStep = stepOfField(field);
                    return (
                      <li key={field}>
                        {label && (
                          <button
                            type="button"
                            onClick={() => {
                              setStep(targetStep);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="font-medium underline underline-offset-2"
                          >
                            {label}
                          </button>
                        )}
                        {label ? ': ' : ''}
                        {(error as { message?: string })?.message}
                      </li>
                    );
                  })}
              </ul>
            </Alert>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            {step > 0 ? (
              <Button type="button" variant="ghost" onClick={goBack} disabled={pending}>
                <ArrowLeft aria-hidden />
                {t('common.back')}
              </Button>
            ) : (
              <span className="hidden sm:block" />
            )}

            {step < STEPS.length - 1 ? (
              <Button type="button" size="lg" onClick={goNext} className="sm:min-w-44">
                {t('common.next')}
                <ArrowRight aria-hidden />
              </Button>
            ) : (
              <Button type="submit" size="lg" disabled={pending} className="sm:min-w-56">
                {pending ? 'Wird gebucht …' : 'Jetzt verbindlich buchen'}
                {!pending && <Check aria-hidden />}
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Sticky price summary */}
      <aside className="lg:sticky lg:top-24">
        <div className="surface p-5">
          <h2 className="text-sm font-semibold text-muted-foreground">Zusammenfassung</h2>
          <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums">
            {values.weightKg ? formatCents(price.totalCents) : '—'}
          </p>

          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <Row label="Route">
              {cityName(values.originCity)} → {cityName(values.destinationCity)}
            </Row>
            <Row label="Gewicht">{values.weightKg ? formatWeight(Number(values.weightKg)) : '—'}</Row>
            <Row label="Gepäckstücke">{values.pieceCount || '—'}</Row>
            <Row label="Abholung">
              {values.pickupRequested
                ? `Ja (+${formatCents(pricingConfig.pickupFeeCents)})`
                : 'Nein — Abgabe bei uns'}
            </Row>
          </dl>

          <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
            Der endgültige Preis wird bei der Annahme anhand des tatsächlichen Gewichts geprüft.
            Abweichungen besprechen wir immer vorher mit dir.
          </p>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

type FormApi = ReturnType<typeof useForm<BookingInput>>;

function ShipmentStep({ form, price }: { form: FormApi; price: ReturnType<typeof calculatePrice> }) {
  const t = useT();
  const { register, watch, setValue, formState } = form;
  const errors = formState.errors;
  const originCountry = watch('originCountry');
  const destinationCountry = watch('destinationCountry');
  const pickupRequested = watch('pickupRequested');
  const weight = watch('weightKg');
  const shipmentType = watch('shipmentType');

  function handleCountryChange(side: 'origin' | 'destination', value: CountryCode) {
    const other: CountryCode = value === 'DE' ? 'MA' : 'DE';
    if (side === 'origin') {
      setValue('originCountry', value);
      setValue('originCity', citiesByCountry(value)[0]?.slug ?? '');
      setValue('senderCountry', value);
      setValue('destinationCountry', other);
      setValue('destinationCity', citiesByCountry(other)[0]?.slug ?? '');
      setValue('recipientCountry', other);
    } else {
      setValue('destinationCountry', value);
      setValue('destinationCity', citiesByCountry(value)[0]?.slug ?? '');
      setValue('recipientCountry', value);
      setValue('originCountry', other);
      setValue('originCity', citiesByCountry(other)[0]?.slug ?? '');
      setValue('senderCountry', other);
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-semibold tracking-tight">Was möchtest du versenden?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {shipmentType === 'documents'
            ? `Dokumente kosten pauschal ${formatCents(pricingConfig.documentsPriceCents)} bis ${pricingConfig.maxDocumentsWeightKg} kg.`
            : `Der Preis berechnet sich automatisch: ${formatCents(pricingConfig.pricePerKgCents)} pro kg, mindestens ${formatCents(pricingConfig.minimumPriceCents)}.`}
        </p>
      </header>

      <fieldset>
        <legend className="field-label">{t('calculator.typeLabel')}</legend>
        <div className="grid grid-cols-2 gap-2.5">
          {(
            [
              {
                value: 'standard' as const,
                icon: Package,
                label: t('calculator.typeStandard'),
                hint: t('calculator.typeStandardHint'),
              },
              {
                value: 'documents' as const,
                icon: FileText,
                label: t('calculator.typeDocuments'),
                hint: `${formatCents(pricingConfig.documentsPriceCents)} pauschal`,
              },
            ]
          ).map((option) => {
            const Icon = option.icon;
            const active = shipmentType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setValue('shipmentType', option.value, { shouldValidate: true });
                  // Dokumente sind ein Umschlag. Ohne das Zurücksetzen bliebe
                  // eine vorher eingetragene Stückzahl stehen und die Buchung
                  // scheiterte an einer Regel, die der Kunde nicht sieht.
                  if (option.value === 'documents') setValue('pieceCount', 1);
                }}
                aria-pressed={active}
                className={cn(
                  'flex min-h-[4.5rem] flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition-colors',
                  active ? 'border-primary bg-primary-muted' : 'border-border bg-card hover:bg-secondary',
                )}
              >
                <Icon className={cn('size-5', active ? 'text-primary' : 'text-muted-foreground')} aria-hidden />
                <span className="text-sm font-semibold leading-tight">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.hint}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('common.from')} htmlFor="origin-country" required>
          <Select
            id="origin-country"
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

        <Field label={t('common.to')} htmlFor="destination-country" required>
          <Select
            id="destination-country"
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

        <Field
          label={t('calculator.originCity')}
          htmlFor="origin-city"
          error={errors.originCity?.message}
          required
        >
          <Select id="origin-city" {...register('originCity')}>
            {citiesByCountry(originCountry).map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}
                {city.active ? '' : ' (auf Anfrage)'}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label={t('calculator.destinationCity')}
          htmlFor="destination-city"
          error={errors.destinationCity?.message}
          required
        >
          <Select id="destination-city" {...register('destinationCity')}>
            {citiesByCountry(destinationCountry).map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}
                {city.active ? '' : ' (auf Anfrage)'}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Gewicht in kg"
          htmlFor="weight"
          error={errors.weightKg?.message}
          hint={
            weight
              ? `Transport: ${formatCents(price.basePriceCents)}`
              : `Mindestpreis ${formatCents(pricingConfig.minimumPriceCents)}`
          }
          required
        >
          <Input
            id="weight"
            type="text"
            inputMode="decimal"
            placeholder="z. B. 25"
            aria-invalid={!!errors.weightKg}
            className="text-lg font-semibold"
            {...register('weightKg')}
          />
        </Field>

        <Field
          label="Anzahl Gepäckstücke"
          htmlFor="pieces"
          error={errors.pieceCount?.message}
          hint="Kartons, Taschen oder Koffer zusammengezählt"
          required
        >
          <Input
            id="pieces"
            type="number"
            inputMode="numeric"
            min={1}
            max={200}
            aria-invalid={!!errors.pieceCount}
            {...register('pieceCount')}
          />
        </Field>
      </div>

      <Field
        label="Art des Inhalts"
        htmlFor="content-type"
        error={errors.contentType?.message}
        hint="z. B. Kleidung, Haushaltswaren, Geschenke"
        required
      >
        <Input
          id="content-type"
          placeholder="Kleidung & Haushaltswaren"
          aria-invalid={!!errors.contentType}
          {...register('contentType')}
        />
      </Field>

      <Field
        label="Beschreibung"
        htmlFor="description"
        error={errors.description?.message}
        hint="Optional — hilft uns bei der Zollanmeldung und beim Verladen."
      >
        <Textarea
          id="description"
          rows={3}
          placeholder="2 Kartons Kleidung, 1 Reisetasche"
          {...register('description')}
        />
      </Field>

      <Checkbox
        label={
          <>
            <span className="font-medium">Abholung bei mir zu Hause</span>
            <span className="block text-muted-foreground">
              Wir holen deine Sendung ab (+{formatCents(pricingConfig.pickupFeeCents)}). Ohne
              Abholung gibst du sie bei uns ab.
            </span>
          </>
        }
        {...register('pickupRequested')}
      />

      {pickupRequested && (
        <Field
          label="Gewünschtes Abholdatum"
          htmlFor="pickup-date"
          error={errors.pickupDate?.message}
          hint="Wir bestätigen dir den genauen Zeitraum telefonisch."
          required
        >
          <Input
            id="pickup-date"
            type="date"
            min={todayIso()}
            aria-invalid={!!errors.pickupDate}
            {...register('pickupDate')}
          />
        </Field>
      )}
    </div>
  );
}

function SenderStep({ form }: { form: FormApi }) {
  const { register, formState } = form;
  const errors = formState.errors;

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-semibold tracking-tight">Deine Kontaktdaten</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Wir brauchen sie für die Bestätigung und für Rückfragen zur Sendung.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Vorname" htmlFor="s-first" error={errors.senderFirstName?.message} required>
          <Input id="s-first" autoComplete="given-name" aria-invalid={!!errors.senderFirstName} {...register('senderFirstName')} />
        </Field>
        <Field label="Nachname" htmlFor="s-last" error={errors.senderLastName?.message} required>
          <Input id="s-last" autoComplete="family-name" aria-invalid={!!errors.senderLastName} {...register('senderLastName')} />
        </Field>
        <Field label="Telefonnummer" htmlFor="s-phone" error={errors.senderPhone?.message} required>
          <Input
            id="s-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+49 176 1234567"
            aria-invalid={!!errors.senderPhone}
            {...register('senderPhone')}
          />
        </Field>
        <Field label="E-Mail" htmlFor="s-email" error={errors.senderEmail?.message} required>
          <Input
            id="s-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@example.com"
            aria-invalid={!!errors.senderEmail}
            {...register('senderEmail')}
          />
        </Field>
      </div>

      <Field label="Adresse" htmlFor="s-address" error={errors.senderAddress?.message} required>
        <Input
          id="s-address"
          autoComplete="street-address"
          placeholder="Straße und Hausnummer"
          aria-invalid={!!errors.senderAddress}
          {...register('senderAddress')}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
        <Field label="PLZ" htmlFor="s-zip" error={errors.senderPostalCode?.message}>
          <Input id="s-zip" inputMode="numeric" autoComplete="postal-code" {...register('senderPostalCode')} />
        </Field>
        <Field label="Stadt" htmlFor="s-city" error={errors.senderCity?.message} required>
          <Input id="s-city" autoComplete="address-level2" aria-invalid={!!errors.senderCity} {...register('senderCity')} />
        </Field>
      </div>

      <Field label="Land" htmlFor="s-country" error={errors.senderCountry?.message} required>
        <Select id="s-country" {...register('senderCountry')}>
          {(['DE', 'MA'] as CountryCode[]).map((c) => (
            <option key={c} value={c}>
              {countryFlags[c]} {countryLabels[c]}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
}

function RecipientStep({ form }: { form: FormApi }) {
  const { register, formState } = form;
  const errors = formState.errors;

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-semibold tracking-tight">Wer bekommt die Sendung?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Die Telefonnummer des Empfängers ist wichtig — ohne sie können wir nicht zustellen.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Vorname" htmlFor="r-first" error={errors.recipientFirstName?.message} required>
          <Input id="r-first" aria-invalid={!!errors.recipientFirstName} {...register('recipientFirstName')} />
        </Field>
        <Field label="Nachname" htmlFor="r-last" error={errors.recipientLastName?.message} required>
          <Input id="r-last" aria-invalid={!!errors.recipientLastName} {...register('recipientLastName')} />
        </Field>
      </div>

      <Field label="Telefonnummer" htmlFor="r-phone" error={errors.recipientPhone?.message} required>
        <Input
          id="r-phone"
          type="tel"
          inputMode="tel"
          placeholder="+212 6 12 34 56 78"
          aria-invalid={!!errors.recipientPhone}
          {...register('recipientPhone')}
        />
      </Field>

      <Field label="Adresse" htmlFor="r-address" error={errors.recipientAddress?.message} required>
        <Input
          id="r-address"
          placeholder="Straße, Hausnummer, Viertel"
          aria-invalid={!!errors.recipientAddress}
          {...register('recipientAddress')}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Stadt" htmlFor="r-city" error={errors.recipientCity?.message} required>
          <Input id="r-city" aria-invalid={!!errors.recipientCity} {...register('recipientCity')} />
        </Field>
        <Field label="Land" htmlFor="r-country" error={errors.recipientCountry?.message} required>
          <Select id="r-country" {...register('recipientCountry')}>
            {(['DE', 'MA'] as CountryCode[]).map((c) => (
              <option key={c} value={c}>
                {countryFlags[c]} {countryLabels[c]}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </div>
  );
}

function ConfirmStep({ form, price }: { form: FormApi; price: ReturnType<typeof calculatePrice> }) {
  const t = useT();
  const { register, watch, formState } = form;
  const errors = formState.errors;
  const v = watch();

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold tracking-tight">Alles korrekt?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Prüfe deine Angaben und bestätige die drei Punkte, dann ist deine Sendung gebucht.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <SummaryBlock title="Sendung">
          <SummaryRow label="Route">
            {cityName(v.originCity)} → {cityName(v.destinationCity)}
          </SummaryRow>
          <SummaryRow label="Gewicht">{formatWeight(Number(v.weightKg))}</SummaryRow>
          <SummaryRow label="Gepäckstücke">{v.pieceCount}</SummaryRow>
          <SummaryRow label="Inhalt">{v.contentType}</SummaryRow>
          <SummaryRow label="Abholung">
            {v.pickupRequested ? `Ja, am ${v.pickupDate}` : 'Nein'}
          </SummaryRow>
        </SummaryBlock>

        <SummaryBlock title="Preis">
          <SummaryRow label="Transport">{formatCents(price.basePriceCents)}</SummaryRow>
          {price.pickupFeeCents > 0 && (
            <SummaryRow label="Abholung">{formatCents(price.pickupFeeCents)}</SummaryRow>
          )}
          <SummaryRow label="Gesamt">
            <strong className="text-base">{formatCents(price.totalCents)}</strong>
          </SummaryRow>
          <p className="pt-2 text-xs text-muted-foreground">
            Bezahlung bei Abgabe oder Abholung. Online-Zahlung folgt.
          </p>
        </SummaryBlock>

        <SummaryBlock title="Absender">
          <SummaryRow label="Name">
            {v.senderFirstName} {v.senderLastName}
          </SummaryRow>
          <SummaryRow label="Telefon">{v.senderPhone}</SummaryRow>
          <SummaryRow label="E-Mail">{v.senderEmail}</SummaryRow>
          <SummaryRow label="Adresse">
            {v.senderAddress}, {v.senderPostalCode} {v.senderCity}
          </SummaryRow>
        </SummaryBlock>

        <SummaryBlock title="Empfänger">
          <SummaryRow label="Name">
            {v.recipientFirstName} {v.recipientLastName}
          </SummaryRow>
          <SummaryRow label="Telefon">{v.recipientPhone}</SummaryRow>
          <SummaryRow label="Adresse">
            {v.recipientAddress}, {v.recipientCity}
          </SummaryRow>
        </SummaryBlock>
      </div>

      <div className="space-y-3">
        <Checkbox
          label={t('booking.confirmDetails')}
          error={errors.detailsConfirmed?.message}
          {...register('detailsConfirmed')}
        />
        <Checkbox
          label={
            <>
              {t('booking.confirmProhibited')}{' '}
              <Link href="/verbotene-waren" target="_blank" className="font-medium text-primary underline">
                Liste ansehen
              </Link>
              <span className="mt-1 block text-xs text-muted-foreground">
                Nicht erlaubt sind u. a.: {prohibitedShortList.slice(0, 4).join(', ')} …
              </span>
            </>
          }
          error={errors.prohibitedConfirmed?.message}
          {...register('prohibitedConfirmed')}
        />
        <Checkbox
          label={
            <>
              Ich akzeptiere die{' '}
              <Link href="/versandbedingungen" target="_blank" className="font-medium text-primary underline">
                Versandbedingungen
              </Link>{' '}
              und die{' '}
              <Link href="/datenschutz" target="_blank" className="font-medium text-primary underline">
                Datenschutzhinweise
              </Link>
              .
            </>
          }
          error={errors.termsAccepted?.message}
          {...register('termsAccepted')}
        />
      </div>
    </div>
  );
}

function SummaryBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <dl className="mt-3 space-y-1.5 text-sm">{children}</dl>
    </div>
  );
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="break-words text-right font-medium">{children}</dd>
    </div>
  );
}

function BookingSuccess({
  trackingNumber,
  totalCents,
}: {
  trackingNumber: string;
  totalCents: number;
}) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const shareText = t('booking.shareText', {
    number: trackingNumber,
    url: `${typeof window !== 'undefined' ? window.location.origin : ''}/tracking/${trackingNumber}`,
  });

  async function copy() {
    try {
      await navigator.clipboard.writeText(trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (older iOS Safari in some contexts) — the number is
      // shown large enough to note down by hand.
    }
  }

  return (
    <div className="mx-auto max-w-xl text-center">
      <span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-primary-muted">
        <CheckCircle2 className="size-8 text-primary" aria-hidden />
      </span>

      <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
        {t('booking.successTitle')}
      </h1>
      <p className="mt-3 text-base text-muted-foreground">{t('booking.successHint')}</p>

      <div className="surface mt-8 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Deine Sendungsnummer
        </p>
        <p className="mt-2 break-all font-mono text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          {trackingNumber}
        </p>
        <Button variant="ghost" size="sm" className="mt-3" onClick={copy}>
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          {copied ? 'Kopiert' : 'Nummer kopieren'}
        </Button>

        <dl className="mt-6 border-t border-border pt-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Gesamtpreis</dt>
            <dd className="font-semibold tabular-nums">{formatCents(totalCents)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href={`/tracking/${trackingNumber}`}>
          <Button size="lg" block className="sm:w-auto">
            <PackageSearch aria-hidden />
            {t('common.trackShipment')}
          </Button>
        </Link>
        <a href={whatsappShareLink(shareText)} target="_blank" rel="noopener noreferrer">
          <Button size="lg" variant="outline" block className="sm:w-auto">
            <Share2 aria-hidden />
            Über WhatsApp teilen
          </Button>
        </a>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Wir haben dir eine Bestätigung per E-Mail geschickt. Fragen? Melde dich einfach bei uns.
      </p>
    </div>
  );
}

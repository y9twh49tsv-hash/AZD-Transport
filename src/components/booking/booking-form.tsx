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
import { citiesByCountry, cityName, countryFlags, type CountryCode } from '@/config/regions';
import { prohibitedCategoryIds } from '@/config/prohibited-items';
import { cn, todayIso } from '@/lib/utils';
import { whatsappShareLink } from '@/lib/notifications/whatsapp';
import { createBooking } from '@/app/(site)/buchen/actions';
import { useT } from '@/lib/i18n/client';
import type { Translate } from '@/lib/i18n';
import { translateError } from '@/lib/i18n/errors';


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
 * Readable names for the error summary on the last step.
 *
 * Without them a rejected field shows only its message, and a message can be
 * as unhelpful as "Invalid input" — leaving someone staring at a form where
 * every visible field looks correct, because the offending one lives two steps
 * back and is not on screen.
 *
 * Built from the request locale rather than written out per language: the side
 * ("Absender"/"Empfänger") is already a translated step name, so the 27 labels
 * come from eleven keys instead of a hundred.
 */
function fieldLabels(t: Translate): Partial<Record<FieldPath<BookingInput>, string>> {
  const sender = t('booking.stepSender');
  const recipient = t('booking.stepRecipient');
  return {
    originCountry: t('booking.fieldOriginCountry'),
    originCity: t('calculator.originCity'),
    destinationCountry: t('booking.fieldDestinationCountry'),
    destinationCity: t('calculator.destinationCity'),
    shipmentType: t('calculator.typeLabel'),
    weightKg: t('common.weight'),
    pieceCount: t('common.pieces'),
    contentType: t('booking.contentLabel'),
    description: t('booking.descriptionLabel'),
    pickupRequested: t('common.pickup'),
    pickupDate: t('booking.pickupDateLabel'),
    senderFirstName: `${t('fields.firstName')} (${sender})`,
    senderLastName: `${t('fields.lastName')} (${sender})`,
    senderPhone: `${t('fields.phone')} (${sender})`,
    senderEmail: `${t('fields.email')} (${sender})`,
    senderAddress: `${t('fields.address')} (${sender})`,
    senderPostalCode: `${t('fields.postalCode')} (${sender})`,
    senderCity: `${t('fields.city')} (${sender})`,
    senderCountry: `${t('fields.country')} (${sender})`,
    recipientFirstName: `${t('fields.firstName')} (${recipient})`,
    recipientLastName: `${t('fields.lastName')} (${recipient})`,
    recipientPhone: `${t('fields.phone')} (${recipient})`,
    recipientAddress: `${t('fields.address')} (${recipient})`,
    recipientCity: `${t('fields.city')} (${recipient})`,
    recipientCountry: `${t('fields.country')} (${recipient})`,
    detailsConfirmed: t('booking.fieldDetailsConfirmed'),
    prohibitedConfirmed: t('booking.fieldProhibitedConfirmed'),
    termsAccepted: t('footer.shippingTerms'),
  };
}

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
  const labels = fieldLabels(t);
  const documentsBooking = values.shipmentType === 'documents';

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
        <ol className="mb-8 flex items-center gap-1.5" aria-label={t('booking.progress')}>
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
            <Alert tone="error" title={t('booking.errorTitle')} className="mt-6">
              {serverError}
            </Alert>
          )}

          {step === 3 && Object.keys(errors).length > 0 && (
            <Alert tone="error" title={t('booking.checkTitle')} className="mt-6">
              <ul className="list-disc space-y-1 ps-5">
                {Object.entries(errors)
                  .slice(0, 6)
                  .map(([field, error]) => {
                    const label = labels[field as FieldPath<BookingInput>];
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
                        {translateError(t, (error as { message?: string })?.message)}
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
                {pending ? t('booking.submitting') : t('booking.submitFinal')}
                {!pending && <Check aria-hidden />}
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Sticky price summary */}
      <aside className="lg:sticky lg:top-24">
        <div className="surface p-5">
          <h2 className="text-sm font-semibold text-muted-foreground">
            {t('booking.summaryTitle')}
          </h2>
          <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums">
            {/*
              Für Dokumente hängt der Preis an keiner Eingabe mehr — er darf
              also nicht auf ein Gewicht warten, das nie kommt.
            */}
            {documentsBooking || values.weightKg ? formatCents(price.totalCents) : '—'}
          </p>

          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <Row label={t('common.route')}>
              {cityName(values.originCity)} → {cityName(values.destinationCity)}
            </Row>
            {documentsBooking ? (
              <Row label={t('calculator.typeLabel')}>{t('calculator.typeDocuments')}</Row>
            ) : (
              <>
                <Row label={t('common.weight')}>
                  {values.weightKg ? formatWeight(Number(values.weightKg)) : '—'}
                </Row>
                <Row label={t('common.pieces')}>{values.pieceCount || '—'}</Row>
              </>
            )}
            <Row label={t('common.pickup')}>
              {values.pickupRequested
                ? t('booking.pickupYes', { fee: formatCents(pricingConfig.pickupFeeCents) })
                : t('booking.pickupNo')}
            </Row>
          </dl>

          <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
            {t('booking.priceNote')}
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
      <dd className="text-end font-medium">{children}</dd>
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
  // Dokumente sind ein Umschlag zum Pauschalpreis: weder Gewicht noch
  // Stückzahl sind etwas, das der Kunde eintragen müsste.
  const isDocuments = shipmentType === 'documents';

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
        <h2 className="text-xl font-semibold tracking-tight">{t('booking.shipmentTitle')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {shipmentType === 'documents'
            ? t('booking.shipmentHintDocuments', {
                price: formatCents(pricingConfig.documentsPriceCents),
                max: pricingConfig.maxDocumentsWeightKg,
              })
            : t('booking.shipmentHintStandard', {
                perKg: formatCents(pricingConfig.pricePerKgCents),
                minimum: formatCents(pricingConfig.minimumPriceCents),
              })}
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
                hint: t('booking.documentsFlat', {
                  price: formatCents(pricingConfig.documentsPriceCents),
                }),
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
                  // scheiterte an einer Regel, die der Kunde nicht sieht. Beim
                  // Gewicht dasselbe: es wird für Dokumente nicht abgefragt,
                  // stünde also unsichtbar im Formular.
                  if (option.value === 'documents') {
                    setValue('pieceCount', 1);
                    setValue('weightKg', undefined as never, { shouldValidate: true });
                  }
                }}
                aria-pressed={active}
                className={cn(
                  'flex min-h-[4.5rem] flex-col items-start gap-1 rounded-xl border p-3.5 text-start transition-colors',
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
                {countryFlags[c]} {t(`countries.${c}`)}
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
                {countryFlags[c]} {t(`countries.${c}`)}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label={t('calculator.originCity')}
          htmlFor="origin-city"
          error={translateError(t, errors.originCity?.message)}
          required
        >
          <Select id="origin-city" {...register('originCity')}>
            {citiesByCountry(originCountry).map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}
                {city.active ? '' : ` (${t('calculator.cityOnRequest')})`}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label={t('calculator.destinationCity')}
          htmlFor="destination-city"
          error={translateError(t, errors.destinationCity?.message)}
          required
        >
          <Select id="destination-city" {...register('destinationCity')}>
            {citiesByCountry(destinationCountry).map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}
                {city.active ? '' : ` (${t('calculator.cityOnRequest')})`}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className={cn('grid gap-4', !isDocuments && 'sm:grid-cols-2')}>
        {/*
          Kein Gewichtsfeld für Dokumente: der Preis ist pauschal, die Zahl
          hätte keine sichtbare Wirkung. Was gespeichert wird, entscheidet
          pricingConfig.documentsAssumedWeightKg — die Spalte ist `not null`
          und geht in die Auslastung der Touren ein.
        */}
        {!isDocuments && (
          <Field
            label={t('calculator.weightLabel')}
            htmlFor="weight"
            error={translateError(t, errors.weightKg?.message)}
            hint={
              weight
                ? t('booking.transportHint', { price: formatCents(price.basePriceCents) })
                : t('booking.minimumHint', {
                    minimum: formatCents(pricingConfig.minimumPriceCents),
                  })
            }
            required
          >
            <Input
              id="weight"
              type="text"
              inputMode="decimal"
              placeholder={t('calculator.weightPlaceholder')}
              aria-invalid={!!errors.weightKg}
              className="text-lg font-semibold"
              {...register('weightKg')}
            />
          </Field>
        )}

        {!isDocuments && (
        <Field
          label={t('booking.piecesLabel')}
          htmlFor="pieces"
          error={translateError(t, errors.pieceCount?.message)}
          hint={t('booking.piecesHint')}
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
        )}
      </div>

      <Field
        label={t('booking.contentLabel')}
        htmlFor="content-type"
        error={translateError(t, errors.contentType?.message)}
        hint={t('booking.contentHint')}
        required
      >
        <Input
          id="content-type"
          placeholder={t('booking.contentPlaceholder')}
          aria-invalid={!!errors.contentType}
          {...register('contentType')}
        />
      </Field>

      <Field
        label={t('booking.descriptionLabel')}
        htmlFor="description"
        error={translateError(t, errors.description?.message)}
        hint={t('booking.descriptionHint')}
      >
        <Textarea
          id="description"
          rows={3}
          placeholder={t('booking.descriptionPlaceholder')}
          {...register('description')}
        />
      </Field>

      <Checkbox
        label={
          <>
            <span className="font-medium">{t('booking.pickupTitle')}</span>
            <span className="block text-muted-foreground">
              {t('booking.pickupText', { fee: formatCents(pricingConfig.pickupFeeCents) })}
            </span>
          </>
        }
        {...register('pickupRequested')}
      />

      {pickupRequested && (
        <Field
          label={t('booking.pickupDateLabel')}
          htmlFor="pickup-date"
          error={translateError(t, errors.pickupDate?.message)}
          hint={t('booking.pickupDateHint')}
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
  const t = useT();
  const { register, formState } = form;
  const errors = formState.errors;

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-semibold tracking-tight">{t('booking.senderTitle')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('booking.senderSubtitle')}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('fields.firstName')} htmlFor="s-first" error={translateError(t, errors.senderFirstName?.message)} required>
          <Input id="s-first" autoComplete="given-name" aria-invalid={!!errors.senderFirstName} {...register('senderFirstName')} />
        </Field>
        <Field label={t('fields.lastName')} htmlFor="s-last" error={translateError(t, errors.senderLastName?.message)} required>
          <Input id="s-last" autoComplete="family-name" aria-invalid={!!errors.senderLastName} {...register('senderLastName')} />
        </Field>
        <Field label={t('fields.phone')} htmlFor="s-phone" error={translateError(t, errors.senderPhone?.message)} required>
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
        <Field label={t('fields.email')} htmlFor="s-email" error={translateError(t, errors.senderEmail?.message)} required>
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

      <Field label={t('fields.address')} htmlFor="s-address" error={translateError(t, errors.senderAddress?.message)} required>
        <Input
          id="s-address"
          autoComplete="street-address"
          placeholder={t('fields.streetPlaceholder')}
          aria-invalid={!!errors.senderAddress}
          {...register('senderAddress')}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
        <Field label={t('fields.postalCode')} htmlFor="s-zip" error={translateError(t, errors.senderPostalCode?.message)}>
          <Input id="s-zip" inputMode="numeric" autoComplete="postal-code" {...register('senderPostalCode')} />
        </Field>
        <Field label={t('fields.city')} htmlFor="s-city" error={translateError(t, errors.senderCity?.message)} required>
          <Input id="s-city" autoComplete="address-level2" aria-invalid={!!errors.senderCity} {...register('senderCity')} />
        </Field>
      </div>

      <Field label={t('fields.country')} htmlFor="s-country" error={translateError(t, errors.senderCountry?.message)} required>
        <Select id="s-country" {...register('senderCountry')}>
          {(['DE', 'MA'] as CountryCode[]).map((c) => (
            <option key={c} value={c}>
              {countryFlags[c]} {t(`countries.${c}`)}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
}

function RecipientStep({ form }: { form: FormApi }) {
  const t = useT();
  const { register, formState } = form;
  const errors = formState.errors;

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-semibold tracking-tight">{t('booking.recipientTitle')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('booking.recipientSubtitle')}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('fields.firstName')} htmlFor="r-first" error={translateError(t, errors.recipientFirstName?.message)} required>
          <Input id="r-first" aria-invalid={!!errors.recipientFirstName} {...register('recipientFirstName')} />
        </Field>
        <Field label={t('fields.lastName')} htmlFor="r-last" error={translateError(t, errors.recipientLastName?.message)} required>
          <Input id="r-last" aria-invalid={!!errors.recipientLastName} {...register('recipientLastName')} />
        </Field>
      </div>

      <Field label={t('fields.phone')} htmlFor="r-phone" error={translateError(t, errors.recipientPhone?.message)} required>
        <Input
          id="r-phone"
          type="tel"
          inputMode="tel"
          placeholder="+212 6 12 34 56 78"
          aria-invalid={!!errors.recipientPhone}
          {...register('recipientPhone')}
        />
      </Field>

      <Field label={t('fields.address')} htmlFor="r-address" error={translateError(t, errors.recipientAddress?.message)} required>
        <Input
          id="r-address"
          placeholder={t('fields.streetPlaceholderMa')}
          aria-invalid={!!errors.recipientAddress}
          {...register('recipientAddress')}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('fields.city')} htmlFor="r-city" error={translateError(t, errors.recipientCity?.message)} required>
          <Input id="r-city" aria-invalid={!!errors.recipientCity} {...register('recipientCity')} />
        </Field>
        <Field label={t('fields.country')} htmlFor="r-country" error={translateError(t, errors.recipientCountry?.message)} required>
          <Select id="r-country" {...register('recipientCountry')}>
            {(['DE', 'MA'] as CountryCode[]).map((c) => (
              <option key={c} value={c}>
                {countryFlags[c]} {t(`countries.${c}`)}
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
        <h2 className="text-xl font-semibold tracking-tight">{t('booking.confirmTitle')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('booking.confirmSubtitle')}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <SummaryBlock title={t('booking.stepShipment')}>
          <SummaryRow label={t('common.route')}>
            {cityName(v.originCity)} → {cityName(v.destinationCity)}
          </SummaryRow>
          {v.shipmentType === 'documents' ? (
            <SummaryRow label={t('calculator.typeLabel')}>
              {t('calculator.typeDocuments')}
            </SummaryRow>
          ) : (
            <>
              <SummaryRow label={t('common.weight')}>{formatWeight(Number(v.weightKg))}</SummaryRow>
              <SummaryRow label={t('common.pieces')}>{v.pieceCount}</SummaryRow>
            </>
          )}
          <SummaryRow label={t('booking.summaryContent')}>{v.contentType}</SummaryRow>
          <SummaryRow label={t('common.pickup')}>
            {v.pickupRequested
              ? t('booking.pickupOnDate', { date: v.pickupDate ?? '' })
              : t('common.nope')}
          </SummaryRow>
        </SummaryBlock>

        <SummaryBlock title={t('common.price')}>
          <SummaryRow label={t('booking.summaryTransport')}>
            {formatCents(price.basePriceCents)}
          </SummaryRow>
          {price.pickupFeeCents > 0 && (
            <SummaryRow label={t('common.pickup')}>{formatCents(price.pickupFeeCents)}</SummaryRow>
          )}
          <SummaryRow label={t('common.total')}>
            <strong className="text-base">{formatCents(price.totalCents)}</strong>
          </SummaryRow>
          <p className="pt-2 text-xs text-muted-foreground">{t('booking.paymentNote')}</p>
        </SummaryBlock>

        <SummaryBlock title={t('booking.stepSender')}>
          <SummaryRow label={t('fields.name')}>
            {v.senderFirstName} {v.senderLastName}
          </SummaryRow>
          <SummaryRow label={t('fields.phone')}>{v.senderPhone}</SummaryRow>
          <SummaryRow label={t('fields.email')}>{v.senderEmail}</SummaryRow>
          <SummaryRow label={t('fields.address')}>
            {v.senderAddress}, {v.senderPostalCode} {v.senderCity}
          </SummaryRow>
        </SummaryBlock>

        <SummaryBlock title={t('booking.stepRecipient')}>
          <SummaryRow label={t('fields.name')}>
            {v.recipientFirstName} {v.recipientLastName}
          </SummaryRow>
          <SummaryRow label={t('fields.phone')}>{v.recipientPhone}</SummaryRow>
          <SummaryRow label={t('fields.address')}>
            {v.recipientAddress}, {v.recipientCity}
          </SummaryRow>
        </SummaryBlock>
      </div>

      <div className="space-y-3">
        <Checkbox
          label={t('booking.confirmDetails')}
          error={translateError(t, errors.detailsConfirmed?.message)}
          {...register('detailsConfirmed')}
        />
        <Checkbox
          label={
            <>
              {t('booking.confirmProhibited')}{' '}
              <Link href="/verbotene-waren" target="_blank" className="font-medium text-primary underline">
                {t('booking.prohibitedLink')}
              </Link>
              <span className="mt-1 block text-xs text-muted-foreground">
                {t('booking.prohibitedExamples', {
                  items: prohibitedCategoryIds
                    .slice(0, 4)
                    .map((id) => t(`legal.prohibited.${id}Title`))
                    .join(', '),
                })}
              </span>
            </>
          }
          error={translateError(t, errors.prohibitedConfirmed?.message)}
          {...register('prohibitedConfirmed')}
        />
        <Checkbox
          label={
            <>
              {t('booking.termsPrefix')}{' '}
              <Link href="/versandbedingungen" target="_blank" className="font-medium text-primary underline">
                {t('footer.shippingTerms')}
              </Link>{' '}
              {t('booking.termsAnd')}{' '}
              <Link href="/datenschutz" target="_blank" className="font-medium text-primary underline">
                {t('booking.termsPrivacy')}
              </Link>
              .
            </>
          }
          error={translateError(t, errors.termsAccepted?.message)}
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
      <dd className="break-words text-end font-medium">{children}</dd>
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
          {t('booking.yourNumber')}
        </p>
        <p className="mt-2 break-all font-mono text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          {trackingNumber}
        </p>
        <Button variant="ghost" size="sm" className="mt-3" onClick={copy}>
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          {copied ? t('booking.copied') : t('booking.copyNumber')}
        </Button>

        <dl className="mt-6 border-t border-border pt-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t('booking.totalPrice')}</dt>
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
            {t('booking.shareWhatsapp')}
          </Button>
        </a>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">{t('booking.emailSent')}</p>
    </div>
  );
}

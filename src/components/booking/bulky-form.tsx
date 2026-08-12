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
import { citiesByCountry, countryFlags, type CountryCode } from '@/config/regions';
import { createBulkyRequest } from '@/app/(site)/sperrgut/actions';
import { useT } from '@/lib/i18n/client';
import { translateError } from '@/lib/i18n/errors';

/**
 * Suggestions for the item field. Keys only — the words are looked up in the
 * request locale, so the datalist a French visitor sees is French.
 */
const COMMON_ITEM_KEYS = [
  'itemWashingMachine',
  'itemFridge',
  'itemBicycle',
  'itemFurniture',
  'itemCarParts',
  'itemTv',
  'itemPram',
  'itemOther',
] as const;

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

  const commonItems = COMMON_ITEM_KEYS.map((key) => t(`bulky.${key}`));
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
            {t('bulky.reference')}
          </p>
          <p className="mt-2 font-mono text-2xl font-bold text-primary">{reference}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {t('bulky.referenceNote')}
          </p>
        </div>

        <Link href="/" className="mt-6 inline-block">
          <Button variant="outline">{t('bulky.toHome')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>
      {/* Photos first — that is what actually determines the price */}
      <section className="surface p-5 sm:p-7">
        <h2 className="text-xl font-semibold tracking-tight">{t('bulky.photosTitle')}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {t('bulky.photosHint')}
        </p>
        <div className="mt-5">
          <PhotoUpload photos={photos} onChange={setPhotos} disabled={pending} />
        </div>
      </section>

      {/* Item */}
      <section className="surface space-y-5 p-5 sm:p-7">
        <h2 className="text-xl font-semibold tracking-tight">{t('bulky.itemTitle')}</h2>

        <Field
          label={t('bulky.itemLabel')}
          htmlFor="item-type"
          error={translateError(t, errors.itemType?.message)}
          required
        >
          <Input
            id="item-type"
            list="common-items"
            placeholder={t('bulky.itemPlaceholder')}
            aria-invalid={!!errors.itemType}
            {...register('itemType')}
          />
          <datalist id="common-items">
            {commonItems.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </Field>

        <Field
          label={t('booking.descriptionLabel')}
          htmlFor="item-description"
          error={translateError(t, errors.itemDescription?.message)}
          hint={t('bulky.itemDescriptionHint')}
        >
          <Textarea
            id="item-description"
            rows={3}
            placeholder={t('bulky.itemDescriptionPlaceholder')}
            {...register('itemDescription')}
          />
        </Field>

        <Field
          label={t('bulky.approxWeightLabel')}
          htmlFor="approx-weight"
          error={translateError(t, errors.approxWeightKg?.message)}
          hint={t('bulky.approxWeightHint')}
          required
        >
          <Input
            id="approx-weight"
            type="text"
            inputMode="decimal"
            placeholder={t('bulky.approxWeightPlaceholder')}
            aria-invalid={!!errors.approxWeightKg}
            {...register('approxWeightKg')}
          />
        </Field>

        <fieldset>
          <legend className="field-label">{t('bulky.dimensionsLabel')}</legend>
          <div className="grid grid-cols-3 gap-3">
            <Field label={t('bulky.length')} htmlFor="length" error={translateError(t, errors.lengthCm?.message)}>
              <Input id="length" type="number" inputMode="numeric" min={1} placeholder="60" {...register('lengthCm')} />
            </Field>
            <Field label={t('bulky.width')} htmlFor="width" error={translateError(t, errors.widthCm?.message)}>
              <Input id="width" type="number" inputMode="numeric" min={1} placeholder="60" {...register('widthCm')} />
            </Field>
            <Field label={t('bulky.height')} htmlFor="height" error={translateError(t, errors.heightCm?.message)}>
              <Input id="height" type="number" inputMode="numeric" min={1} placeholder="85" {...register('heightCm')} />
            </Field>
          </div>
        </fieldset>
      </section>

      {/* Route */}
      <section className="surface space-y-5 p-5 sm:p-7">
        <h2 className="text-xl font-semibold tracking-tight">{t('bulky.routeTitle')}</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('common.from')} htmlFor="b-origin-country" required>
            <Select
              id="b-origin-country"
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
          <Field label={t('common.to')} htmlFor="b-destination-country" required>
            <Select
              id="b-destination-country"
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
          <Field label={t('bulky.originLabel')} htmlFor="b-origin-city" error={translateError(t, errors.originCity?.message)} required>
            <Select id="b-origin-city" {...register('originCity')}>
              {citiesByCountry(originCountry).map((city) => (
                <option key={city.slug} value={city.slug}>
                  {city.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('bulky.destinationLabel')} htmlFor="b-destination-city" error={translateError(t, errors.destinationCity?.message)} required>
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
              <span className="font-medium">{t('bulky.pickupTitle')}</span>
              <span className="block text-muted-foreground">{t('bulky.pickupText')}</span>
            </>
          }
          {...register('pickupRequested')}
        />
      </section>

      {/* Contact */}
      <section className="surface space-y-5 p-5 sm:p-7">
        <h2 className="text-xl font-semibold tracking-tight">{t('bulky.contactTitle')}</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('fields.firstName')} htmlFor="b-first" error={translateError(t, errors.contactFirstName?.message)} required>
            <Input id="b-first" autoComplete="given-name" aria-invalid={!!errors.contactFirstName} {...register('contactFirstName')} />
          </Field>
          <Field label={t('fields.lastName')} htmlFor="b-last" error={translateError(t, errors.contactLastName?.message)} required>
            <Input id="b-last" autoComplete="family-name" aria-invalid={!!errors.contactLastName} {...register('contactLastName')} />
          </Field>
          <Field label={t('fields.phone')} htmlFor="b-phone" error={translateError(t, errors.phone?.message)} required>
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
            label={t('fields.email')}
            htmlFor="b-email"
            error={translateError(t, errors.email?.message)}
            hint={t('bulky.emailHint')}
          >
            <Input id="b-email" type="email" inputMode="email" autoComplete="email" {...register('email')} />
          </Field>
        </div>

        <Field label={t('bulky.notesLabel')} htmlFor="b-notes" error={translateError(t, errors.notes?.message)}>
          <Textarea
            id="b-notes"
            rows={3}
            placeholder={t('bulky.notesPlaceholder')}
            {...register('notes')}
          />
        </Field>

        <Checkbox
          label={
            <>
              {t('bulky.prohibitedConfirm')}{' '}
              <Link href="/verbotene-waren" target="_blank" className="font-medium text-primary underline">
                {t('booking.prohibitedLink')}
              </Link>
            </>
          }
          error={translateError(t, errors.prohibitedConfirmed?.message)}
          {...register('prohibitedConfirmed')}
        />
      </section>

      {serverError && (
        <Alert tone="error" title={t('bulky.errorTitle')}>
          {serverError}
        </Alert>
      )}

      <Button type="submit" size="lg" block disabled={pending} className="sm:w-auto">
        {pending ? t('bulky.sending') : t('bulky.send')}
        {!pending && <Send aria-hidden />}
      </Button>
    </form>
  );
}

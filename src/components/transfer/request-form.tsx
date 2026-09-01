'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, MessageCircle, Phone } from 'lucide-react';
import { submitTransferRequest } from '@/app/(transfer)/anfrage/actions';
import { VEHICLE_STATES, VEHICLE_TYPES } from '@/lib/transfer-request';
import { siteConfig, telLink, whatsappRequestLink } from '@/config/site';
import { cn } from '@/lib/utils';

type Errors = Record<string, string>;

/** Heute, als YYYY-MM-DD in lokaler Zeit — `toISOString()` läge in UTC. */
function today(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
        {label}
        {!required && <span className="ms-1.5 text-xs text-muted-foreground">optional</span>}
      </label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

const control =
  'w-full min-h-12 rounded-sm border border-input bg-card px-3.5 text-base text-foreground ' +
  'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-ring focus-visible:border-ring transition-colors';

/**
 * Das Anfrageformular.
 *
 * Ein Schritt, keine Strecke über mehrere Seiten. Pflicht sind nur Abholort,
 * Zielort, Name und eine Kontaktmöglichkeit — alles andere klärt ein Anruf
 * schneller, als ein zusätzliches Pflichtfeld Anfragen kostet.
 *
 * `text-base` in allen Eingabefeldern ist keine Geschmacksfrage: Safari auf
 * dem iPhone zoomt beim Fokussieren in jedes Feld mit kleinerer Schrift, und
 * der Zoom bleibt danach stehen.
 */
export function RequestForm({ defaultNotes }: { defaultNotes?: string } = {}) {
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setServerError(null);
    setErrors({});

    const payload = {
      pickupLocation: formData.get('pickupLocation'),
      dropoffLocation: formData.get('dropoffLocation'),
      vehicleMake: formData.get('vehicleMake'),
      vehicleModel: formData.get('vehicleModel'),
      vehicleType: formData.get('vehicleType'),
      vehicleState: formData.get('vehicleState'),
      vehicleValue: formData.get('vehicleValue'),
      preferredDate: formData.get('preferredDate'),
      dateFlexible: formData.get('dateFlexible') === 'on',
      notes: formData.get('notes'),
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      privacyAccepted: formData.get('privacyAccepted') === 'on',
      company: formData.get('company'),
    };

    startTransition(async () => {
      const result = await submitTransferRequest(payload);
      if (result.ok) {
        setDone(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      setServerError(result.error);
      if (result.fieldErrors) setErrors(result.fieldErrors);
    });
  }

  if (done) {
    return (
      <div className="panel p-8 text-center sm:p-12">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-primary-muted">
          <CheckCircle2 className="size-7 text-primary" aria-hidden />
        </span>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight">Vielen Dank.</h2>
        <p className="mx-auto mt-3 max-w-md text-[0.95rem] leading-relaxed text-muted-foreground">
          Ihre Anfrage wurde übermittelt. Wir prüfen die Angaben und melden uns kurzfristig mit
          einem individuellen Angebot.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-2.5 sm:flex-row">
          <a
            href={telLink()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-border px-5 text-sm font-medium"
          >
            <Phone className="size-4" aria-hidden />
            {siteConfig.phone}
          </a>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-sm px-5 text-sm text-muted-foreground hover:text-foreground"
          >
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={onSubmit} noValidate className="space-y-10">
      {/* Honigtopf: für Menschen unsichtbar, für Formularroboter verlockend. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="company">Firma (bitte frei lassen)</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset className="space-y-5">
        <legend className="eyebrow">Strecke</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Abholort"
            htmlFor="pickupLocation"
            error={errors.pickupLocation}
            hint="PLZ oder Ort genügt"
            required
          >
            <input
              id="pickupLocation"
              name="pickupLocation"
              className={control}
              placeholder="60311 Frankfurt am Main"
              autoComplete="off"
              required
              aria-invalid={!!errors.pickupLocation}
              aria-describedby={errors.pickupLocation ? 'pickupLocation-error' : undefined}
            />
          </Field>

          <Field
            label="Zielort"
            htmlFor="dropoffLocation"
            error={errors.dropoffLocation}
            hint="PLZ oder Ort genügt"
            required
          >
            <input
              id="dropoffLocation"
              name="dropoffLocation"
              className={control}
              placeholder="80331 München"
              autoComplete="off"
              required
              aria-invalid={!!errors.dropoffLocation}
              aria-describedby={errors.dropoffLocation ? 'dropoffLocation-error' : undefined}
            />
          </Field>
        </div>
      </fieldset>

      <div className="rule" />

      <fieldset className="space-y-5">
        <legend className="eyebrow">Fahrzeug</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Hersteller" htmlFor="vehicleMake" error={errors.vehicleMake}>
            <input
              id="vehicleMake"
              name="vehicleMake"
              className={control}
              placeholder="z. B. Porsche"
              autoComplete="off"
            />
          </Field>

          <Field label="Modell" htmlFor="vehicleModel" error={errors.vehicleModel}>
            <input
              id="vehicleModel"
              name="vehicleModel"
              className={control}
              placeholder="z. B. 911 Carrera"
              autoComplete="off"
            />
          </Field>

          <Field label="Fahrzeugtyp" htmlFor="vehicleType" required>
            <select id="vehicleType" name="vehicleType" className={control} defaultValue="PKW">
              {VEHICLE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Zulassung"
            htmlFor="vehicleState"
            hint="Für die Fahrt wird ein gültiges Kennzeichen benötigt"
            required
          >
            <select
              id="vehicleState"
              name="vehicleState"
              className={control}
              defaultValue="zugelassen"
            >
              {VEHICLE_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Fahrzeugwert"
            htmlFor="vehicleValue"
            error={errors.vehicleValue}
            hint="Hilft bei der Einschätzung der Absicherung"
            className="sm:col-span-2"
          >
            <input
              id="vehicleValue"
              name="vehicleValue"
              className={control}
              placeholder="z. B. 95.000 €"
              autoComplete="off"
            />
          </Field>
        </div>
      </fieldset>

      <div className="rule" />

      <fieldset className="space-y-5">
        <legend className="eyebrow">Termin</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Wunschtermin" htmlFor="preferredDate" error={errors.preferredDate}>
            <input
              id="preferredDate"
              name="preferredDate"
              type="date"
              min={today()}
              className={control}
            />
          </Field>

          <div className="flex items-end">
            <label
              htmlFor="dateFlexible"
              className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-sm border border-input bg-card px-3.5"
            >
              <input
                id="dateFlexible"
                name="dateFlexible"
                type="checkbox"
                className="size-5 shrink-0 accent-[hsl(var(--primary))]"
              />
              <span className="text-sm text-foreground">
                Termin ist flexibel
                <span className="block text-xs text-muted-foreground">
                  Ermöglicht oft ein günstigeres Angebot
                </span>
              </span>
            </label>
          </div>
        </div>

        <Field
          label="Bemerkungen"
          htmlFor="notes"
          error={errors.notes}
          hint="Besonderheiten, Ansprechpartner vor Ort, Übergabezeiten"
        >
          <textarea
            id="notes"
            name="notes"
            rows={4}
            className={cn(control, 'min-h-[7rem] py-3 leading-relaxed')}
            placeholder="Abholung beim Autohaus, Ansprechpartner Herr …"
            defaultValue={defaultNotes}
          />
        </Field>
      </fieldset>

      <div className="rule" />

      <fieldset className="space-y-5">
        <legend className="eyebrow">Kontakt</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" htmlFor="name" error={errors.name} required className="sm:col-span-2">
            <input
              id="name"
              name="name"
              className={control}
              autoComplete="name"
              required
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
          </Field>

          <Field
            label="Telefon"
            htmlFor="phone"
            error={errors.phone}
            hint="Telefon oder E-Mail genügt"
          >
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className={control}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
          </Field>

          <Field label="E-Mail" htmlFor="email" error={errors.email}>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              className={control}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </Field>
        </div>

        <label
          htmlFor="privacyAccepted"
          className="flex cursor-pointer items-start gap-3 rounded-sm border border-input bg-card p-4"
        >
          <input
            id="privacyAccepted"
            name="privacyAccepted"
            type="checkbox"
            required
            className="mt-0.5 size-5 shrink-0 accent-[hsl(var(--primary))]"
          />
          <span className="text-sm leading-relaxed text-muted-foreground">
            Ich habe die{' '}
            <Link href="/datenschutz" target="_blank" className="text-primary underline">
              Datenschutzhinweise
            </Link>{' '}
            gelesen und bin damit einverstanden, dass meine Angaben zur Bearbeitung der Anfrage
            verwendet werden.
          </span>
        </label>
        {errors.privacyAccepted && (
          <p role="alert" className="text-sm text-destructive">
            {errors.privacyAccepted}
          </p>
        )}
      </fieldset>

      {serverError && (
        <div role="alert" className="rounded-sm border border-destructive/40 bg-destructive/10 p-4">
          <p className="text-sm text-foreground">{serverError}</p>
        </div>
      )}

      <div className="space-y-4">
        <button
          type="submit"
          disabled={pending}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 text-[0.95rem] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? 'Wird übermittelt …' : 'Unverbindliches Angebot anfordern'}
          {!pending && <ArrowRight className="size-4" aria-hidden />}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Lieber direkt?{' '}
          <a href={telLink()} className="text-foreground underline underline-offset-4">
            {siteConfig.phone}
          </a>{' '}
          oder{' '}
          <a
            href={whatsappRequestLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-foreground underline underline-offset-4"
          >
            <MessageCircle className="size-3.5" aria-hidden />
            WhatsApp
          </a>
        </p>
      </div>
    </form>
  );
}

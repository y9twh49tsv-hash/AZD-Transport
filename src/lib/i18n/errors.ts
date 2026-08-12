import type { Translate } from './index';

/**
 * Translating the messages that come out of a Zod schema.
 *
 * The schemas in `lib/validation.ts` run in two places: in the browser through
 * react-hook-form, and again on the server inside every server action, because
 * a server must never trust what the browser sends. Neither place knows the
 * reader's language at the moment the schema is *defined* — the schemas are
 * module-level constants, evaluated once.
 *
 * So the schemas carry keys instead of sentences, and the translation happens
 * where the message is shown. A message that needs a number carries it inline:
 *
 *     "validation.tooLong:max=120"
 *     "validation.weightMin:min=0.5"
 *
 * Anything that is not one of these keys is passed through unchanged. That
 * matters for the messages a server action writes itself ("Diese Sendungsnummer
 * existiert bereits") — they are prose, not keys, and must survive untouched.
 */

const PREFIX = 'validation.';

/** Splits "validation.tooLong:max=120" into its key and its parameters. */
export function parseErrorKey(
  message: string,
): { path: string; params: Record<string, string> } | null {
  if (!message.startsWith(PREFIX)) return null;

  const separator = message.indexOf(':');
  if (separator === -1) return { path: message, params: {} };

  const path = message.slice(0, separator);
  const params: Record<string, string> = {};

  for (const pair of message.slice(separator + 1).split('|')) {
    const equals = pair.indexOf('=');
    if (equals > 0) params[pair.slice(0, equals)] = pair.slice(equals + 1);
  }

  return { path, params };
}

/**
 * Turns a schema message into a sentence in the reader's language.
 *
 * Returns `undefined` for no message at all, so it can be handed straight to a
 * `<Field error={…}>` without a wrapper conditional at every call site.
 */
export function translateError(t: Translate, message?: string | null): string | undefined {
  if (!message) return undefined;
  const parsed = parseErrorKey(message);
  return parsed ? t(parsed.path, parsed.params) : message;
}

/**
 * Builds a message string for a schema.
 *
 * Used by `lib/validation.ts` so the encoding lives in one place rather than
 * being spelled out by hand thirty times.
 */
export function errorKey(
  key: string,
  params?: Record<string, string | number>,
): string {
  const path = `${PREFIX}${key}`;
  if (!params) return path;
  const encoded = Object.entries(params)
    .map(([name, value]) => `${name}=${value}`)
    .join('|');
  return encoded ? `${path}:${encoded}` : path;
}

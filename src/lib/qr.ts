import QRCode from 'qrcode';
import { appUrl } from '@/config/brand';

/**
 * QR codes point at `/scan/<token>` — an unguessable 40-character token, never
 * the tracking number and never any customer data. Scanning the label with a
 * random phone therefore reveals nothing; the route itself requires a
 * signed-in driver or staff member.
 */
export function scanUrl(scanToken: string): string {
  return `${appUrl()}/scan/${scanToken}`;
}

/**
 * Renders an SVG string. SVG (rather than a PNG data URL) keeps labels crisp
 * at any printer resolution and needs no canvas in the serverless runtime.
 */
export async function renderQrSvg(
  data: string,
  options?: { margin?: number; width?: number },
): Promise<string> {
  return QRCode.toString(data, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: options?.margin ?? 0,
    width: options?.width ?? 256,
    color: { dark: '#0c0a09', light: '#ffffff' },
  });
}

export async function renderShipmentQr(
  scanToken: string,
  options?: { margin?: number; width?: number },
): Promise<string> {
  return renderQrSvg(scanUrl(scanToken), options);
}

/** Data URL variant, for the rare place that needs an <img src>. */
export async function renderQrDataUrl(data: string, width = 256): Promise<string> {
  return QRCode.toDataURL(data, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width,
    color: { dark: '#0c0a09', light: '#ffffff' },
  });
}

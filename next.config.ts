import type { NextConfig } from 'next';

/**
 * Security headers applied to every response.
 * Note: no CSP with `unsafe-eval` in production — Next injects its own inline
 * bootstrap scripts, which is why we rely on nonce-free hardening headers here
 * and keep third-party scripts out of the app entirely.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Permissions-Policy',
    // Die Seite braucht keine dieser Fähigkeiten — es gibt kein Formular, das
    // die Kamera öffnet, und nichts, was den Standort abfragt.
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /**
   * Self-hosting (Railway, Docker, any container host) needs the standalone
   * build: Next then emits a small server.js plus only the node_modules it
   * actually traced, which keeps the image around 200 MB instead of 1 GB.
   *
   * Gated on DOCKER_BUILD so the managed-platform build path (Vercel) stays
   * exactly as it was — it does its own bundling and ignores this setting.
   */
  output: process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,
  /**
   * Keine entfernten Bildquellen: alles, was die Seite anzeigt, liegt in
   * `public/`. Eine leere Liste ist hier die sichere Vorgabe — sie verhindert,
   * dass sich der Bildoptimierer als offener Weiterleiter missbrauchen lässt.
   */
  images: { remotePatterns: [] },
  experimental: {
    /**
     * Die Anwendung hat zwei Wurzellayouts — eines je Sprache. Damit gibt es
     * kein gemeinsames Layout, aus dem Next eine 404-Seite für unbekannte
     * Adressen zusammensetzen könnte; ohne diese Einstellung zeigt es seine
     * eigene weiße Fehlerseite. `app/global-not-found.tsx` ersetzt sie.
     */
    globalNotFound: true,
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;

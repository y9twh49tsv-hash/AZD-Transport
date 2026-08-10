/**
 * Steht im Test an der Stelle des Pakets `server-only`.
 *
 * Das echte Paket wirft beim Import, sobald es nicht in einer Server-Umgebung
 * landet — genau dafür ist es da, und für die Anwendung bleibt es unverändert
 * in Kraft. Nur der Testlauf braucht diesen leeren Ersatz, sonst ließe sich
 * kein einziges servergebundenes Modul prüfen.
 *
 * Verdrahtet in vitest.config.ts.
 */
export {};

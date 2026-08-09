'use client';

import { useEffect, useRef, useState } from 'react';
import { Eraser, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Finger-friendly signature pad.
 *
 * Uses Pointer Events so it works identically with a finger on iOS/Android and
 * with a mouse on a laptop, and scales the canvas to devicePixelRatio so the
 * stroke is not blurry on retina screens.
 */
export function SignaturePad({
  onChange,
  disabled,
}: {
  onChange: (blob: Blob | null) => void;
  disabled?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasStrokes = useRef(false);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;

    const context = canvas.getContext('2d');
    if (!context) return;
    context.scale(ratio, ratio);
    context.lineWidth = 2.5;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#0c0a09';
  }, []);

  function position(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    if (disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    drawing.current = true;
    const { x, y } = position(event);
    context.beginPath();
    context.moveTo(x, y);
  }

  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    event.preventDefault();
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    const { x, y } = position(event);
    context.lineTo(x, y);
    context.stroke();
    hasStrokes.current = true;
    if (empty) setEmpty(false);
  }

  function end() {
    if (!drawing.current) return;
    drawing.current = false;
    exportSignature();
  }

  function exportSignature() {
    const canvas = canvasRef.current;
    if (!canvas || !hasStrokes.current) {
      onChange(null);
      return;
    }
    canvas.toBlob((blob) => onChange(blob), 'image/png');
  }

  function clear() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    hasStrokes.current = false;
    setEmpty(true);
    onChange(null);
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-input bg-card">
        <canvas
          ref={canvasRef}
          className="h-40 w-full touch-none"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          onPointerCancel={end}
          aria-label="Unterschriftenfeld"
        />
        {empty && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <PenLine className="size-4" aria-hidden />
            Hier unterschreiben
          </span>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-2"
        onClick={clear}
        disabled={disabled || empty}
      >
        <Eraser aria-hidden />
        Löschen
      </Button>
    </div>
  );
}

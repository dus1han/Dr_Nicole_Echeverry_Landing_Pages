'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { useIsDesktop } from '@/lib/hooks';
import { cn } from '@/lib/utils';

type Petal = {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  rot: number;
  vrot: number;
  alpha: number;
  hue: number;
};

const COLOURS = ['221,110,150', '243,184,204', '233,147,177', '217,185,140'];

/**
 * Drifting petal particles.
 *
 * Desktop + pointer only, and paused entirely while off-screen via
 * IntersectionObserver — an idle hero costs zero frames. Skipped under
 * prefers-reduced-motion.
 */
export function PetalCanvas({
  className,
  /**
   * Petal count. The hero uses the full 28; other sections use far fewer so
   * the effect reads as an echo rather than repeating the hero at full
   * strength — several sections at full density made the page feel busy.
   */
  count = 28,
}: {
  className?: string;
  count?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDesktop = useIsDesktop();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!isDesktop || reduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let petals: Petal[] = [];
    let raf = 0;
    let running = false;

    const seed = () => {
      petals = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 3 + Math.random() * 6,
        vy: 0.14 + Math.random() * 0.32,
        vx: -0.18 + Math.random() * 0.36,
        rot: Math.random() * Math.PI * 2,
        vrot: (-0.5 + Math.random()) * 0.006,
        alpha: 0.16 + Math.random() * 0.3,
        hue: Math.floor(Math.random() * COLOURS.length),
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      // Capped at 1.5, not 2: these are soft translucent blobs, so the extra
      // pixels of a 2× buffer are invisible but the per-frame fill cost is not.
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (petals.length === 0) seed();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (const p of petals) {
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.y * 0.006) * 0.22;
        p.rot += p.vrot;

        // Recycle above the top once a petal drifts out of the bottom.
        if (p.y - p.r > h) {
          p.y = -p.r * 2;
          p.x = Math.random() * w;
        }
        if (p.x < -20) p.x = w + 10;
        if (p.x > w + 20) p.x = -10;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = `rgba(${COLOURS[p.hue]},${p.alpha})`;
        // A petal is an ellipse squashed on one axis.
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r, p.r * 0.56, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Only burn frames while the canvas is actually visible.
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [isDesktop, reduced, count]);

  if (!isDesktop || reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
    />
  );
}

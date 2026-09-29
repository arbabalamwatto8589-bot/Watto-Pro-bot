import React, { useEffect, useRef, useState } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  baseSize: number;
  speedY: number;
  speedX: number;
  angle: number;
  rotSpeed: number;
  flip: number;
  flipSpeed: number;
  swayFreq: number;
  swayAmp: number;
  phase: number;
  opacity: number;
  hueShift: number; // Slight variation in pink/rose/sakura/neon tint
}

interface FallingPetalsCanvasProps {
  enabled?: boolean;
}

export const FallingPetalsCanvas: React.FC<FallingPetalsCanvasProps> = ({ enabled = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    try {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
      } else if (typeof (mediaQuery as any).addListener === 'function') {
        (mediaQuery as any).addListener(handler);
        return () => (mediaQuery as any).removeListener(handler);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!enabled || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let isVisible = !document.hidden;

    // Determine petal count based on viewport width (high-performance mobile optimization)
    const getPetalCount = () => {
      const w = window.innerWidth;
      if (w < 640) return 18; // Mobile phones: lightweight, ultra smooth
      if (w < 1024) return 26; // Tablets
      return 36; // Desktop: rich yet subtle atmosphere
    };

    const createPetal = (initialYRandom = false): Petal => {
      const isLarge = Math.random() < 0.12; // 12% slightly larger
      const isMedium = !isLarge && Math.random() < 0.28; // 28% medium
      // Remaining 60% small/micro petals

      let baseSize: number;
      if (isLarge) {
        baseSize = 14 + Math.random() * 4; // 14-18px
      } else if (isMedium) {
        baseSize = 9.5 + Math.random() * 3.5; // 9.5-13px
      } else {
        baseSize = 5.5 + Math.random() * 3.5; // 5.5-9px (delicate micro petals)
      }

      // Slow, smooth falling speed
      const speedY = 0.35 + Math.random() * 0.55 + (isLarge ? 0.15 : 0);
      // Gentle horizontal drift
      const speedX = (Math.random() - 0.5) * 0.45;

      return {
        x: Math.random() * (width || window.innerWidth),
        y: initialYRandom ? Math.random() * (height || window.innerHeight) : -20 - Math.random() * 40,
        size: baseSize,
        baseSize,
        speedY,
        speedX,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.015,
        flip: Math.random() * Math.PI * 2,
        flipSpeed: 0.012 + Math.random() * 0.02,
        swayFreq: 0.0015 + Math.random() * 0.002,
        swayAmp: 0.8 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        // Moderate opacity for elegant foreground overlay: visible on top of dark UI while keeping text/signals crisp (0.42 to 0.72)
        opacity: 0.42 + Math.random() * 0.30,
        hueShift: Math.random(), // 0..1: blends from subtle soft cherry blossom to slight neon magenta/rose
      };
    };

    let petals: Petal[] = [];

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      // Cap DPR at 1.5 to prevent GPU strain on mobile 3x / 4k displays
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const targetCount = getPetalCount();
      if (petals.length === 0) {
        petals = Array.from({ length: targetCount }, () => createPetal(true));
      } else if (petals.length < targetCount) {
        while (petals.length < targetCount) {
          petals.push(createPetal(false));
        }
      } else if (petals.length > targetCount) {
        petals = petals.slice(0, targetCount);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // Handle tab visibility to save battery and mobile CPU
    const handleVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        lastTime = performance.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    let lastTime = performance.now();

    // Natural curved organic petal path
    const drawPetalPath = (size: number) => {
      ctx.beginPath();
      // Organic teardrop curved petal shape
      ctx.moveTo(0, -size);
      ctx.bezierCurveTo(size * 0.72, -size * 0.65, size * 0.82, size * 0.35, 0, size);
      ctx.bezierCurveTo(-size * 0.82, size * 0.35, -size * 0.72, -size * 0.65, 0, -size);
      ctx.closePath();
    };

    const render = (time: number) => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Delta time normalization
      const dt = Math.min((time - lastTime) / 16.667, 2.5); // normalized to ~60fps
      lastTime = time;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Render all petals
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];

        // Natural movement updates
        p.y += p.speedY * dt;
        // Sinusoidal breeze + individual sway
        const sway = Math.sin(time * p.swayFreq + p.phase) * p.swayAmp;
        p.x += (p.speedX + sway * 0.4) * dt;

        p.angle += p.rotSpeed * dt;
        p.flip += p.flipSpeed * dt;

        // Reset if offscreen (past bottom or far off the sides)
        if (p.y > height + 25) {
          p.y = -15 - Math.random() * 25;
          p.x = Math.random() * width;
        }
        if (p.x < -30) p.x = width + 20;
        if (p.x > width + 30) p.x = -20;

        // 3D tumbling factor: simulation of petal turning in the air
        const flipScale = Math.sin(p.flip);
        const absFlip = Math.abs(flipScale);
        if (absFlip < 0.05) continue; // Skip near-zero edge-on frames

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.scale(1, flipScale); // 3D tumble flip

        // Subtle luminescence / glow
        ctx.shadowColor = p.hueShift > 0.6 
          ? 'rgba(244, 114, 182, 0.4)' 
          : 'rgba(251, 146, 175, 0.35)';
        ctx.shadowBlur = 4;

        // Elegant gradient for realistic floral petal texture
        const grad = ctx.createLinearGradient(0, -p.size, 0, p.size);
        
        if (p.hueShift > 0.7) {
          // Soft rose gold / Sakura with slight neon magenta edge
          grad.addColorStop(0, `rgba(255, 230, 240, ${p.opacity * 1.15})`);
          grad.addColorStop(0.4, `rgba(251, 168, 196, ${p.opacity})`);
          grad.addColorStop(0.85, `rgba(244, 114, 182, ${p.opacity * 0.85})`);
          grad.addColorStop(1, `rgba(219, 39, 119, ${p.opacity * 0.55})`);
        } else if (p.hueShift > 0.35) {
          // Classic delicate Sakura blossom
          grad.addColorStop(0, `rgba(255, 240, 245, ${p.opacity * 1.1})`);
          grad.addColorStop(0.5, `rgba(255, 182, 193, ${p.opacity})`);
          grad.addColorStop(0.9, `rgba(244, 143, 177, ${p.opacity * 0.8})`);
          grad.addColorStop(1, `rgba(206, 107, 144, ${p.opacity * 0.5})`);
        } else {
          // Subtle pearlescent rose with faint cyber cyan hint on tip
          grad.addColorStop(0, `rgba(245, 243, 255, ${p.opacity * 1.15})`);
          grad.addColorStop(0.45, `rgba(252, 165, 198, ${p.opacity})`);
          grad.addColorStop(0.85, `rgba(236, 72, 153, ${p.opacity * 0.8})`);
          grad.addColorStop(1, `rgba(6, 182, 212, ${p.opacity * 0.45})`);
        }

        ctx.fillStyle = grad;
        drawPetalPath(p.size);
        ctx.fill();

        // Subtle petal spine / vein highlight
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.7);
        ctx.lineTo(0, p.size * 0.6);
        ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity * 0.35})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enabled, prefersReducedMotion]);

  // If user prefers reduced motion or petals are disabled, don't render canvas
  if (!enabled || prefersReducedMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[45] select-none overflow-hidden"
      style={{
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
    />
  );
};

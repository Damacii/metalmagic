'use client';

import { useEffect, useRef, useState } from 'react';

type HeroSparksProps = {
  heroRef: React.RefObject<HTMLElement | null>;
  activeSelector?: string;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
};

const palette = ['#DF682F', '#F08C3E', '#F4A742', '#F1C453'];
const maxParticles = 160;
const emitIntervalMs = 16;

export default function HeroSparks({ heroRef, activeSelector }: HeroSparksProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const activeRef = useRef(false);
  const lastEmitRef = useRef(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setReduceMotion(true);
      return;
    }

    const canvas = canvasRef.current;
    const hero = heroRef.current;
    if (!canvas || !hero) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const emit = (x: number, y: number) => {
      const now = performance.now();
      if (now - lastEmitRef.current < emitIntervalMs) return;
      lastEmitRef.current = now;

      const count = 3 + Math.floor(Math.random() * 6);
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.6 + Math.random() * 1.6;
        const size = 1 + Math.random() * 2;
        const maxLife = 26 + Math.floor(Math.random() * 20);
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed * 0.6,
          vy: Math.sin(angle) * speed * 0.6 - 0.6,
          life: maxLife,
          maxLife,
          size,
          color: palette[Math.floor(Math.random() * palette.length)]
        });
      }

      if (particlesRef.current.length > maxParticles) {
        particlesRef.current.splice(0, particlesRef.current.length - maxParticles);
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const nextParticles: Particle[] = [];

      for (const p of particlesRef.current) {
        p.vy += 0.14;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;

        const lifeRatio = p.life / p.maxLife;
        const size = p.size * (0.45 + lifeRatio * 0.35);

        if (p.life > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(lifeRatio, 0);
          ctx.shadowBlur = 12;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          nextParticles.push(p);
        }
      }

      particlesRef.current = nextParticles;

      if (activeRef.current || particlesRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(draw);
      } else if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (activeSelector) {
        const target = event.target as HTMLElement | null;
        if (!target || !target.closest(activeSelector)) return;
      }
      const rect = hero.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!inside) return;
      emit(event.clientX, event.clientY);
    };

    const handleEnter = () => {
      if (activeRef.current) return;
      activeRef.current = true;
      resizeCanvas();
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('resize', resizeCanvas);
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    const handleLeave = () => {
      activeRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
    };

    hero.addEventListener('mouseenter', handleEnter);
    hero.addEventListener('mouseleave', handleLeave);

    return () => {
      hero.removeEventListener('mouseenter', handleEnter);
      hero.removeEventListener('mouseleave', handleLeave);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [heroRef]);

  if (reduceMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-20"
      aria-hidden="true"
    />
  );
}

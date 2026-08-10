import React, { useEffect, useRef } from 'react';
import { Cloud, CheckCircle2, Sparkles, Zap, X } from 'lucide-react';

export const playSuccessChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // First note: C5 -> E5
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second note: High shimmer C6 -> G6
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1046.50, now + 0.12);
    osc2.frequency.exponentialRampToValueAtTime(1567.98, now + 0.35);
    gain2.gain.setValueAtTime(0.12, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.7);
  } catch {
    // Audio Context blocked or not supported
  }
};

export default function CloudSuccessCelebration({ 
  show, 
  onClose, 
  data = {} 
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!show) return;

    // Play chime sound
    playSuccessChime();

    // Setup canvas particle burst
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    // Particle pool
    const particles = [];
    const colors = ['#10b981', '#06b6d4', '#3b82f6', '#fbbf24', '#ec4899', '#a855f7'];

    // Spawn 120 particles from top-center Cloud area
    const startX = width / 2;
    const startY = height * 0.2;

    for (let i = 0; i < 110; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 3;
      particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        decay: Math.random() * 0.015 + 0.008,
        shape: Math.random() > 0.4 ? 'rect' : 'circle',
      });
    }

    let startTime = Date.now();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      let aliveCount = 0;
      particles.forEach((p) => {
        if (p.opacity <= 0) return;

        aliveCount++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.vx *= 0.98; // friction
        p.rotation += p.rSpeed;
        p.opacity -= p.decay;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      if (aliveCount > 0 && Date.now() - startTime < 3000) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    // Auto dismiss after 2.8 seconds
    const timer = setTimeout(() => {
      onClose?.();
    }, 2800);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
    };
  }, [show, onClose]);

  if (!show) return null;

  const { endpoint = 'SALE', method = 'POST', status = 200, duration = 120 } = data;

  return (
    <>
      {/* Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9999]"
      />

      {/* Floating Glass Banner Overlay */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9998] w-[92%] max-w-lg pointer-events-auto animate-in fade-in zoom-in-95 slide-in-from-top-8 duration-500">
        <div className="relative p-5 rounded-3xl bg-slate-900/90 dark:bg-[#121c2d]/95 backdrop-blur-2xl border border-emerald-500/40 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.4)] overflow-hidden">
          {/* Animated Glowing Gradient Ring Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 animate-pulse pointer-events-none" />
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Banner Header */}
          <div className="relative z-10 flex items-start gap-4">
            {/* Animated Cloud Icon */}
            <div className="relative p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 shrink-0 animate-bounce">
              <Cloud className="w-7 h-7 text-white" />
              <CheckCircle2 className="w-5 h-5 text-emerald-200 absolute -bottom-1 -right-1 bg-slate-900 rounded-full" />
            </div>

            {/* Content Details */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 tracking-wider flex items-center gap-1 font-mono">
                  <Sparkles className="w-3 h-3 text-emerald-300" />
                  NUBE RESPONDIONAL OK
                </span>
                <span className="px-2 py-0.5 text-[10px] font-black font-mono rounded-md bg-white/10 text-white border border-white/15">
                  {status} OK
                </span>
                <span className="text-[10px] font-bold font-mono text-slate-400">
                  {duration}ms
                </span>
              </div>

              <h4 className="text-sm sm:text-base font-black text-white tracking-tight uppercase flex items-center gap-1.5">
                ¡Enviado a la Nube con Éxito!
              </h4>

              <p className="text-xs text-slate-300 font-mono mt-1 flex items-center gap-2 truncate">
                <span className="text-emerald-400 font-bold">{method}</span>
                <span className="text-slate-400">/{endpoint}</span>
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0 border border-white/10"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Timer Line */}
          <div className="mt-3.5 h-1 w-full bg-slate-800 rounded-full overflow-hidden relative">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 animate-out fade-out fill-mode-forwards duration-[2800ms] w-full origin-left transition-all" style={{ animationName: 'shrinkWidth', animationDuration: '2800ms', animationTimingFunction: 'linear' }} />
          </div>
        </div>
      </div>
    </>
  );
}

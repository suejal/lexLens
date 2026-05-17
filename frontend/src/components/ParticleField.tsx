import { useEffect, useRef } from 'react';

export const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const particles = Array.from({ length: 56 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00022,
      vy: (Math.random() - 0.5) * 0.00022,
      size: 0.6 + Math.random() * 1.4,
    }));

    let frame = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = 'rgba(201, 168, 76, 0.46)';
      context.strokeStyle = 'rgba(201, 168, 76, 0.08)';
      particles.forEach((particle, index) => {
        particle.x = (particle.x + particle.vx + 1) % 1;
        particle.y = (particle.y + particle.vy + 1) % 1;
        const px = particle.x * width;
        const py = particle.y * height;
        context.beginPath();
        context.arc(px, py, particle.size, 0, Math.PI * 2);
        context.fill();

        for (let j = index + 1; j < particles.length; j += 1) {
          const other = particles[j];
          const ox = other.x * width;
          const oy = other.y * height;
          const distance = Math.hypot(px - ox, py - oy);
          if (distance < 150) {
            context.globalAlpha = 1 - distance / 150;
            context.beginPath();
            context.moveTo(px, py);
            context.lineTo(ox, oy);
            context.stroke();
            context.globalAlpha = 1;
          }
        }
      });
      frame = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-70" aria-hidden="true" />;
};

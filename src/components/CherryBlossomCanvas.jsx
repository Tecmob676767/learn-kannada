import React, { useEffect, useRef } from 'react';

const CherryBlossomCanvas = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const petalsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Orange blossom / marigold palette
    const colors = [
      '#ff9f43', '#ff9f1c', '#ff7f50', '#ffa500', '#ffd700',
      '#ff6b35', '#ffe4b5', '#ffb347', '#ff8c00', '#fff3e0'
    ];

    const createPetal = (fromTop = true) => ({
      x: Math.random() * canvas.width,
      y: fromTop ? -20 - Math.random() * 100 : Math.random() * canvas.height,
      size: 4 + Math.random() * 9,
      speedX: (Math.random() - 0.5) * 1.8,
      speedY: 0.5 + Math.random() * 1.5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.08,
      opacity: 0.35 + Math.random() * 0.5,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.012 + Math.random() * 0.025,
      color: colors[Math.floor(Math.random() * colors.length)],
      scaleX: 0.55 + Math.random() * 0.45,
    });

    petalsRef.current = Array.from({ length: 70 }, () => createPetal(false));

    const drawPetal = (ctx, p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(p.scaleX, 1);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.5, p.size * 0.8, p.size * 0.5, 0, p.size);
      ctx.bezierCurveTo(-p.size * 0.8, p.size * 0.5, -p.size * 0.8, -p.size * 0.5, 0, -p.size);
      ctx.fill();

      // Highlight sheen
      ctx.globalAlpha = p.opacity * 0.3;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-p.size * 0.25, -p.size * 0.3, p.size * 0.3, p.size * 0.15, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    let windTime = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      windTime += 0.008;
      const windForce = Math.sin(windTime) * 1.1;

      petalsRef.current.forEach((p, i) => {
        p.wobble += p.wobbleSpeed;
        p.x += (p.speedX + Math.sin(p.wobble) * 0.85 + windForce);
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        drawPetal(ctx, p);

        if (p.y > canvas.height + 30 || p.x < -60 || p.x > canvas.width + 60) {
          petalsRef.current[i] = createPetal(true);
        }
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} id="sakura-canvas" />;
};

export default CherryBlossomCanvas;

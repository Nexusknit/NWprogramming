// Hero background — canvas particle network (FPS-adaptive)
(function () {
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.getElementById("heroCanvas");
  if (!canvas || prefersReduced) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let dpr = Math.max(1, window.devicePixelRatio || 1);
  let width = 0,
    height = 0;
  const points = [];

  // Base density from viewport; adapt between MIN..MAX
  const base = Math.floor((window.innerWidth * window.innerHeight) / 12000);
  let MAX_POINTS = Math.min(140, base);
  const MIN_POINTS = Math.max(40, Math.floor(MAX_POINTS * 0.5));
  let targetPoints = MAX_POINTS;

  let SPEED = 0.35;
  let LINK_DIST = 110;
  const mouse = { x: -9999, y: -9999 };

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = Math.floor(rect.width);
    height = Math.floor(rect.height);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (points.length === 0) seed(targetPoints);
  }

  function seed(count) {
    points.length = 0;
    for (let i = 0; i < count; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() * 2 - 1) * SPEED,
        vy: (Math.random() * 2 - 1) * SPEED,
      });
    }
  }

  function adaptPoints(count) {
    if (count > points.length) {
      const add = count - points.length;
      for (let i = 0; i < add; i++) {
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() * 2 - 1) * SPEED,
          vy: (Math.random() * 2 - 1) * SPEED,
        });
      }
    } else if (count < points.length) {
      points.length = count;
    }
  }

  let last = 0;
  let acc = 0,
    frames = 0,
    avgFps = 60;
  function step(now) {
    if (!last) last = now;
    const dt = now - last;
    last = now;
    acc += dt;
    frames++;

    // Once per ~1s, recompute FPS and adapt
    if (acc >= 1000) {
      avgFps = frames * (1000 / acc);
      acc = 0;
      frames = 0;
      if (avgFps < 45 && targetPoints > MIN_POINTS) {
        targetPoints = Math.max(MIN_POINTS, targetPoints - 12);
        LINK_DIST = Math.max(80, LINK_DIST - 4);
        adaptPoints(targetPoints);
      } else if (avgFps > 58 && targetPoints < MAX_POINTS) {
        targetPoints = Math.min(MAX_POINTS, targetPoints + 12);
        LINK_DIST = Math.min(120, LINK_DIST + 4);
        adaptPoints(targetPoints);
      }
    }

    ctx.clearRect(0, 0, width, height);

    // update and draw
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -20 || p.x > width + 20) p.vx *= -1;
      if (p.y < -20 || p.y > height + 20) p.vy *= -1;

      const dxm = p.x - mouse.x,
        dym = p.y - mouse.y;
      const dm = Math.hypot(dxm, dym);
      if (dm < 160) {
        p.vx += (dxm / dm) * 0.005;
        p.vy += (dym / dm) * 0.005;
      }

      for (let j = i + 1; j < points.length; j++) {
        const q = points[j];
        const dx = p.x - q.x,
          dy = p.y - q.y;
        const d = Math.hypot(dx, dy);
        if (d < LINK_DIST) {
          const a = 1 - d / LINK_DIST;
          ctx.strokeStyle = `rgba(56,189,248,${a * 0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }

    for (const p of points) {
      ctx.fillStyle = "rgba(59,130,246,0.9)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(step);
  }

  function onMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    mouse.y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  }

  let raf = null;
  window.addEventListener(
    "resize",
    () => {
      const newBase = Math.floor(
        (window.innerWidth * window.innerHeight) / 12000
      );
      MAX_POINTS = Math.min(140, newBase);
      targetPoints = Math.min(targetPoints, MAX_POINTS);
      resize();
      adaptPoints(targetPoints);
    },
    { passive: true }
  );
  window.addEventListener(
    "orientationchange",
    () => {
      resize();
      adaptPoints(targetPoints);
    },
    { passive: true }
  );
  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("touchmove", onMove, { passive: true });

  resize();
  requestAnimationFrame(step);
})();

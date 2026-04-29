/**
 * splash.js — 開場動畫控制器
 * 墨點粒子 + 書法揭幕 + 點擊進入
 */
(function() {
  'use strict';

  function initInkCanvas() {
    const canvas = document.getElementById('splash-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    // 墨滴粒子（緩慢飄動，營造水墨氣氛）
    const drops = Array.from({ length: 28 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 60 + 24,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.4) * 0.22,
      a: Math.random() * 0.06 + 0.02,
      hue: Math.random() < 0.7 ? 'rgba(20,15,10,' : 'rgba(201,168,76,'
    }));

    // 飄落的金色光點
    const sparks = Array.from({ length: 60 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      vy: Math.random() * 0.6 + 0.2,
      vx: (Math.random() - 0.5) * 0.1,
      a: Math.random() * 0.5 + 0.2
    }));

    let raf = null;
    let stopped = false;

    function draw() {
      if (stopped) return;
      ctx.clearRect(0, 0, w, h);

      // 墨滴
      drops.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < -d.r) d.x = w + d.r;
        if (d.x > w + d.r) d.x = -d.r;
        if (d.y < -d.r) d.y = h + d.r;
        if (d.y > h + d.r) d.y = -d.r;
        const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r);
        grad.addColorStop(0, d.hue + d.a + ')');
        grad.addColorStop(1, d.hue + '0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // 光點
      sparks.forEach(s => {
        s.x += s.vx; s.y += s.vy;
        if (s.y > h + 10) { s.y = -10; s.x = Math.random() * w; }
        ctx.fillStyle = `rgba(255, 220, 140, ${s.a})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    }

    function onResize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', onResize);
    draw();

    return () => {
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }

  function dismiss() {
    const splash = document.getElementById('splash');
    if (!splash) return;
    splash.classList.add('fadeout');
    setTimeout(() => { splash.remove(); }, 1000);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('splash');
    if (!splash) return;
    initInkCanvas();
    document.getElementById('splash-enter')?.addEventListener('click', dismiss);
    splash.addEventListener('click', e => {
      if (e.target.id === 'splash-enter') return;
      // 等所有字落下後才允許點擊空白處跳過（約 2.5s）
      const now = Date.now() - (window._splashStart || 0);
      if (now > 2500) dismiss();
    });
    window._splashStart = Date.now();

    // 自動 6.5 秒後跳過（如果使用者沒互動）
    setTimeout(() => {
      const s = document.getElementById('splash');
      if (s && !s.classList.contains('fadeout')) dismiss();
    }, 6500);
  });
})();

/**
 * splash.js — 過場動畫控制器 v2
 * 9.5 秒不可跳過電影式開幕：閃白 → 信箱框 → 墨滴+衝擊波+爆裂粒子 → 解鎖
 * 主色：金 #c9a84c / 紅 #b53a2c
 */
(function () {
  'use strict';

  const TOTAL_MS = 9500;   // 9.5 秒後解鎖按鈕

  /* ── 注入過場覆蓋層元素 ─────────────────────────── */
  function injectCinElements(splash) {
    // 白色閃光
    const flash = document.createElement('div');
    flash.className = 'cin-flash';
    splash.appendChild(flash);

    // 信箱黑條（上）
    const lbTop = document.createElement('div');
    lbTop.id = 'cin-lb-top';
    lbTop.className = 'cin-lb-top';
    splash.appendChild(lbTop);

    // 信箱黑條（下）+ 進度條
    const lbBot = document.createElement('div');
    lbBot.id = 'cin-lb-bot';
    lbBot.className = 'cin-lb-bot';
    const prog = document.createElement('div');
    prog.className = 'cin-progress';
    const fill = document.createElement('div');
    fill.id = 'cin-progress-fill';
    fill.className = 'cin-progress-fill';
    prog.appendChild(fill);
    lbBot.appendChild(prog);
    splash.appendChild(lbBot);

    // 掃描線
    const scan = document.createElement('div');
    scan.className = 'cin-scanlines';
    splash.appendChild(scan);

    // 暈影
    const vig = document.createElement('div');
    vig.className = 'cin-vignette';
    splash.appendChild(vig);

    // 解鎖後提示文字
    const tip = document.createElement('div');
    tip.id = 'cin-ready-tip';
    tip.className = 'cin-ready-tip';
    tip.textContent = '▶  點 擊 任 意 處 進 入';
    splash.appendChild(tip);
  }

  /* ── Canvas：背景粒子 + 衝擊波 + 爆裂粒子 ────────── */
  function initCanvas() {
    const canvas = document.getElementById('splash-canvas');
    if (!canvas) return { stop() {}, emitShockwave() {}, emitBurst() {}, cx: innerWidth / 2, cy: innerHeight / 2 };
    const ctx = canvas.getContext('2d');
    let w = canvas.width = innerWidth;
    let h = canvas.height = innerHeight;
    let stopped = false;
    let raf = null;

    // 墨滴背景粒子
    const drops = Array.from({ length: 30 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 62 + 26,
      vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.4) * 0.22,
      a: Math.random() * 0.06 + 0.02,
      hue: Math.random() < 0.68 ? 'rgba(20,15,10,' : 'rgba(201,168,76,'
    }));

    // 金色浮光
    const sparks = Array.from({ length: 65 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      vy: Math.random() * 0.6 + 0.18, vx: (Math.random() - 0.5) * 0.1,
      a: Math.random() * 0.5 + 0.2
    }));

    // 動態陣列
    const shockwaves = [];
    const bursts    = [];

    function emitShockwave(x, y, colorStr) {
      const col = colorStr || 'rgba(201,168,76,';
      shockwaves.push({ x, y, r: 6, maxR: Math.max(w, h) * 0.55, alpha: 0.85, col });
    }

    function emitBurst(x, y, colorStr, count) {
      const col = colorStr || 'rgba(201,168,76,';
      const n   = count || 24;
      for (let i = 0; i < n; i++) {
        const ang   = (Math.PI * 2 * i / n) + (Math.random() - 0.5) * 0.4;
        const speed = Math.random() * 5 + 2;
        bursts.push({
          x, y,
          vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed,
          r: Math.random() * 3 + 1, alpha: 0.9, col
        });
      }
    }

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
        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r);
        g.addColorStop(0, d.hue + d.a + ')');
        g.addColorStop(1, d.hue + '0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
      });

      // 浮光
      sparks.forEach(s => {
        s.x += s.vx; s.y += s.vy;
        if (s.y > h + 10) { s.y = -10; s.x = Math.random() * w; }
        ctx.fillStyle = `rgba(255,220,140,${s.a})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      });

      // 衝擊波環
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.r += (sw.maxR - sw.r) * 0.048 + 2.4;
        sw.alpha -= 0.013;
        if (sw.alpha <= 0) { shockwaves.splice(i, 1); continue; }
        // 外環
        ctx.strokeStyle = sw.col + sw.alpha + ')';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2); ctx.stroke();
        // 內暈環
        ctx.strokeStyle = sw.col + (sw.alpha * 0.35) + ')';
        ctx.lineWidth = 7;
        ctx.beginPath(); ctx.arc(sw.x, sw.y, sw.r * 0.82, 0, Math.PI * 2); ctx.stroke();
      }

      // 爆裂粒子
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.x += b.vx; b.y += b.vy;
        b.vx *= 0.96; b.vy *= 0.96;
        b.alpha -= 0.022;
        if (b.alpha <= 0) { bursts.splice(i, 1); continue; }
        ctx.fillStyle = b.col + b.alpha + ')';
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => {
      w = canvas.width = innerWidth;
      h = canvas.height = innerHeight;
    });
    draw();

    return {
      stop() { stopped = true; if (raf) cancelAnimationFrame(raf); },
      emitShockwave, emitBurst,
      get cx() { return w / 2; },
      get cy() { return h / 2; }
    };
  }

  /* ── 進度條 ────────────────────────────────────────── */
  function startProgress() {
    const fill = document.getElementById('cin-progress-fill');
    if (!fill) return;
    const t0 = Date.now();
    const iv = setInterval(() => {
      const pct = Math.min(100, (Date.now() - t0) / TOTAL_MS * 100);
      fill.style.width = pct + '%';
      if (pct >= 100) clearInterval(iv);
    }, 50);
  }

  /* ── 收起信箱條然後淡出 ────────────────────────────── */
  function dismiss() {
    const splash = document.getElementById('splash');
    if (!splash || splash.dataset.dismissed) return;
    splash.dataset.dismissed = '1';

    const lbTop = document.getElementById('cin-lb-top');
    const lbBot = document.getElementById('cin-lb-bot');
    if (lbTop) lbTop.classList.add('retract');
    if (lbBot) lbBot.classList.add('retract');

    setTimeout(() => {
      splash.classList.add('fadeout');
      setTimeout(() => splash.remove(), 1000);
    }, 220);
  }

  /* ── DOMContentLoaded 入口 ─────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('splash');
    if (!splash) return;

    injectCinElements(splash);

    // 鎖定按鈕
    const btn = document.getElementById('splash-enter');
    if (btn) btn.classList.add('cin-locked');

    // 封鎖所有互動直到解鎖
    let unlocked = false;
    function blockAll(e) {
      if (!unlocked) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    }
    splash.addEventListener('click',      blockAll, true);
    splash.addEventListener('touchstart', blockAll, true);

    // Canvas 特效
    const cv = initCanvas();

    // 進度條
    startProgress();

    // ── 時間軸 ──────────────────────────────────────────
    // 3.0s：印章落地 → 紅色衝擊波 + 爆裂
    setTimeout(() => {
      cv.emitShockwave(cv.cx, cv.cy, 'rgba(181,58,44,');
      cv.emitBurst(cv.cx, cv.cy, 'rgba(239,83,80,', 22);
    }, 3000);

    // 4.6s：標題字全數落定 → 金色爆裂
    setTimeout(() => {
      cv.emitBurst(cv.cx, cv.cy - 50, 'rgba(201,168,76,', 30);
    }, 4600);

    // 6.5s：中場保持 → 金色衝擊波
    setTimeout(() => {
      cv.emitShockwave(cv.cx, cv.cy, 'rgba(201,168,76,');
      cv.emitBurst(cv.cx, cv.cy, 'rgba(255,232,168,', 18);
    }, 6500);

    // 8.5s：終幕爆發 → 雙重衝擊波 + 大爆裂
    setTimeout(() => {
      cv.emitShockwave(cv.cx, cv.cy, 'rgba(201,168,76,');
      cv.emitShockwave(cv.cx, cv.cy, 'rgba(181,58,44,');
      cv.emitBurst(cv.cx, cv.cy, 'rgba(255,232,168,', 40);
    }, 8500);

    // 9.5s：解鎖
    setTimeout(() => {
      unlocked = true;
      splash.removeEventListener('click',      blockAll, true);
      splash.removeEventListener('touchstart', blockAll, true);

      // 解鎖按鈕
      if (btn) {
        btn.classList.remove('cin-locked');
        btn.classList.add('cin-unlocked');
      }

      // 顯示提示
      const tip = document.getElementById('cin-ready-tip');
      if (tip) tip.classList.add('show');

      // 鍵盤
      document.addEventListener('keydown', e => {
        if (['Enter', ' ', 'Escape'].includes(e.key)) dismiss();
      }, { once: true });

      // 點擊任意處
      splash.addEventListener('click', () => dismiss(), { once: true });
    }, TOTAL_MS);

    // 按鈕事件（解鎖後才能觸發）
    if (btn) {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        if (unlocked) dismiss();
      });
    }
  });
})();

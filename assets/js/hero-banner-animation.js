/* =====================================================================
   D&J POWER WASHING — Hero banner wash reveal — service/area subpages
   6 SEQUENTIAL ROW PASSES (alternating L→R / R→L) with 80% band overlap.
   Sprays a tall ellipse + droplet scatter — no stripes possible.
   Canvas: hero element only, absolute, z-index 10.
   ===================================================================== */
(function () {
  'use strict';

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function init() {
    var hero = document.querySelector(
      '.page-hero, .hero-banner, .service-hero, .hero-section, .inner-hero'
    );
    if (!hero) return;

    var W = hero.offsetWidth;
    var H = hero.offsetHeight;
    if (W < 80 || H < 80) return;

    // Force the hero to host an absolutely-positioned overlay
    var cs = window.getComputedStyle(hero);
    if (cs.position === 'static') hero.style.position = 'relative';
    if (cs.overflow !== 'hidden') hero.style.overflow = 'hidden';

    // Build the in-element canvas — sized to hero, NOT viewport
    var canvas = document.createElement('canvas');
    canvas.id = 'djpw-banner-wash';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.width  = W;
    canvas.height = H;
    canvas.style.cssText = [
      'position:absolute',
      'top:0', 'left:0',
      'width:100%', 'height:100%',
      'z-index:10',
      'pointer-events:none',
      'opacity:1'
    ].join(';');

    var ctx = canvas.getContext('2d');

    console.log(
      '[djpw-banner] canvas:', W + '×' + H,
      '· hero offset:', hero.offsetWidth + '×' + hero.offsetHeight,
      '· z-index:', canvas.style.zIndex
    );

    // ── Dirty grime texture — same generator as homepage ──
    var imageData = ctx.createImageData(W, H);
    var data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
      var g = 110 + Math.random() * 70;
      data[i]     = g;
      data[i + 1] = g * 0.78;
      data[i + 2] = g * 0.45;
      data[i + 3] = 130 + (Math.random() * 70) | 0;
    }
    ctx.putImageData(imageData, 0, 0);

    hero.insertBefore(canvas, hero.firstChild);

    // ── Pass plan: 6 rows, alternating direction, 80% overlap ──
    var NUM_PASSES   = 6;
    var bandHeight   = H / NUM_PASSES;
    var sprayHeight  = bandHeight * 1.8;
    var STEP         = 60;
    var EDGE         = 130;

    var passes = [];
    for (var p = 0; p < NUM_PASSES; p++) {
      passes.push({
        y: bandHeight * (p + 0.5),
        dir: p % 2 === 0 ? 1 : -1
      });
    }

    var passIdx = 0;
    var x       = 0;
    var rafId   = null;

    function spray(cx, centerY) {
      ctx.globalCompositeOperation = 'destination-out';
      var grad = ctx.createRadialGradient(cx, centerY, 0, cx, centerY, sprayHeight);
      grad.addColorStop(0,    'rgba(0,0,0,1)');
      grad.addColorStop(0.5,  'rgba(0,0,0,0.85)');
      grad.addColorStop(0.85, 'rgba(0,0,0,0.4)');
      grad.addColorStop(1,    'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, centerY, 110, sprayHeight / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      for (var d = 0; d < 7; d++) {
        ctx.globalCompositeOperation = 'destination-out';
        var dx = cx + (Math.random() - 0.5) * 200;
        var dy = centerY + (Math.random() - 0.5) * sprayHeight * 1.2;
        var dr = 2 + Math.random() * 5;
        ctx.beginPath();
        ctx.arc(dx, dy, dr, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,' + (0.3 + Math.random() * 0.5) + ')';
        ctx.fill();
      }
    }

    function startPass() {
      if (passIdx >= passes.length) { finish(); return; }
      var pass = passes[passIdx];
      x = pass.dir === 1 ? -EDGE : W + EDGE;
      rafId = requestAnimationFrame(frame);
    }

    function frame() {
      var pass = passes[passIdx];
      spray(x, pass.y);
      x += pass.dir * STEP;

      var done = pass.dir === 1 ? x > W + EDGE : x < -EDGE;
      if (done) {
        passIdx++;
        startPass();
      } else {
        rafId = requestAnimationFrame(frame);
      }
    }

    function finish() {
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, W, H);
      canvas.style.transition = 'opacity 0.35s ease-out';
      canvas.style.opacity = '0';
      setTimeout(function () {
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        startGlossEffect();
      }, 400);
    }

    /* ── Diagonal gloss/shine sweep — runs after spray completes, loops ── */
    function startGlossEffect() {
      var glossHero = document.querySelector(
        '.hero, .hero-section, .page-hero, .hero-banner, .service-hero, .inner-hero'
      );
      if (!glossHero) return;

      glossHero.style.position = 'relative';
      glossHero.style.overflow = 'hidden';

      var gloss = document.createElement('div');
      gloss.className = 'djpw-gloss';
      gloss.style.cssText = [
        'position:absolute',
        'top:-50%',
        'left:-75%',
        'width:50%',
        'height:200%',
        'background:linear-gradient(105deg,' +
          ' rgba(255,255,255,0) 0%,' +
          ' rgba(255,255,255,0.06) 40%,' +
          ' rgba(255,255,255,0.13) 50%,' +
          ' rgba(255,255,255,0.06) 60%,' +
          ' rgba(255,255,255,0) 100%)',
        'transform:skewX(-15deg)',
        'pointer-events:none',
        'z-index:5',
        'transition:none'
      ].join(';');

      glossHero.appendChild(gloss);

      function runGloss() {
        gloss.style.transition = 'none';
        gloss.style.left = '-75%';
        // Force reflow so the next transition runs from the reset position
        gloss.getBoundingClientRect();
        gloss.style.transition = 'left 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
        gloss.style.left = '150%';
      }

      runGloss();
      setInterval(runGloss, 5000);
    }

    setTimeout(startPass, 150);

    function bail() {
      if (rafId) cancelAnimationFrame(rafId);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      window.removeEventListener('resize', bail);
    }
    window.addEventListener('resize', bail);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

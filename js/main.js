/* Sanjay Kumar S — portfolio interactions (vanilla JS, zero dependencies) */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var rand = function (a, b) { return a + Math.random() * (b - a); };

  $('#year').textContent = new Date().getFullYear();

  /* ================= intro ================= */
  var intro = $('#intro'), introDone = false;
  function finishIntro() {
    if (introDone) return; introDone = true;
    intro.classList.add('done');
    doc.body.classList.add('ready');
    setTimeout(function () { intro.style.display = 'none'; }, 1800);
    startBubble();
  }
  var seen = false;
  try { seen = sessionStorage.getItem('sk-intro') === '1'; } catch (e) {}
  if (reduce || seen) { intro.style.display = 'none'; introDone = true; doc.body.classList.add('ready'); }
  else {
    setTimeout(finishIntro, 2000);
    $('#introSkip').addEventListener('click', finishIntro);
    intro.addEventListener('click', finishIntro);
    try { sessionStorage.setItem('sk-intro', '1'); } catch (e) {}
  }

  /* ================= reveal on scroll ================= */
  var revealObs;
  function countUp(el) {
    if (!el || el.dataset.done) return; el.dataset.done = 1;
    var to = +el.dataset.to;
    if (reduce) { el.textContent = to; return; }
    var t0 = performance.now(), dur = 1600;
    (function tick(t) {
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  if (!('IntersectionObserver' in window)) {
    $$('[data-reveal],[data-chapter]').forEach(function (n) { n.classList.add('in'); });
    $$('.count').forEach(function (c) { c.textContent = c.dataset.to; });
  } else {
    revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        if (en.target.classList.contains('num')) countUp(en.target.querySelector('.count'));
        revealObs.unobserve(en.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    $$('[data-reveal],[data-chapter]').forEach(function (n) { revealObs.observe(n); });
  }

  /* ================= statement: words light up with scroll ================= */
  var stmt = $('#statement'), words = [];
  if (stmt && !reduce) {
    (function split(node, hl) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = doc.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(doc.createTextNode(' ')); return; }
            var s = doc.createElement('span'); s.className = 'w' + (hl ? ' hl' : ''); s.textContent = part;
            words.push(s); frag.appendChild(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.classList.contains('hl')) { split(n, true); }
      });
    })(stmt, false);
  }
  var litN = 0;
  function updateStatement() {
    if (!words.length) return;
    var r = stmt.getBoundingClientRect(), vh = window.innerHeight;
    var p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.25), 0, 1), n = Math.round(p * words.length);
    if (n === litN) return; var lo = Math.min(n, litN), hi = Math.max(n, litN); for (var i = lo; i < hi; i++) words[i].classList.toggle('lit', i < n); litN = n;
  }

  /* ================= role rotator ================= */
  var rot = $('#roleRot'), roles = ['Java · Spring Boot', 'React front-ends', 'AI agents & automation', 'Enterprise integrations'], ri = 0;
  if (rot && !reduce) setInterval(function () {
    rot.classList.add('swap');
    setTimeout(function () { ri = (ri + 1) % roles.length; rot.textContent = roles[ri]; rot.classList.remove('swap'); }, 420);
  }, 2900);

  /* ================= marquee: duplicate for a seamless loop ================= */
  var track = $('#marquee'); if (track) track.innerHTML += track.innerHTML;

  /* ================= nav ================= */
  var nav = $('#nav'), bar = $('#progress'), lastY = 0, ticking = false, navLinks = $('#navLinks');
  var sections = ['experience', 'stack', 'work', 'about', 'contact'].map(function (id) { return doc.getElementById(id); });
  var links = $$('.nav-links a');
  var nativeProgress = window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()');
  var tops = [], scrollTimer = 0;
  function measureTops() { var y = window.scrollY; tops = sections.map(function (s) { return s ? s.getBoundingClientRect().top + y : 1e9; }); }
  function onScroll() {
    var y = window.scrollY;
    if (!nativeProgress) { var h = root.scrollHeight - window.innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')'; }
    var sc = y > 40; if (sc !== nav._sc) { nav._sc = sc; nav.classList.toggle('scrolled', sc); }
    var hide = y > lastY && y > 480 && !navLinks.classList.contains('open'); if (hide !== nav._h) { nav._h = hide; nav.classList.toggle('hide', hide); }
    lastY = y;
    var cur = '', line = y + window.innerHeight * 0.4;
    for (var i = 0; i < tops.length; i++) if (tops[i] < line) cur = sections[i].id;
    if (cur !== onScroll.cur) { onScroll.cur = cur; links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + cur && !a.classList.contains('pill')); }); }
    updateStatement(); ticking = false;
  }
  function scrollFlag() { root.classList.add('is-scrolling'); clearTimeout(scrollTimer); scrollTimer = setTimeout(function () { root.classList.remove('is-scrolling'); }, 140); }
  window.addEventListener('scroll', scrollFlag, { passive: true });
  window.addEventListener('load', function () { measureTops(); onScroll(); }); measureTops();
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', function () { measureTops(); onScroll(); }); onScroll();
  var mb = $('#menuBtn');
  mb.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    mb.setAttribute('aria-expanded', open); mb.textContent = open ? 'Close' : 'Menu';
  });
  links.forEach(function (a) { a.addEventListener('click', function () { navLinks.classList.remove('open'); mb.textContent = 'Menu'; mb.setAttribute('aria-expanded', 'false'); }); });

  /* ================= pointer-only polish ================= */
  var pointer = { x: window.innerWidth * 0.7, y: window.innerHeight * 0.4, t: 0, has: false };
  window.addEventListener('pointermove', function (e) { pointer.x = e.clientX; pointer.y = e.clientY; pointer.t = performance.now(); pointer.has = true; }, { passive: true });
  if (fine && !reduce) {
    var glow = $('#glow'), gx = pointer.x, gy = pointer.y;
    window.addEventListener('mousemove', function () { glow.classList.add('on'); }, { passive: true, once: true });
    (function loop() { gx += (pointer.x - gx) * 0.08; gy += (pointer.y - gy) * 0.08; glow.style.transform = 'translate3d(' + gx + 'px,' + gy + 'px,0)'; requestAnimationFrame(loop); })();
    $$('[data-magnetic]').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.2) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.32) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
    $$('.shot').forEach(function (c) {
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = 'perspective(1000px) rotateY(' + (x * 7) + 'deg) rotateX(' + (-y * 7) + 'deg) scale(1.015)';
      });
      c.addEventListener('mouseleave', function () { c.style.transform = ''; });
    });
  }

  /* ================= animated avatar ================= */
  var avatars = [];
  function Avatar(el) {
    var q = function (s) { return el.querySelector(s); };
    this.el = el; this.kind = el.dataset.avatar;
    this.tilt = q('.av-tilt'); this.body = q('.av-body'); this.head = q('.av-headgrp');
    this.hA = q('[data-hand="a"]'); this.hB = q('[data-hand="b"]');
    this.eyes = [q('[data-eye="l"]'), q('[data-eye="r"]')];
    this.canvas = q('.av-steam'); this.visible = true;
    this.s = { hx: 0, hy: 0, hr: 0, ex: 0, ey: 0, tx: 0, ty: 0 };
    this.gaze = { x: 0.35, y: -0.05, next: 0 };
    this.jit = { x: 0, y: 0, next: 0 };
    this.blink = { start: -1, next: performance.now() + rand(1500, 3200), dbl: false };
    this.parts = []; this.spawn = 0; this.ctx = null;
    if (this.canvas) { this.ctx = this.canvas.getContext('2d'); }
    var self = this;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { self.visible = en[0].isIntersecting; }, { rootMargin: '80px' }).observe(el);
  }
  Avatar.prototype.rect = function () {
    if (this.dirty !== false || !this.box) {
      var b = this.el.getBoundingClientRect();
      this.box = { l: b.left + window.scrollX, t: b.top + window.scrollY, w: b.width, h: b.height }; this.dirty = false;
    }
    var y = window.scrollY, x = window.scrollX;
    return { left: this.box.l - x, top: this.box.t - y, width: this.box.w, height: this.box.h };
  };
  Avatar.prototype.sizeCanvas = function () {
    if (!this.canvas) return;
    var r = this.el.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.round(r.width * d));
    if (this.canvas.width !== w) { this.canvas.width = w; this.canvas.height = w; }
  };
  Avatar.prototype.steam = function (dt) {
    var c = this.ctx; if (!c) return;
    var W = this.canvas.width, k = W / 1024;
    this.spawn += dt * 5.5;
    while (this.spawn > 1) { this.spawn -= 1; this.parts.push({ x: 352 + rand(-16, 16), y: 846, age: 0, life: rand(2.6, 3.8), seed: rand(0, 6.28), r: rand(10, 16) }); }
    c.clearRect(0, 0, W, W);
    for (var i = this.parts.length - 1; i >= 0; i--) {
      var p = this.parts[i]; p.age += dt;
      if (p.age > p.life) { this.parts.splice(i, 1); continue; }
      var a = p.age / p.life, x = (p.x + Math.sin(p.age * 1.7 + p.seed) * (8 + a * 22)) * k, y = (p.y - p.age * 34) * k, r = (p.r + a * 34) * k;
      var alpha = 0.2 * Math.min(1, p.age * 2.4) * (1 - a);
      var g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(255,250,244,' + alpha + ')'); g.addColorStop(1, 'rgba(255,250,244,0)');
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill();
    }
  };
  Avatar.prototype.frame = function (now, dt, t) {
    var s = this.s, r = this.rect();
    var idle = !pointer.has || now - pointer.t > 4500 || !fine;
    var nx, ny;
    if (idle) {
      if (now > this.gaze.next) {
        var spots = [[0.4, -0.05], [0.15, 0.1], [0.65, 0.15], [0.05, -0.12], [-0.25, 0.05], [0.5, -0.25]], sp = spots[(Math.random() * spots.length) | 0];
        this.gaze.x = sp[0]; this.gaze.y = sp[1]; this.gaze.next = now + rand(2000, 4200);
      }
      nx = this.gaze.x; ny = this.gaze.y;
    } else {
      var cx = r.left + r.width * 0.503, cy = r.top + r.height * 0.27;
      nx = clamp((pointer.x - cx) / Math.max(window.innerWidth * 0.42, 460), -1, 1);
      ny = clamp((pointer.y - cy) / Math.max(window.innerHeight * 0.42, 380), -1, 1);
      nx = Math.sign(nx) * Math.pow(Math.abs(nx), 0.78); ny = Math.sign(ny) * Math.pow(Math.abs(ny), 0.78);
    }
    /* micro saccades */
    if (now > this.jit.next) { this.jit.x = rand(-0.7, 0.7); this.jit.y = rand(-0.4, 0.4); this.jit.next = now + rand(500, 1500); }
    var ease = function (cur, tgt, rate) { return cur + (tgt - cur) * (1 - Math.exp(-dt * rate)); };
    var sway = Math.sin(t * 0.7) * (idle ? 0.6 : 0.2);
    s.hx = ease(s.hx, nx * 12, 4.2);
    s.hy = ease(s.hy, ny * 6.5, 4.2);
    s.hr = ease(s.hr, nx * 3.4 + sway, 4.2);
    s.ex = ease(s.ex, clamp(nx * 8.5 - s.hx * 0.12 + this.jit.x, -9, 9), 16);
    s.ey = ease(s.ey, clamp(ny * 3.6 + this.jit.y, -3.6, 3.6), 16);
    s.tx = ease(s.tx, -ny * 3, 3); s.ty = ease(s.ty, nx * 4, 3);
    var bob = Math.sin(t * 1.7 + 0.5);
    this.tilt.style.setProperty('--tx', s.tx.toFixed(3)); this.tilt.style.setProperty('--ty', s.ty.toFixed(3));
    this.body.style.setProperty('--breath', (1 + 0.0045 * Math.sin(t * 1.7)).toFixed(5));
    this.head.style.setProperty('--hx', s.hx.toFixed(2)); this.head.style.setProperty('--hy', (s.hy + bob * 1.4).toFixed(2)); this.head.style.setProperty('--hr', s.hr.toFixed(3));
    if (this.hA) { this.hA.style.setProperty('--har', (1.6 * Math.sin(t * 1.05) + nx * 0.8).toFixed(3)); this.hA.style.setProperty('--hay', (2.6 * Math.sin(t * 1.3 + 1.2)).toFixed(2)); this.hA.style.setProperty('--hax', (1.2 * Math.sin(t * 0.9)).toFixed(2)); }
    if (this.hB) { this.hB.style.setProperty('--har', (-1.9 * Math.sin(t * 0.85 + 2.1)).toFixed(3)); this.hB.style.setProperty('--hay', (2.2 * Math.sin(t * 1.15 + 0.3)).toFixed(2)); this.hB.style.setProperty('--hax', (1.0 * Math.sin(t * 0.7 + 1)).toFixed(2)); }
    /* blink */
    var b = this.blink, lid = 0;
    if (b.start < 0 && now > b.next) { b.start = now; }
    if (b.start >= 0) {
      var e = now - b.start;
      if (e < 75) lid = e / 75; else if (e < 110) lid = 1; else if (e < 240) lid = 1 - (e - 110) / 130; else {
        b.start = -1; b.next = now + (b.dbl ? rand(2600, 5200) : 140); b.dbl = !b.dbl && Math.random() < 0.18 ? true : false;
        if (b.next - now === 140 && !b.dbl) b.next = now + rand(2400, 5600);
      }
    }
    for (var i = 0; i < 2; i++) { var eye = this.eyes[i]; if (!eye) continue; eye.style.setProperty('--ex', s.ex.toFixed(2)); eye.style.setProperty('--ey', s.ey.toFixed(2)); eye.style.setProperty('--lid', lid.toFixed(3)); }
    if (this.ctx) this.steam(dt);
  };
  $$('[data-avatar]').forEach(function (el) { avatars.push(new Avatar(el)); });
  if (avatars.length && !reduce) {
    var last = performance.now(), t0 = last, skip = false;
    avatars.forEach(function (a) { a.sizeCanvas(); });
    window.addEventListener('resize', function () { avatars.forEach(function (a) { a.dirty = true; a.sizeCanvas(); }); });
    window.addEventListener('load', function () { avatars.forEach(function (a) { a.dirty = true; }); });
    (function loop(now) {
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      var t = (now - t0) / 1000;
      skip = !skip; if (!(root.classList.contains('is-scrolling') && skip)) for (var i = 0; i < avatars.length; i++) if (avatars[i].visible) avatars[i].frame(now, dt, t);
      requestAnimationFrame(loop);
    })(last);
  }

  /* speech bubble */
  var bubble = $('#bubble'), lines = ["Hi, I'm Sanjay.", 'Java by trade, AI by curiosity.', 'Ship it. Test it. Own it.', 'Coffee first, then code.', 'Ask me about Spring Boot.'], bi = 0, bubbleOn = false;
  function startBubble() {
    if (bubbleOn || !bubble || reduce) return; bubbleOn = true;
    setInterval(function () {
      bubble.classList.add('swap');
      setTimeout(function () { bi = (bi + 1) % lines.length; bubble.textContent = lines[bi]; bubble.classList.remove('swap'); }, 420);
    }, 4600);
  }
  if (introDone) startBubble();

  /* ================= live clock ================= */
  function tick() {
    var t;
    try { t = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }); }
    catch (e) { t = new Date().toTimeString().slice(0, 5); }
    ['clock', 'clock2'].forEach(function (id) { var el = doc.getElementById(id); if (el) el.textContent = t; });
  }
  tick(); setInterval(tick, 20000);

  /* ================= copy email ================= */
  var cp = $('#copyMail'), toast = $('#toast');
  if (cp) cp.addEventListener('click', function (e) {
    e.preventDefault(); e.stopPropagation();
    var mail = 'sanjayyykumarr23@gmail.com';
    function done(ok) { toast.textContent = ok ? 'Email copied' : mail; toast.classList.add('show'); setTimeout(function () { toast.classList.remove('show'); }, 1900); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(mail).then(function () { done(true); }, function () { done(false); });
    else done(false);
  });

  /* ================= contact form → prefilled email ================= */
  (function () {
    var form = $('#form'); if (!form) return;
    var btn = $('#sendBtn'), label = btn.querySelector('span'), err = $('#formErr'), sent = $('#sent'), msg = $('#f-msg'), cnt = $('#cnt');
    var MAIL = 'sanjayyykumarr23@gmail.com';
    msg.addEventListener('input', function () { var n = msg.value.length; cnt.textContent = n + ' / 1200'; cnt.classList.toggle('warn', n > 1100); });
    function busy(on) { btn.disabled = on; btn.classList.toggle('busy', on); label.textContent = on ? 'Sending…' : 'Send message'; }
    function fallback(f) {
      var body = f.message + '\n\n— ' + f.name + ' (' + f.email + ')\nTopic: ' + f.topic;
      window.location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('[' + f.topic + '] Hello from ' + f.name) + '&body=' + encodeURIComponent(body);
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault(); err.hidden = true;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var fd = new FormData(form), f = { name: fd.get('name').trim(), email: fd.get('email').trim(), message: fd.get('message').trim(), topic: fd.get('topic') || 'Hello' };
      if (fd.get('bot-field')) return;
      busy(true);
      var ctl = window.AbortController ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 12000);
      var body = new URLSearchParams(); fd.forEach(function (v, k) { body.append(k, v); });
      fetch(form.getAttribute('action') || '/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString(), signal: ctl ? ctl.signal : undefined })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r; })
        .then(function () {
          clearTimeout(to); busy(false);
          $('#sentTo').textContent = f.email; sent.hidden = false; form.reset(); cnt.textContent = '0 / 1200';
        })
        .catch(function () {
          clearTimeout(to); busy(false);
          err.textContent = 'Couldn’t send directly from here, so I’ve opened your email app with the message ready. You can also write to ' + MAIL + '.';
          err.hidden = false; fallback(f);
        });
    });
    $('#sentAgain').addEventListener('click', function () { sent.hidden = true; $('#f-name').focus(); });
  })();

  /* scrolling is native (compositor-driven); parallax lives in CSS scroll timelines */
})();

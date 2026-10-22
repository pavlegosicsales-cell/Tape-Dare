/* ==========================================================================
   Tapedare, ponasanje sajta
   Mobilna navigacija, scroll reveal, podela naslova po recima, FAQ
   akordeon, visekoracna forma za upit, klizac pre/posle i topologija u
   footeru. Preuzeto iz Deko Pro builda, promenjena su polja forme,
   tekstovi i dodat je klizac pre/posle.
   ========================================================================== */

/* Paste the Apps Script URL here after running Skill 03 (Form Backend Setup) */
const ENDPOINT = '';

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------- Smooth scrolling
     Lenis drives the real window scroll, so the keyboard, the scrollbar
     and touch all keep working normally. Intercepting wheel events by
     hand breaks on a trackpad and leaves the page drifting after the
     gesture stops, which is why that approach is not used here. */
  var lenis = null;

  if (!reduceMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      lerp: 0.085,          // lower value = softer, longer glide
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false      // touch keeps the system own inertia
    });

    var rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);
  }

  // One helper for both modes
  function goToY(y) {
    if (lenis) { lenis.scrollTo(y); return; }
    window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  /* In-page anchor links ride the same easing */
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href');
    if (!id || id === '#') return;
    const dest = document.querySelector(id);
    if (!dest) return;
    e.preventDefault();
    goToY(dest.getBoundingClientRect().top + window.scrollY - 100);
  });

  /* ---------------------------------------------------------------- Year */
  document.querySelectorAll('#year').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ------------------------------------------------------------------ Nav */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');

  if (nav && navToggle) {
    navToggle.addEventListener('click', function () {
      const open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Zatvori meni' : 'Otvori meni');
    });

    // Close the menu after tapping a link
    nav.querySelectorAll('.nav-menu a, .nav-cta a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Otvori meni');
      });
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });

    /* The bar follows the scroll direction:
       top of page    -> half opaque navy bar
       scrolling down -> solid white bar
       scrolling up   -> fully transparent bar
       A 6px threshold stops it flickering on tiny movements. */
    var lastY = window.scrollY;
    var TOP_ZONE = 40;
    var DIR_THRESHOLD = 6;

    const onScroll = function () {
      var y = window.scrollY;
      var delta = y - lastY;

      if (y <= TOP_ZONE) {
        nav.classList.remove('is-down', 'is-up');
        lastY = y;
        return;
      }
      if (Math.abs(delta) < DIR_THRESHOLD) return;

      if (delta > 0) {
        nav.classList.add('is-down');
        nav.classList.remove('is-up');
      } else {
        nav.classList.add('is-up');
        nav.classList.remove('is-down');
      }
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* -------------------------------------------- Word-by-word heading split */
  function splitWords(el) {
    if (el.dataset.splitDone) return;
    if (el.hasAttribute('data-split-blur')) el.classList.add('split-blur');
    /* Pasusi idu mekse: manji blur, kraci hod, brzi stagger. */
    const soft = el.hasAttribute('data-split-soft');
    if (soft) el.classList.add('split-soft');

    const walk = function (node) {
      const kids = Array.prototype.slice.call(node.childNodes);
      kids.forEach(function (child) {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach(function (part) {
            if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
            const span = document.createElement('span');
            span.className = 'split-word';
            span.textContent = part;
            frag.appendChild(span);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(el);

    const step = soft ? 0.03 : 0.085;
    el.querySelectorAll('.split-word').forEach(function (w, i) {
      w.style.setProperty('--word-delay', (i * step) + 's');
    });
    el.dataset.splitDone = '1';
  }

  const splitTargets = document.querySelectorAll('[data-split]');
  if (!reduceMotion) {
    splitTargets.forEach(splitWords);
  }

  /* -------------------------------------------------- Scroll reveal system */
  if (reduceMotion || !('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); });
    splitTargets.forEach(function (el) { el.classList.add('split-ready'); });
  } else {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });

    // Headings animate their words in when they scroll into view
    const headingIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('split-ready');
        headingIO.unobserve(entry.target);
      });
    }, { threshold: 0.25 });

    splitTargets.forEach(function (el) {
      // Headings above the fold reveal immediately on load
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
        setTimeout(function () { el.classList.add('split-ready'); }, 350);
      } else {
        headingIO.observe(el);
      }
    });
  }

  /* ====================================================================
     Scroll motion: parallax u herou i drift kartica

     Uradjeno po hydrowell.framer.website. Tamo hero slika ima svoj
     transform na skrolu, pa deluje kao da stoji dok sadrzaj odlazi
     navise, a staklene mini kartice preko fotografija klize sporije
     od ostatka strane. Sve ide kroz jedan rAF, bez biblioteke.
     ==================================================================== */
  if (!reduceMotion) {
    var heroSec   = document.querySelector('.hero');
    var heroImg   = document.querySelector('.hero-bg img');
    var heroInner = document.querySelector('.hero > .container');

    /* Elementi koji klize. Broj je jacina: 1 = 100px hoda kroz ceo ekran. */
    var drifters = [];
    document.querySelectorAll('[data-drift]').forEach(function (el) {
      drifters.push({ el: el, amt: parseFloat(el.getAttribute('data-drift')) || 0.12 });
    });

    var vh = window.innerHeight;
    var ticking = false;
    var enabled = window.innerWidth > 900;

    function frame() {
      ticking = false;
      var y = window.scrollY;

      if (heroSec && heroImg) {
        var h = heroSec.offsetHeight || vh;
        var p = Math.min(Math.max(y / h, 0), 1);
        /* Slika se spusta 62 odsto puta koji strana predje, pa na ekranu
           odlazi samo trecinom brzine i deluje kao da stoji. Pomeranje je
           nadole, tako da donja ivica slike nikad ne otkrije prazno. */
        heroImg.style.transform = 'translate3d(0,' + (p * h * 0.62).toFixed(1) + 'px,0)';
        if (heroInner) {
          heroInner.style.transform = 'translate3d(0,' + (p * -70).toFixed(1) + 'px,0)';
          heroInner.style.opacity = String(1 - p * 0.55);
        }
      }

      if (enabled) {
        for (var i = 0; i < drifters.length; i++) {
          var d = drifters[i];
          var r = d.el.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) continue;
          /* -1 kad je element pri dnu ekrana, +1 kad je pri vrhu */
          var q = (vh / 2 - (r.top + r.height / 2)) / (vh / 2);
          d.el.style.transform = 'translate3d(0,' + (q * d.amt * -100).toFixed(1) + 'px,0)';
        }
      }
    }

    function onScrollMotion() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(frame);
    }

    window.addEventListener('scroll', onScrollMotion, { passive: true });
    window.addEventListener('resize', function () {
      vh = window.innerHeight;
      enabled = window.innerWidth > 900;
      if (!enabled) {
        drifters.forEach(function (d) { d.el.style.transform = ''; });
      }
      onScrollMotion();
    });
    frame();
  }

  /* --------------------------------------------------------- FAQ accordion */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item = btn.closest('.faq-item');
      const list = btn.closest('.faq-list');
      const willOpen = !item.classList.contains('is-open');

      if (list) {
        list.querySelectorAll('.faq-item').forEach(function (other) {
          other.classList.remove('is-open');
          const b = other.querySelector('.faq-q');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
      }
      item.classList.toggle('is-open', willOpen);
      btn.setAttribute('aria-expanded', String(willOpen));
    });
  });

  /* ---------------------------------------------------------- POST helper */
  function send(payload) {
    if (!ENDPOINT) {
      // The backend is not wired up yet. Log the payload so the form stays testable.
      console.info('[Tapedare] ENDPOINT je prazan. Ovo bi bilo poslato:', payload);
      return Promise.resolve({ ok: true, simulated: true });
    }
    return fetch(ENDPOINT, {
      method: 'POST',
      // Apps Script web apps reject preflighted requests, so keep it simple.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error('Request failed with status ' + res.status);
      return { ok: true };
    });
  }

  /* ============================================================== WIZARD */
  const form = document.getElementById('wizardForm');

  if (form) {
    const steps = Array.prototype.slice.call(form.querySelectorAll('.wiz-step'));
    const dotsWrap = document.getElementById('wizDots');
    const countEl = document.getElementById('wizCount');
    const submitBtn = document.getElementById('wizSubmit');
    const formError = document.getElementById('wizFormError');
    const doneEl = document.getElementById('wizDone');
    const summaryEl = document.getElementById('wizSummary');
    const answers = {
      service: '', radovi: '', materijal: '', prevoz: '', timing: '',
      suburb: '', name: '', phone: '', email: '', message: ''
    };

    /* Ne vazi svaki korak za svaki komad. Zidni paneli se prave nanovo i
       ugradjuju na licu mesta, pa ih ne pitamo da li je presvlacenje ili
       popravka, ni kako da preuzmemo namestaj. Koraci koji vaze samo za
       neke komade nose data-when sa listom vrednosti iz prvog koraka.

       Zato "current" nije indeks u steps nego pozicija u "order", listi
       koraka koji trenutno vaze. Lista se prepravlja cim se promeni
       odgovor na prvom koraku. */
    let order = [];
    let current = 0;

    function stepApplies(el) {
      const when = el.dataset.when;
      if (!when) return true;
      if (!answers.service) return true;
      return when.split('|').indexOf(answers.service) > -1;
    }

    function buildDots() {
      dotsWrap.innerHTML = '';
      for (let i = 0; i < order.length; i++) {
        const dot = document.createElement('span');
        dot.className = 'wiz-dot';
        dotsWrap.appendChild(dot);
      }
    }

    function rebuildOrder(keepAbs) {
      order = [];
      steps.forEach(function (s, i) { if (stepApplies(s)) order.push(i); });

      /* Odgovor sa koraka koji je ispao mora da se obrise, inace bi
         odgovor izabran ranije zavrsio u rezimeu i u mejlu. */
      steps.forEach(function (s, i) {
        if (order.indexOf(i) > -1) return;
        const g = s.querySelector('[data-choice-group]');
        if (!g) return;
        answers[g.dataset.choiceGroup] = '';
        g.querySelectorAll('.choice').forEach(function (c) { c.classList.remove('is-picked'); });
      });

      if (typeof keepAbs === 'number') {
        const p = order.indexOf(keepAbs);
        current = p > -1 ? p : 0;
      }
      buildDots();
    }

    function paint() {
      const abs = order[current];
      steps.forEach(function (s, i) { s.classList.toggle('is-active', i === abs); });
      Array.prototype.slice.call(dotsWrap.children).forEach(function (d, i) {
        d.classList.toggle('is-done', i <= current);
      });
      countEl.textContent = 'Korak ' + (current + 1) + ' od ' + order.length;
    }

    rebuildOrder(0);

    function showError(key, on) {
      const el = form.querySelector('[data-error-for="' + key + '"]');
      if (el) el.hidden = !on;
    }

    function goTo(pos) {
      current = Math.max(0, Math.min(order.length - 1, pos));
      paint();
      const wizard = form.closest('.wizard');
      if (wizard) {
        goToY(wizard.getBoundingClientRect().top + window.scrollY - 110);
      }
      const firstControl = steps[order[current]].querySelector('.choice, input, textarea');
      if (firstControl) firstControl.focus({ preventScroll: true });
    }

    // Choice buttons
    form.querySelectorAll('[data-choice-group]').forEach(function (group) {
      const key = group.dataset.choiceGroup;
      const autoAdvance = group.dataset.autoAdvance === 'true';

      group.querySelectorAll('.choice').forEach(function (choice) {
        choice.addEventListener('click', function () {
          group.querySelectorAll('.choice').forEach(function (c) { c.classList.remove('is-picked'); });
          choice.classList.add('is-picked');
          answers[key] = choice.dataset.value;
          showError(key, false);
          if (key === 'service') rebuildOrder(order[current]);
          if (autoAdvance) {
            window.setTimeout(function () { if (current < order.length - 1) goTo(current + 1); }, 220);
          }
        });
      });
    });

    // Text inputs
    ['suburb', 'name', 'phone', 'email', 'message'].forEach(function (key) {
      const input = form.querySelector('#' + key);
      if (!input) return;
      input.addEventListener('input', function () {
        answers[key] = input.value.trim();
        showError(key, false);
      });
    });

    /* Korak sa izborom trazi odgovor u svojoj grupi. Poslednji korak
       (bez grupe) proverava polja. Imejl nije obavezan, jer se tapetar
       ionako javlja telefonom, ali ako je upisan mora da bude ispravan. */
    function validateStep(pos) {
      const step = steps[order[pos]];
      const group = step.querySelector('[data-choice-group]');
      let ok = true;

      if (group) {
        const key = group.dataset.choiceGroup;
        if (!answers[key]) { showError(key, true); ok = false; }
        return ok;
      }

      if (!answers.name) { showError('name', true); ok = false; }
      if (!answers.phone || answers.phone.replace(/\D/g, '').length < 8) { showError('phone', true); ok = false; }
      if (answers.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email)) { showError('email', true); ok = false; }
      if (!answers.suburb) { showError('suburb', true); ok = false; }
      return ok;
    }

    form.querySelectorAll('[data-next]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!validateStep(current)) return;
        goTo(current + 1);
      });
    });

    form.querySelectorAll('[data-back]').forEach(function (btn) {
      btn.addEventListener('click', function () { goTo(current - 1); });
    });

    // Enter should advance rather than submit early
    form.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      if (e.target.tagName === 'TEXTAREA') return;
      if (current < order.length - 1) {
        e.preventDefault();
        if (validateStep(current)) goTo(current + 1);
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (formError) formError.hidden = true;
      if (!validateStep(current)) return;

      submitBtn.disabled = true;
      const original = submitBtn.firstChild.textContent;
      submitBtn.firstChild.textContent = 'Šaljem ';

      const payload = {
        formType: 'Upit za ponudu, Tapedare',
        service: answers.service,
        radovi: answers.radovi,
        materijal: answers.materijal,
        prevoz: answers.prevoz,
        timing: answers.timing,
        suburb: answers.suburb,
        name: answers.name,
        phone: answers.phone,
        email: answers.email,
        message: answers.message,
        submittedAt: new Date().toISOString(),
        page: window.location.href
      };

      send(payload).then(function () {
        form.style.display = 'none';
        doneEl.classList.add('is-active');

        summaryEl.innerHTML = '';
        [
          ['Nameštaj', answers.service],
          ['Radovi', answers.radovi],
          ['Materijal', answers.materijal],
          ['Prevoz', answers.prevoz],
          ['Rok', answers.timing],
          ['Mesto', answers.suburb],
          ['Kontakt', answers.name + ', ' + answers.phone]
        ].filter(function (row) {
          /* Preskoceni koraci nemaju odgovor, pa ne idu ni u rezime. */
          return row[1] && String(row[1]).trim();
        }).forEach(function (row) {
          const wrap = document.createElement('div');
          wrap.className = 'summary-row';
          const dt = document.createElement('dt');
          dt.textContent = row[0];
          const dd = document.createElement('dd');
          dd.textContent = row[1];
          wrap.appendChild(dt);
          wrap.appendChild(dd);
          summaryEl.appendChild(wrap);
        });

        goToY(doneEl.getBoundingClientRect().top + window.scrollY - 120);
      }).catch(function (err) {
        console.error(err);
        submitBtn.disabled = false;
        submitBtn.firstChild.textContent = original;
        if (formError) {
          formError.hidden = false;
          formError.textContent = 'Slanje nije uspelo. Pozovite nas na 063 314 690 i rešićemo odmah.';
        }
      });
    });

    paint();
  }


  /* ===================================================== Topologija u footeru
     Prenos "topology-field" komponente na obican 2D canvas. Sfera je kruta,
     pa se parovi tacaka koje se spajaju racunaju jednom, na startu, i posle
     se samo rotira i projektuje. Tako nema three.js-a, a slika je ista.
     Crta se samo dok je u vidnom polju, da ne trosi bateriju na telefonu. */
  const topo = document.querySelector('.topology-mark');

  if (topo && topo.getContext) {
    const ctx = topo.getContext('2d');
    const NODES = 110;
    const LINK_DIST = 0.46;
    const pts = [];

    // Fibonacci raspored, isto kao u originalu
    for (let i = 0; i < NODES; i++) {
      const phi = Math.acos(-1 + (2 * i) / NODES);
      const theta = Math.sqrt(NODES * Math.PI) * phi;
      pts.push({
        x: Math.cos(theta) * Math.sin(phi),
        y: Math.sin(theta) * Math.sin(phi),
        z: Math.cos(phi),
        size: Math.random() * 1.4 + 1,
        speed: Math.random() * 0.02 + 0.015,
        phase: Math.random() * Math.PI * 2
      });
    }

    const links = [];
    for (let i = 0; i < NODES; i++) {
      for (let j = i + 1; j < NODES; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, dz = pts[i].z - pts[j].z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < LINK_DIST) links.push([i, j, (1 - d / LINK_DIST) * 0.8]);
      }
    }

    let cssW = 0, cssH = 0;
    function sizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = topo.getBoundingClientRect();
      cssW = rect.width; cssH = rect.height;
      topo.width = Math.round(cssW * dpr);
      topo.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas, { passive: true });

    const GOLD = '225, 187, 40';
    let t = 0;
    const proj = [];

    function draw() {
      if (!cssW || !cssH) return;
      const R = Math.min(cssW, cssH) * 0.42;
      const cx = cssW / 2, cy = cssH / 2;
      const ry = t * 0.0018, rx = 0.2, rz = t * 0.0006;
      const cosY = Math.cos(ry), sinY = Math.sin(ry);
      const cosX = Math.cos(rx), sinX = Math.sin(rx);
      const cosZ = Math.cos(rz), sinZ = Math.sin(rz);

      for (let i = 0; i < NODES; i++) {
        const p = pts[i];
        let x = p.x * cosY + p.z * sinY;
        let z = -p.x * sinY + p.z * cosY;
        let y = p.y * cosX - z * sinX;
        z = p.y * sinX + z * cosX;
        const x2 = x * cosZ - y * sinZ;
        const y2 = x * sinZ + y * cosZ;
        proj[i] = { sx: cx + x2 * R, sy: cy + y2 * R, depth: (z + 1) / 2 };
      }

      ctx.clearRect(0, 0, cssW, cssH);

      ctx.lineWidth = 1;
      for (let k = 0; k < links.length; k++) {
        const a = proj[links[k][0]], b = proj[links[k][1]];
        const alpha = links[k][2] * 0.5 * ((a.depth + b.depth) / 2 + 0.25);
        ctx.strokeStyle = 'rgba(' + GOLD + ',' + alpha.toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.stroke();
      }

      for (let i = 0; i < NODES; i++) {
        const p = pts[i], q = proj[i];
        const pulse = (Math.sin(t * p.speed + p.phase) + 1) / 2;
        const r = (p.size + pulse * 1.4) * (0.45 + q.depth * 0.75);
        ctx.fillStyle = 'rgba(255, 255, 255,' + (0.25 + pulse * 0.45) * (0.3 + q.depth * 0.7) + ')';
        ctx.beginPath();
        ctx.arc(q.sx, q.sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Prvi kadar se crta odmah, sinhrono. Ako je kartica u pozadini kada se
    // strana ucita, requestAnimationFrame ne otkucava, pa bi znak ostao prazan
    // sve dok korisnik ne vrati karticu. Ovako je uvek nesto nacrtano.
    draw();

    if (!reduceMotion) {
      let running = false, rafId = 0;
      const loop = function () {
        t += 1;
        draw();
        rafId = requestAnimationFrame(loop);
      };
      const start = function () { if (!running) { running = true; rafId = requestAnimationFrame(loop); } };
      const stop = function () { if (running) { running = false; cancelAnimationFrame(rafId); } };

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries[0].isIntersecting ? start() : stop();
        }, { threshold: 0 }).observe(topo);
      } else {
        start();
      }
      document.addEventListener('visibilitychange', function () {
        document.hidden ? stop() : start();
      });
    }
  }

  /* ==================================================== Konfigurator boje
     Sekcija "Izaberite boju". Dva <img> sloja: donji drzi trenutnu boju,
     gornji dobije novu i otkrije se kruznim clip-path prelazom iz mesta
     kliknutog kruzica. Kad prelaz prodje, nova boja se spusti u donji sloj
     i gornji se sakrije, pa je sledeci klik opet cist. */
  const paletaStage = document.getElementById('paletaStage');

  if (paletaStage) {
    const PALETA_MS = 900;   /* mora da prati trajanje u .is-wiping u CSS-u */
    const base  = paletaStage.querySelector('.paleta-img.is-base');
    const over  = paletaStage.querySelector('.paleta-img.is-over');
    const ghost = paletaStage.querySelector('.paleta-ghost');
    const chips = Array.prototype.slice.call(document.querySelectorAll('.paleta-chip'));
    const src   = function (color) { return 'images/boje/ograda-' + color + '.webp'; };
    let busy = false;

    /* Sve boje se povuku unapred, da prva promena ne saceka mrezu. */
    window.addEventListener('load', function () {
      chips.forEach(function (c) { new Image().src = src(c.dataset.color); });
    });

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        if (busy || chip.classList.contains('is-active')) return;
        busy = true;

        chips.forEach(function (c) {
          c.classList.toggle('is-active', c === chip);
          c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
        });

        const color = chip.dataset.color;
        const name  = chip.dataset.name;
        const alt   = 'Ograda od dekorativnog bloka u boji ' + name;

        function finish() {
          base.src = src(color);
          base.alt = alt;
          over.classList.remove('is-wiping');
          over.style.clipPath = '';
          over.visibility = '';
          ghost.textContent = name;
          ghost.classList.remove('is-swap');
          busy = false;
        }

        if (reduceMotion) { finish(); return; }

        /* Krug krece sa x pozicije kliknutog kruzica, sa gornje ivice
           pozornice, i siri se dok ne prekrije celu sliku. */
        const stageBox = paletaStage.getBoundingClientRect();
        const chipBox  = chip.getBoundingClientRect();
        const x = Math.max(0, Math.min(100,
          ((chipBox.left + chipBox.width / 2 - stageBox.left) / stageBox.width) * 100));

        ghost.classList.add('is-swap');

        const img = new Image();
        img.onload = function () {
          over.src = img.src;
          over.style.clipPath = 'circle(0% at ' + x.toFixed(1) + '% 0%)';
          over.classList.add('is-wiping');
          /* Sinhroni reflow umesto rAF: pocetni krug mora da se primeni pre
             prelaza, a rAF ne stize kad kartica nije u prvom planu. */
          void over.offsetWidth;
          over.style.clipPath = 'circle(150% at ' + x.toFixed(1) + '% 0%)';
          window.setTimeout(function () {
            ghost.textContent = name;
            ghost.classList.remove('is-swap');
          }, PALETA_MS * 0.45);
          window.setTimeout(finish, PALETA_MS + 60);
        };
        img.onerror = finish;
        img.src = src(color);
      });
    });
  }

  /* ===================================================== Klizac pre/posle
     Range input postavlja --pos na .ba, a CSS klipuje gornju sliku i
     pomera rucku. Tastatura (strelice) radi jer je to pravi input. */
  document.querySelectorAll('.ba').forEach(function (ba) {
    const range = ba.querySelector('.ba-range');
    if (!range) return;
    const set = function () { ba.style.setProperty('--pos', range.value + '%'); };
    range.addEventListener('input', set);
    set();
  });

  /* ================================================= Footer call back form */
  const cbForm = document.getElementById('callbackForm');
  if (cbForm) {
    const cbInput = document.getElementById('callbackEmail');
    const cbBtn = document.getElementById('callbackBtn');
    const cbNote = document.getElementById('callbackNote');

    cbForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const value = cbInput.value.trim();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        cbNote.textContent = 'Upišite ispravnu imejl adresu.';
        cbInput.focus();
        return;
      }

      cbBtn.disabled = true;
      cbBtn.textContent = 'Šaljem';
      cbNote.textContent = '';

      send({
        formType: 'Zahtev za povratni poziv',
        email: value,
        submittedAt: new Date().toISOString(),
        page: window.location.href
      }).then(function () {
        cbForm.reset();
        cbBtn.textContent = 'Pozovite me';
        cbBtn.disabled = false;
        cbNote.textContent = 'Hvala, javljamo se uskoro.';
      }).catch(function (err) {
        console.error(err);
        cbBtn.textContent = 'Pozovite me';
        cbBtn.disabled = false;
        cbNote.textContent = 'Slanje nije uspelo. Pozovite nas na 063 314 690.';
      });
    });
  }

})();

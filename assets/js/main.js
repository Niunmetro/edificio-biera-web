(function () {
  'use strict';
  var B = window.BIERA || {}, T = B.t || {}, U = B.units || {};
  var lang = B.lang || document.documentElement.lang || 'es';
  var isMobile = window.matchMedia('(max-width:760px)');
  var isCompact = window.matchMedia('(max-width:1100px)');
  var form = document.getElementById('lead');
  var EP = B.action || (form && form.action) || '';
  var two = function (v) { return ('0' + v).slice(-2); };
  var fmt = function (s, o) { return String(s || '').replace(/\{(\w+)\}/g, function (m, k) { return k in o ? o[k] : m; }); };

  // Origen de la visita (?o=valla, ?o=lona, ?o=idealista…), se conserva durante la sesión
  var origen = 'directo';
  try {
    var sp = new URLSearchParams(location.search), q = sp.get('o');
    // Campañas con UTM (utm_source/medium/campaign) → origen "utm:fuente/medio/campaña"
    if (!q && sp.get('utm_source')) q = 'utm:' + ['utm_source', 'utm_medium', 'utm_campaign'].map(function (k) { return (sp.get(k) || '').replace(/[^a-z0-9_-]/gi, '').slice(0, 20); }).filter(Boolean).join('/');
    if (q) { origen = q.replace(/[^a-z0-9_:\/-]/gi, '').slice(0, 64) || 'directo'; sessionStorage.setItem('biera_o', origen); }
    else { origen = sessionStorage.getItem('biera_o') || (document.referrer && document.referrer.indexOf(location.hostname) < 0 ? 'web:' + new URL(document.referrer).hostname : 'directo'); }
  } catch (e) {}
  try { var _y = new URLSearchParams(location.search).get('y'); if (_y && /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) { document.querySelector('.pg').style.marginTop = (-Math.min(20000, +_y || 0)) + 'px'; } } catch (e) {}
  // Al recargar (F5) la página vuelve arriba, salvo que la URL lleve un ancla
  try { if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; if (!location.hash) window.scrollTo(0, 0); } } catch (e) {}
  var origenInput = document.getElementById('origen');
  if (origenInput) origenInput.value = origen;

  // Medición anónima (sin cookies): visitas y pulsaciones en los botones de contacto
  function track(t, x) {
    if (!EP) return;
    try {
      var d = new URLSearchParams(Object.assign({ t: t, o: origen, lang: lang.toUpperCase(), dev: isMobile.matches ? 'movil' : 'escritorio' }, x || {}));
      if (navigator.sendBeacon) navigator.sendBeacon(EP, d);
      else fetch(EP, { method: 'POST', body: d, mode: 'no-cors', keepalive: true });
    } catch (e) {}
  }
  try { if (!sessionStorage.getItem('biera_v')) { sessionStorage.setItem('biera_v', '1'); track('visita'); } } catch (e) { track('visita'); }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-track]');
    if (a) track('clic', { id: a.getAttribute('data-track') });
  });

  // WhatsApp con texto según idioma y vivienda elegida
  var current = null;
  function waHref() {
    var txt = current ? fmt(T['wa.text_unit'], { v: two(current) }) : T['wa.text'];
    return 'https://wa.me/34640512434?text=' + encodeURIComponent(txt || 'Edificio Biera');
  }
  function refreshWa() { document.querySelectorAll('[data-wa]').forEach(function (a) { a.href = waHref(); }); }
  refreshWa();

  // Viviendas: filtro, filas desplegables y visor de planos
  var list = document.getElementById('units');
  var rows = list ? [].slice.call(list.querySelectorAll('.row')) : [];
  var status = document.getElementById('units-status');
  var select = document.getElementById('viv');
  var pick = document.getElementById('pick'), pickT = document.getElementById('pick-t');

  function markLast() {
    rows.forEach(function (r) { r.classList.remove('is-last'); });
    var vis = rows.filter(function (r) { return !r.hidden; });
    if (vis.length) vis[vis.length - 1].classList.add('is-last');
    if (status) status.textContent = vis.length === 1 ? T['units.count1'] : fmt(T['units.count'], { n: vis.length });
  }
  markLast();
  document.querySelectorAll('.tab').forEach(function (p) {
    p.addEventListener('click', function () {
      var f = p.getAttribute('data-filter');
      document.querySelectorAll('.tab').forEach(function (o) { var on = o === p; o.classList.toggle('on', on); o.setAttribute('aria-pressed', on); });
      rows.forEach(function (r) { r.hidden = !(f === 'all' || r.getAttribute('data-d') === f); });
      markLast();
      track('filtro', { id: f });
    });
  });
  rows.forEach(function (r) {
    var v = r.getAttribute('data-v'), rh = r.querySelector('.rh');
    rh.addEventListener('click', function () {
      if (isCompact.matches) {
        var open = r.classList.toggle('open');
        rh.setAttribute('aria-expanded', open);
      } else { opener = rh; openPlan(v); }
    });
  });
  document.querySelectorAll('[data-plan]').forEach(function (b) {
    b.addEventListener('click', function (e) { e.stopPropagation(); opener = b; openPlan(b.getAttribute('data-plan')); });
  });

  var dlg = document.getElementById('plan'), opener = null;
  function openPlan(v) {
    var u = U[v] || {};
    current = v;
    document.getElementById('plan-t').textContent = T['units.viv'] + ' ' + two(v) + ' · ' + (u.name || '');
    document.getElementById('plan-s').textContent = (u.dist || '') + ' · ' + (u.constr || '') + '\u00a0m²';
    var pn = document.getElementById('plan-note'); if (pn) { pn.textContent = u.note || ''; pn.hidden = !u.note; }
    var img = document.getElementById('plan-img'), src = document.getElementById('plan-src');
    src.srcset = '/assets/img/plano-v' + v + '.webp';
    img.src = '/assets/img/plano-v' + v + '.jpg';
    img.alt = fmt(T['units.plan_alt'], { v: v });
    document.getElementById('plan-full').href = '/assets/img/plano-v' + v + '.jpg';
    refreshWa();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    track('plano', { v: v });
  }
  function closePlan() { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); if (opener && opener.focus) opener.focus(); }
  document.getElementById('plan-close').addEventListener('click', closePlan);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) closePlan(); });
  document.getElementById('plan-want').addEventListener('click', function () { if (current) choose(current); closePlan(); });

  function choose(v) {
    current = v;
    if (select) select.value = 'v' + v;
    if (pick) { pickT.textContent = T['units.viv'] + ' ' + two(v) + ' · ' + ((U[v] || {}).name || ''); pick.hidden = false; }
    refreshWa();
  }
  if (pick) document.getElementById('pick-x').addEventListener('click', function () { pick.hidden = true; current = null; if (select) select.value = ''; refreshWa(); });
  if (select) select.addEventListener('change', function () {
    var m = /^v(\d+)$/.exec(select.value);
    if (m) choose(m[1]); else { current = null; if (pick) pick.hidden = true; refreshWa(); }
  });

  // Formulario
  if (form) {
    var err = document.getElementById('err'), ok = document.getElementById('ok'), okP = document.getElementById('ok-p'), send = document.getElementById('send');
    var started = false;
    form.addEventListener('focusin', function () { if (!started) { started = true; track('form_inicio'); } });
    function showErr(msg) { err.textContent = msg; err.hidden = false; }
    function invalid(i) { i.setAttribute('aria-invalid', 'true'); i.setAttribute('aria-describedby', 'err'); i.focus(); }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      err.hidden = true;
      var nombre = form.nombre, tel = form.telefono, email = form.email, priv = form.privacidad;
      [nombre, tel, email].forEach(function (i) { i.removeAttribute('aria-invalid'); i.removeAttribute('aria-describedby'); });
      if (!nombre.value.trim()) { invalid(nombre); return showErr(T['f.err.name']); }
      if (tel.value.replace(/\D/g, '').length < 9) { invalid(tel); return showErr(T['f.err.tel']); }
      if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { form.querySelector('.more').open = true; invalid(email); return showErr(T['f.err.email']); }
      if (!priv.checked) { priv.focus(); return showErr(T['f.err.priv']); }
      send.disabled = true;
      var label = send.textContent;
      send.textContent = T['f.sending'];
      fetch(form.action, { method: 'POST', body: new URLSearchParams(new FormData(form)) })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.error || 'error');
          var canal = form.querySelector('input[name="canal"]:checked');
          okP.innerHTML = fmt(T[canal && canal.value === 'whatsapp' && T['f.ok.p_wa'] ? 'f.ok.p_wa' : 'f.ok.p'], { ref: res.ref ? fmt(T['f.ok.ref'], { ref: res.ref }) : '', tel: tel.value.replace(/</g, ''), wa: waHref() });
          form.hidden = true;
          ok.hidden = false;
          ok.focus();
          track('form_ok', { v: select ? select.value : '' });
        })
        .catch(function () {
          err.innerHTML = T['f.err.send'] + ' <a class="u" href="tel:+34640512434">640 51 24 34</a>.';
          err.hidden = false;
          send.disabled = false;
          send.textContent = label;
        });
    });
    // Privacidad en línea
    var more = document.getElementById('priv-more');
    if (more) more.addEventListener('click', function () {
      var ex = document.getElementById('priv-full');
      if (ex) { ex.hidden = !ex.hidden; return; }
      var src = document.querySelector('#privacidad p');
      var p = document.createElement('p');
      p.className = 'priv-full f full'; p.id = 'priv-full';
      p.textContent = src ? src.textContent : '';
      more.closest('.priv-mini').after(p);
    });
  }

  // Cabecera compacta (escritorio) y barra fija (móvil)
  var hdr = document.getElementById('hdr'), mbar = document.getElementById('mbar');
  var heroCtas = document.querySelector('.hero .ctas'), contact = document.getElementById('contacto');
  var pastHero = false, inContact = false, typing = false;
  function upd() {
    if (hdr) { var onH = pastHero; hdr.classList.toggle('on', onH); hdr.inert = !onH; }
    if (mbar) { var on = pastHero && !inContact && !typing && isMobile.matches; mbar.classList.toggle('on', on); mbar.inert = !on; }
  }
  if ('IntersectionObserver' in window) {
    if (heroCtas) new IntersectionObserver(function (e) { pastHero = !e[0].isIntersecting && e[0].boundingClientRect.top < 0; upd(); }).observe(heroCtas);
    if (contact) new IntersectionObserver(function (e) { inContact = e[0].isIntersecting; upd(); }, { threshold: .08 }).observe(contact);
    document.addEventListener('focusin', function (e) { if (e.target.matches('input,select,textarea')) { typing = true; upd(); } });
    document.addEventListener('focusout', function () { setTimeout(function () { typing = !!document.activeElement && document.activeElement.matches('input,select,textarea'); upd(); }, 60); });
    // Revelado suave al hacer scroll
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
    // Red de seguridad: si el observador no dispara, revelar lo que ya está en pantalla
    var net = function () {
      var pend = document.querySelectorAll('.rv:not(.in)');
      if (!pend.length) return;
      var h = window.innerHeight;
      pend.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < h * 0.94 && r.bottom > 0) el.classList.add('in'); });
    };
    setTimeout(net, 600); setTimeout(net, 2000);
    window.addEventListener('scroll', net, { passive: true });
  } else {
    document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); });
  }
  isMobile.addEventListener ? isMobile.addEventListener('change', upd) : isMobile.addListener(upd);

  // Vídeo: pausa/reproducción, arranque cuando entra en pantalla y respeto a "reducir movimiento"
  var vid = document.getElementById('vid'), vt = document.getElementById('vtoggle'), vs = document.getElementById('vsound'), syncS = function () {};
  if (vid) {
    // Vídeo promocional: vertical en móvil, horizontal en pantallas anchas
    var pickSrc = function () {
      var v = isMobile.matches, src = vid.getAttribute(v ? 'data-v' : 'data-h');
      if (vid.getAttribute('src') !== src) { var was = !vid.paused; vid.setAttribute('poster', vid.getAttribute(v ? 'data-pv' : 'data-ph')); vid.src = src; vid.setAttribute('width', v ? 720 : 1280); vid.setAttribute('height', v ? 1280 : 720); if (was) vid.play().catch(function () {}); }
    };
    vid.muted = true; pickSrc();
    if (isMobile.addEventListener) isMobile.addEventListener('change', pickSrc);
    if (vs) {
      syncS = function () { vs.classList.toggle('on', !vid.muted); vs.querySelector('.vs-t').textContent = vid.muted ? vs.getAttribute('data-on') : vs.getAttribute('data-off'); };
      vs.addEventListener('click', function () { vid.muted = !vid.muted; if (!vid.muted) { vid.volume = 1; if (vid.paused) vid.play().catch(function () {}); track('video_sonido'); } syncS(); });
      syncS();
    }
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { vid.removeAttribute('autoplay'); vid.loop = false; vid.pause(); }
    var sync = function () { var p = vid.paused; if (vt) { vt.classList.toggle('paused', p); vt.setAttribute('aria-label', p ? vt.getAttribute('data-play') : vt.getAttribute('data-pause')); } };
    var go = function () { vid.muted = vid.muted; var p = vid.play(); if (p && p.catch) p.catch(sync); };
    // El vídeo arranca en silencio (única forma permitida por los navegadores) y activa el sonido
    // al primer toque o clic del visitante en la página, salvo que lo haya silenciado a mano.
    var userMuted = false, inView = false;
    if (vs) vs.addEventListener('click', function () { userMuted = !vid.muted; }, true);
    var unmuteOnGesture = function (e) {
      if (vs && vs.contains(e.target)) return;
      if (!userMuted && inView && vid.muted) { vid.muted = false; vid.volume = 1; vid.play().catch(function () { vid.muted = true; }); syncS(); track('video_sonido', { x: 'auto' }); }
      if (!vid.muted || userMuted) { ['pointerdown', 'keydown', 'touchstart'].forEach(function (t) { document.removeEventListener(t, unmuteOnGesture, true); }); }
    };
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (t) { document.addEventListener(t, unmuteOnGesture, true); });
    vid.addEventListener('play', sync); vid.addEventListener('pause', sync);
    if (vt) vt.addEventListener('click', function () { vid.paused ? go() : vid.pause(); });
    if (!reduce && 'IntersectionObserver' in window) new IntersectionObserver(function (e) { inView = e[0].isIntersecting; inView ? go() : vid.pause(); }, { threshold: .25 }).observe(vid);
    sync();
  }

  // FAQ: registrar qué preguntas se abren
  document.querySelectorAll('.fq').forEach(function (d, i) {
    d.addEventListener('toggle', function () { if (d.open) track('faq', { q: i + 1 }); });
  });

  // Enlace directo a una vivienda (#v06): abre su plano (escritorio) o su ficha (móvil)
  function openFromHash() {
    var m = /^#v0?(\d{1,2})$/.exec(location.hash);
    if (!m || !U[m[1]]) return;
    var row = document.querySelector('.row[data-v="' + m[1] + '"]');
    if (!row) return;
    row.scrollIntoView({ block: 'center' });
    if (isCompact.matches) { if (!row.classList.contains('open')) row.querySelector('.rh').click(); }
    else openPlan(m[1]);
  }
  window.addEventListener('hashchange', openFromHash);
  setTimeout(openFromHash, 500);

  // Mapa interactivo (Leaflet autoalojado + teselas CARTO/OpenStreetMap, sin cookies). Se carga al acercarse a la sección.
  var mapEl = document.getElementById('map');
  if (mapEl && B.pois && B.pois.items && B.pois.items.length) {
    var mapStarted = false;
    function loadMap() {
      if (mapStarted) return; mapStarted = true;
      var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = '/assets/vendor/leaflet/leaflet.css'; document.head.appendChild(css);
      var s = document.createElement('script'); s.src = '/assets/vendor/leaflet/leaflet.js'; s.onload = initMap; document.head.appendChild(s);
    }
    function initMap() {
      var L = window.L; if (!L) return;
      var c = B.pois.center, items = B.pois.items;
      var ph = mapEl.querySelector('.map-ph'); if (ph) ph.remove();
      var map = L.map(mapEl, { scrollWheelZoom: false, zoomControl: true, attributionControl: true, tap: false });
      map.attributionControl.setPrefix(false);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>' }).addTo(map);
      var here = L.marker([c.lat, c.lon], { icon: L.divIcon({ className: 'mk mk-here', html: '<span class="mk-dot"></span><span class="mk-lbl">' + T['map.here'] + '</span>', iconSize: [0, 0], iconAnchor: [0, 0] }), zIndexOffset: 1000, keyboard: false }).addTo(map);
      var markers = [];
      items.forEach(function (p, i) {
        var lbl = p.top ? '<span class="mk-lbl">' + (p.short || p.name) + '</span>' : '';
        var m = L.marker([p.lat, p.lon], { icon: L.divIcon({ className: 'mk mk-poi mk-' + p.cat + (p.top ? ' mk-top' : '') + (p.side === 'left' ? ' mk-left' : ''), html: '<span class="mk-dot"></span>' + lbl, iconSize: [0, 0], iconAnchor: [0, 0] }), title: p.name, zIndexOffset: p.top ? 500 : 0 }).addTo(map);
        m.bindPopup('<strong>' + p.name + '</strong><br>' + p.label, { closeButton: false, offset: [0, -6], maxWidth: 240 });
        m.on('click', function () { setActive(i); track('mapa', { x: p.name }); });
        markers.push(m);
      });
      var lis = mapEl.parentNode.querySelectorAll('.poi-b');
      function setActive(i) { lis.forEach(function (b, k) { b.classList.toggle('on', k === i); }); }
      lis.forEach(function (b) {
        b.addEventListener('click', function () {
          var i = +b.getAttribute('data-i'), p = items[i];
          setActive(i);
          map.flyTo([(p.lat + c.lat) / 2, (p.lon + c.lon) / 2], Math.max(map.getZoom(), 13), { duration: .8 });
          markers[i].openPopup();
          track('mapa', { x: p.name });
        });
      });
      // Encuadre inicial: el edificio y los puntos cercanos (≤ 7 km); los lejanos se alcanzan desde la lista
      var group = L.featureGroup(markers.filter(function (m, i) { return items[i].km <= 7; }).concat([here]));
      map.fitBounds(group.getBounds(), { padding: [40, 40], maxZoom: 14 });
      map.on('popupclose', function () { setActive(-1); });
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { loadMap(); o.disconnect(); } }, { rootMargin: '600px 0px' }).observe(mapEl);
    else loadMap();
  }

  // Navegación por secciones: resalta la sección visible
  var navLinks = document.querySelectorAll('.nav a[href^="#"]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    var navSecs = [];
    navLinks.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s && navSecs.indexOf(s) < 0) navSecs.push(s); });
    var navIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { var id = '#' + e.target.id; navLinks.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === id); }); } });
    }, { rootMargin: '-35% 0px -55% 0px' });
    navSecs.forEach(function (s) { navIO.observe(s); });
  }
})();

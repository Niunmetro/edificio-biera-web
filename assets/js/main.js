(function () {
  'use strict';

  var UNITS = [
    { v: 1, title: 'Tríplex de extremo', orient: 'Fachada sur', prog: '4 dorm. · 3 baños + aseo', m2: '165,41 m²', sol: '21,35 m²', gar: 'Box doble con escalera propia', d: 4 },
    { v: 2, title: 'Tríplex con box', orient: 'Fachada sur', prog: '4 dorm. · 3 baños + aseo', m2: '157,56 m²', sol: '21,25 m²', gar: 'Box con escalera propia', d: 4 },
    { v: 3, title: 'Tríplex con box', orient: 'Fachada sur', prog: '4 dorm. · 3 baños + aseo', m2: '158,86 m²', sol: '20,70 m²', gar: 'Box con escalera propia', d: 4 },
    { v: 4, title: 'Tríplex con box y trastero', orient: 'Fachada sur', prog: '4 dorm. · 3 baños + aseo', m2: '158,40 m²', sol: '21,25 m²', gar: 'Box con trastero y escalera propia', d: 4 },
    { v: 5, title: 'Tríplex en esquina', orient: 'Fachada sur · esquina', prog: '4 dorm. · 3 baños + aseo', m2: '156,19 m²', sol: '20,70 m²', gar: 'Box con trastero y escalera propia', d: 4 },
    { v: 6, title: 'Tríplex de 3 dormitorios', orient: 'Fachada este', prog: '3 dorm. · 2 baños + aseo', m2: '115,23 m²', sol: '37,60 m²', gar: 'Plaza en sótano', d: 3 },
    { v: 7, title: 'Tríplex con suite y patio', orient: 'Fachada este', prog: '3 dorm. · 2 baños + 2 aseos', m2: '124,59 m²', sol: '34,00 m² + patio', gar: 'Plaza en sótano', d: 3 },
    { v: 8, title: 'Tríplex con garaje doble', orient: 'Fachada norte', prog: '4 dorm. · 3 baños + aseo', m2: '158,40 m²', sol: '18,60 m²', gar: 'Box doble con escalera propia', d: 4 },
    { v: 9, title: 'Tríplex de 4 dormitorios', orient: 'Fachada norte', prog: '4 dorm. · 3 baños + aseo', m2: '150,17 m²', sol: '18,40 m²', gar: 'Plaza en sótano', d: 4 },
    { v: 10, title: 'La esquina XL', orient: 'Esquina norte y este', prog: '4 dorm. · 3 baños + aseo', m2: '172,18 m²', sol: '77,30 m²', gar: 'Plaza en sótano', d: 4 }
  ];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // Origen del contacto (?o=valla, ?o=lona, ?o=idealista…), se conserva durante la visita
  var origen = 'directo';
  try {
    var q = new URLSearchParams(location.search).get('o');
    if (q) { origen = q.replace(/[^a-z0-9_-]/gi, '').slice(0, 30) || 'directo'; sessionStorage.setItem('biera_o', origen); }
    else { origen = sessionStorage.getItem('biera_o') || (document.referrer ? 'web:' + new URL(document.referrer).hostname : 'directo'); }
  } catch (e) {}
  var origenInput = document.getElementById('origen');
  if (origenInput) origenInput.value = origen;

  // Listado de viviendas
  var list = document.getElementById('units');
  var select = document.getElementById('viv');
  function want(v) {
    if (select) select.value = 'Vivienda ' + v;
  }
  UNITS.forEach(function (u) {
    var row = el('div', 'row');
    row.dataset.d = u.d;
    row.appendChild(el('span', 'num serif', String(u.v).padStart(2, '0')));
    var ty = el('div', 'ty serif', u.title);
    ty.appendChild(el('small', null, u.orient));
    row.appendChild(ty);
    var specs = el('div', 'specs');
    [['Programa', u.prog], ['Construidos', u.m2], ['Solárium', u.sol], ['Garaje', u.gar]].forEach(function (s) {
      var d = el('div');
      d.appendChild(el('b', null, s[0]));
      d.appendChild(document.createTextNode(s[1]));
      specs.appendChild(d);
    });
    row.appendChild(specs);
    var acts = el('div', 'acts');
    var bp = el('button', 'btn btn-line btn-sm', 'Ver plano');
    bp.type = 'button';
    bp.setAttribute('aria-label', 'Ver plano de la vivienda ' + u.v);
    bp.addEventListener('click', function () { openPlan(u.v); });
    var bw = el('a', 'btn btn-ink btn-sm', 'Me interesa');
    bw.href = '#contacto';
    bw.setAttribute('aria-label', 'Me interesa la vivienda ' + u.v);
    bw.addEventListener('click', function () { want(u.v); });
    acts.appendChild(bp);
    acts.appendChild(bw);
    row.appendChild(acts);
    list.appendChild(row);
  });

  // Filtro por dormitorios
  var pills = document.querySelectorAll('.pill');
  pills.forEach(function (p) {
    p.addEventListener('click', function () {
      var f = p.dataset.filter;
      pills.forEach(function (o) { var on = o === p; o.classList.toggle('on', on); o.setAttribute('aria-pressed', on); });
      list.querySelectorAll('.row').forEach(function (r) { r.hidden = !(f === 'all' || r.dataset.d === f); });
    });
  });

  // Visor de planos
  var dlg = document.getElementById('plan');
  var current = null;
  function openPlan(v) {
    current = v;
    document.getElementById('plan-t').textContent = 'Vivienda ' + v;
    var img = document.getElementById('plan-img');
    img.src = '/assets/img/plano-v' + v + '.jpg';
    img.alt = 'Plano de venta de la vivienda ' + v;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }
  function closePlan() { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); }
  document.getElementById('plan-close').addEventListener('click', closePlan);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) closePlan(); });
  document.getElementById('plan-want').addEventListener('click', function () { if (current) want(current); closePlan(); });

  // Formulario
  var form = document.getElementById('lead');
  var err = document.getElementById('err');
  var ok = document.getElementById('ok');
  var send = document.getElementById('send');
  function showErr(msg) { err.textContent = msg; err.hidden = false; }
  try {
    var sp = new URLSearchParams(location.search);
    if (sp.get('enviado') === '1') { form.hidden = true; ok.hidden = false; }
    else if (sp.get('error') === '1') showErr('No se ha podido enviar. Llama o escribe a Daniel al 640 51 24 34.');
  } catch (e) {}
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    err.hidden = true;
    var nombre = form.nombre, tel = form.telefono, priv = form.privacidad;
    [nombre, tel].forEach(function (i) { i.removeAttribute('aria-invalid'); });
    if (!nombre.value.trim()) { nombre.setAttribute('aria-invalid', 'true'); nombre.focus(); return showErr('Indica tu nombre.'); }
    if (tel.value.replace(/\D/g, '').length < 9) { tel.setAttribute('aria-invalid', 'true'); tel.focus(); return showErr('Indica un teléfono válido.'); }
    if (form.email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value)) { form.email.focus(); return showErr('Revisa el email.'); }
    if (!priv.checked) { priv.focus(); return showErr('Necesitamos tu conformidad con la información de privacidad.'); }
    send.disabled = true;
    send.textContent = 'Enviando…';
    fetch(form.action, { method: 'POST', body: new URLSearchParams(new FormData(form)) })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.error || 'error');
        form.hidden = true;
        ok.hidden = false;
        ok.focus();
      })
      .catch(function () {
        showErr('No se ha podido enviar. Llama o escribe a Daniel al 640 51 24 34.');
        send.disabled = false;
        send.textContent = 'Enviar solicitud';
      });
  });
})();

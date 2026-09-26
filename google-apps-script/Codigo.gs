// Formulario y medición de edificiobiera.com -> hoja "Contactos web Edificio Biera" + email a JD León
var DESTINO = 'info@jdleon.com';                 // comercializadora
var COPIA_OCULTA = 'ccsshaft@gmail.com';         // copia para el equipo gestor (varias: 'a@x.com,b@y.com')
var HOJA_ID = '1sRE1bvpcD-5qbpwrvJqOKwsQybVqX-qWbgayPwkkboQ';
var CAB_CONTACTOS = ['Fecha', 'Mes', 'Ref', 'Nombre', 'Teléfono', 'Email', 'Interés', 'Plazo', 'Canal preferido', 'Origen', 'Idioma', 'Mensaje', 'Estado', 'Notas JD León'];
var CAB_EVENTOS = ['Fecha', 'Mes', 'Tipo', 'Detalle', 'Origen', 'Vivienda', 'Idioma', 'Dispositivo'];
var ORIGENES = { valla: 'QR de la valla publicitaria', lona: 'QR de la lona de obra', directo: 'acceso directo a la web',
  idealista: 'anuncio en Idealista', fotocasa: 'anuncio en Fotocasa', rrss: 'redes sociales', google: 'búsqueda en Google' };
var VIVIENDAS = { '': 'Aún no lo sabe', '3d': '3 dormitorios', '4d': '4 dormitorios' };
var PLAZOS = { '': 'No lo indica', pronto: 'Lo antes posible', '3-6m': 'En 3–6 meses', despues: 'Más adelante' };
var IDIOMAS = { ES: 'Español', EN: 'Inglés (contestar en inglés)', FR: 'Francés (contestar en francés)' };

function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.t) return registrarEvento(p);
  if (p.web) return respuesta({ ok: true });
  var nombre = txt(p.nombre, 120), tel = txt(p.telefono, 30), email = txt(p.email, 160);
  var viv = txt(p.vivienda, 10), plazo = txt(p.plazo, 10), canal = txt(p.canal, 10) === 'whatsapp' ? 'WhatsApp' : 'Llamada';
  var mensaje = txt(p.mensaje, 2000), origen = txt(p.origen, 60).replace(/[^a-z0-9_.:-]/gi, '') || 'directo';
  var idioma = txt(p.idioma, 5).toUpperCase() || 'ES';
  if (!nombre || tel.replace(/\D/g, '').length < 9 || p.privacidad !== 'si') return respuesta({ ok: false, error: 'datos' });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return respuesta({ ok: false, error: 'datos' });
  var ahora = new Date();
  var fecha = Utilities.formatDate(ahora, 'Europe/Madrid', 'dd/MM/yyyy HH:mm');
  var mes = Utilities.formatDate(ahora, 'Europe/Madrid', 'yyyy-MM');
  var vivTexto = VIVIENDAS[viv] || (/^v\d+$/.test(viv) ? 'Vivienda ' + viv.slice(1) : viv || 'Aún no lo sabe');
  var plazoTexto = PLAZOS[plazo] || plazo;
  var origenTexto = ORIGENES[origen] || (origen.indexOf('web:') === 0 ? 'enlace desde ' + origen.slice(4) : origen);

  var ref = '', fila = 0, guardado = false;
  var lock = LockService.getScriptLock();
  if (lock.tryLock(10000)) {
    try {
      var hoja = hoja_('Contactos', CAB_CONTACTOS);
      fila = hoja.getLastRow() + 1;
      ref = 'EB-' + ('000' + (fila - 1)).slice(-4);
      hoja.appendRow([ahora, mes, ref, nombre, "'" + tel, email, vivTexto, plazoTexto, canal, origen, idioma, mensaje, 'Nuevo', '']);
      guardado = true;
    } finally { lock.releaseLock(); }
  }
  var d = tel.replace(/\D/g, ''); if (d.length === 9) d = '34' + d;

  var cuerpo = 'EDIFICIO BIERA · Nueva solicitud de información\n'
    + '========================================\n\n'
    + 'Se ha recibido una solicitud de información sobre el Edificio Biera (10 tríplex de obra nueva, '
    + 'Carretera de Santa Catalina, Murcia) a través de la landing page edificiobiera.com.\n'
    + 'Origen de la visita: ' + origenTexto + '.\n\n'
    + (guardado
      ? 'Este contacto queda registrado internamente por el equipo gestor con la referencia ' + ref + ' (' + fecha + ') en el registro de contactos de la promoción. Por favor, incluid su seguimiento en el reporte quincenal.\n\n'
      : 'ATENCIÓN: no se ha podido anotar en el registro interno; conservad este correo.\n\n')
    + 'DATOS DEL INTERESADO\n'
    + '----------------------------------------\n'
    + 'Nombre:        ' + nombre + '\n'
    + 'Teléfono:      ' + tel + '   ·  Llamar: tel:+' + d + '  ·  WhatsApp: https://wa.me/' + d + '\n'
    + 'Email:         ' + (email || '—') + '\n'
    + 'Interés:       ' + vivTexto + '\n'
    + 'Plazo:         ' + plazoTexto + '\n'
    + 'Prefiere:      ' + canal + '\n'
    + 'Idioma:        ' + (IDIOMAS[idioma] || idioma) + '\n'
    + 'Fecha:         ' + fecha + '\n'
    + '----------------------------------------\n'
    + (mensaje ? 'Mensaje del interesado:\n' + mensaje + '\n\n' : '')
    + 'El interesado ha aceptado la información de privacidad de la web y ha pedido que se le contacte.\n'
    + (email ? 'Puedes responderle directamente a este correo.\n' : '')
    + '\nEquipo gestor · Edificio Biera\n';
  var opciones = { name: 'Web Edificio Biera' };
  if (email) opciones.replyTo = email;
  if (COPIA_OCULTA) opciones.bcc = COPIA_OCULTA;
  var enviado = true;
  try {
    MailApp.sendEmail(DESTINO, 'Edificio Biera · Nuevo contacto ' + (ref || '') + ' desde la web · ' + vivTexto + ' · ' + origenTexto, cuerpo, opciones);
  } catch (err) { enviado = false; console.error(err); }
  return respuesta({ ok: guardado || enviado, ref: ref });
}

function registrarEvento(p) {
  var tipo = txt(p.t, 20).replace(/[^a-z_]/gi, '');
  if (!tipo) return respuesta({ ok: false });
  var ahora = new Date();
  var hoja = hoja_('Eventos', CAB_EVENTOS);
  hoja.appendRow([ahora, Utilities.formatDate(ahora, 'Europe/Madrid', 'yyyy-MM'), tipo, txt(p.id, 40), txt(p.o, 60).replace(/[^a-z0-9_.:-]/gi, ''), txt(p.v, 10), txt(p.lang, 5).toUpperCase(), txt(p.dev, 12)]);
  return respuesta({ ok: true });
}

function doGet() {
  return respuesta({ ok: true, servicio: 'formulario edificiobiera.com' });
}

// Ejecutar una vez desde el editor: prepara las hojas y la pestaña "Resumen" con estadísticas
function configurarHoja() {
  var ss = SpreadsheetApp.openById(HOJA_ID);
  var h = hoja_('Contactos', CAB_CONTACTOS);
  h.getRange(1, 1, 1, CAB_CONTACTOS.length).setValues([CAB_CONTACTOS]).setFontWeight('bold').setBackground('#1E2429').setFontColor('#F7F5F1');
  h.setFrozenRows(1);
  h.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm');
  [140, 75, 80, 170, 120, 190, 150, 130, 110, 100, 70, 320, 90, 240].forEach(function (w, i) { h.setColumnWidth(i + 1, w); });
  var ev = hoja_('Eventos', CAB_EVENTOS);
  ev.getRange(1, 1, 1, CAB_EVENTOS.length).setValues([CAB_EVENTOS]).setFontWeight('bold').setBackground('#56697A').setFontColor('#F7F5F1');
  ev.setFrozenRows(1);
  ev.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm');
  var r = ss.getSheetByName('Resumen') || ss.insertSheet('Resumen');
  r.clear();
  var Q = function (rango, sel, etiquetas) { return '=IFERROR(QUERY(' + rango + ';"' + sel + ' label ' + etiquetas + '";0);"Sin datos")'; };
  var c = [
    ['ESTADÍSTICAS · edificiobiera.com', ''],
    ['Contactos (formulario)', '=COUNTA(Contactos!D2:D)'],
    ['Contactos últimos 7 días', '=COUNTIFS(Contactos!A2:A;">="&(NOW()-7))'],
    ['Visitas registradas', '=COUNTIF(Eventos!C2:C;"visita")'],
    ['Visitas últimos 7 días', '=COUNTIFS(Eventos!C2:C;"visita";Eventos!A2:A;">="&(NOW()-7))'],
    ['Pulsaciones en Llamar', '=COUNTIFS(Eventos!C2:C;"clic";Eventos!D2:D;"*llamar*")'],
    ['Pulsaciones en WhatsApp', '=COUNTIFS(Eventos!C2:C;"clic";Eventos!D2:D;"*whatsapp*")'],
    ['Planos abiertos', '=COUNTIF(Eventos!C2:C;"plano")'],
    ['Conversión formulario / visitas', '=IFERROR(TEXT(B2/B4;"0,0%");"—")'],
    ['', ''],
    ['VISITAS POR ORIGEN', ''],
    [Q('Eventos!C2:E', 'select E, count(C) where C = \'visita\' group by E order by count(C) desc', 'E \'Origen\', count(C) \'Visitas\''), ''],
    ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''],
    ['CONTACTOS POR ORIGEN', ''],
    [Q('Contactos!J2:J', 'select J, count(J) where J is not null group by J order by count(J) desc', 'J \'Origen\', count(J) \'Contactos\''), ''],
    ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''],
    ['CONTACTOS POR VIVIENDA DE INTERÉS', ''],
    [Q('Contactos!G2:G', 'select G, count(G) where G is not null group by G order by count(G) desc', 'G \'Interés\', count(G) \'Contactos\''), ''],
    ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''],
    ['PLANOS MÁS VISTOS', ''],
    [Q('Eventos!C2:F', 'select F, count(C) where C = \'plano\' group by F order by count(C) desc', 'F \'Vivienda\', count(C) \'Veces\''), ''],
    ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''],
    ['CONTACTOS POR MES', ''],
    [Q('Contactos!B2:B', 'select B, count(B) where B is not null group by B order by B desc', 'B \'Mes\', count(B) \'Contactos\''), ''],
    ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''],
    ['CONTACTOS POR IDIOMA', ''],
    [Q('Contactos!K2:K', 'select K, count(K) where K is not null group by K order by count(K) desc', 'K \'Idioma\', count(K) \'Contactos\''), '']
  ];
  r.getRange(1, 1, c.length, 2).setValues(c);
  r.getRange('A1').setFontWeight('bold').setFontSize(13);
  c.forEach(function (row, i) { if (/^[A-ZÁÉÍÓÚ ]{6,}$/.test(row[0]) && i > 0) r.getRange(i + 1, 1).setFontWeight('bold').setBackground('#ECE6DD'); });
  r.setColumnWidth(1, 320); r.setColumnWidth(2, 120);
  ss.setActiveSheet(h);
}

function hoja_(nombre, cabeceras) {
  var ss = SpreadsheetApp.openById(HOJA_ID);
  var h = ss.getSheetByName(nombre);
  if (!h) {
    h = (nombre === 'Contactos' && ss.getSheets()[0].getLastRow() <= 1 && !ss.getSheetByName('Contactos')) ? ss.getSheets()[0] : ss.insertSheet(nombre);
    h.setName(nombre);
  }
  if (h.getLastRow() === 0) h.appendRow(cabeceras);
  else if (nombre === 'Contactos' && h.getRange(1, 3).getValue() !== 'Ref') h.getRange(1, 1, 1, cabeceras.length).setValues([cabeceras]);
  return h;
}

function respuesta(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function txt(v, n) {
  return String(v || '').trim().slice(0, n);
}

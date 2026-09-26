// Formulario de edificiobiera.com -> hoja "Contactos web Edificio Biera" + email a JD León
var DESTINO = 'info@jdleon.com';
var HOJA_ID = '1sRE1bvpcD-5qbpwrvJqOKwsQybVqX-qWbgayPwkkboQ';

function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.web) return respuesta({ ok: true });
  var nombre = txt(p.nombre, 120), tel = txt(p.telefono, 30), email = txt(p.email, 160);
  var vivienda = txt(p.vivienda, 40) || 'Aún no lo sé', plazo = txt(p.plazo, 40);
  var mensaje = txt(p.mensaje, 2000), origen = txt(p.origen, 60).replace(/[^a-z0-9_.:-]/gi, '') || 'directo';
  if (!nombre || tel.replace(/\D/g, '').length < 9 || p.privacidad !== 'si') return respuesta({ ok: false, error: 'datos' });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return respuesta({ ok: false, error: 'datos' });
  var fecha = Utilities.formatDate(new Date(), 'Europe/Madrid', 'dd/MM/yyyy HH:mm');

  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  var hoja = SpreadsheetApp.openById(HOJA_ID).getSheets()[0];
  if (hoja.getLastRow() === 0) hoja.appendRow(['Fecha', 'Nombre', 'Teléfono', 'Email', 'Interés', 'Plazo', 'Origen', 'Mensaje']);
  hoja.appendRow([fecha, nombre, "'" + tel, email, vivienda, plazo, origen, mensaje]);
  lock.releaseLock();

  var cuerpo = 'Nuevo contacto desde edificiobiera.com\n'
    + '----------------------------------------\n'
    + 'Nombre:    ' + nombre + '\n'
    + 'Teléfono:  ' + tel + '\n'
    + 'Email:     ' + (email || '-') + '\n'
    + 'Interés:   ' + vivienda + '\n'
    + 'Plazo:     ' + (plazo || '-') + '\n'
    + 'Origen:    ' + origen + '\n'
    + 'Fecha:     ' + fecha + '\n'
    + '----------------------------------------\n'
    + (mensaje ? 'Mensaje:\n' + mensaje + '\n\n' : '')
    + 'El interesado ha aceptado la información de privacidad de la web.\n';
  var opciones = { name: 'Web Edificio Biera' };
  if (email) opciones.replyTo = email;
  MailApp.sendEmail(DESTINO, 'Nuevo contacto web Edificio Biera · ' + vivienda + ' · ' + origen, cuerpo, opciones);
  return respuesta({ ok: true });
}

function doGet() {
  return respuesta({ ok: true, servicio: 'formulario edificiobiera.com' });
}

function respuesta(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function txt(v, n) {
  return String(v || '').trim().slice(0, n);
}

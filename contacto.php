<?php
/**
 * Formulario de contacto de edificiobiera.com
 * Envía cada solicitud por email a JD León Inmobiliaria y guarda una copia de seguridad
 * en /leads (carpeta protegida con .htaccess).
 */
declare(strict_types=1);

const DESTINO   = 'info@jdleon.com';          // quien recibe los contactos
const REMITENTE = 'web@edificiobiera.com';    // dirección del dominio que envía
const PROMOCION = 'Edificio Biera';

$wantsJson = strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

function responder(bool $ok, string $error = ''): void
{
    global $wantsJson;
    if ($wantsJson) {
        header('Content-Type: application/json; charset=utf-8');
        if (!$ok) http_response_code($error === 'datos' ? 422 : 500);
        echo json_encode(['ok' => $ok, 'error' => $error]);
    } else {
        header('Location: /?' . ($ok ? 'enviado=1' : 'error=1') . '#contacto', true, 303);
    }
    exit;
}

function campo(string $clave, int $max, bool $multilinea = false): string
{
    $v = trim((string)($_POST[$clave] ?? ''));
    if (!$multilinea) $v = preg_replace('/[\r\n\t]+/', ' ', $v);
    return mb_substr($v, 0, $max, 'UTF-8');
}

header('X-Robots-Tag: noindex');
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Location: /', true, 303);
    exit;
}

// Trampa para robots: un humano nunca rellena este campo
if (campo('web', 200) !== '') responder(true);

$nombre   = campo('nombre', 120);
$telefono = campo('telefono', 30);
$email    = campo('email', 160);
$vivienda = campo('vivienda', 40) ?: 'Aún no lo sé';
$plazo    = campo('plazo', 40);
$mensaje  = campo('mensaje', 2000, true);
$origen   = preg_replace('/[^a-z0-9_.:-]/i', '', campo('origen', 60)) ?: 'directo';
$acepta   = ($_POST['privacidad'] ?? '') === 'si';

if ($nombre === '' || strlen(preg_replace('/\D/', '', $telefono)) < 9 || !$acepta) responder(false, 'datos');
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) responder(false, 'datos');

$fecha = (new DateTime('now', new DateTimeZone('Europe/Madrid')))->format('d/m/Y H:i');

$cuerpo = "Nuevo contacto desde edificiobiera.com\n"
    . "----------------------------------------\n"
    . "Nombre:    $nombre\n"
    . "Teléfono:  $telefono\n"
    . "Email:     " . ($email ?: '—') . "\n"
    . "Interés:   $vivienda\n"
    . "Plazo:     " . ($plazo ?: '—') . "\n"
    . "Origen:    $origen\n"
    . "Fecha:     $fecha\n"
    . "----------------------------------------\n"
    . ($mensaje !== '' ? "Mensaje:\n$mensaje\n\n" : '')
    . "El interesado ha aceptado la información de privacidad de la web.\n";

$asunto = '=?UTF-8?B?' . base64_encode('Nuevo contacto web ' . PROMOCION . ' · ' . $vivienda . ' · ' . $origen) . '?=';
$cabeceras = [
    'From: =?UTF-8?B?' . base64_encode('Web ' . PROMOCION) . '?= <' . REMITENTE . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
];
if ($email !== '') $cabeceras[] = 'Reply-To: ' . $email;

$enviado = @mail(DESTINO, $asunto, $cuerpo, implode("\r\n", $cabeceras), '-f' . REMITENTE);

// Copia de seguridad del contacto (por si falla el correo)
$dir = __DIR__ . '/leads';
if (!is_dir($dir)) @mkdir($dir, 0750, true);
if (is_dir($dir) && is_writable($dir)) {
    $archivo = $dir . '/contactos-' . date('Y-m') . '.csv';
    $nuevo = !file_exists($archivo);
    if ($fh = @fopen($archivo, 'ab')) {
        if ($nuevo) fputcsv($fh, ['fecha', 'nombre', 'telefono', 'email', 'vivienda', 'plazo', 'origen', 'mensaje', 'email_enviado'], ';');
        fputcsv($fh, [$fecha, $nombre, $telefono, $email, $vivienda, $plazo, $origen, $mensaje, $enviado ? 'si' : 'NO'], ';');
        fclose($fh);
    }
}

responder($enviado, $enviado ? '' : 'correo');

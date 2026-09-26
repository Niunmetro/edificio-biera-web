# edificiobiera.com

Landing de una sola página del **Edificio Biera** (10 tríplex de obra nueva, Santa Catalina, Murcia), destino del QR de la valla y la lona de obra.

- `index.html` + `assets/`: web estática (sin cookies ni dependencias externas; fuentes alojadas en local).
- `contacto.php`: envía cada solicitud a **info@jdleon.com** y guarda copia en `leads/` (carpeta protegida).
- `?o=valla`, `?o=lona`, `?o=idealista`…: origen del contacto, llega en el email.
- `qr/`: códigos QR estáticos (permanentes) para imprenta.

## Publicar en IONOS
Subir al directorio raíz del dominio todo excepto `qr/`, `README.md` y `.git`. Requiere PHP y SSL activo en el dominio.

# edificiobiera.com

Landing trilingüe (ES/EN/FR) del **Edificio Biera**, 10 tríplex de obra nueva en Santa Catalina, Murcia. Destino del QR de la valla y la lona de obra. Alojada en GitHub Pages.

- `src/template.html` + `i18n/*.json` → `python build.py` genera `index.html`, `en/index.html` y `fr/index.html`.
- `assets/`: CSS, JS, fuentes locales e imágenes optimizadas (sin cookies ni dependencias externas).
- Formulario y medición anónima → Google Apps Script (`google-apps-script/Codigo.gs`): email a **info@jdleon.com** con copia al equipo gestor y registro en la hoja "Contactos web Edificio Biera" (pestañas Contactos, Eventos y Resumen).
- `?o=valla`, `?o=lona`, `?o=idealista`…: origen de la visita, llega al email y a la hoja.
- `qr/`: códigos QR estáticos (permanentes) para imprenta.

Para cambiar un texto: editar el JSON del idioma y ejecutar `python build.py`; después `git push`.

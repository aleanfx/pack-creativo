# Pack Creativo — Landing

Archivos:
- index.html: HTML principal que referencia assets externos.
- styles.css: Estilos extraídos del HTML.
- main.js: Lógica de la página (animaciones, formulario, pixel).
- /modules/ui.js: Componentes UI.
- /modules/carousel.js: Carrousel de productos.
- /modules/audio.js: Gestión de audio.
- /modules/sfx.js: Gestión de efectos sonoros.

Publicación:
- Sube a Vercel como proyecto estático. Necesitas `index.html`, `styles.css` y `main.js`.

Backend (opcional):
- El formulario hace `POST` a `/api/order` con `FormData`.
- Implementa un endpoint en Node.js (Vercel Functions) o PHP que procese `name`, `phone`, `method` y `attachment`.

Pixel de Meta:
- Edita `META_PIXEL_ID` en `main.js` para habilitar el evento `Purchase`.

Diseño responsivo y animaciones suaves con IntersectionObserver.
- Botones de copiar en métodos de pago.
- Se añadieron comentarios tipo "tombstone" en `index.html` indicando dónde se removieron los bloques inline.

/* Note: price references updated to show 10$ instead of 10 USDT */
/* Refactor: JavaScript split into modules in /modules (ui.js, carousel.js, audio.js, sfx.js) and main.js now only imports them. */
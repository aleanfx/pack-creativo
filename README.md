# Pack Creativo — Landing

Archivos (estructura plana, sin carpetas):
- index.html: HTML principal que referencia assets externos.
- styles.css: Estilos extraídos del HTML.
- main.js: Lógica de la página (orquestación).
- ui.js: Componentes/UI, formulario, countdown, copy, pixel, etc.
- carousel.js: Carrusel de productos.
- audio.js: Música de fondo.
- sfx.js: Efectos sonoros de botones.

Publicación:
- Sube a Vercel como proyecto estático. Necesitas `index.html`, `styles.css` y `main.js`.  
- El resto de JS vive en la raíz (sin carpetas) y es importado por `main.js`.

Backend (opcional):
- El formulario hace `POST` a `/api/order` con `FormData`.
- Implementa un endpoint en Node.js (Vercel Functions) o PHP que procese `name`, `phone`, `method` y `attachment`.

Pixel de Meta:
- Edita `META_PIXEL_ID` en `main.js` para habilitar el evento `Purchase`.

Diseño responsivo y animaciones suaves con IntersectionObserver.
- Botones de copiar en métodos de pago.
- Sin carpetas `modules/` (código plano en la raíz).

# Pack Creativo — Landing

Archivos (estructura plana, sin carpetas):
- index.html: HTML principal que referencia assets externos.
- styles.css: Estilos extraídos del HTML.
- main.js: Lógica de la página (orquestación).
- ui.js: Componentes/UI, formulario, countdown, copy, etc.
- carousel.js: Carrusel de productos.
- audio.js: Música de fondo.
- sfx.js: Efectos sonoros de botones.

Publicación:
- Sube a Vercel como proyecto estático. Necesitas `index.html`, `styles.css` y `main.js`.  
- El resto de JS vive en la raíz (sin carpetas) y es importado por `main.js`.

Backend (opcional):
- El formulario hace `POST` a `/api/order` con `FormData`.
- Implementa un endpoint en Node.js (Vercel Functions) o PHP que procese `name`, `phone`, `method` y `attachment`.

Diseño responsivo y animaciones suaves con IntersectionObserver.
- Botones de copiar en métodos de pago.
- Sin carpetas `modules/` (código plano en la raíz).


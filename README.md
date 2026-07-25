# Laxergy Estudio — Landing (TC-2026-001)

Landing estática de **Laxergy Estudio** (Altos Mirandinos, Miranda, Venezuela). Portada del diseño aprobado
en Claude Design a HTML/CSS/JS vanilla, servida con nginx en Docker (Coolify, VPS bunker).

- **Dominio de producción:** https://laxergyestudio.com (+ `www`). Migrado el **2026-07-25**.
- **Dominio provisional:** https://laxergy.techcam.com.ar — sigue activo, responde **301** al dominio final.
- Sin backend: la conversión es el botón de reservas (SimplyBook.me) y WhatsApp.

## Stack y estructura

HTML5 + CSS + JS vanilla. **Sin build step, sin framework.** Fuentes y placeholders vendorizados
localmente (nada de CDNs).

```
index.html          Página (una sola). Estilos de layout inline (fiel al diseño).
styles.css          @font-face, base, keyframes, :hover y responsive.
app.js              Menú mobile + GA4 (apagada por ANALYTICS_ENABLED) + eventos + UTMs.
config.js           Config única JS: SITE_URL, BOOKING_URL, WHATSAPP, GA4_ID,
                    PROVISIONAL, ANALYTICS_ENABLED.
robots.txt          Indexación permitida + referencia al sitemap.
sitemap.xml         Única URL del sitio (one-pager).
public/
  hero-salon.webp            Placeholders on-brand (reemplazar por fotos reales).
  estudio-recepcion.webp
  estudio-salon.webp
  estudio-detalle.webp
  fonts/                     Anton + Montserrat (subset latin, woff2).
  favicon.ico, apple-touch-icon.png
nginx.conf          Cabeceras de seguridad + cache + 301 del dominio provisional.
Dockerfile          nginx:alpine + adaptación a ${PORT} de Coolify.
.dockerignore
```

## Desarrollo local

```bash
# Servir el sitio tal cual (rutas relativas):
python3 -m http.server 8099
# → http://localhost:8099

# O probar la imagen de producción completa (nginx + cabeceras):
docker build -t laxergy-landing .
docker run --rm -p 8080:80 laxergy-landing
# → http://localhost:8080   ·   curl -I http://localhost:8080 para ver las cabeceras
```

## Reemplazar las imágenes por nuevas fotos

Los `image-slot` del diseño se portaron a `<img>`. Fotos reales actuales (versión `-v1`):

| Archivo                           | Qué va                                              |
|-----------------------------------|-----------------------------------------------------|
| `public/hero-salon-v1.webp`       | Hero: fondo (LCP). **Provisional:** recepción oscurecida hasta tener foto ancha dedicada. |
| `public/estudio-recepcion-v1.webp`| Recepción (tile grande, vertical).                  |
| `public/estudio-salon-v1.webp`    | Salón de clases.                                    |
| `public/estudio-detalle-v1.webp`  | Detalle del espacio.                                |

Recomendado: exportar a `.webp`, ancho ≤ 1600px, calidad ~80.

> **IMPORTANTE — caché de Cloudflare.** Los assets se sirven con `Cache-Control: max-age=604800`
> (7 días) y Cloudflare los cachea en el edge bajo el mismo nombre. Reemplazar un `.webp`
> *con el mismo nombre* NO se ve hasta que expire la caché. Por eso, al cambiar una foto:
> **subir el número de versión del archivo** (`-v1` → `-v2`) y actualizar su referencia en `index.html`
> (para el hero son 4 refs: `<img>`, `preload`, `og:image` y el `image` del JSON-LD; para los demás,
> el `<img src>`). URL nueva = sin caché previa, sin depender de purgar Cloudflare (el token del VPS
> no tiene permiso de purga). Luego `git push` + redeploy.

## Seguridad (nginx.conf)

- **CSP** `default-src 'none'` con whitelist para: GA4 (`googletagmanager`, `google-analytics`),
  Google Maps embed (`www.google.com`) y el widget de SimplyBook (`laxergy.simplybook.me`).
  `style-src` incluye `'unsafe-inline'` porque el diseño usa estilos inline; **los scripts NO**.
- **HSTS**, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` mínima (sin cámara/mic/geo).
- Todos los enlaces externos con `rel="noopener noreferrer"`.
- Reservas y WhatsApp son enlaces directos (`target="_blank"`), no iframes → sin contenido mixto.
- Cache: HTML/JS/CSS `no-cache` (revalidan), assets `expires 7d`.

## Medición (GA4) — lista, apagada · **PENDIENTE ABIERTO**

`config.js` trae `GA4_ID: "G-XXXXXXXXXX"` (placeholder) y `ANALYTICS_ENABLED: false`. La analítica
tiene su **propio interruptor**, separado de `PROVISIONAL`: la migración de dominio no la enciende.
Mientras `ANALYTICS_ENABLED` sea `false`, **GA4 no carga** (y aunque se pusiera en `true`, `app.js`
igual aborta si `GA4_ID` sigue siendo el placeholder — doble red).

**Para activarla hacen falta dos pasos, en este orden:**
1. Crear la propiedad GA4 sobre `laxergyestudio.com` y copiar el ID real (`G-…`) a `GA4_ID`.
2. Poner `ANALYTICS_ENABLED: true`, redeploy y verificar en GA4 → Tiempo real.

Con ambos hechos, `app.js`:
- carga `gtag.js`,
- dispara `reserve_click` en los CTA de reservar y `whatsapp_click` en los enlaces `wa.me`
  (listener delegado por `data-analytics`, sin datos personales),
- adjunta las UTMs presentes en la URL.

## Deploy en Coolify (VPS bunker)

Mismo patrón que las otras landings del equipo (Landing-Hogar).

1. **DNS (Cloudflare, zona techcam.com.ar):** crear registro
   **A** · nombre `laxergy` · contenido `23.94.236.166` (IP del bunker) · proxy **activado**.
2. **Repo:** `Darkslidex/laxergy-landing` (público, para que Coolify lo sirva sin credenciales).
3. **Coolify → New Application** (aplicación **nueva y aislada**, no tocar las demás):
   - Source: el repo. **Build Pack: `Dockerfile`.**
   - Domain: `https://laxergy.techcam.com.ar`. Puerto expuesto: `80` (Coolify inyecta `PORT`,
     el `Dockerfile` lo adapta).
   - SSL: **Let's Encrypt** automático. Forzar **HTTP → HTTPS**.
4. Deploy. Referencias en Coolify (bunker):
   - Proyecto `laxergy` · UUID `lnqrst2b5ezh1y5fpebw53no`.
   - App `laxergy-landing` · UUID `edc3d8ran0b2ie4txq39pro6` · entorno `production`.
   - Desplegado el 2026-07-17 en https://laxergy.techcam.com.ar (HTTP/2 200, HTTP→HTTPS 307, cert vía Cloudflare + Let's Encrypt).

> Coolify genera los labels de Traefik y gestiona el certificado; no se editan labels a mano.

## Migración a laxergyestudio.com — ✅ EJECUTADA (2026-07-25)

El dominio definitivo resultó ser **`laxergyestudio.com`** (no `laxergy.com`, que no estaba
disponible). Checklist completo, ya aplicado:

1. ✅ **DNS (Cloudflare):** `A @` y `A www` → `23.94.236.166`, ambos en **DNS only** (nube gris).
   La nube gris es deliberada: permite que Let's Encrypt valide por HTTP contra el bunker.
2. ✅ **Coolify:** los tres dominios conviven en la misma app
   (`https://laxergyestudio.com,https://www.laxergyestudio.com,https://laxergy.techcam.com.ar`).
   Certificados Let's Encrypt emitidos para apex y `www`.
3. ✅ **`index.html` → bloque `SITE_URL` del `<head>`:** `canonical`, `og:url`, `og:image` y el
   JSON-LD (`url`, `image`) apuntan al dominio nuevo. `address` (Carrizal) y `areaServed`
   (Altos Mirandinos) **no se tocaron** — ver criterio geográfico D-14.
4. ✅ **`index.html`:** eliminada la etiqueta `<meta name="robots" content="noindex, nofollow">`.
5. ✅ **`nginx.conf`:** eliminada la línea `add_header X-Robots-Tag "noindex, nofollow" always;`.
6. ✅ **`config.js`:** `SITE_URL` al dominio nuevo, `PROVISIONAL: false` y `ANALYTICS_ENABLED: false`
   como flag independiente. GA4 sigue apagada a propósito (ver "Medición").
7. ✅ **`robots.txt` + `sitemap.xml`** creados (indexación permitida, una sola URL) y agregados al
   `COPY` del Dockerfile.
8. ✅ **301 del dominio provisional:** `nginx.conf` tiene un server block que matchea
   `laxergy.techcam.com.ar` y responde `301` a `https://laxergyestudio.com$request_uri`
   (conserva path y query). Los enlaces ya difundidos siguen funcionando.

> **Cuidado con el `sed` del Dockerfile.** Al agregar el segundo server block, el patrón pasó de
> `s/listen 80;/…/` a `s/listen 80/…/` (**sin** el `;`), porque el bloque default declara
> `listen 80 default_server;`. Con el patrón viejo esa línea no se reescribía y nginx quedaba
> escuchando en el puerto 80 en vez del `${PORT}` que inyecta Coolify → la app no respondía.
> Si se agregan más `listen`, verificar siempre con
> `docker exec <container> grep listen /etc/nginx/conf.d/default.conf`.

### Pendientes tras la migración

- **GA4 sin activar** (`ANALYTICS_ENABLED: false`, `GA4_ID` en placeholder). Falta crear la
  propiedad del dominio nuevo. Ver "Medición (GA4)".
- **Foto ancha dedicada para el hero** (hoy usa la recepción oscurecida).
- **Search Console:** dar de alta `laxergyestudio.com` y enviar el sitemap.

> Nota: al ser un sitio estático sin build step, no hay un único flag que apague TODO de golpe;
> lo dependiente del dominio está concentrado en el bloque `SITE_URL` del `<head>` + `config.js`.

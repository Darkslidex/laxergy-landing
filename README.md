# Laxergy Estudio — Landing (TC-2026-001)

Landing estática de **Laxergy Estudio** (Altos Mirandinos, Miranda, Venezuela). Portada del diseño aprobado
en Claude Design a HTML/CSS/JS vanilla, servida con nginx en Docker (Coolify, VPS bunker).

- **Dominio provisional:** https://laxergy.techcam.com.ar (presentación a la clienta).
- **Dominio final:** https://laxergy.com (se compra y migra al recibir el primer pago).
- Sin backend: la conversión es el botón de reservas (SimplyBook.me) y WhatsApp.

## Stack y estructura

HTML5 + CSS + JS vanilla. **Sin build step, sin framework.** Fuentes y placeholders vendorizados
localmente (nada de CDNs).

```
index.html          Página (una sola). Estilos de layout inline (fiel al diseño).
styles.css          @font-face, base, keyframes, :hover y responsive.
app.js              Menú mobile + GA4 (apagada por PROVISIONAL) + eventos + UTMs.
config.js           Config única JS: SITE_URL, BOOKING_URL, WHATSAPP, GA4_ID, PROVISIONAL.
public/
  hero-salon.webp            Placeholders on-brand (reemplazar por fotos reales).
  estudio-recepcion.webp
  estudio-salon.webp
  estudio-detalle.webp
  fonts/                     Anton + Montserrat (subset latin, woff2).
  favicon.ico, apple-touch-icon.png
nginx.conf          Cabeceras de seguridad + cache + X-Robots-Tag noindex.
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

## Medición (GA4) — lista, apagada

`config.js` trae `GA4_ID: "G-XXXXXXXXXX"` (placeholder) y `PROVISIONAL: true`. Mientras
`PROVISIONAL` sea `true`, **GA4 no carga**. Al ponerlo en `false` y con un `GA4_ID` real, `app.js`:
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

## Migración a laxergy.com (al recibir el primer pago)

Checklist exacto. Todo lo dependiente del dominio está concentrado; son pocos cambios:

1. **DNS:** en Cloudflare, apuntar `laxergy.com` (A `@` → `23.94.236.166`) y `www` (CNAME → `laxergy.com`).
2. **Coolify:** agregar `https://laxergy.com` como dominio de la misma app; reemitir el certificado
   Let's Encrypt. (Opcional: dejar `laxergy.techcam.com.ar` como redirección o darlo de baja.)
3. **`index.html` → bloque `SITE_URL` del `<head>`:** cambiar `laxergy.techcam.com.ar` por `laxergy.com`
   en `canonical`, `og:url`, `og:image` **y** en el JSON-LD (`url`, `image`).
4. **`index.html`:** borrar la etiqueta `<meta name="robots" content="noindex, nofollow">`.
5. **`nginx.conf`:** borrar la línea `add_header X-Robots-Tag "noindex, nofollow" always;`
   (o cambiar el valor por `all`).
6. **`config.js`:** poner `PROVISIONAL: false`, `SITE_URL: "https://laxergy.com"` y el `GA4_ID` real
   (crear antes la propiedad GA4 del dominio final).
7. Redeploy. Verificar: candado válido en laxergy.com, `curl -I` ya **sin** `X-Robots-Tag: noindex`,
   GA4 recibiendo eventos, y agregar `sitemap.xml` + `robots.txt` si se quiere indexación.

> Nota: al ser un sitio estático sin build step, no hay un único flag que apague TODO de golpe;
> este checklist es el equivalente (bloque `SITE_URL` en el `<head>` + `config.js` + 2 líneas de noindex).

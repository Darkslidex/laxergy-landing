FROM nginx:alpine

# ══ SOLO PREVIEW (rama preview/fotos-aprobadas) ═══════════════════════════════
# Diferencias contra el Dockerfile de producción, todas deliberadas:
#   · apache2-utils para generar el .htpasswd de Basic Auth en el arranque.
#   · NO se copian robots.txt ni sitemap.xml: el preview no debe ofrecerlos.
#   · se copian preview.css y preview.js (panel de variantes).
# Al aprobar las fotos, este archivo vuelve al de main.
# ══════════════════════════════════════════════════════════════════════════════
RUN apk add --no-cache apache2-utils

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html styles.css app.js config.js preview.css preview.js /usr/share/nginx/html/
COPY public/ /usr/share/nginx/html/public/

EXPOSE 80

# Healthcheck contra el puerto real (Coolify inyecta PORT; se expande en runtime).
# Apunta a /_salud, que nginx expone sin Basic Auth y solo al loopback: el wget de
# BusyBox no soporta --user/--password, y pasar las credenciales por --header las
# volcaría a los logs del deploy en cada intento fallido.
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${PORT:-80}/_salud" || exit 1

# Arranque:
#   1. Exige PREVIEW_USER y PREVIEW_PASS. Si falta alguna, nginx no levanta: un
#      preview sin Basic Auth queda expuesto al público.
#   2. Genera /etc/nginx/.htpasswd a partir de esas variables. El archivo nunca
#      se commitea: el repo es público.
#   3. Reescribe el puerto. El patrón va SIN ';' final para alcanzar tanto a
#      "listen 80;" como a "listen 80 default_server;".
CMD ["/bin/sh", "-c", "\
: \"${PREVIEW_USER:?falta PREVIEW_USER: el preview no arranca sin Basic Auth}\" && \
: \"${PREVIEW_PASS:?falta PREVIEW_PASS: el preview no arranca sin Basic Auth}\" && \
htpasswd -cbB /etc/nginx/.htpasswd \"$PREVIEW_USER\" \"$PREVIEW_PASS\" >/dev/null && \
chmod 640 /etc/nginx/.htpasswd && chown root:nginx /etc/nginx/.htpasswd && \
sed -i \"s/listen 80/listen ${PORT:-80}/\" /etc/nginx/conf.d/default.conf && \
exec nginx -g 'daemon off;'"]

FROM nginx:alpine

# ══ SOLO PREVIEW (rama preview/fotos-aprobadas) ═══════════════════════════════
# Diferencias contra el Dockerfile de producción, todas deliberadas:
#   · NO se copian robots.txt ni sitemap.xml: el preview no debe ofrecerlos.
#   · se copian preview.css y preview.js (panel de variantes).
#   · se genera el cuerpo de la sonda /_salud del healthcheck.
# El Basic Auth se retiró a pedido: ya no hace falta apache2-utils ni generar un
# .htpasswd en el arranque. El preview queda sin control de acceso; lo único que
# lo mantiene fuera de los buscadores es el noindex del index.html y del
# nginx.conf. Para reactivarlo, revertir el commit que lo quitó.
# Al aprobar las fotos, este archivo vuelve al de main.
# ══════════════════════════════════════════════════════════════════════════════

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html styles.css app.js config.js preview.css preview.js /usr/share/nginx/html/
COPY public/ /usr/share/nginx/html/public/

# Cuerpo de la sonda de salud. Es un archivo y no un `return` del nginx.conf para
# que el allow/deny del location sí se evalúe (ver el comentario allí).
RUN printf 'ok\n' > /usr/share/nginx/html/_salud

EXPOSE 80

# Healthcheck contra el puerto real (Coolify inyecta PORT; se expande en runtime).
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${PORT:-80}/_salud" || exit 1

# Coolify/Nixpacks inyectan PORT (ej. 3000). nginx se adapta a ${PORT:-80}.
# El patrón NO lleva ';' final: debe alcanzar tanto a "listen 80;" como a
# "listen 80 default_server;" (los dos server blocks de nginx.conf).
CMD ["/bin/sh", "-c", "sed -i \"s/listen 80/listen ${PORT:-80}/\" /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]

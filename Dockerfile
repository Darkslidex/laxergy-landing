FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html styles.css app.js config.js robots.txt sitemap.xml /usr/share/nginx/html/
COPY public/ /usr/share/nginx/html/public/

EXPOSE 80

# Healthcheck contra el puerto real (Coolify inyecta PORT; se expande en runtime).
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${PORT:-80}/" || exit 1

# Coolify/Nixpacks inyectan PORT (ej. 3000). nginx se adapta a ${PORT:-80}.
# El patrón NO lleva ';' final: debe alcanzar tanto a "listen 80;" como a
# "listen 80 default_server;" (los dos server blocks de nginx.conf).
CMD ["/bin/sh", "-c", "sed -i \"s/listen 80/listen ${PORT:-80}/\" /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]

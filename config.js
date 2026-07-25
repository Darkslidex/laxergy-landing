/* Laxergy Estudio · configuración única
   Migrado el 2026-07-25 de laxergy.techcam.com.ar (provisional) al dominio
   definitivo laxergyestudio.com. El bloque "SITE_URL" del <head> de index.html
   es el valor autoritativo para buscadores (ver README). */
window.LAXERGY_CONFIG = {
  // Dominio canónico (referencia). El valor autoritativo para buscadores vive en
  // <link rel="canonical"> / Open Graph / JSON-LD del <head> de index.html.
  SITE_URL: "https://laxergyestudio.com",

  // Conversión (coincide con los href del HTML; estos no cambian al migrar de dominio).
  BOOKING_URL: "https://laxergy.simplybook.me/",
  WHATSAPP: "584246446679",

  // Analítica GA4 — placeholder hasta crear la propiedad del dominio final.
  GA4_ID: "G-XXXXXXXXXX",

  // Etapa del sitio: true = presentación provisional. false = producción final.
  // NO controla la analítica (ver ANALYTICS_ENABLED).
  PROVISIONAL: false,

  // Interruptor exclusivo de GA4. Poner en true SOLO cuando exista una propiedad
  // GA4 real y GA4_ID deje de ser el placeholder.
  ANALYTICS_ENABLED: false
};

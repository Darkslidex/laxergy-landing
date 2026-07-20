/* Laxergy Estudio · configuración única
   Al migrar de laxergy.techcam.com.ar (provisional) a laxergy.com, revisar este
   archivo Y el bloque "SITE_URL" del <head> de index.html (ver README). */
window.LAXERGY_CONFIG = {
  // Dominio canónico (referencia). El valor autoritativo para buscadores vive en
  // <link rel="canonical"> / Open Graph / JSON-LD del <head> de index.html.
  SITE_URL: "https://laxergy.techcam.com.ar",

  // Conversión (coincide con los href del HTML; estos no cambian al migrar de dominio).
  BOOKING_URL: "https://laxergy.simplybook.me/",
  WHATSAPP: "584246446679",

  // Analítica GA4 — placeholder hasta crear la propiedad en el dominio final.
  GA4_ID: "G-XXXXXXXXXX",

  // Etapa provisional: true = presentación (GA4 apagada). false = producción final (activa GA4).
  PROVISIONAL: true
};

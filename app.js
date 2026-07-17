/* Laxergy Estudio · JS vanilla
   1) Menú mobile (reemplaza toggleMenu/closeMenu del framework de diseño).
   2) Medición GA4 — preparada pero APAGADA mientras PROVISIONAL = true.
   Sin PII. Todo con addEventListener (sin handlers inline, compatible con la CSP). */
(function () {
  "use strict";
  var cfg = window.LAXERGY_CONFIG || {};

  /* ── 1) Menú mobile ── */
  var toggle = document.getElementById("menu-toggle");
  var menu = document.getElementById("mobile-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
    // Cerrar el menú al volver a desktop
    var mq = window.matchMedia("(min-width: 1081px)");
    mq.addEventListener("change", function (e) {
      if (e.matches) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ── 2) Medición GA4 (gated por PROVISIONAL) ── */
  if (cfg.PROVISIONAL === true) return;               // presentación: no cargar GA4
  var id = cfg.GA4_ID;
  if (!id || id.indexOf("G-") !== 0 || id === "G-XXXXXXXXXX") return;  // sin ID real: no cargar

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", id);

  // UTMs de la URL (sin datos personales)
  function utms() {
    var p = new URLSearchParams(window.location.search);
    var out = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) {
      var v = p.get(k);
      if (v) out[k] = v;
    });
    return out;
  }

  // Listener delegado: dispara reserve_click / whatsapp_click según data-analytics
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-analytics]");
    if (!el) return;
    var kind = el.getAttribute("data-analytics");
    var name = kind === "whatsapp" ? "whatsapp_click"
             : kind === "reservar" ? "reserve_click"
             : null;
    if (!name) return;
    var params = utms();
    params.location_id = el.id || "";
    gtag("event", name, params);
  }, { passive: true });
})();

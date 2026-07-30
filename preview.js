/* ══ SOLO PREVIEW · panel de variantes ═══════════════════════════════════════
   Existe únicamente en la rama preview/fotos-aprobadas, para que la dueña del
   estudio compare encuadre de hero e intensidad del velo antes de aprobar.
   Al aprobar se borra este archivo junto con preview.css.

   Va como archivo externo, no inline, para no necesitar 'unsafe-inline' en la
   CSP: script-src ya incluye 'self'.

   La selección queda en localStorage para que sobreviva a las recargas durante
   la muestra. Con el panel oculto se recupera con la tecla P.                 ── */
(function () {
  'use strict';

  var CLAVE = 'laxergy-preview';

  var ENCUADRES = {
    amplio: {
      src: 'public/hero-nichos-v2.webp',
      srcset: 'public/hero-nichos-v2-1200.webp 1200w, public/hero-nichos-v2.webp 1600w',
      ancho: 1600, alto: 1000
    },
    cerrado: {
      src: 'public/hero-nichos-cerrado-v2.webp',
      srcset: '',
      ancho: 1200, alto: 750
    }
  };

  var estado = { encuadre: 'amplio', velo: 'sobrio', plegado: false, oculto: false };

  // En pantallas chicas el panel desplegado tapa los CTA del hero, que son parte
  // de lo que hay que aprobar: ahí arranca plegado hasta que se lo abra a mano.
  if (window.innerWidth <= 520) estado.plegado = true;

  try {
    var guardado = JSON.parse(localStorage.getItem(CLAVE) || '{}');
    Object.keys(estado).forEach(function (k) {
      if (guardado[k] !== undefined) estado[k] = guardado[k];
    });
  } catch (e) { /* localStorage no disponible: se sigue con los valores por defecto */ }

  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* sin persistencia */ }
  }

  var heroImg = document.querySelector('#top img.slot-img');
  var panel;

  function aplicar() {
    var enc = ENCUADRES[estado.encuadre];
    if (heroImg && enc) {
      heroImg.setAttribute('srcset', enc.srcset);
      heroImg.setAttribute('src', enc.src);
      heroImg.setAttribute('width', enc.ancho);
      heroImg.setAttribute('height', enc.alto);
    }
    document.body.classList.toggle('scrim-denso', estado.velo === 'denso');

    if (panel) {
      panel.hidden = estado.oculto;
      panel.classList.toggle('pv-plegado', estado.plegado);
      panel.querySelectorAll('[data-campo]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(estado[b.dataset.campo] === b.dataset.valor));
      });
    }
  }

  function crearGrupo(etiqueta, campo, opciones) {
    var grupo = document.createElement('div');
    grupo.className = 'pv-grupo';

    var rotulo = document.createElement('span');
    rotulo.className = 'pv-etiqueta';
    rotulo.textContent = etiqueta;
    grupo.appendChild(rotulo);

    var caja = document.createElement('div');
    caja.className = 'pv-opciones';
    opciones.forEach(function (op) {
      var boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'pv-boton';
      boton.textContent = op.texto;
      boton.dataset.campo = campo;
      boton.dataset.valor = op.valor;
      boton.addEventListener('click', function () {
        estado[campo] = op.valor;
        guardar();
        aplicar();
      });
      caja.appendChild(boton);
    });
    grupo.appendChild(caja);
    return grupo;
  }

  function construir() {
    panel = document.createElement('aside');
    panel.className = 'pv-panel';
    panel.setAttribute('aria-label', 'Opciones de vista previa');

    var cabecera = document.createElement('div');
    cabecera.className = 'pv-cabecera';
    var titulo = document.createElement('span');
    titulo.className = 'pv-titulo';
    titulo.textContent = 'VISTA PREVIA';
    var flecha = document.createElement('span');
    flecha.className = 'pv-flecha';
    flecha.textContent = '▾';
    cabecera.appendChild(titulo);
    cabecera.appendChild(flecha);
    cabecera.addEventListener('click', function () {
      estado.plegado = !estado.plegado;
      guardar();
      aplicar();
    });
    panel.appendChild(cabecera);

    var cuerpo = document.createElement('div');
    cuerpo.className = 'pv-cuerpo';
    cuerpo.appendChild(crearGrupo('ENCUADRE DEL HERO', 'encuadre', [
      { texto: 'Amplio', valor: 'amplio' },
      { texto: 'Cerrado', valor: 'cerrado' }
    ]));
    cuerpo.appendChild(crearGrupo('INTENSIDAD DEL VELO', 'velo', [
      { texto: 'Sobrio', valor: 'sobrio' },
      { texto: 'Denso', valor: 'denso' }
    ]));

    var ocultar = document.createElement('button');
    ocultar.type = 'button';
    ocultar.className = 'pv-ocultar';
    ocultar.textContent = 'OCULTAR PANEL';
    ocultar.addEventListener('click', function () {
      estado.oculto = true;
      guardar();
      aplicar();
    });
    cuerpo.appendChild(ocultar);

    var nota = document.createElement('p');
    nota.className = 'pv-nota';
    nota.textContent = 'Para volver a mostrarlo, presionar la tecla P.';
    cuerpo.appendChild(nota);

    panel.appendChild(cuerpo);
    document.body.appendChild(panel);
  }

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'p' || ev.key === 'P') {
      var enCampo = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
      if (enCampo) return;
      estado.oculto = !estado.oculto;
      guardar();
      aplicar();
    }
  });

  construir();
  aplicar();
})();

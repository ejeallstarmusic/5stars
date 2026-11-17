/* 5STARS — comportamiento del sitio (sin dependencias). */
(function () {
  "use strict";

  /* ───── CONFIGURACIÓN ─────
     Para activar el envío real del formulario, pega aquí la URL del servicio de formularios
     que elijas (por ejemplo Formspree o Basin). Mientras esté vacío, el formulario NO simula
     un envío: avisa que no está activo y ofrece enviar la solicitud por correo. */
  var FORM_ENDPOINT = "";
  var CONTACT_EMAIL = "5stars@agency.com";
  var WHATSAPP = "573024713340";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Cabecera: cambia de apariencia al hacer scroll */
  var header = $("#header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 16); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Revelado al hacer scroll */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    reveals.forEach(function (el) { rio.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* Sección activa en el menú */
  var navLinks = $$("[data-nav]");
  var ids = ["inicio", "presentacion", "manifiesto", "servicios", "trabajos", "nosotros", "proceso", "contacto"];
  function setActive(id) {
    if (id === "presentacion") id = "inicio";
    navLinks.forEach(function (a) {
      if (a.getAttribute("data-nav") === id) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  }
  if ("IntersectionObserver" in window) {
    var aio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-40% 0px -55% 0px" });
    ids.forEach(function (id) { var el = document.getElementById(id); if (el) aio.observe(el); });
  }
  setActive("inicio");

  /* Menú móvil */
  var burger = $("#burger"), menu = $("#menu-movil"), closeTimer = 0;
  function openMenu() {
    clearTimeout(closeTimer);
    menu.hidden = false; menu.classList.remove("closing"); menu.classList.add("open");
    burger.setAttribute("aria-expanded", "true"); burger.setAttribute("aria-label", "Cerrar menú");
    document.documentElement.style.overflow = "hidden";
    var first = $("a", menu); if (first) first.focus();
  }
  function closeMenu(returnFocus) {
    if (menu.hidden) return;
    menu.classList.remove("open"); menu.classList.add("closing");
    burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Abrir menú");
    document.documentElement.style.overflow = "";
    closeTimer = setTimeout(function () { menu.hidden = true; menu.classList.remove("closing"); }, reduce ? 0 : 400);
    if (returnFocus) burger.focus();
  }
  burger.addEventListener("click", function () { if (menu.hidden) openMenu(); else closeMenu(false); });
  $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { closeMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(true); });
  window.addEventListener("resize", function () { if (window.innerWidth >= 1024) closeMenu(false); });

  /* Escena audiovisual del primer bloque */
  var canvas = $("#scene");
  if (canvas && window.StarsScene) {
    var scene = window.StarsScene.create(canvas, canvas.parentElement);
    if (scene) {
      var visible = true, rt = 0;
      var sync = function () { if (reduce) return; if (visible && !document.hidden) scene.start(); else scene.stop(); };
      if (reduce) {
        scene.renderStill(9.8); // fotograma estático del momento protagonista
      } else {
        sync();
        if ("IntersectionObserver" in window) {
          new IntersectionObserver(function (en) { visible = en[0].isIntersecting; sync(); }).observe(canvas);
        }
        document.addEventListener("visibilitychange", sync);
      }
      window.addEventListener("resize", function () {
        clearTimeout(rt);
        rt = setTimeout(function () { if (reduce) scene.renderStill(9.8); else scene.resize(); }, 150);
      });
      window.__scene = scene; // para pruebas manuales en la consola
    }
  }

  /* Formulario de contacto */
  var form = $("#contact-form");
  if (form) {
    var status = $("#form-status"), btn = $("#submit-btn"), label = $("#submit-label");
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var fields = {
      name: function (v) { return v.trim().length < 2 ? "Escribe tu nombre completo." : ""; },
      email: function (v) { return !v.trim() ? "Escribe tu correo electrónico." : !EMAIL_RE.test(v.trim()) ? "Revisa el formato del correo (ejemplo: nombre@empresa.com)." : ""; },
      business: function (v) { return v.trim().length < 2 ? "Indica el nombre de tu negocio." : ""; },
      service: function (v) { return !v ? "Elige un servicio de interés." : ""; },
      message: function (v) { return v.trim().length < 10 ? "Cuéntanos un poco más sobre tu proyecto (mínimo 10 caracteres)." : ""; }
    };
    var idOf = { name: "f-name", email: "f-email", business: "f-business", service: "f-service", message: "f-message" };

    function showError(k, msg) {
      var input = document.getElementById(idOf[k]), err = document.getElementById("e-" + k);
      input.parentNode.classList.toggle("invalid", !!msg);
      if (msg) { input.setAttribute("aria-invalid", "true"); input.setAttribute("aria-describedby", "e-" + k); err.textContent = msg; err.hidden = false; }
      else { input.removeAttribute("aria-invalid"); input.removeAttribute("aria-describedby"); err.hidden = true; err.textContent = ""; }
    }
    Object.keys(fields).forEach(function (k) {
      document.getElementById(idOf[k]).addEventListener("input", function () { showError(k, ""); });
    });

    function values() {
      var o = {}; Object.keys(idOf).forEach(function (k) { o[k] = document.getElementById(idOf[k]).value; }); return o;
    }
    function mailto(v) {
      var body = "Nombre: " + v.name + "\nCorreo: " + v.email + "\nNegocio: " + v.business + "\nServicio de interés: " + v.service + "\n\nProyecto:\n" + v.message;
      return "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent("Solicitud de proyecto — " + v.business) + "&body=" + encodeURIComponent(body);
    }
    function wa(v) {
      var t = "Hola, soy " + v.name + " (" + v.business + "). Servicio de interés: " + v.service + ". " + v.message + " Mi correo: " + v.email;
      return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(t);
    }
    function box(cls, html) { status.innerHTML = '<div class="notice ' + cls + '">' + html + "</div>"; }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (form.elements.website && form.elements.website.value) return; // trampa anti-spam
      var v = values(), first = null;
      Object.keys(fields).forEach(function (k) {
        var msg = fields[k](v[k]); showError(k, msg); if (msg && !first) first = k;
      });
      if (first) { document.getElementById(idOf[first]).focus(); status.innerHTML = ""; return; }

      if (!FORM_ENDPOINT) { // sin integración real no se simula un envío exitoso
        box("", "<b>El envío desde el formulario todavía no está activo.</b>Tu solicitud no se ha enviado. Puedes mandarla ahora, con los datos que ya completaste, por correo o por WhatsApp:<br><a href=\"" + esc(mailto(v)) + "\">ENVIAR POR CORREO</a> &nbsp; <a href=\"" + esc(wa(v)) + "\" target=\"_blank\" rel=\"noopener noreferrer\">ENVIAR POR WHATSAPP</a>");
        return;
      }
      btn.disabled = true; label.textContent = "ENVIANDO…"; status.innerHTML = "";
      var data = new FormData();
      Object.keys(v).forEach(function (k) { data.append(k, v[k].trim ? v[k].trim() : v[k]); });
      fetch(FORM_ENDPOINT, { method: "POST", headers: { Accept: "application/json" }, body: data })
        .then(function (r) { if (!r.ok) throw new Error(r.status); box("ok", "<b>Solicitud enviada</b>Recibimos tus datos. Te responderemos al correo que indicaste."); form.reset(); })
        .catch(function () { box("bad", "No pudimos enviar tu solicitud. Inténtalo de nuevo o escríbenos a " + CONTACT_EMAIL + "."); })
        .then(function () { btn.disabled = false; label.textContent = "ENVIAR SOLICITUD"; });
    });
  }
})();

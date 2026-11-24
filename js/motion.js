/* 5STARS · Hero de motion design (26 s, en bucle) — Canvas 2D, sin librerías
   Inspirado en el lenguaje de los films de motion design: formas geométricas con degradados cálidos,
   volúmenes brillantes con sombras suaves, trazos de línea, cortes por barrido y textura de grano.
   Todo con la paleta de 5STARS: #FFC600, #7300FF, #0B0909 y #E8EDF2 (los degradados cálidos salen
   de interpolar el matiz del amarillo al morado). Seis escenas: Idea, Estructura, Tienda,
   Experiencia, Dispositivos y Marca. No usa audio. */
(function () {
  "use strict";
  var T = 26;
  var STARTS = [0, 4, 8, 13, 18, 22];
  var SCENES = [
    { label: "Idea", th: "white" }, { label: "Estructura", th: "purple" },
    { label: "Tienda", th: "yellow" }, { label: "Experiencia", th: "black" },
    { label: "Dispositivos", th: "white" }, { label: "Marca", th: "purple" }
  ];
  var WIPE = 0.7, MSG_FROM = 23.4, MSG_TO = 25.4;
  var Y = "#FFC600", P = "#7300FF", K = "#0B0909", W = "#E8EDF2";

  /* ---------- utilidades ---------- */
  function clamp(v, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(x) { x = clamp(x); return x * x * (3 - 2 * x); }
  function eo3(x) { x = clamp(x); return 1 - Math.pow(1 - x, 3); }
  function eio(x) { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function bk(x) { x = clamp(x); var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
  function elastic(x) { x = clamp(x); if (x === 0 || x === 1) return x; return Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * (2 * Math.PI) / 3) + 1; }
  function bounceOut(x) {
    x = clamp(x); var n1 = 7.5625, d1 = 2.75;
    if (x < 1 / d1) return n1 * x * x;
    if (x < 2 / d1) { x -= 1.5 / d1; return n1 * x * x + 0.75; }
    if (x < 2.5 / d1) { x -= 2.25 / d1; return n1 * x * x + 0.9375; }
    x -= 2.625 / d1; return n1 * x * x + 0.984375;
  }
  function hex(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
  function mixc(a, b, t) {
    var A = hex(a), B = hex(b);
    return "rgb(" + Math.round(lerp(A[0], B[0], t)) + "," + Math.round(lerp(A[1], B[1], t)) + "," + Math.round(lerp(A[2], B[2], t)) + ")";
  }
  function rgba(h, a) { var c = hex(h); return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }
  /* degradado cálido: matiz del amarillo (46°) al morado (267°) pasando por naranja, rojo y magenta */
  /* degradado solo con colores de marca: amarillo → morado, con transición corta para no generar tonos intermedios ajenos */
  function warm(t) {
    var k = ease((clamp(t) - 0.35) / 0.3), A = hex(Y), B = hex(P);
    return "#" + [0, 1, 2].map(function (i) { return Math.round(lerp(A[i], B[i], k)).toString(16).padStart(2, "0"); }).join("");
  }
  function lin(c, x0, y0, x1, y1, stops) {
    var g = c.createLinearGradient(x0, y0, x1, y1);
    for (var i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
    return g;
  }
  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
  }
  function shadow(c, a, blur, oy) { c.shadowColor = "rgba(11,9,9," + a + ")"; c.shadowBlur = blur; c.shadowOffsetY = oy; c.shadowOffsetX = 0; }
  function noShadow(c) { c.shadowColor = "transparent"; c.shadowBlur = 0; c.shadowOffsetY = 0; }
  function bg(c, col) { c.fillStyle = col; c.fillRect(-3000, -3000, 6000, 6000); }
  function contactShadow(c, x, y, rx, a) {
    var g = c.createRadialGradient(x, y, 0, x, y, rx);
    g.addColorStop(0, "rgba(11,9,9," + a + ")"); g.addColorStop(1, "rgba(11,9,9,0)");
    c.save(); c.translate(0, y); c.scale(1, 0.18); c.translate(0, -y); c.fillStyle = g;
    c.beginPath(); c.arc(x, y, rx, 0, 7); c.fill(); c.restore();
  }

  /* ---------- volúmenes brillantes ---------- */
  function sphere(c, x, y, r, cA, cB, ground) {
    if (r <= 0.5) return;
    if (ground !== undefined) contactShadow(c, x, ground, r * 1.1, 0.28);
    var g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.08, x, y, r * 1.05);
    g.addColorStop(0, mixc(cA, "#ffffff", 0.0)); g.addColorStop(1, cB);
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    var h = c.createRadialGradient(x - r * 0.38, y - r * 0.45, 0, x - r * 0.38, y - r * 0.45, r * 0.5);
    h.addColorStop(0, "rgba(255,255,255,.85)"); h.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = h; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    c.strokeStyle = "rgba(255,255,255,.28)"; c.lineWidth = Math.max(1, r * 0.05);
    c.beginPath(); c.arc(x, y, r * 0.9, 0.2, 1.25); c.stroke();
  }
  function ring(c, x, y, r, tube, cA, cB, tilt) {
    if (r <= 1) return;
    c.save(); c.translate(x, y); c.rotate(tilt || 0);
    c.lineWidth = tube; c.strokeStyle = lin(c, -r, -r, r, r, [[0, cA], [1, cB]]);
    c.beginPath(); c.ellipse(0, 0, r, r * 0.5, 0, 0, 7); c.stroke();
    c.lineWidth = tube * 0.22; c.strokeStyle = "rgba(255,255,255,.55)";
    c.beginPath(); c.ellipse(0, -tube * 0.12, r, r * 0.5, 0, Math.PI * 1.1, Math.PI * 1.6); c.stroke();
    c.restore();
  }
  function cone(c, x, y, w, h, cA, cB, ground) {
    if (w <= 1) return;
    if (ground !== undefined) contactShadow(c, x, ground, w * 0.7, 0.26);
    c.beginPath(); c.moveTo(x, y - h / 2); c.lineTo(x + w / 2, y + h / 2); c.quadraticCurveTo(x, y + h * 0.68, x - w / 2, y + h / 2); c.closePath();
    c.fillStyle = lin(c, x - w / 2, y - h / 2, x + w / 2, y + h / 2, [[0, cA], [1, cB]]); c.fill();
    c.beginPath(); c.moveTo(x, y - h / 2); c.lineTo(x + w / 2, y + h / 2); c.quadraticCurveTo(x + w * 0.2, y + h * 0.6, x, y + h * 0.6); c.closePath();
    c.fillStyle = "rgba(11,9,9,.2)"; c.fill();
    c.strokeStyle = "rgba(255,255,255,.5)"; c.lineWidth = Math.max(1, w * 0.03);
    c.beginPath(); c.moveTo(x - w * 0.05, y - h * 0.28); c.lineTo(x - w * 0.3, y + h * 0.36); c.stroke();
  }
  function cube(c, x, y, s, cT, cL, cR, ground) {
    if (s <= 1) return;
    if (ground !== undefined) contactShadow(c, x, ground, s * 1.1, 0.28);
    var hx = s * 0.87, hy = s * 0.5;
    c.fillStyle = cT; c.beginPath(); c.moveTo(x, y - s); c.lineTo(x + hx, y - s + hy); c.lineTo(x, y - s + 2 * hy); c.lineTo(x - hx, y - s + hy); c.closePath(); c.fill();
    c.fillStyle = cL; c.beginPath(); c.moveTo(x - hx, y - s + hy); c.lineTo(x, y - s + 2 * hy); c.lineTo(x, y + s * 0.0 + hy * 2 - 0 + 0); c.lineTo(x, y + s); c.lineTo(x - hx, y + hy); c.closePath(); c.fill();
    c.fillStyle = cR; c.beginPath(); c.moveTo(x + hx, y - s + hy); c.lineTo(x, y - s + 2 * hy); c.lineTo(x, y + s); c.lineTo(x + hx, y + hy); c.closePath(); c.fill();
  }
  function pill(c, x, y, w, h, cA, cB, rot) {
    if (w <= 1) return;
    c.save(); c.translate(x, y); c.rotate(rot || 0);
    rr(c, -w / 2, -h / 2, w, h, h / 2); c.fillStyle = lin(c, -w / 2, -h / 2, w / 2, h / 2, [[0, cA], [1, cB]]); c.fill();
    rr(c, -w / 2 + h * 0.2, -h / 2 + h * 0.14, w * 0.5, h * 0.2, h * 0.1); c.fillStyle = "rgba(255,255,255,.6)"; c.fill();
    c.restore();
  }
  function starPath(c, x, y, R, inner, rot) {
    c.beginPath();
    for (var i = 0; i < 10; i++) {
      var a = rot + i * Math.PI / 5 - Math.PI / 2, r = (i % 2 === 0) ? R : R * inner;
      var px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.closePath();
  }

  /* ---------- interfaz de tienda ---------- */
  function rv(b, a) { return ease((b - a) / 0.16); }
  var GRID = { cols: 3 };
  /* devuelve el centro (relativo a la ventana) de cada miniatura de producto */
  function thumbs(w, h, chrome) {
    var iw = w - 40, cols = w < 300 ? 2 : 3, gap = 14, cw = (iw - gap * (cols - 1)) / cols;
    var top = -h / 2 + (chrome ? 30 : 0) + 16, hy = top + 36 + 12 + 26 + 12 + h * 0.26 + 14;
    var ch = h / 2 - 16 - hy, out = [];
    for (var i = 0; i < cols; i++) out.push({ x: -w / 2 + 20 + i * (cw + gap) + cw / 2, y: hy + ch * 0.31, r: Math.min(cw, ch * 0.62) * 0.36 });
    return out;
  }
  function win(c, cx, cy, w, h, b, chrome, noThumbs) {
    c.save(); c.translate(cx, cy);
    var x0 = -w / 2, y0 = -h / 2, iw = w - 40, cols = w < 300 ? 2 : 3, gap = 14;
    shadow(c, 0.28, 40, 18); rr(c, x0, y0, w, h, 16); c.fillStyle = "#fff"; c.fill(); noShadow(c);
    var top = y0 + 16;
    if (chrome) {
      c.save(); rr(c, x0, y0, w, h, 16); c.clip();
      c.fillStyle = "#EEF0F5"; c.fillRect(x0, y0, w, 30);
      [P, Y, "#B9A6FF"].forEach(function (col, i) { c.fillStyle = col; c.beginPath(); c.arc(x0 + 18 + i * 16, y0 + 15, 4.5, 0, 7); c.fill(); });
      c.restore(); top = y0 + 30 + 16;
    }
    var x = x0 + 20;
    /* encabezado */
    var hw = iw * eo3(b / 0.2);
    c.fillStyle = K; rr(c, x, top, hw, 36, 8); c.fill();
    if (b > 0.1) { c.globalAlpha = rv(b, 0.1); c.fillStyle = Y; rr(c, x + 10, top + 8, 56, 20, 4); c.fill(); c.fillStyle = "rgba(232,237,242,.7)"; for (var n = 0; n < 3; n++) { rr(c, x + iw - 196 + n * 62, top + 14, 46, 8, 4); c.fill(); } c.globalAlpha = 1; }
    /* categorías */
    var cy2 = top + 36 + 12;
    var chipCols = [P, Y, "#D9DEE8", "#D9DEE8"];
    for (var k = 0; k < (cols === 2 ? 3 : 4); k++) {
      var cwid = (iw - 3 * 10) / 4;
      c.globalAlpha = rv(b, 0.2 + k * 0.04); c.fillStyle = chipCols[k]; rr(c, x + k * (cwid + 10), cy2, cwid, 26, 13); c.fill();
    }
    c.globalAlpha = 1;
    /* banner */
    var by = cy2 + 26 + 12, bh = h * 0.26;
    var ba = rv(b, 0.34);
    if (ba > 0) {
      c.save(); c.globalAlpha = ba; rr(c, x, by, iw, bh, 12); c.clip();
      c.fillStyle = lin(c, x, by, x + iw, by + bh, [[0, P], [0.6, "#9B4DFF"], [1, warm(0.2)]]); c.fillRect(x, by, iw, bh);
      c.fillStyle = "rgba(255,255,255,.95)"; rr(c, x + 22, by + bh * 0.28, iw * 0.34, 14, 7); c.fill();
      c.fillStyle = "rgba(255,255,255,.55)"; rr(c, x + 22, by + bh * 0.28 + 24, iw * 0.24, 10, 5); c.fill();
      c.fillStyle = Y; rr(c, x + 22, by + bh * 0.28 + 48, iw * 0.14, 20, 10); c.fill();
      sphere(c, x + iw * 0.8, by + bh * 0.52, bh * 0.36, Y, warm(0.3));
      c.restore();
    }
    /* productos */
    var gy = by + bh + 14, gh = y0 + h - 16 - gy, cw2 = (iw - gap * (cols - 1)) / cols;
    for (var i = 0; i < cols; i++) {
      var pa = rv(b, 0.5 + i * 0.12);
      if (pa <= 0) continue;
      var px = x + i * (cw2 + gap);
      c.save(); c.globalAlpha = pa; c.translate(0, (1 - pa) * 14);
      rr(c, px, gy, cw2, gh, 10); c.fillStyle = "#F4F5FA"; c.fill();
      rr(c, px + 8, gy + 8, cw2 - 16, gh * 0.62, 8); c.fillStyle = ["#EADFFF", "#FFF0BD", "#E3E8F5"][i]; c.fill();
      c.fillStyle = "#C9CEDB"; rr(c, px + 10, gy + gh * 0.62 + 18, cw2 * 0.62, 7, 3.5); c.fill();
      c.fillStyle = Y; rr(c, px + 10, gy + gh * 0.62 + 32, cw2 * 0.3, 11, 5.5); c.fill();
      c.restore();
    }
    c.restore();
  }

  /* ---------- escenas ---------- */
  var LABEL_Y = 0;
  /* 1 · Idea (fondo claro): línea → círculo → péndulo */
  function s1(c, lt) {
    bg(c, W);
    var hw = lt < 1.0 ? 420 * eo3(lt / 1.0) : lerp(420, 70, eio((lt - 1.1) / 0.9));
    var hh = lerp(0.5, 70, eio((lt - 1.0) / 1.0));
    c.strokeStyle = K; c.lineWidth = 3; c.lineCap = "round";
    if (lt < 2.15) {
      c.globalAlpha = 1 - ease((lt - 1.95) / 0.2);
      c.beginPath(); c.ellipse(0, 0, hw, hh, 0, 0, 7); c.stroke(); c.globalAlpha = 1;
    }
    if (lt >= 1.9) {
      var pop = bk((lt - 1.9) / 0.6);
      var pivY = -470, L = 520;
      var th = function (tt) { return 0.5 * Math.sin(3.0 * (tt - 2.1)) * Math.exp(-0.18 * Math.max(0, tt - 2.1)) * ease((tt - 2.05) / 0.3); };
      var pos = function (tt) { var a = th(tt); return [Math.sin(a) * L, pivY + Math.cos(a) * L]; };
      var q = pos(lt);
      c.strokeStyle = K; c.lineWidth = 2.5;
      var drop = eo3((lt - 1.95) / 0.35);
      c.beginPath(); c.moveTo(0, pivY); c.lineTo(lerp(0, q[0], drop), lerp(pivY, q[1], drop)); c.stroke();
      for (var k = 3; k >= 1; k--) {
        var pq = pos(lt - k * 0.07);
        c.globalAlpha = 0.2 / k * 1.6; c.fillStyle = P; c.beginPath(); c.arc(pq[0], pq[1], 70 * pop, 0, 7); c.fill();
      }
      c.globalAlpha = 1;
      sphere(c, q[0], q[1], 70 * pop, warm(0.12), warm(0.9));
    }
  }
  /* 2 · Estructura (morado): túnel de rombos con profundidad */
  function s2(c, lt) {
    var g = c.createRadialGradient(0, 0, 0, 0, 0, 1000);
    g.addColorStop(0, "#8D35FF"); g.addColorStop(1, "#24096A");
    c.fillStyle = g; c.fillRect(-3000, -3000, 6000, 6000);
    var z = lt * 0.75 + 2.6 * Math.pow(ease((lt - 2.9) / 1.1), 2);
    var n0 = Math.floor(z), f = z - n0, base = 1700, ratio = 0.62;
    var pal = [[Y, "#FFD43A"], [P, "#5A00D6"], [W, "#B9A6FF"], ["#9B4DFF", P]];
    c.save(); c.rotate(0.45 * Math.sin(lt * 0.55));
    for (var k = 0; k < 11; k++) {
      var s = base * Math.pow(ratio, k - f);
      var id = ((k + n0) % 4 + 4) % 4, p = pal[id];
      shadow(c, 0.38, 36, 16);
      c.fillStyle = lin(c, -s, -s, s, s, [[0, p[0]], [1, p[1]]]);
      c.beginPath(); c.moveTo(0, -s); c.lineTo(s, 0); c.lineTo(0, s); c.lineTo(-s, 0); c.closePath(); c.fill();
    }
    noShadow(c);
    c.fillStyle = K; c.beginPath(); c.moveTo(0, -6); c.lineTo(6, 0); c.lineTo(0, 6); c.lineTo(-6, 0); c.closePath(); c.fill();
    c.restore();
  }
  /* 3 · Tienda (amarillo): los volúmenes caen y se convierten en los productos */
  function s3(c, lt) {
    var g = c.createRadialGradient(0, -60, 0, 0, -60, 900);
    g.addColorStop(0, "#FFD43A"); g.addColorStop(1, Y);
    c.fillStyle = g; c.fillRect(-3000, -3000, 6000, 6000);
    var GY = 235;
    c.strokeStyle = K; c.lineWidth = 3; c.globalAlpha = 1 - ease((lt - 1.8) / 0.5) * 0.7;
    c.beginPath(); c.moveTo(-1200, GY); c.lineTo(1200, GY); c.stroke(); c.globalAlpha = 1;
    var winS = bk((lt - 1.7) / 0.8), b = clamp((lt - 2.2) / 2.2);
    var WX = 0, WY = -45, WW = 660, WH = 420;
    if (winS > 0.01) { c.save(); c.translate(WX, WY); c.scale(winS, winS); c.translate(-WX, -WY); win(c, WX, WY, WW, WH, b, true); c.restore(); }
    var th = thumbs(WW, WH, true);
    var items = [
      { x: -330, r: 54, kind: "sphere", t: 0 }, { x: -170, r: 60, kind: "cone", t: 1 }, { x: 0, r: 46, kind: "cube", t: 2 },
      { x: 170, r: 46, kind: "ring", t: -1 }, { x: 330, r: 36, kind: "pill", t: -2 }
    ];
    items.forEach(function (it, i) {
      var rel = 0.1 + i * 0.15;
      var p = bounceOut((lt - rel) / 0.95);
      var rest = GY - it.r * (it.kind === "ring" ? 0.45 : 1);
      var y = lerp(-520, rest, p);
      if (lt < rel) return;
      var x = it.x, s = 1, gr = GY;
      if (it.t >= 0) {
        var m = eio((lt - (2.7 + it.t * 0.25)) / 0.8);
        var T0 = th[it.t];
        x = lerp(it.x, WX + T0.x, m); y = lerp(y, WY + T0.y, m); s = lerp(1, (T0.r / it.r), m); gr = undefined;
      } else {
        var m2 = eio((lt - 2.8) / 1.0);
        x = lerp(it.x, it.t === -1 ? -470 : 470, m2); y = lerp(y, it.t === -1 ? 150 : -170, m2) + Math.sin(lt * 1.6 + i) * 8 * m2; gr = lerp(GY, undefined === 0 ? 0 : GY, 0) ; if (m2 > 0.05) gr = undefined;
      }
      var r = it.r * s;
      if (it.kind === "sphere") sphere(c, x, y, r, P, "#9B4DFF", gr);
      else if (it.kind === "cone") cone(c, x, y, r * 1.6, r * 1.8, "#FFE45C", warm(0.3), gr);
      else if (it.kind === "cube") cube(c, x, y + r * 0.2, r * 0.9, "#9B5CFF", "#5A00D6", "#3E0099", gr);
      else if (it.kind === "ring") ring(c, x, y, r * 0.95, r * 0.34, K, "#4A2C8F", 0.3);
      else pill(c, x, y, r * 2.4, r * 0.9, W, "#BFC7DB", -0.6);
    });
  }
  /* 4 · Experiencia (negro): curva de crecimiento con pelota y los pasos de compra */
  function curve(u) { return [-440 + 880 * u, 170 - 330 * Math.pow(u, 1.5) + 22 * Math.sin(u * 13) * (1 - u)]; }
  function icon(c, kind, x, y, s) {
    if (s <= 0.02) return;
    c.save(); c.translate(x, y); c.scale(s, s);
    sphere(c, 0, 0, 42, kind === 1 ? Y : P, kind === 1 ? warm(0.3) : "#9B4DFF");
    c.strokeStyle = kind === 1 ? K : "#fff"; c.fillStyle = c.strokeStyle; c.lineWidth = 3.5; c.lineCap = "round"; c.lineJoin = "round";
    if (kind === 0) { c.beginPath(); c.moveTo(-20, -14); c.lineTo(-13, -14); c.lineTo(-8, 8); c.lineTo(14, 8); c.lineTo(18, -8); c.lineTo(-11, -8); c.stroke(); c.beginPath(); c.arc(-6, 17, 3, 0, 7); c.arc(12, 17, 3, 0, 7); c.fill(); }
    else if (kind === 1) { rr(c, -20, -13, 40, 26, 5); c.stroke(); c.fillRect(-20, -6, 40, 6); }
    else { rr(c, -10, -20, 20, 40, 5); c.stroke(); c.beginPath(); c.moveTo(-3, 14); c.lineTo(3, 14); c.stroke(); }
    c.restore();
  }
  function s4(c, lt) {
    var g = c.createRadialGradient(0, 0, 0, 0, 0, 900);
    g.addColorStop(0, "#1B0B3D"); g.addColorStop(1, K);
    c.fillStyle = g; c.fillRect(-3000, -3000, 6000, 6000);
    c.strokeStyle = "rgba(232,237,242,.08)"; c.lineWidth = 1.5;
    for (var i = -10; i <= 10; i++) { c.beginPath(); c.moveTo(i * 80, -500); c.lineTo(i * 80, 500); c.stroke(); }
    for (var j = -6; j <= 6; j++) { c.beginPath(); c.moveTo(-900, j * 80); c.lineTo(900, j * 80); c.stroke(); }
    var u = eio((lt - 0.4) / 3.4);
    /* trazo de la curva con degradado cálido */
    c.lineWidth = 7; c.lineCap = "round"; c.lineJoin = "round";
    c.strokeStyle = lin(c, -440, 0, 440, 0, [[0, Y], [0.5, W], [1, P]]);
    c.beginPath();
    for (var k = 0; k <= 80; k++) { var uu = u * k / 80, p = curve(uu); if (k === 0) c.moveTo(p[0], p[1]); else c.lineTo(p[0], p[1]); }
    c.stroke();
    /* hitos de compra */
    var marks = [{ u: 0.3, kind: 0 }, { u: 0.58, kind: 1 }, { u: 0.84, kind: 2 }];
    marks.forEach(function (m) {
      if (u < m.u) return;
      var p = curve(m.u), pop = elastic((u - m.u) / 0.12);
      c.setLineDash([6, 8]); c.strokeStyle = "rgba(232,237,242,.35)"; c.lineWidth = 2;
      c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(p[0], 250); c.stroke(); c.setLineDash([]);
      icon(c, m.kind, p[0], p[1] - 78 * pop, pop);
    });
    /* pelota que recorre la curva */
    var bp = curve(u);
    sphere(c, bp[0], bp[1], 22, "#FFE45C", warm(0.2));
    /* remate: estrella al final de la curva */
    if (lt > 3.6) {
      var sp = bk((lt - 3.6) / 0.5), e = curve(1);
      c.save(); shadow(c, 0.4, 24, 8);
      starPath(c, e[0], e[1] - 6, 46 * sp, 0.46, 0);
      c.fillStyle = lin(c, e[0] - 40, e[1] - 50, e[0] + 40, e[1] + 40, [[0, "#FFE45C"], [1, warm(0.2)]]); c.fill(); noShadow(c); c.restore();
    }
  }
  /* 5 · Dispositivos (fondo claro): la tienda en laptop, celular y tablet */
  function s5(c, lt) {
    bg(c, W);
    var gdl = c.createRadialGradient(0, 0, 0, 0, 0, 900); gdl.addColorStop(0, "#FFFFFF"); gdl.addColorStop(1, "rgba(232,237,242,0)");
    c.fillStyle = gdl; c.fillRect(-3000, -3000, 6000, 6000);
    var pl = bk((lt - 0.1) / 0.8), ph = bk((lt - 0.6) / 0.8), pt = bk((lt - 1.0) / 0.8);
    var ft = Math.sin(lt * 1.4) * 6;
    /* tablet (atrás) */
    if (pt > 0.01) {
      c.save(); c.translate(250, -80 + ft); c.scale(pt, pt); c.rotate(0.06);
      shadow(c, 0.3, 36, 16); rr(c, -170, -120, 340, 240, 22); c.fillStyle = K; c.fill(); noShadow(c);
      c.save(); rr(c, -156, -106, 312, 212, 12); c.clip(); win(c, 0, 0, 312, 212, 1, false); c.restore();
      c.restore();
    }
    /* laptop */
    if (pl > 0.01) {
      c.save(); c.translate(-20, -20); c.scale(pl, pl);
      contactShadow(c, 0, 225, 330, 0.3);
      shadow(c, 0.3, 34, 16); rr(c, -265, -185, 530, 340, 20); c.fillStyle = K; c.fill(); noShadow(c);
      c.save(); rr(c, -250, -170, 500, 310, 10); c.clip(); win(c, 0, -15, 500, 310, clamp(lt / 1.4), false); c.restore();
      c.beginPath(); c.moveTo(-300, 190); c.lineTo(300, 190); c.lineTo(270, 160); c.lineTo(-270, 160); c.closePath();
      c.fillStyle = lin(c, -300, 160, 300, 190, [[0, "#C9CFDD"], [1, "#8E96AD"]]); c.fill();
      c.restore();
    }
    /* celular */
    if (ph > 0.01) {
      c.save(); c.translate(-350, 70 - ft); c.scale(ph, ph); c.rotate(-0.07);
      shadow(c, 0.32, 30, 14); rr(c, -78, -150, 156, 300, 26); c.fillStyle = K; c.fill(); noShadow(c);
      c.save(); rr(c, -68, -138, 136, 276, 18); c.clip(); win(c, 0, 0, 136, 276, clamp((lt - 0.6) / 1.4), false); c.restore();
      c.restore();
    }
    /* volúmenes que orbitan */
    var o = lt * 0.9;
    sphere(c, 400 + Math.cos(o) * 30, -170 + Math.sin(o * 1.3) * 18, 34 * bk((lt - 1.3) / 0.6), P, "#9B4DFF");
    cone(c, -420, -150 + Math.sin(o) * 14, 70 * bk((lt - 1.5) / 0.6), 80 * bk((lt - 1.5) / 0.6), "#FFE45C", warm(0.3));
    ring(c, 420, 215 + Math.sin(o * 1.1) * 10, 54 * bk((lt - 1.7) / 0.6), 18, K, "#4A2C8F", -0.3);
    pill(c, -150, 255, 120 * bk((lt - 1.9) / 0.6), 34 * bk((lt - 1.9) / 0.6), Y, warm(0.3), 0.2);
  }
  /* 6 · Marca (morado): del círculo a la estrella cromada */
  function s6(c, lt) {
    var g = c.createRadialGradient(0, -40, 0, 0, -40, 1000);
    g.addColorStop(0, "#8D35FF"); g.addColorStop(1, "#2A0A78");
    c.fillStyle = g; c.fillRect(-3000, -3000, 6000, 6000);
    for (var i = 0; i < 4; i++) {
      var rr0 = ((lt * 200 + i * 190) % 760) + 40;
      c.strokeStyle = "rgba(232,237,242," + (0.22 * (1 - rr0 / 800)).toFixed(3) + ")"; c.lineWidth = 2;
      c.beginPath(); c.arc(0, -40, rr0, 0, 7); c.stroke();
    }
    var m = eio((lt - 0.15) / 1.3), sc = bk((lt - 0.05) / 0.9);
    var R = 150 * sc, inner = lerp(1.0, 0.45, m), rot = lerp(-0.9, 0, m) + 0.04 * Math.sin(lt * 1.2);
    contactShadow(c, 0, 60, 150 * sc, 0.3);
    c.save();
    shadow(c, 0.4, 40, 18);
    starPath(c, 0, -120, R, inner, rot);
    c.fillStyle = lin(c, -R, -R, R, R, [[0, "#FFE45C"], [0.45, Y], [1, warm(0.25)]]);
    c.lineJoin = "round"; c.lineWidth = 16; c.strokeStyle = Y; c.stroke(); c.fill(); noShadow(c);
    c.clip();
    /* brillo cromado: franjas diagonales que barren la estrella */
    var sw = lerp(-R * 1.6, R * 1.6, ease((lt - 1.5) / 1.1));
    c.globalCompositeOperation = "lighter";
    c.fillStyle = lin(c, sw - 70, -R, sw + 70, R, [[0, "rgba(255,255,255,0)"], [0.5, "rgba(255,255,255,.75)"], [1, "rgba(255,255,255,0)"]]);
    c.fillRect(-R * 2, -R * 2, R * 4, R * 4);
    c.globalCompositeOperation = "source-over";
    c.fillStyle = "rgba(255,255,255,.35)"; c.beginPath(); c.ellipse(-R * 0.25, -120 - R * 0.35, R * 0.28, R * 0.1, -0.7, 0, 7); c.fill();
    c.restore();
  }

  var DRAW = [s1, s2, s3, s4, s5, s6];

  /* ---------- barridos entre escenas ---------- */
  function clipWipe(c, i, p) {
    var R = 2300, e = eio(p);
    c.beginPath();
    if (i === 0) { c.arc(0, 45, e * R, 0, 7); }
    else if (i === 1) { var d = e * R; c.moveTo(0, -d); c.lineTo(d, 0); c.lineTo(0, d); c.lineTo(-d, 0); c.closePath(); }
    else if (i === 2) { var hgt = e * 2400; c.rect(-2000, 1200 - hgt, 4000, hgt); }
    else if (i === 3) { c.arc(0, 0, e * R, 0, 7); }
    else if (i === 4) { var hw = e * 2000; c.rect(-hw, -1200, hw * 2, 2400); }
    else { c.arc(0, -40, e * R, 0, 7); }
    c.clip();
  }

  function grainCanvas() {
    var g = document.createElement("canvas"); g.width = g.height = 128;
    var x = g.getContext("2d"), d = x.createImageData(128, 128);
    for (var i = 0; i < d.data.length; i += 4) { var v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0); return g;
  }

  function create(canvas, host) {
    var ctx = canvas.getContext("2d");
    if (!ctx || !ctx.ellipse) return null;
    var grain = grainCanvas(), grainPat = null;

    /* Capa de texto corporativa: índice de escena, progreso y mensaje final */
    var hud = document.createElement("div");
    hud.className = "cin-hud"; hud.setAttribute("aria-hidden", "true"); hud.setAttribute("data-th", "white");
    hud.innerHTML = '<div class="cin-idx"><b></b><span></span></div><div class="cin-bar"><i></i></div>' +
      '<div class="cin-msg"><svg class="logo" aria-hidden="true"><use href="#logo"/></svg><p>Tu negocio comienza a brillar</p></div>';
    host.appendChild(hud);
    var idxN = hud.querySelector(".cin-idx b"), idxL = hud.querySelector(".cin-idx span"),
        bar = hud.querySelector(".cin-bar i"), msg = hud.querySelector(".cin-msg");
    var cur = -1, msgOn = false;
    function sceneIdx(t) { var s = 0; for (var i = 0; i < STARTS.length; i++) if (t >= STARTS[i]) s = i; return s; }
    function setHud(t) {
      var si = sceneIdx(t);
      if (si !== cur) { cur = si; idxN.textContent = "0" + (si + 1); idxL.textContent = SCENES[si].label; hud.setAttribute("data-th", SCENES[si].th); }
      bar.style.transform = "scaleX(" + (t / T).toFixed(4) + ")";
      var on = t >= MSG_FROM && t < MSG_TO;
      if (on !== msgOn) { msgOn = on; msg.classList.toggle("on", on); }
    }

    var dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    var clock = 0, W0 = 1, H0 = 1;
    function resize() {
      var w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      W0 = canvas.width; H0 = canvas.height; grainPat = null;
    }
    function render(t) {
      t = ((t % T) + T) % T;
      if (!grainPat) grainPat = ctx.createPattern(grain, "repeat");
      var sc = Math.min(W0 / 1100, H0 / 760);
      ctx.setTransform(sc, 0, 0, sc, W0 / 2, H0 / 2 + 26 * dpr);
      var i = sceneIdx(t), next = i < STARTS.length - 1 ? STARTS[i + 1] : T;
      ctx.save(); DRAW[i](ctx, t - STARTS[i]); ctx.restore();
      var wp = (t - (next - WIPE)) / WIPE;
      if (wp > 0) {
        ctx.save(); clipWipe(ctx, i, wp);
        DRAW[(i + 1) % DRAW.length](ctx, 0); ctx.restore();
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 0.07; ctx.fillStyle = grainPat; ctx.fillRect(0, 0, W0, H0); ctx.globalAlpha = 1;
      setHud(t);
    }

    var raf = 0, running = false, last = 0;
    var acc = 0, nf = 0;
    function frame(now) {
      var raw = now - last;
      /* resolución adaptativa: si el equipo va lento (>34 ms por cuadro en promedio), baja la resolución interna */
      if (raw < 250) { acc += raw; nf++; if (nf === 45) { if (acc / nf > 34 && dpr > 0.75) { dpr = Math.max(0.75, dpr * 0.8); resize(); } acc = 0; nf = 0; } }
      var dt = Math.min(raw / 1000, 0.05);
      last = now; clock = (clock + dt) % T;
      render(clock);
      raf = requestAnimationFrame(frame);
    }
    resize(); render(0);
    return {
      start: function () { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); },
      stop: function () { running = false; cancelAnimationFrame(raf); },
      renderStill: function (t) { resize(); render(t === undefined ? 24.2 : t); },
      resize: function () { resize(); if (!running) render(clock); },
      seek: function (t) { clock = t; render(t); },
      period: T, still: 24.2, kind: "motion"
    };
  }
  window.StarsMotion = { create: create, LOOP_SECONDS: T };
})();

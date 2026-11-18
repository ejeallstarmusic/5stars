/*
 * Escena cinematográfica 5STARS — Canvas 2D, sin dependencias.
 * Todo es función pura del tiempo t en [0, 12) s y cada elemento periódico tiene período 12 s
 * (o un divisor), así que el bucle es exacto. El reinicio se oculta con un destello que sale de
 * la estrella (11,3–12 s) y se disipa sobre la pantalla oscura inicial (0–0,55 s).
 *
 *  ESCENA 1  0 – 2,2 s   Oscuridad → partículas veloces, haces de luz, suelo en perspectiva
 *  ESCENA 2  2,2 – 4,2   Anillos 3D, sólidos alámbricos, fragmentos en órbita, HUD, cámara lateral
 *  ESCENA 3  4,2 – 6,4   La estrella se construye con fragmentos y líneas de energía → carga → explosión
 *  ESCENA 4  6,4 – 9,2   Ondas, chispas, escombros que se acercan, giro de la estrella, sacudida
 *  ESCENA 5  9,2 – 12    Estrella protagonista, rayos de luz, avance de cámara y destello de cierre
 */
(function () {
  "use strict";
  var STAR_PATH = "M 1076.164062 852.871094 C 1062.976562 834.164062 1054.066406 816.359375 1048.015625 801.769531 C 1067.082031 790.714844 1091.363281 774.003906 1115.527344 749.363281 C 1134.40625 730.113281 1148.257812 711.078125 1158.25 695.078125 C 1136.300781 705.488281 1109.695312 716.027344 1078.765625 724.3125 C 1059.1875 729.558594 1040.820312 733.113281 1024.097656 735.507812 C 1015.378906 722.40625 1005.183594 704.308594 997.207031 681.417969 C 988.066406 655.191406 985.03125 631.839844 984.136719 614.796875 C 978.429688 623.402344 971.273438 635.71875 965.242188 651.386719 C 961.410156 661.339844 958.035156 672.640625 955.777344 685.214844 C 955.171875 688.59375 954.6875 691.890625 954.285156 695.121094 C 952.210938 711.878906 952.71875 726.511719 953.925781 737.859375 C 943.273438 735.5 928.796875 733.539062 911.792969 734.835938 C 900.832031 735.675781 890.914062 737.707031 882.160156 740.289062 C 868.09375 744.441406 857.058594 750.011719 849.644531 754.320312 C 860.101562 755.050781 883.261719 758.101562 905.785156 774.371094 C 906.515625 774.898438 907.242188 775.4375 907.96875 775.992188 C 921.253906 786.125 929.570312 797.492188 934.472656 805.574219 C 926.980469 810.84375 918.3125 817.683594 909.355469 826.359375 C 903.566406 831.96875 897.660156 838.335938 891.871094 845.566406 C 869.773438 873.160156 859.335938 900.734375 854.214844 918.527344 C 867.160156 906.425781 885.085938 891.800781 908.308594 878.28125 C 913.800781 875.082031 919.585938 871.945312 925.675781 868.917969 C 950.859375 856.402344 974.113281 849.277344 992.621094 845.074219 C 999.957031 855.5625 1015.972656 875.429688 1043.597656 889.34375 C 1077.800781 906.574219 1109.554688 904.488281 1122.214844 902.960938 C 1108.683594 891.601562 1091.933594 875.234375 1076.164062 852.871094";
  var T = 12, TAU = Math.PI * 2, Z0 = 9, F = 9, TE = 6.4, TA = 4.2;
  var SC = { x: 1004, y: 767 }, SR = 154;

  var clamp = function (v, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return v < a ? a : v > b ? b : v; };
  var sm = function (a, b, t) { var x = clamp((t - a) / (b - a)); return x * x * (3 - 2 * x); };
  var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };
  var easeIn = function (x) { return x * x * x; };
  var easeOutBack = function (x) { return 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2); };
  var fract = function (x) { return x - Math.floor(x); };
  var yel = function (a) { return "rgba(255,198,0," + a.toFixed(3) + ")"; };
  var pur = function (a) { return "rgba(115,0,255," + a.toFixed(3) + ")"; };
  var ice = function (a) { return "rgba(232,237,242," + a.toFixed(3) + ")"; };

  function rng(seed) {
    var a = seed;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Cámara: valores equiespaciados (uno por segundo), interpolados con Catmull-Rom periódico
  function kf(v, t) {
    var n = v.length, x = fract(t / T) * n, i = Math.floor(x), f = x - i;
    var p0 = v[(i - 1 + n) % n], p1 = v[i % n], p2 = v[(i + 1) % n], p3 = v[(i + 2) % n];
    return 0.5 * (2 * p1 + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (-p0 + 3 * p1 - 3 * p2 + p3) * f * f * f);
  }
  var DOLLY = [0, 0.2, 0.5, 1.0, 1.7, 2.1, 1.9, -0.8, 0.2, 0.9, 0.6, 1.2];
  var YAW = [-0.25, -0.1, 0.18, 0.3, 0.1, -0.12, -0.2, 0.15, 0.34, 0.1, -0.1, -0.22];
  var PITCH = [0.1, 0.04, -0.06, -0.1, -0.02, 0.08, 0.12, 0.0, -0.08, -0.04, 0.05, 0.1];
  var ROLL = [0.05, 0.03, -0.04, -0.06, 0.02, 0.05, 0.0, -0.07, 0.06, 0.0, -0.03, 0.04];
  var PANX = [-0.5, 0, 0.4, 0.2, -0.2, -0.3, 0, 0.3, 0.1, 0, -0.2, -0.4];

  var CUBE_V = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
  var CUBE_E = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  var OCTA_V = [[1.3,0,0],[-1.3,0,0],[0,1.3,0],[0,-1.3,0],[0,0,1.3],[0,0,-1.3]];
  var OCTA_E = [[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,4],[4,3],[3,5],[5,2]];

  var HIGH = { particles: 220, ceiling: true, segs: 90, layers: 12, shardA: 12, sparks: 130, bloomDiv: 6, bloomAlpha: 0.3, ghost: true, dpr: 1.5, solids: 6, streams: 8 };
  var LOW = { particles: 90, ceiling: false, segs: 54, layers: 6, shardA: 8, sparks: 60, bloomDiv: 8, bloomAlpha: 0.24, ghost: false, dpr: 1, solids: 4, streams: 4 };

  function create(canvas, host) {
    var ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return null;
    var c = ctx;
    var bloom = document.createElement("canvas");
    var bctx = bloom.getContext("2d");
    var low = window.innerWidth < 768 || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
    var Q = low ? LOW : HIGH;
    var starPath = new Path2D(STAR_PATH);

    function build(q) {
      var r = rng(5150), i, j;
      var parts = [], beams = [], streams = [], shards = [], inflow = [], sparks = [], solids = [], frags = [], debris = [];
      for (i = 0; i < q.particles; i++) parts.push({ x: r() * 2 - 1, y: r() * 2 - 1, u: r(), k: 1 + Math.floor(r() * 3), size: 0.6 + r() * 1.6, col: Math.floor(r() * 3) });
      for (j = 0; j < 10; j++) beams.push({ t0: j < 5 ? 0.12 + j * 0.4 : 6.5 + (j - 5) * 0.42, y0: 0.1 + r() * 0.8, y1: 0.1 + r() * 0.8, col: j % 2 });
      for (j = 0; j < q.streams; j++) streams.push({ x: 0.06 + (j / q.streams) * 0.9 + r() * 0.04, k: 2 + (j % 3), ph: r(), col: j % 2 });
      var A = q.shardA, radii = [0, 80, 240];
      for (var ring = 0; ring < 2; ring++) {
        for (var a = 0; a < A; a++) {
          var a0 = (a / A) * TAU, a1 = ((a + 1) / A) * TAU, r0 = radii[ring], r1 = radii[ring + 1];
          var poly = new Path2D();
          poly.moveTo(r0 * Math.cos(a0), r0 * Math.sin(a0));
          poly.lineTo(r1 * Math.cos(a0), r1 * Math.sin(a0));
          poly.lineTo(r1 * Math.cos(a1), r1 * Math.sin(a1));
          poly.lineTo(r0 * Math.cos(a1), r0 * Math.sin(a1));
          poly.closePath();
          var am = (a0 + a1) / 2, rm = ((r0 + r1) / 2) * (ring === 0 ? 0.75 : 1);
          var d = [r() * 2 - 1, r() * 2 - 1, r() * 2 - 1], dl = Math.hypot(d[0], d[1], d[2]) || 1, dist = 3 + r() * 3.2;
          shards.push({ poly: poly, cx: rm * Math.cos(am), cy: rm * Math.sin(am), sx: (d[0] / dl) * dist, sy: (d[1] / dl) * dist * 0.8, sz: (d[2] / dl) * dist, rot0: (r() * 2 - 1) * 5, flip0: Math.cos(r() * TAU), delay: r() * 0.9, ph: r() * TAU });
        }
      }
      for (i = 0; i < 70; i++) inflow.push({ a: r() * TAU, rad: 1.4 + r() * 2.2, d: r() * 1.0, sw: (r() * 2 - 1) * 2.2, col: r() < 0.5 ? 0 : 1 });
      for (i = 0; i < q.sparks; i++) { var z = r() * 2 - 1, an = r() * TAU, s = Math.sqrt(1 - z * z); sparks.push({ dx: s * Math.cos(an), dy: s * Math.sin(an), dz: z, v: 5 + r() * 11, col: Math.floor(r() * 3) }); }
      for (j = 0; j < q.solids; j++) solids.push({ cube: j % 3 !== 2, rad: 1.5 + r() * 1.7, psi: r() * TAU, m: (j % 2 ? -1 : 1) * (1 + (j % 3)), k1: 1 + (j % 3), k2: 2 - (j % 2), size: 0.14 + r() * 0.16, col: j % 2, tin: 2.4 + j * 0.2, yo: (r() * 2 - 1) * 0.9 });
      for (i = 0; i < q.solids * 3; i++) frags.push({ rad: 1.2 + r() * 2.6, psi: r() * TAU, m: (r() < 0.5 ? -1 : 1) * (1 + Math.floor(r() * 3)), yo: (r() * 2 - 1) * 1.4, size: 0.05 + r() * 0.11, k: 1 + Math.floor(r() * 3), col: r() < 0.5 ? 0 : 1, ph: r() * TAU });
      var nd = Math.round(q.solids * 1.5);
      for (j = 0; j < nd; j++) debris.push({ tpass: 7.0 + (j / nd) * 2.4 + r() * 0.15, x: (r() < 0.5 ? -1 : 1) * (0.5 + r() * 1.6), y: (r() * 2 - 1) * 1.3, cube: j % 2 === 0, size: 0.14 + r() * 0.2, col: j % 2, spin: 1 + (j % 3) });
      return { parts: parts, beams: beams, streams: streams, shards: shards, inflow: inflow, sparks: sparks, solids: solids, frags: frags, debris: debris };
    }
    var D = build(Q);

    var W = 0, H = 0, dpr = 1, K = 1, wu = 1, portrait = false, dollyMul = 1, gy = 2, hxw = 3, hyw = 3, ringMul = 1;
    var cam = { cy: 1, sy: 0, cp: 1, sp: 0, cr: 1, sr: 0, d: 0, px: 0 };
    var cx = 0, cyy = 0;
    var ringBuf = [0, 1, 2, 3].map(function () { return new Float32Array(3 * 130); });
    var o1 = [0, 0, 0, 0], o2 = [0, 0, 0, 0];

    function resize() {
      W = Math.max(1, host.clientWidth); H = Math.max(1, host.clientHeight);
      dpr = Math.min(window.devicePixelRatio || 1, Q.dpr);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      portrait = H > W * 1.1;
      var U = portrait ? W : Math.min(W, H * 1.15);
      K = U * 0.5;
      wu = (portrait ? 0.78 : 0.66) / SR;
      dollyMul = portrait ? 0.4 : 1;
      ringMul = portrait ? 0.62 : 1;
      gy = (H / 2 / K) * 0.78; hxw = (W / 2 / K) * 1.9; hyw = (H / 2 / K) * 1.9;
      bloom.width = Math.max(2, Math.round((W * dpr) / Q.bloomDiv));
      bloom.height = Math.max(2, Math.round((H * dpr) / Q.bloomDiv));
    }

    function pr(x, y, z, o) {
      x -= cam.px;
      var x1 = x * cam.cy - z * cam.sy, z1 = x * cam.sy + z * cam.cy;
      var y1 = y * cam.cp - z1 * cam.sp, z2 = y * cam.sp + z1 * cam.cp;
      var depth = Z0 + z2 - cam.d, s = F / Math.max(depth, 0.05);
      var xr = x1 * cam.cr - y1 * cam.sr, yr = x1 * cam.sr + y1 * cam.cr;
      o[0] = cx + xr * s * K; o[1] = cyy + yr * s * K; o[2] = s; o[3] = depth;
    }

    var speedI = function (t) { return 0.3 + 0.7 * Math.max(1 - sm(0.8, 2.6, t), sm(6.3, 6.7, t) * (1 - sm(8.2, 9.6, t)), sm(11.0, 11.8, t)); };
    var loopFlash = function (t) { return 0.8 * (t < 0.55 ? 1 - sm(0, 0.55, t) : sm(11.3, 11.95, t)); };

    function starState(t) {
      var theta = -0.3 + (t < TE ? 0.18 * (t - TA) : 0.18 * (TE - TA)) + (t >= TE ? TAU * easeOut(clamp((t - TE) / 2.8)) : 0) + (t > 9.2 ? 0.35 * Math.sin(clamp(t - 9.2, 0, 2.8) * 1.1) : 0);
      return { theta: theta, phi: 0.1 + 0.16 * Math.sin((TAU * 2 * t) / T), fy: 0.04 * Math.sin((TAU * 3 * t) / T), m: t > 11.2 ? 1 + 5.5 * easeIn(clamp((t - 11.2) / 0.8)) : 1 };
    }

    function starGradient() {
      var g = c.createLinearGradient(850, 615, 1158, 919);
      g.addColorStop(0, "#8f3dff"); g.addColorStop(0.45, "#7300FF"); g.addColorStop(1, "#430099");
      return g;
    }

    function drawWholeStar(theta, phi, fy, m, layers, alpha, grad, t, extrude) {
      pr(0, fy, 0, o1);
      var k = wu * K * o1[2] * m, ct = Math.cos(theta), st = Math.sin(theta), thick = 0.22 * K * o1[2] * m;
      c.globalAlpha = alpha;
      if (extrude) {
        for (var i = layers; i >= 1; i--) {
          var f = i / layers;
          c.save();
          c.translate(o1[0] - (st * 0.9 + 0.1) * thick * f, o1[1] + 0.22 * thick * f * (0.6 + 0.4 * Math.cos(phi * 3)));
          c.transform(ct * k, -0.12 * st * k, 0, k, 0, 0);
          c.translate(-SC.x, -SC.y);
          c.fillStyle = i % 2 ? "#4a00b3" : "#3a0090";
          c.fill(starPath);
          c.restore();
        }
      }
      c.save();
      c.translate(o1[0], o1[1]);
      c.transform(ct * k, -0.12 * st * k, 0, k, 0, 0);
      c.translate(-SC.x, -SC.y);
      c.fillStyle = grad; c.fill(starPath);
      c.save();
      c.clip(starPath);
      c.globalCompositeOperation = "lighter";
      var sx = 760 + 520 * fract(t / 2.4 + 0.2);
      var sw = c.createLinearGradient(sx - 70, 600, sx + 70, 940);
      sw.addColorStop(0, "rgba(255,255,255,0)"); sw.addColorStop(0.5, "rgba(255,226,140,0.32)"); sw.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = sw; c.fillRect(840, 600, 330, 340);
      var sp = c.createLinearGradient(850, 615, 1000, 800);
      sp.addColorStop(0, "rgba(255,255,255,0.09)"); sp.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = sp; c.fillRect(840, 600, 330, 340);
      c.restore();
      c.lineWidth = 2.4 / k; c.strokeStyle = yel(0.95); c.stroke(starPath);
      c.restore();
      c.globalAlpha = 1;
    }

    function drawShards(t, theta, fy, grad) {
      var ct = Math.cos(theta), st = Math.sin(theta);
      for (var n = 0; n < D.shards.length; n++) {
        var sh = D.shards[n];
        var p = clamp((t - TA - sh.delay) / 1.25), pe = easeOut(p), vis = sm(2.3 + sh.delay * 0.4, 3.4, t);
        if (vis <= 0.01) continue;
        var dx = 0.3 * Math.sin((TAU * 2 * t) / T + sh.ph), dy = 0.22 * Math.sin((TAU * 3 * t) / T + sh.ph * 1.3), dz = 0.3 * Math.sin((TAU * t) / T + sh.ph * 0.7);
        var tx = sh.cx * wu * ct, ty = sh.cy * wu + fy, tz = -sh.cx * wu * st;
        var x = (sh.sx + dx) * (1 - pe) + tx * pe, y = (sh.sy + dy) * (1 - pe) + ty * pe, z = (sh.sz + dz) * (1 - pe) + tz * pe;
        pr(x, y, z, o1);
        if (o1[3] < 0.4) continue;
        if (p > 0 && p < 1) {
          var pp = easeOut(clamp(p - 0.1));
          pr((sh.sx + dx) * (1 - pp) + tx * pp, (sh.sy + dy) * (1 - pp) + ty * pp, (sh.sz + dz) * (1 - pp) + tz * pp, o2);
          c.globalCompositeOperation = "lighter"; c.lineCap = "round";
          c.strokeStyle = yel(0.75 * (1 - p)); c.lineWidth = 2.2;
          c.beginPath(); c.moveTo(o2[0], o2[1]); c.lineTo(o1[0], o1[1]); c.stroke();
          c.strokeStyle = pur(0.4 * (1 - p)); c.lineWidth = 8;
          c.beginPath(); c.moveTo(o2[0], o2[1]); c.lineTo(o1[0], o1[1]); c.stroke();
          c.globalCompositeOperation = "source-over";
        }
        var k = wu * K * o1[2];
        c.save();
        c.globalAlpha = vis * (0.4 + 0.6 * pe);
        c.translate(o1[0], o1[1]); c.rotate(sh.rot0 * (1 - pe));
        c.scale((sh.flip0 * (1 - pe) + ct * pe) * k, k);
        c.translate(-sh.cx, -sh.cy); c.clip(sh.poly);
        c.translate(-SC.x, -SC.y);
        c.fillStyle = grad; c.fill(starPath);
        c.restore();
      }
      c.globalAlpha = 1;
    }

    function wire(V, E, size, wx, wy, wz, a1, a2, color, al, lw) {
      var pts = V.map(function (v) {
        var x = v[0] * size, y = v[1] * size, z = v[2] * size;
        var x1 = x * Math.cos(a1) + z * Math.sin(a1), z1 = -x * Math.sin(a1) + z * Math.cos(a1);
        var y1 = y * Math.cos(a2) - z1 * Math.sin(a2), z2 = y * Math.sin(a2) + z1 * Math.cos(a2);
        pr(wx + x1, wy + y1, wz + z2, o1);
        return [o1[0], o1[1], o1[3]];
      });
      if (pts[0][2] < 0.6) return;
      c.strokeStyle = color(al); c.lineWidth = lw;
      c.beginPath();
      for (var e = 0; e < E.length; e++) { c.moveTo(pts[E[e][0]][0], pts[E[e][0]][1]); c.lineTo(pts[E[e][1]][0], pts[E[e][1]][1]); }
      c.stroke();
    }

    function render(t) {
      var e = t - TE, i, n;
      cam.d = kf(DOLLY, t) * dollyMul;
      var yaw = kf(YAW, t) * (portrait ? 0.7 : 1), pitch = kf(PITCH, t), roll = kf(ROLL, t);
      cam.cy = Math.cos(yaw); cam.sy = Math.sin(yaw); cam.cp = Math.cos(pitch); cam.sp = Math.sin(pitch); cam.cr = Math.cos(roll); cam.sr = Math.sin(roll);
      cam.px = kf(PANX, t) * (portrait ? 0.5 : 1);
      var shx = 0, shy = 0;
      if (e > 0 && e < 2.6) { var am = 18 * Math.exp(-e * 3.4) * (portrait ? 0.5 : 1); shx = Math.sin(e * 53) * am; shy = Math.cos(e * 41) * am; }
      cx = W / 2 + shx; cyy = H / 2 + shy - (portrait ? H * 0.02 : 0);

      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.globalCompositeOperation = "source-over"; c.globalAlpha = 1;
      c.fillStyle = "#0B0909"; c.fillRect(0, 0, W, H);

      var sst = starState(t);
      pr(0, sst.fy, 0, o1);
      var scx = o1[0], scy = o1[1], starS = o1[2];
      var maxDim = Math.max(W, H), speed = speedI(t);
      var energy = 0.25 + 0.35 * sm(0, 2.2, t) + 0.3 * sm(4.2, 6.4, t);

      // Resplandor volumétrico púrpura
      c.globalCompositeOperation = "lighter";
      var pulse = t > TE ? 0.12 * Math.sin((TAU * 4 * t) / T) : 0;
      var g = c.createRadialGradient(scx, scy, 0, scx, scy, maxDim * (0.55 + 0.25 * energy));
      g.addColorStop(0, pur(clamp(0.5 * energy + pulse + 0.2 * sm(6.3, 6.6, t)))); g.addColorStop(0.5, pur(0.16 * energy)); g.addColorStop(1, pur(0));
      c.fillStyle = g; c.fillRect(0, 0, W, H);

      // Rayos de luz
      var godI = sm(5.4, 6.6, t) * (1 - sm(11.0, 11.6, t));
      if (godI > 0.02) {
        g = c.createRadialGradient(scx, scy, 0, scx, scy, maxDim * 0.95);
        g.addColorStop(0, yel(0.34)); g.addColorStop(1, yel(0));
        c.fillStyle = g; c.globalAlpha = godI * (0.55 + 0.25 * Math.sin((TAU * 3 * t) / T));
        var nr = 14, rot = (TAU * t) / T;
        for (i = 0; i < nr; i++) {
          var an = rot + (i / nr) * TAU, w = 0.075;
          c.beginPath(); c.moveTo(scx, scy);
          c.lineTo(scx + Math.cos(an - w) * maxDim * 1.3, scy + Math.sin(an - w) * maxDim * 1.3);
          c.lineTo(scx + Math.cos(an + w) * maxDim * 1.3, scy + Math.sin(an + w) * maxDim * 1.3);
          c.closePath(); c.fill();
        }
        c.globalAlpha = 1;
      }

      // Suelo / techo en perspectiva
      var gridI = sm(0.35, 1.4, t) * (1 - sm(11.2, 11.8, t)) * (0.35 + 0.35 * sm(4.2, 6.4, t));
      if (gridI > 0.02) {
        var planes = Q.ceiling ? [gy, -gy] : [gy];
        for (var pi = 0; pi < planes.length; pi++) {
          var gyy = planes[pi], zNear = 0.4 - Z0 + cam.d + 0.2, j;
          for (i = -8; i <= 8; i++) {
            pr(i * 0.9, gyy, 8, o1); pr(i * 0.9, gyy, zNear, o2);
            c.strokeStyle = i % 4 === 0 ? yel(gridI * 0.7) : pur(gridI); c.lineWidth = 1;
            c.beginPath(); c.moveTo(o1[0], o1[1]); c.lineTo(o2[0], o2[1]); c.stroke();
          }
          for (j = 0; j < 12; j++) {
            var zz = (0.5 - fract(j / 12 + t / T)) * 16;
            if (Z0 + zz - cam.d < 0.5) continue;
            pr(-7.5, gyy, zz, o1); pr(7.5, gyy, zz, o2);
            var fade = clamp(1.2 - (zz + 8) / 18);
            c.strokeStyle = j % 4 === 0 ? yel(gridI * 0.8 * fade) : pur(gridI * fade); c.lineWidth = 1;
            c.beginPath(); c.moveTo(o1[0], o1[1]); c.lineTo(o2[0], o2[1]); c.stroke();
          }
        }
      }

      // Haces de luz que cruzan la pantalla
      for (n = 0; n < D.beams.length; n++) {
        var b = D.beams[n], q = (t - b.t0) / 0.6;
        if (q < 0 || q > 1) continue;
        var cxb = -0.3 * W + q * 1.6 * W, yb = (b.y0 + (b.y1 - b.y0) * q) * H, L = W * 0.55;
        var ang = Math.atan2((b.y1 - b.y0) * H, 1.6 * W);
        var x0 = cxb - Math.cos(ang) * L, y0 = yb - Math.sin(ang) * L, x1 = cxb + Math.cos(ang) * L, y1 = yb + Math.sin(ang) * L;
        g = c.createLinearGradient(x0, y0, x1, y1);
        var col = b.col ? pur : yel;
        g.addColorStop(0, col(0)); g.addColorStop(0.5, col(0.95)); g.addColorStop(1, col(0));
        c.strokeStyle = g; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
        c.lineWidth = 16; c.globalAlpha = 0.28; c.stroke(); c.globalAlpha = 1;
      }

      // Corrientes de datos verticales
      var si = sm(0.2, 1.2, t) * (1 - sm(11.2, 11.8, t));
      for (n = 0; n < D.streams.length; n++) {
        var s = D.streams[n], SL = 120 + 80 * s.ph, sy = fract((t * s.k) / T + s.ph) * (H + SL) - SL;
        g = c.createLinearGradient(0, sy, 0, sy + SL);
        var sc2 = s.col ? pur : yel;
        g.addColorStop(0, sc2(0)); g.addColorStop(1, sc2(0.85 * si));
        c.strokeStyle = g; c.lineWidth = 1.5; c.beginPath(); c.moveTo(s.x * W, sy); c.lineTo(s.x * W, sy + SL); c.stroke();
      }

      // Partículas en planos de profundidad (estelas = motion blur)
      var dl = 0.22 * (0.6 + 2.4 * speed), pAlpha = 1 - sm(11.5, 11.95, t) * 0.5;
      c.lineCap = "round";
      for (n = 0; n < D.parts.length; n++) {
        var pt = D.parts[n], zp = (0.5 - fract(pt.u + (pt.k * t) / T)) * 16;
        pr(pt.x * hxw, pt.y * hyw, zp, o1);
        if (o1[3] < 0.5) continue;
        pr(pt.x * hxw, pt.y * hyw, zp + dl * pt.k * 0.8, o2);
        var pa = sm(8, 5.5, zp) * clamp((o1[3] - 0.5) / 1.5) * pAlpha;
        if (pa < 0.02) continue;
        c.strokeStyle = pt.col === 0 ? yel(pa) : pt.col === 1 ? ice(pa * 0.85) : pur(Math.min(1, pa * 1.3));
        c.lineWidth = clamp(pt.size * o1[2] * 0.9, 0.6, 3.4);
        c.beginPath(); c.moveTo(o2[0], o2[1]); c.lineTo(o1[0], o1[1]); c.stroke();
      }

      // Partículas atraídas hacia la estrella
      if (t > 3.4 && t < TE + 0.05) {
        var ia = sm(3.4, 4.2, t);
        for (n = 0; n < D.inflow.length; n++) {
          var f = D.inflow[n], qq = clamp((t - 3.6 - f.d * 1.6) / 2.2);
          if (qq <= 0) continue;
          var rr = f.rad * (1 - easeOut(qq)), aa = f.a + f.sw * qq, rp = f.rad * (1 - easeOut(clamp(qq - 0.07))), ap = f.a + f.sw * clamp(qq - 0.07);
          pr(Math.cos(aa) * rr, Math.sin(aa) * rr * 0.8 + sst.fy, Math.sin(aa * 1.7) * rr * 0.7, o1);
          pr(Math.cos(ap) * rp, Math.sin(ap) * rp * 0.8 + sst.fy, Math.sin(ap * 1.7) * rp * 0.7, o2);
          c.strokeStyle = f.col ? yel(0.9 * ia * (1 - qq * 0.6)) : ice(0.8 * ia * (1 - qq * 0.6)); c.lineWidth = 1.6;
          c.beginPath(); c.moveTo(o2[0], o2[1]); c.lineTo(o1[0], o1[1]); c.stroke();
        }
      }

      // Anillos 3D: se calculan ahora, se dibuja la mitad trasera antes y la delantera después de la estrella
      var ringDefs = [
        { R: 1.1, tin: 2.3, a0: 1.2, b0: 0.2, c0: -0.3, ka: 1, kb: -1, kc: 0, col: 0, wd: 1.6 },
        { R: 1.6, tin: 2.55, a0: 0.4, b0: 1.1, c0: 0.5, ka: -2, kb: 1, kc: 1, col: 1, wd: 2.4 },
        { R: 2.2, tin: 2.8, a0: 1.0, b0: -0.6, c0: 1.3, ka: 1, kb: 2, kc: -1, col: 2, wd: 1.2 },
        { R: 0.86, tin: TE, a0: 0.9, b0: 0.3, c0: 0.0, ka: 3, kb: -2, kc: 2, col: 0, wd: 2.2 }
      ];
      var ringA = [];
      ringDefs.forEach(function (rd, ri) {
        var sc = (rd.tin < TE ? easeOutBack(clamp((t - rd.tin) / 1.0)) : easeOutBack(clamp((t - rd.tin) / 0.7))) * (1 + 2.5 * sm(11.0, 12, t)) * ringMul;
        var al = sm(rd.tin, rd.tin + 0.4, t) * (1 - sm(11.0, 11.8, t));
        ringA[ri] = al;
        if (al <= 0.01) return;
        var a = rd.a0 + (TAU * rd.ka * t) / T, bb = rd.b0 + (TAU * rd.kb * t) / T, cc = rd.c0 + (TAU * rd.kc * t) / T;
        var ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(bb), sb = Math.sin(bb), cz = Math.cos(cc), sz = Math.sin(cc), buf = ringBuf[ri];
        for (var sg = 0; sg <= Q.segs; sg++) {
          var ph = (sg / Q.segs) * TAU, x = rd.R * sc * Math.cos(ph), y = rd.R * sc * Math.sin(ph);
          var y1 = y * ca, z1 = y * sa, x2 = x * cb + z1 * sb, z2 = -x * sb + z1 * cb, x3 = x2 * cz - y1 * sz, y3 = x2 * sz + y1 * cz;
          pr(x3, y3 + sst.fy, z2, o1);
          buf[sg * 3] = o1[0]; buf[sg * 3 + 1] = o1[1]; buf[sg * 3 + 2] = z2 < 0 ? 1 : 0;
        }
      });
      function drawRings(front) {
        c.globalCompositeOperation = "lighter";
        ringDefs.forEach(function (rd, ri) {
          var al = ringA[ri];
          if (!al || al <= 0.01) return;
          var buf = ringBuf[ri], rc = rd.col === 0 ? yel : rd.col === 1 ? pur : ice;
          for (var pass = 0; pass < 2; pass++) {
            c.strokeStyle = rc((pass ? 0.95 : 0.22) * al * (front ? 1 : 0.55));
            c.lineWidth = pass ? rd.wd : rd.wd * 6;
            c.beginPath();
            var pen = false;
            for (var sg = 0; sg < Q.segs; sg++) {
              if (buf[sg * 3 + 2] === front) {
                if (!pen) { c.moveTo(buf[sg * 3], buf[sg * 3 + 1]); pen = true; }
                c.lineTo(buf[(sg + 1) * 3], buf[(sg + 1) * 3 + 1]);
              } else pen = false;
            }
            c.stroke();
          }
        });
        c.globalCompositeOperation = "source-over";
      }
      drawRings(0);

      // Sólidos alámbricos y fragmentos en órbita
      var ea = function (tin) { return sm(tin, tin + 0.7, t) * (1 - sm(11.0, 11.7, t)); };
      c.globalCompositeOperation = "lighter";
      for (n = 0; n < D.solids.length; n++) {
        var so = D.solids[n], sal = ea(so.tin);
        if (sal < 0.02) continue;
        var psi = so.psi + (TAU * so.m * t) / T;
        var wx = Math.cos(psi) * so.rad * ringMul, wz = Math.sin(psi) * so.rad * ringMul, wy = Math.sin(psi * 2 + so.psi) * 0.4 + so.yo * 0.5;
        pr(wx, wy + sst.fy, wz, o2);
        wire(so.cube ? CUBE_V : OCTA_V, so.cube ? CUBE_E : OCTA_E, so.size, wx, wy + sst.fy, wz, (TAU * so.k1 * t) / T, (TAU * so.k2 * t) / T, so.col ? pur : yel, sal, clamp(1.3 * o2[2], 0.8, 2.6));
      }
      for (n = 0; n < D.frags.length; n++) {
        var fr = D.frags[n], fal = ea(2.6 + fr.ph * 0.2);
        if (fal < 0.02) continue;
        var fp = fr.psi + (TAU * fr.m * t) / T;
        pr(Math.cos(fp) * fr.rad * ringMul, fr.yo + Math.sin(fp * 3) * 0.2 + sst.fy, Math.sin(fp) * fr.rad * ringMul, o1);
        if (o1[3] < 0.5) continue;
        var fz = fr.size * K * o1[2], frot = (TAU * fr.k * t) / T + fr.ph;
        c.fillStyle = fr.col ? pur(fal * 0.9) : yel(fal * 0.85);
        c.beginPath();
        for (var v = 0; v < 3; v++) { var aa2 = frot + (v / 3) * TAU; c[v ? "lineTo" : "moveTo"](o1[0] + Math.cos(aa2) * fz, o1[1] + Math.sin(aa2) * fz * 0.8); }
        c.closePath(); c.fill();
      }
      c.globalCompositeOperation = "source-over";

      // Estrella oficial: fragmentos que se ensamblan → objeto 3D
      var grad = starGradient(), charge = sm(5.4, TE, t);
      if (t < TE && t > 2.3) drawShards(t, sst.theta, sst.fy, grad);
      if (t >= TE) {
        if (Q.ghost && t < 9.0) for (var gI = 3; gI >= 1; gI--) { var s2 = starState(t - gI * 0.035); drawWholeStar(s2.theta, s2.phi, s2.fy, s2.m, 0, 0.16, grad, t, false); }
        drawWholeStar(sst.theta, sst.phi, sst.fy, sst.m, Q.layers, 1, grad, t, true);
      }
      if (charge > 0 && t < TE) {
        c.globalCompositeOperation = "lighter";
        g = c.createRadialGradient(scx, scy, 0, scx, scy, wu * K * SR * 2.2 * starS);
        g.addColorStop(0, yel(0.65 * charge)); g.addColorStop(1, yel(0));
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        c.globalCompositeOperation = "source-over";
      }
      drawRings(1);

      // Escombros que se acercan a la cámara
      if (t > 6.6 && t < 11.4) {
        c.globalCompositeOperation = "lighter";
        for (n = 0; n < D.debris.length; n++) {
          var db = D.debris[n], dq = (t - (db.tpass - 2.4)) / 2.4;
          if (dq < 0 || dq > 1) continue;
          var da = sm(0, 0.12, dq) * (1 - sm(0.86, 1, dq));
          pr(db.x, db.y, 7 - dq * 14, o2);
          wire(db.cube ? CUBE_V : OCTA_V, db.cube ? CUBE_E : OCTA_E, db.size, db.x, db.y, 7 - dq * 14, (TAU * db.spin * t) / 3, ((TAU * db.spin * t) / 3) * 0.7, db.col ? pur : yel, da, clamp(1.6 * o2[2], 1, 4));
        }
        c.globalCompositeOperation = "source-over";
      }

      // Explosión: destello, ondas, chispas
      if (e > 0) {
        c.globalCompositeOperation = "lighter";
        var fa = Math.exp(-e * 4.2);
        if (fa > 0.01) {
          g = c.createRadialGradient(scx, scy, 0, scx, scy, maxDim * (0.25 + e * 0.9));
          g.addColorStop(0, "rgba(255,240,190," + (0.95 * fa).toFixed(3) + ")"); g.addColorStop(0.35, yel(0.55 * fa)); g.addColorStop(1, yel(0));
          c.fillStyle = g; c.fillRect(0, 0, W, H);
        }
        c.lineCap = "round";
        [0, 0.38, 0.85].forEach(function (dly, wi) {
          var wq = (e - dly) / 1.7;
          if (wq <= 0 || wq >= 1) return;
          c.strokeStyle = wi === 1 ? pur(0.9 * (1 - wq)) : wi === 2 ? ice(0.7 * (1 - wq)) : yel(0.95 * (1 - wq));
          c.lineWidth = 1 + 9 * (1 - wq) * (wi === 0 ? 1 : 0.6);
          c.beginPath(); c.arc(scx, scy, easeOut(wq) * maxDim * (wi === 0 ? 0.8 : 0.62), 0, TAU); c.stroke();
        });
        if (e < 2.8) {
          var life = 1 - e / 2.8;
          for (n = 0; n < D.sparks.length; n++) {
            var sp = D.sparks[n];
            var dist = (sp.v * (1 - Math.exp(-2.4 * e))) / 2.4, dist0 = (sp.v * (1 - Math.exp(-2.4 * Math.max(0, e - 0.045)))) / 2.4;
            pr(sp.dx * dist, sp.dy * dist + sst.fy, sp.dz * dist, o1);
            pr(sp.dx * dist0, sp.dy * dist0 + sst.fy, sp.dz * dist0, o2);
            if (o1[3] < 0.5) continue;
            var spa = Math.pow(life, 1.4);
            c.strokeStyle = sp.col === 0 ? yel(spa) : sp.col === 1 ? ice(spa * 0.9) : pur(spa);
            c.lineWidth = clamp(2.2 * o1[2], 0.8, 4);
            c.beginPath(); c.moveTo(o2[0], o2[1]); c.lineTo(o1[0], o1[1]); c.stroke();
          }
        }
        c.globalCompositeOperation = "source-over";
      }

      // Destello de lente anamórfico
      var la = Math.max(e > 0 ? Math.exp(-e * 2.2) : 0, sm(9.0, 9.6, t) * (1 - sm(11.0, 11.5, t)) * 0.6);
      if (la > 0.02) {
        c.globalCompositeOperation = "lighter";
        g = c.createLinearGradient(0, scy, W, scy);
        g.addColorStop(0, yel(0)); g.addColorStop(0.5, "rgba(255,236,170," + (0.9 * la).toFixed(3) + ")"); g.addColorStop(1, yel(0));
        c.fillStyle = g; c.fillRect(0, scy - 2, W, 4);
        c.fillStyle = pur(0.25 * la); c.fillRect(0, scy - 14, W, 28);
        c.globalCompositeOperation = "source-over";
      }

      // HUD tecnológico
      var ha = sm(2.2, 3.0, t) * (1 - sm(10.8, 11.5, t));
      if (ha > 0.02) {
        var mg = Math.min(W, H) * 0.05, LL = 26;
        c.strokeStyle = ice(0.75 * ha); c.lineWidth = 2; c.lineCap = "butt";
        c.beginPath();
        c.moveTo(mg, mg + LL); c.lineTo(mg, mg); c.lineTo(mg + LL, mg);
        c.moveTo(W - mg - LL, mg); c.lineTo(W - mg, mg); c.lineTo(W - mg, mg + LL);
        c.moveTo(mg, H - mg - LL); c.lineTo(mg, H - mg); c.lineTo(mg + LL, H - mg);
        c.moveTo(W - mg - LL, H - mg); c.lineTo(W - mg, H - mg); c.lineTo(W - mg, H - mg - LL);
        c.stroke();
        c.strokeStyle = ice(0.3 * ha); c.lineWidth = 1; c.beginPath();
        var step = 18, off = (t * 36) % step;
        for (var hx = mg + LL + 8 - off; hx < W - mg - LL - 8; hx += step) {
          if (hx < mg + LL + 8) continue;
          var tl = Math.round(hx / step) % 4 === 0 ? 10 : 5;
          c.moveTo(hx, H - mg); c.lineTo(hx, H - mg - tl);
        }
        c.stroke();
        var sy2 = fract(t / 3) * H;
        g = c.createLinearGradient(0, sy2 - 40, 0, sy2);
        g.addColorStop(0, yel(0)); g.addColorStop(1, yel(0.2 * ha));
        c.fillStyle = g; c.fillRect(0, sy2 - 40, W, 40);
        c.fillStyle = yel(0.6 * ha); c.fillRect(0, sy2, W, 1);
      }

      // Bloom controlado (copia reducida sumada con 'lighter')
      if (bctx) {
        bctx.globalCompositeOperation = "copy";
        bctx.drawImage(canvas, 0, 0, bloom.width, bloom.height);
        c.globalCompositeOperation = "lighter";
        c.globalAlpha = Q.bloomAlpha * (0.8 + 0.5 * godI);
        c.imageSmoothingEnabled = true; c.imageSmoothingQuality = "high";
        c.drawImage(bloom, 0, 0, W, H);
        c.globalAlpha = 1; c.globalCompositeOperation = "source-over";
      }

      // Destello de bucle (cierre → inicio)
      var lf = loopFlash(t);
      if (lf > 0.003) {
        g = c.createRadialGradient(scx, scy, 0, scx, scy, maxDim * 0.9);
        g.addColorStop(0, "rgba(255,246,214," + lf.toFixed(3) + ")");
        g.addColorStop(0.6, "rgba(255,198,0," + (lf * 0.95).toFixed(3) + ")");
        g.addColorStop(1, "rgba(115,0,255," + (lf * 0.9).toFixed(3) + ")");
        c.fillStyle = g; c.fillRect(0, 0, W, H);
      }
    }

    var raf = 0, running = false, clock = 0.6, last = 0, acc = 0, nf = 0, adapted = low;
    function frame(now) {
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now; clock = (clock + dt) % T;
      render(clock);
      if (!adapted) {
        acc += dt; nf++;
        if (nf === 90) { if (acc / nf > 0.027) { Q = LOW; D = build(Q); resize(); } adapted = true; }
      }
      raf = requestAnimationFrame(frame);
    }

    resize();
    render(0);
    return {
      start: function () { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); },
      stop: function () { running = false; cancelAnimationFrame(raf); },
      renderStill: function (t) { resize(); render(t === undefined ? 9.8 : t); },
      resize: function () { resize(); if (!running) render(clock); },
      seek: function (t) { clock = t; render(t); },
      period: T
    };
  }
  window.StarsScene = { create: create, LOOP_SECONDS: T };
})();

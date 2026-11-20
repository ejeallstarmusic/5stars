/* 5STARS · Hero 3D con materiales cromados y plastificados
   WebGL puro (sin librerías): una estrella 3D de cromo dorado, anillos de cromo violeta
   y esferas de plástico brillante en los colores de la marca (#7300FF, #FFC600, #0B0909, #E8EDF2),
   con reflejos de estudio sobre un piso lacado. Bucle de 12 s. Si el navegador no soporta WebGL,
   main.js usa la animación 2D de scene.js. */
(function () {
  "use strict";
  var T = 12;

  var VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}";

  var FRAG = [
    "precision highp float;",
    "uniform vec2 uRes;uniform float uT;uniform float uIntro;uniform vec2 uMouse;",
    "const float PI=3.14159265;",
    "mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}",
    /* estrella de 5 puntas (iq) */
    "float sdStar(vec2 p,float r,float m){",
    " float an=PI/5.0;float en=PI/m;vec2 acs=vec2(cos(an),sin(an));vec2 ecs=vec2(cos(en),sin(en));",
    " float bn=mod(atan(p.x,p.y),2.0*an)-an;p=length(p)*vec2(cos(bn),abs(sin(bn)));",
    " p-=r*acs;p+=ecs*clamp(-dot(p,ecs),0.0,r*acs.y/ecs.y);return length(p)*sign(p.x);}",
    "float sdStarExt(vec3 p){",
    " float d=sdStar(p.xy,1.0,3.5);",
    " float k=clamp(-d/0.4,0.0,1.0);float hh=0.07+0.2*(1.0-(1.0-k)*(1.0-k));",
    " vec2 w=vec2(d+0.06,abs(p.z)-hh+0.06);",
    " return min(max(w.x,w.y),0.0)+length(max(w,0.0))-0.06;}",
    "float sdTorus(vec3 p,vec2 t){vec2 q=vec2(length(p.xz)-t.x,p.y);return length(q)-t.y;}",
    "float sdCaps(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);return length(pa-ba*h)-r;}",
    /* animación periódica (12 s) */
    "float gA=0.0;float gS=1.0;",
    "vec3 s1,s2,s3,s4,s5a,s5b;",
    "void anim(){",
    " gA=2.0*PI*uT/12.0;gS=uIntro;",
    " s1=vec3(2.45*cos(gA+0.6),0.55*sin(gA*2.0)+0.55,2.45*sin(gA+0.6));",
    " s2=vec3(1.9*cos(-gA*2.0+2.3),-0.45+0.35*sin(gA*3.0),1.9*sin(-gA*2.0+2.3));",
    " s3=vec3(3.1*cos(gA+3.9),-0.9+0.25*sin(gA*2.0+1.0),3.1*sin(gA+3.9)-0.6);",
    " s4=vec3(1.35*cos(-gA*3.0+1.1),1.5+0.2*sin(gA*2.0),1.35*sin(-gA*3.0+1.1));",
    " vec3 c=vec3(-2.6*cos(gA*1.0+5.2),0.9+0.3*sin(gA*2.0+2.0),-2.6*sin(gA*1.0+5.2));",
    " vec3 dd=vec3(cos(gA*2.0),0.35,sin(gA*2.0))*0.34;s5a=c-dd;s5b=c+dd;}",
    /* escena: x = distancia, y = material */
    "vec2 mp(vec3 p){",
    " float yb=0.06*sin(gA*2.0);",
    " vec3 q=p-vec3(0.0,yb,0.0);q.xz*=rot(0.95*sin(gA));q.yz*=rot(0.18*sin(gA*2.0+1.0));",
    " float sc=max(gS,0.001);",
    " vec2 r=vec2(sdStarExt(q/(sc*1.25))*sc*1.25,1.0);",
    " vec3 t=p;t.xy*=rot(1.05+0.12*sin(gA));t.xz*=rot(-gA*2.0);",
    " r=r.x<sdTorus(t,vec2(1.78,0.085)*sc)?r:vec2(sdTorus(t,vec2(1.78,0.085)*sc),2.0);",
    " vec3 u=p;u.xy*=rot(-0.5);u.yz*=rot(0.35);u.xz*=rot(gA*1.0);",
    " float d3=sdTorus(u,vec2(2.5,0.05)*sc);r=r.x<d3?r:vec2(d3,3.0);",
    " float d4=length(p-s1*sc)-0.23*sc;r=r.x<d4?r:vec2(d4,4.0);",
    " d4=length(p-s2*sc)-0.17*sc;r=r.x<d4?r:vec2(d4,5.0);",
    " d4=length(p-s3*sc)-0.34*sc;r=r.x<d4?r:vec2(d4,6.0);",
    " d4=length(p-s4*sc)-0.12*sc;r=r.x<d4?r:vec2(d4,7.0);",
    " d4=sdCaps(p,s5a*sc,s5b*sc,0.13*sc);r=r.x<d4?r:vec2(d4,5.0);",
    " float fl=p.y+1.75;r=r.x<fl?r:vec2(fl,8.0);",
    " return r;}",
    "vec3 nrm(vec3 p){vec2 e=vec2(0.0015,-0.0015);",
    " return normalize(e.xyy*mp(p+e.xyy).x+e.yyx*mp(p+e.yyx).x+e.yxy*mp(p+e.yxy).x+e.xxx*mp(p+e.xxx).x);}",
    "vec2 march(vec3 ro,vec3 rd,int steps,float tmax){",
    " float t=0.02;float id=0.0;",
    " for(int i=0;i<90;i++){",
    "  if(i>=steps)break;",
    "  vec2 h=mp(ro+rd*t);",
    "  if(h.x<0.0009*t){id=h.y;break;}",
    "  t+=h.x*0.8;",
    "  if(t>tmax)break;}",
    " if(t>tmax)id=0.0;",
    " return vec2(t,id);}",
    /* entorno de estudio con los colores de la marca */
    "vec3 env(vec3 d){",
    " float y=d.y;float az=atan(d.x,d.z);",
    " vec3 col=mix(vec3(0.008,0.004,0.016),vec3(0.10,0.0,0.36),smoothstep(0.15,1.0,y));",
    " col+=vec3(1.0,0.72,0.04)*0.75*exp(-pow((y+0.02)*4.5,2.0));",
    " float sw=0.55*sin(2.0*PI*uT/12.0);",
    " float a1=abs(mod(az-(0.95+sw)+PI,2.0*PI)-PI);",
    " float b1=smoothstep(0.0,0.07,0.42-a1)*smoothstep(0.0,0.09,0.42-abs(y-0.42));",
    " col+=vec3(6.0)*b1;",
    " float a2=abs(mod(az+1.45+PI,2.0*PI)-PI);",
    " float b2=smoothstep(0.0,0.04,0.09-a2)*smoothstep(0.0,0.08,0.75-abs(y-0.15));",
    " col+=vec3(1.0,0.9,0.7)*4.5*b2;",
    " float a3=abs(mod(az-2.7+PI,2.0*PI)-PI);",
    " float b3=smoothstep(0.0,0.05,0.11-a3)*smoothstep(0.0,0.08,0.8-abs(y-0.2));",
    " col+=vec3(0.55,0.15,2.0)*1.4*b3;",
    " float tp=smoothstep(0.0,0.06,0.5-length(vec2(az+0.4,(y-1.05)*1.6)));",
    " col+=vec3(2.2,1.9,2.6)*tp*step(0.85,y+0.4);",
    " col=mix(col,vec3(0.01,0.005,0.02)+vec3(1.0,0.7,0.05)*0.03*exp(y*8.0),smoothstep(0.0,-0.3,y));",
    " return col;}",
    "vec3 bgc(vec2 uv){",
    " float g=exp(-dot(uv*vec2(0.7,0.9),uv*vec2(0.7,0.9))*1.6);",
    " vec3 b=vec3(0.043,0.035,0.035)+vec3(0.16,0.0,0.42)*g*0.26+vec3(0.25,0.18,0.0)*exp(-pow((uv.y+0.62)*3.2,2.0))*0.18;",
    " return b;}",
    "float ao(vec3 p,vec3 n){float o=0.0;float s=1.0;",
    " for(int i=1;i<4;i++){float h=0.14*float(i);o+=(h-mp(p+n*h).x)*s;s*=0.6;}",
    " return clamp(1.0-1.7*o,0.25,1.0);}",
    /* sombreado sin rebote */
    "vec3 shade0(vec3 p,vec3 n,vec3 rd,float id,vec2 uv){",
    " vec3 r=reflect(rd,n);float ndv=max(dot(n,-rd),0.0);",
    " float fr=pow(1.0-ndv,5.0);",
    " vec3 L=normalize(vec3(-0.55,0.9,0.65));",
    " vec3 H=normalize(L-rd);",
    " float a=ao(p,n);",
    " vec3 col=vec3(0.0);",
    " if(id<1.5){vec3 tint=vec3(1.0,0.76,0.12);col=env(r)*tint*(0.78+0.5*fr)*a+tint*0.04;col+=pow(max(dot(n,H),0.0),180.0)*1.6;}",
    " else if(id<2.5){vec3 tint=vec3(0.62,0.22,1.0);col=env(r)*tint*(0.82+0.5*fr)*a+tint*0.03;col+=pow(max(dot(n,H),0.0),160.0)*1.3;}",
    " else{",
    "  vec3 alb=vec3(0.0);float cc=0.9;",
    "  if(id<3.5)alb=vec3(0.015,0.012,0.02);",
    "  else if(id<4.5)alb=vec3(1.0,0.72,0.0);",
    "  else if(id<5.5)alb=vec3(0.45,0.0,1.0);",
    "  else if(id<6.5)alb=vec3(0.02,0.015,0.03);",
    "  else if(id<7.5)alb=vec3(0.9,0.92,0.95);",
    "  else{alb=vec3(0.02,0.012,0.045);cc=1.0;}",
    "  float df=max(dot(n,L),0.0);",
    "  vec3 amb=mix(vec3(0.05,0.02,0.12),vec3(0.14,0.1,0.22),n.y*0.5+0.5);",
    "  float f=0.05+0.95*fr;if(id>7.5)f=0.03+0.55*pow(1.0-ndv,3.0);",
    "  col=alb*(df*0.95+amb)*a*(1.0-f)+env(r)*f*cc*a;",
    "  col+=pow(max(dot(n,H),0.0),120.0)*(id>7.5?0.35:1.1);",
    "  if(id>7.5){float gl=exp(-pow(length(p.xz)*0.32,2.0));col+=vec3(0.16,0.0,0.45)*gl*0.28;",
    "   vec2 gp=abs(fract(p.xz*0.5)-0.5);float gr=smoothstep(0.015,0.0,min(gp.x,gp.y));col+=vec3(0.45,0.15,1.0)*gr*0.07*gl;}",
    " }",
    " return col;}",
    /* sombreado con un rebote de reflexión */
    "vec3 shade1(vec3 p,vec3 n,vec3 rd,float id,vec2 uv){",
    " vec3 base=shade0(p,n,rd,id,uv);",
    " float k=0.0;",
    " if(id<2.5)k=0.62;else if(id>7.5)k=0.5;else k=0.22;",
    " vec3 r=reflect(rd,n);",
    " vec2 h=march(p+n*0.012,r,36,14.0);",
    " if(h.y>0.5){vec3 p2=p+n*0.012+r*h.x;vec3 n2=nrm(p2);vec3 c2=shade0(p2,n2,r,h.y,uv);",
    "  if(id<2.5){float tr=id<1.5?1.0:1.0;vec3 tint=id<1.5?vec3(1.0,0.76,0.12):vec3(0.62,0.22,1.0);base=mix(base,c2*tint*1.4,k*0.55);}",
    "  else if(id>7.5){base+=c2*0.42*pow(1.0-max(dot(n,-rd),0.0),1.5)+c2*0.2;}",
    "  else base+=c2*k*0.35;}",
    " return base;}",
    "void main(){",
    " vec2 uv=(gl_FragCoord.xy*2.0-uRes)/uRes.y;",
    " anim();",
    " float asp=uRes.x/uRes.y;",
    " float dist=max(5.6,4.6/asp);",
    " float yaw=0.38*sin(2.0*PI*uT/12.0)+uMouse.x*0.28;",
    " vec3 ro=vec3(sin(yaw)*dist,0.55+uMouse.y*0.45+0.1*sin(gA),cos(yaw)*dist);",
    " vec3 ta=vec3(0.0,0.0,0.0);",
    " vec3 ww=normalize(ta-ro);vec3 uu=normalize(cross(ww,vec3(0.0,1.0,0.0)));vec3 vv=cross(uu,ww);",
    " vec3 rd=normalize(uv.x*uu+uv.y*vv+1.9*ww);",
    " vec3 col=bgc(uv);",
    " vec2 h=march(ro,rd,88,26.0);",
    " if(h.y>0.5){",
    "  vec3 p=ro+rd*h.x;vec3 n=nrm(p);",
    "  vec3 c=shade1(p,n,rd,h.y,uv);",
    "  if(h.y>7.5)c=mix(c,col,smoothstep(7.0,17.0,h.x));",
    "  col=c;}",
    " col*=1.0+0.35*uIntro*0.0;",
    /* tono */
    " col=(col*(2.51*col+0.03))/(col*(2.43*col+0.59)+0.14);",
    " col=pow(clamp(col,0.0,1.0),vec3(1.0/2.15));",
    " col*=1.0-0.28*dot(uv*0.5,uv*0.5);",
    " col+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-0.5)/255.0;",
    " gl_FragColor=vec4(col,1.0);}"
  ].join("\n");

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { return null; }
    return s;
  }
  function program(gl) {
    var v = compile(gl, gl.VERTEX_SHADER, VERT), f = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!v || !f) return null;
    var p = gl.createProgram();
    gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
    return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
  }
  function getGL(canvas) {
    var o = { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: "high-performance", preserveDrawingBuffer: false };
    return canvas.getContext("webgl", o) || canvas.getContext("experimental-webgl", o);
  }

  function create(canvas, host) {
    /* Se prueba primero en un lienzo aparte: si falla, el lienzo real queda libre para la animación 2D */
    try {
      var test = document.createElement("canvas");
      var tg = getGL(test);
      if (!tg || !program(tg)) return null;
      var ext = tg.getExtension("WEBGL_lose_context"); if (ext) ext.loseContext();
    } catch (e) { return null; }

    var gl = getGL(canvas);
    if (!gl) return null;
    var prog = program(gl);
    if (!prog) return null;
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uRes = gl.getUniformLocation(prog, "uRes"), uT = gl.getUniformLocation(prog, "uT"),
        uIntro = gl.getUniformLocation(prog, "uIntro"), uMouse = gl.getUniformLocation(prog, "uMouse");

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var scale = Math.max(1, Math.min(dpr, 1.5));
    var MAXPX = 2400000;
    var mx = 0, my = 0, tx = 0, ty = 0;
    var clock = 0, intro = 0.001, introT = 0;

    function resize() {
      var w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
      var k = scale; var pw = w * k, ph = h * k;
      if (pw * ph > MAXPX) { var f = Math.sqrt(MAXPX / (pw * ph)); pw *= f; ph *= f; }
      canvas.width = Math.round(pw); canvas.height = Math.round(ph);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    function render(t) {
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uT, t);
      gl.uniform1f(uIntro, intro);
      gl.uniform2f(uMouse, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    host.addEventListener("pointermove", function (e) {
      var r = host.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = -((e.clientY - r.top) / r.height - 0.5) * 2;
    });

    var raf = 0, running = false, last = 0, acc = 0, nf = 0;
    function frame(now) {
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now; clock = (clock + dt) % T;
      if (introT >= 0) { introT += dt; var x = Math.min(introT / 1.6, 1); intro = 1 - Math.pow(1 - x, 3); if (x >= 1) introT = -1; }
      mx += (tx - mx) * 0.06; my += (ty - my) * 0.06;
      render(clock);
      acc += dt; nf++;
      if (nf === 45) {
        var avg = acc / nf; acc = 0; nf = 0;
        if (avg > 0.034 && scale > 0.55) { scale = Math.max(0.55, scale * 0.85); resize(); }
      }
      raf = requestAnimationFrame(frame);
    }

    resize();
    render(0);
    return {
      start: function () { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); },
      stop: function () { running = false; cancelAnimationFrame(raf); },
      renderStill: function (t) { intro = 1; introT = -1; resize(); render(t === undefined ? 3.2 : t); },
      resize: function () { resize(); if (!running) render(clock); },
      seek: function (t) { clock = t; render(t); },
      period: T,
      kind: "webgl"
    };
  }
  window.StarsScene3D = { create: create, LOOP_SECONDS: T };
})();

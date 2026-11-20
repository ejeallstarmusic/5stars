/* 5STARS · Hero 3D en formato historia (20 s, en bucle)
   WebGL puro, sin librerías. Materiales cromados y plastificados en los colores de la marca.
   Escena 1 (0–4 s)   El universo de las ideas: la estrella descubre una esfera brillante.
   Escena 2 (4–8 s)   La transformación: la esfera se vuelve una pantalla y aparece la tienda.
   Escena 3 (8–15 s)  Construyendo experiencias: productos, carrito, pago y celular se conectan.
   Escena 4 (15–20 s) Tu negocio comienza a brillar: la cámara se aleja y la estrella señala la tienda.
   Si el navegador no soporta WebGL, main.js usa la animación 2D de scene.js. */
(function () {
  "use strict";
  var T = 20;
  var MSG_FROM = 17.3, MSG_TO = 19.4;

  var VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}";

  var FRAG = `
precision highp float;
uniform vec2 uRes;uniform float uT;uniform vec2 uMouse;
const float PI=3.14159265;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float ss(float a,float b,float x){float t=clamp((x-a)/(b-a),0.0,1.0);return t*t*(3.0-2.0*t);}
float eob(float x){x=clamp(x,0.0,1.0);float y=x-1.0;return 1.0+2.7*y*y*y+1.7*y*y;}
float h11(float n){return fract(sin(n*127.1)*43758.5453);}
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}

float sdStar(vec2 p,float r,float m){
  float an=PI/5.0;float en=PI/m;vec2 acs=vec2(cos(an),sin(an));vec2 ecs=vec2(cos(en),sin(en));
  float bn=mod(atan(p.x,p.y),2.0*an)-an;p=length(p)*vec2(cos(bn),abs(sin(bn)));
  p-=r*acs;p+=ecs*clamp(-dot(p,ecs),0.0,r*acs.y/ecs.y);return length(p)*sign(p.x);}
float sdStarExt(vec3 p){
  float d=sdStar(p.xy,1.0,3.5);
  float k=clamp(-d/0.4,0.0,1.0);float hh=0.07+0.2*(1.0-(1.0-k)*(1.0-k));
  vec2 w=vec2(d+0.06,abs(p.z)-hh+0.06);
  return min(max(w.x,w.y),0.0)+length(max(w,0.0))-0.06;}
float sdRB(vec3 p,vec3 b,float r){vec3 q=abs(p)-b+r;return length(max(q,0.0))+min(max(q.x,max(q.y,q.z)),0.0)-r;}
float sdCaps(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/max(dot(ba,ba),0.0001),0.0,1.0);return length(pa-ba*h)-r;}

/* ---- estado de la historia ---- */
vec3 gStar;float gSS,gYaw,gPitch,gArm;
vec3 gSP;float gSR;
vec3 gPM;float gPS,gPYaw,gLB,gBuild;
vec3 gPh;float gPhS,gPhYaw,gBuildPh;
vec3 gTb;float gTbS,gTbYaw;
vec3 gC0,gC1,gC2;float gCS0,gCS1,gCS2;
vec3 gCart;float gCartS;vec3 gPay;float gPayS;
vec3 gB0,gB1,gB2,gB3;float gBW;
float gFlash;

void anim(){
  float t=uT;
  /* estrella */
  float ssz=eob(t/1.3)*0.55;
  ssz=mix(ssz,0.85,ss(8.0,9.2,t));ssz=mix(ssz,1.0,ss(14.8,16.0,t));
  gSS=ssz;
  vec3 a=vec3(-1.7,0.15+0.1*sin(t*1.6),0.0);
  a.y+=0.3*sin(PI*clamp((t-2.4)/0.6,0.0,1.0));
  vec3 touch=vec3(0.2,0.45,0.0);
  vec3 back=vec3(-1.1,0.55,0.6);
  vec3 s3=vec3(-1.9+0.4*sin(t*1.1),0.5+0.25*sin(t*1.7),0.7+0.3*cos(t*0.9));
  vec3 s4=vec3(-3.1,-0.25+0.07*sin(t*2.0),1.3);
  gStar=a;
  gStar=mix(gStar,touch,ss(3.3,4.3,t));
  gStar=mix(gStar,back,ss(4.6,5.6,t));
  gStar=mix(gStar,s3,ss(7.6,8.6,t));
  gStar=mix(gStar,s4,ss(14.8,16.0,t));
  float yaw=mix(-0.45+0.2*sin(t*0.9),-0.1,ss(3.0,4.0,t));
  yaw=mix(yaw,0.45*sin(t*1.4),ss(7.5,8.5,t));
  yaw=mix(yaw,-0.65,ss(14.8,16.0,t));
  yaw+=6.2832*ss(4.3,5.1,t);
  gYaw=yaw;gPitch=0.1*sin(t*1.3);
  gArm=ss(15.8,16.7,t);
  /* esfera idea */
  gSP=vec3(1.5,0.45+0.06*sin(t*1.3),-0.2);
  gSR=0.5*eob((t-0.4)/1.2)*(1.0-ss(4.3,5.0,t))*(1.0+0.05*sin(t*5.0));
  /* pantalla principal / laptop */
  float k4=ss(14.8,16.2,t);
  gPM=mix(vec3(1.5,0.45,-0.2),vec3(0.35,0.62,0.0),k4);
  gPS=eob((t-4.3)/1.5)*mix(1.0,1.2,k4);
  gPYaw=mix(-0.28,-0.05,k4)+0.04*sin(t*0.7);
  gLB=ss(15.0,16.0,t);
  gBuild=clamp((t-5.0)/6.0,0.0,1.0);
  /* elementos que se organizan en la escena 3 */
  float f0=eob((t-8.3)/1.0),f1=eob((t-8.75)/1.0),f2=eob((t-9.2)/1.0);
  float f3=eob((t-9.65)/1.0),f4=eob((t-10.1)/1.0),f5=eob((t-10.55)/1.0);
  vec3 T0=mix(vec3(0.15,1.55,0.9),vec3(-0.9,1.9,0.8),k4);
  vec3 T1=mix(vec3(1.7,1.85,0.6),vec3(0.6,2.3,0.4),k4);
  vec3 T2=mix(vec3(3.1,1.5,0.8),vec3(2.1,2.0,0.6),k4);
  vec3 TC=mix(vec3(0.25,-0.6,1.1),vec3(-1.4,-0.5,1.2),k4);
  vec3 TP=mix(vec3(2.1,-0.95,1.2),vec3(1.4,-0.95,1.5),k4);
  vec3 TH=mix(vec3(3.5,0.2,0.8),vec3(3.5,-0.15,0.7),k4);
  vec3 o=gStar+vec3(0.0,0.0,0.4);
  gC0=mix(o,T0,f0)+vec3(0.0,0.06*sin(t*1.9),0.0);gCS0=f0*0.95;
  gC1=mix(o,T1,f1)+vec3(0.0,0.06*sin(t*1.9+1.3),0.0);gCS1=f1*0.95;
  gC2=mix(o,T2,f2)+vec3(0.0,0.06*sin(t*1.9+2.6),0.0);gCS2=f2*0.95;
  gCart=mix(o,TC,f3)+vec3(0.0,0.05*sin(t*1.7),0.0);gCartS=f3*mix(0.9,1.1,k4);
  gPay=mix(o,TP,f4)+vec3(0.0,0.05*sin(t*1.7+1.0),0.0);gPayS=f4*0.9;
  gPh=mix(o,TH,f5);gPhS=f5*mix(0.9,1.3,k4);gPhYaw=-0.35+0.1*sin(t);
  gBuildPh=clamp((t-10.4)/2.6,0.0,1.0);
  gTb=vec3(2.4,1.25,-1.4);gTbS=ss(15.2,16.4,t);gTbYaw=-0.3;
  /* rayos de conexión */
  gB0=mix(gStar,gC0,ss(9.0,9.8,t));gB1=mix(gStar,gC1,ss(9.5,10.3,t));
  gB2=mix(gStar,gCart,ss(10.0,10.8,t));gB3=mix(gStar,gPh,ss(10.8,11.6,t));
  gBW=ss(8.8,9.2,t)*(1.0-ss(14.6,15.6,t));
  /* destellos */
  float f=0.0;
  f+=step(4.35,t)*exp(-(t-4.35)*7.0);
  f+=0.5*step(8.0,t)*exp(-(t-8.0)*8.0);
  f+=0.7*step(15.3,t)*exp(-(t-15.3)*6.0);
  f+=1.0*step(17.6,t)*exp(-(t-17.6)*5.0);
  gFlash=f;
}

vec2 dm(vec2 r,float d,float id){return d<r.x?vec2(d,id):r;}

vec2 mp(vec3 p){
  vec2 r=vec2(p.y+1.7,8.0);
  /* estrella cromada con cara */
  if(gSS>0.01){
    vec3 q=p-gStar;q.xz*=rot(gYaw);q.yz*=rot(gPitch);
    float s=gSS*1.25;
    vec3 u=q/s;
    float d=sdStarExt(u)*s;
    r=dm(r,d,1.0);
    if(d<0.35*s){
      float e1=length(u-vec3(-0.16,0.08,0.25))-0.055;
      float e2=length(u-vec3(0.16,0.08,0.25))-0.055;
      float sm=min(min(length(u-vec3(-0.1,-0.07,0.255))-0.028,length(u-vec3(-0.045,-0.115,0.26))-0.028),min(length(u-vec3(0.045,-0.115,0.26))-0.028,length(u-vec3(0.1,-0.07,0.255))-0.028));
      r=dm(r,min(min(e1,e2),sm)*s,3.0);
    }
    if(gArm>0.01){
      vec3 a0=vec3(0.45,-0.02,0.1);vec3 a1=a0+vec3(0.85,0.2,0.05)*gArm;
      float da=sdCaps(u,a0,a1,0.075)*s;
      da=min(da,(length(u-a1)-0.11)*s);
      r=dm(r,da,4.0);
    }
  }
  /* esfera de la idea */
  if(gSR>0.01)r=dm(r,length(p-gSP)-gSR,9.0);
  /* pantalla principal y base de laptop */
  if(gPS>0.01){
    vec3 q=p-gPM;q.xz*=rot(gPYaw);
    r=dm(r,sdRB(q,vec3(1.56,0.98,0.03)*gPS,0.04*gPS),3.0);
    r=dm(r,sdRB(q-vec3(0.0,0.0,0.03*gPS),vec3(1.5,0.92,0.004)*gPS,0.0),10.0);
    if(gLB>0.01){
      vec3 b=q-vec3(0.0,-0.98*gPS-0.02,0.62*gPS);
      r=dm(r,sdRB(b,vec3(1.62*gPS,0.03*gPS,0.64*gPS*gLB),0.03*gPS),3.0);
    }
  }
  /* celular */
  if(gPhS>0.01){
    vec3 q=p-gPh;q.xz*=rot(gPhYaw);
    r=dm(r,sdRB(q,vec3(0.3,0.6,0.035)*gPhS,0.06*gPhS),3.0);
    r=dm(r,sdRB(q-vec3(0.0,0.0,0.034*gPhS),vec3(0.27,0.56,0.004)*gPhS,0.0),11.0);
  }
  /* tablet */
  if(gTbS>0.01){
    vec3 q=p-gTb;q.xz*=rot(gTbYaw);
    r=dm(r,sdRB(q,vec3(0.62,0.44,0.03)*gTbS,0.05*gTbS),3.0);
    r=dm(r,sdRB(q-vec3(0.0,0.0,0.03*gTbS),vec3(0.57,0.39,0.004)*gTbS,0.0),12.0);
  }
  /* tarjetas de producto */
  if(gCS0>0.01){vec3 q=p-gC0;q.xz*=rot(0.35*sin(uT*0.8));r=dm(r,sdRB(q,vec3(0.32,0.4,0.02)*gCS0,0.03*gCS0),20.0);}
  if(gCS1>0.01){vec3 q=p-gC1;q.xz*=rot(0.35*sin(uT*0.8+1.7));r=dm(r,sdRB(q,vec3(0.32,0.4,0.02)*gCS1,0.03*gCS1),21.0);}
  if(gCS2>0.01){vec3 q=p-gC2;q.xz*=rot(0.35*sin(uT*0.8+3.4));r=dm(r,sdRB(q,vec3(0.32,0.4,0.02)*gCS2,0.03*gCS2),22.0);}
  /* carrito de compras (cromo violeta) */
  if(gCartS>0.01){
    vec3 q=p-gCart;q.xz*=rot(0.5+0.3*sin(uT*0.7));float s=gCartS;
    float d=sdRB(q,vec3(0.3,0.15,0.2)*s,0.04*s);
    d=min(d,sdCaps(q,vec3(-0.34,0.12,0.0)*s,vec3(-0.46,0.46,0.0)*s,0.028*s));
    d=min(d,sdCaps(q,vec3(-0.46,0.46,-0.12)*s,vec3(-0.46,0.46,0.12)*s,0.028*s));
    r=dm(r,d,2.0);
    float w=min(length(q-vec3(-0.2,-0.22,0.12)*s),min(length(q-vec3(0.2,-0.22,0.12)*s),min(length(q-vec3(-0.2,-0.22,-0.12)*s),length(q-vec3(0.2,-0.22,-0.12)*s))))-0.06*s;
    r=dm(r,w,3.0);
  }
  /* tarjeta de pago */
  if(gPayS>0.01){
    vec3 q=p-gPay;q.xz*=rot(-0.4+0.25*sin(uT*0.9));q.yz*=rot(0.35);float s=gPayS;
    r=dm(r,sdRB(q,vec3(0.5,0.32,0.014)*s,0.03*s),5.0);
    r=dm(r,sdRB(q-vec3(-0.28,0.08,0.012*s),vec3(0.1,0.075,0.006)*s,0.015*s),4.0);
  }
  /* rayos de conexión */
  if(gBW>0.01){
    float rb=0.013*gBW;
    float d=sdCaps(p,gStar,gB0,rb);
    d=min(d,sdCaps(p,gStar,gB1,rb));d=min(d,sdCaps(p,gStar,gB2,rb));d=min(d,sdCaps(p,gStar,gB3,rb));
    r=dm(r,d,30.0);
  }
  return r;}

vec3 nrm(vec3 p){vec2 e=vec2(0.0015,-0.0015);
  return normalize(e.xyy*mp(p+e.xyy).x+e.yyx*mp(p+e.yyx).x+e.yxy*mp(p+e.yxy).x+e.xxx*mp(p+e.xxx).x);}
vec2 march(vec3 ro,vec3 rd,int steps,float tmax){
  float t=0.02;float id=0.0;
  for(int i=0;i<80;i++){
    if(i>=steps)break;
    vec2 h=mp(ro+rd*t);
    if(h.x<0.0009*t){id=h.y;break;}
    t+=h.x*0.85;
    if(t>tmax)break;}
  if(t>tmax)id=0.0;
  return vec2(t,id);}

/* ---- entorno de estudio ---- */
vec3 env(vec3 d){
  float y=d.y;float az=atan(d.x,d.z);
  vec3 col=mix(vec3(0.008,0.004,0.016),vec3(0.10,0.0,0.36),smoothstep(0.15,1.0,y));
  col+=vec3(1.0,0.72,0.04)*0.7*exp(-pow((y+0.02)*4.5,2.0));
  float sw=0.55*sin(2.0*PI*uT/20.0);
  float a1=abs(mod(az-(0.95+sw)+PI,2.0*PI)-PI);
  float b1=smoothstep(0.0,0.07,0.42-a1)*smoothstep(0.0,0.09,0.42-abs(y-0.42));
  col+=vec3(6.0)*b1;
  float a2=abs(mod(az+1.45+PI,2.0*PI)-PI);
  float b2=smoothstep(0.0,0.04,0.09-a2)*smoothstep(0.0,0.08,0.75-abs(y-0.15));
  col+=vec3(1.0,0.9,0.7)*4.5*b2;
  float a3=abs(mod(az-2.7+PI,2.0*PI)-PI);
  float b3=smoothstep(0.0,0.05,0.11-a3)*smoothstep(0.0,0.08,0.8-abs(y-0.2));
  col+=vec3(0.55,0.15,2.0)*0.55*b3;
  col=mix(col,vec3(0.01,0.005,0.02)+vec3(1.0,0.7,0.05)*0.03*exp(y*8.0),smoothstep(0.0,-0.3,y));
  return col;}

vec3 parts(vec2 uv){
  vec3 c=vec3(0.0);
  for(int L=0;L<3;L++){
    float fl=float(L);float sc=6.0+fl*5.0;
    vec2 p=uv*sc;p.y-=uT/20.0*(2.0+fl*2.0);
    vec2 id=floor(p);vec2 f=fract(p)-0.5;
    float h=h21(id+fl*17.0);
    vec2 off=(vec2(h21(id+3.1),h21(id+7.7))-0.5)*0.6;
    float d=length(f-off);
    float tw=0.5+0.5*sin(2.0*PI*uT/20.0*floor(2.0+h*5.0)+h*40.0);
    float br=step(0.8,h)*exp(-d*d*(110.0+fl*50.0))*(0.35+0.65*tw);
    vec3 pc=h>0.95?vec3(1.0,0.78,0.15):(h>0.89?vec3(0.65,0.3,1.0):vec3(0.7,0.82,1.0));
    c+=pc*br*(1.0-0.22*fl);
  }
  return c;}

vec3 bgc(vec2 uv){
  float blue=1.0-ss(3.4,6.2,uT);
  vec3 navy=vec3(0.012,0.03,0.12)+vec3(0.02,0.05,0.2)*exp(-dot(uv,uv)*0.9);
  float g=exp(-dot(uv*vec2(0.7,0.9),uv*vec2(0.7,0.9))*1.6);
  vec3 brand=vec3(0.043,0.035,0.035)+vec3(0.16,0.0,0.42)*g*0.3+vec3(0.25,0.18,0.0)*exp(-pow((uv.y+0.62)*3.2,2.0))*0.14;
  vec3 b=mix(brand,navy,blue);
  return b+parts(uv)*mix(0.55,0.9,blue);}

float ao(vec3 p,vec3 n){float o=0.0;float s=1.0;
  for(int i=1;i<4;i++){float h=0.14*float(i);o+=(h-mp(p+n*h).x)*s;s*=0.6;}
  return clamp(1.0-1.7*o,0.25,1.0);}

/* ---- interfaces de la tienda ---- */
float rc(vec2 q,vec2 lo,vec2 hi){vec2 s=step(lo,q)*step(q,hi);return s.x*s.y;}
float rv(float st,float b){return smoothstep(st,st+0.12,b);}
vec3 prodImg(vec2 q,float i){
  vec3 c1=i<0.5?vec3(0.45,0.0,1.0):(i<1.5?vec3(1.0,0.78,0.0):(i<2.5?vec3(0.85,0.88,0.93):vec3(0.12,0.1,0.16)));
  vec3 c2=i<0.5?vec3(1.0,0.78,0.0):(i<1.5?vec3(0.45,0.0,1.0):(i<2.5?vec3(0.45,0.0,1.0):vec3(1.0,0.78,0.0)));
  vec3 c=mix(c1,c1*0.6,q.y);
  float d=length((q-vec2(0.5,0.52))*vec2(1.0,1.15));
  c=mix(c,c2,smoothstep(0.3,0.26,d));
  c=mix(c,vec3(1.0),smoothstep(0.1,0.0,length(q-vec2(0.38,0.64)))*0.35);
  return c;}
vec3 ui(vec2 q,float b,float cols){
  vec3 base=vec3(0.035,0.02,0.09);
  vec2 g=abs(fract(q*vec2(14.0,9.0))-0.5);
  base+=vec3(0.35,0.15,0.9)*smoothstep(0.47,0.5,max(g.x,g.y))*0.35;
  vec3 c=base;
  float m;
  /* encabezado */
  m=rc(q,vec2(0.0,0.9),vec2(1.0,1.0))*step(q.x,(b-0.05)*3.0);
  c=mix(c,vec3(0.043,0.035,0.035),m);
  m=rc(q,vec2(0.04,0.923),vec2(0.2,0.977))*rv(0.1,b);c=mix(c,vec3(1.0,0.78,0.0),m);
  m=rc(q,vec2(0.55,0.935),vec2(0.62,0.965))*rv(0.13,b)+rc(q,vec2(0.66,0.935),vec2(0.73,0.965))*rv(0.15,b)+rc(q,vec2(0.77,0.935),vec2(0.84,0.965))*rv(0.17,b)+rc(q,vec2(0.88,0.925),vec2(0.96,0.975))*rv(0.19,b);
  c=mix(c,vec3(0.78,0.8,0.86),m);
  /* categorías */
  m=rc(q,vec2(0.04,0.8),vec2(0.2,0.86))*rv(0.22,b);c=mix(c,vec3(0.45,0.0,1.0),m);
  m=rc(q,vec2(0.23,0.8),vec2(0.39,0.86))*rv(0.26,b);c=mix(c,vec3(1.0,0.78,0.0),m);
  m=rc(q,vec2(0.42,0.8),vec2(0.58,0.86))*rv(0.3,b)+rc(q,vec2(0.61,0.8),vec2(0.77,0.86))*rv(0.34,b);
  c=mix(c,vec3(0.85,0.88,0.93),m);
  /* banner */
  vec2 bq=(q-vec2(0.04,0.5))/vec2(0.92,0.27);
  m=rc(q,vec2(0.04,0.5),vec2(0.96,0.77))*rv(0.38,b);
  vec3 bc=mix(vec3(0.45,0.0,1.0),vec3(0.2,0.0,0.6),bq.x);
  bc=mix(bc,vec3(1.0,0.78,0.0),smoothstep(0.2,0.17,length((bq-vec2(0.78,0.5))*vec2(1.7,1.0))));
  bc=mix(bc,vec3(1.0),rc(bq,vec2(0.06,0.55),vec2(0.45,0.67)));
  bc=mix(bc,vec3(1.0,0.78,0.0),rc(bq,vec2(0.06,0.2),vec2(0.26,0.38)));
  c=mix(c,bc,m);
  /* productos */
  for(int i=0;i<3;i++){
    float fi=float(i);
    if(cols<2.5&&i==2)break;
    float cw=cols>2.5?0.29:0.44;float gp=cols>2.5?0.035:0.08;
    float x0=0.04+fi*(cw+gp);
    float rvv=rv(0.5+0.15*fi,b);
    vec2 lo=vec2(x0,0.06),hi=vec2(x0+cw,0.46);
    float inC=rc(q,lo,hi)*rvv;
    vec2 cq=(q-lo)/(hi-lo);
    vec3 cc=vec3(0.96,0.97,0.99);
    cc=mix(cc,prodImg(vec2(cq.x,(cq.y-0.3)/0.7),fi),step(0.3,cq.y));
    cc=mix(cc,vec3(0.7,0.72,0.78),rc(cq,vec2(0.08,0.15),vec2(0.7,0.2)));
    cc=mix(cc,vec3(1.0,0.78,0.0),rc(cq,vec2(0.08,0.04),vec2(0.4,0.12)));
    c=mix(c,cc,inC);
  }
  return c;}
vec3 cardTex(vec2 q,float i){
  vec3 c=vec3(0.96,0.97,0.99);
  c=mix(c,prodImg(vec2(q.x,(q.y-0.32)/0.68),i),step(0.32,q.y));
  c=mix(c,vec3(0.7,0.72,0.78),rc(q,vec2(0.1,0.18),vec2(0.75,0.24)));
  c=mix(c,vec3(1.0,0.78,0.0),rc(q,vec2(0.1,0.05),vec2(0.45,0.14)));
  return c;}

vec3 cardPos(float id){return id<20.5?gC0:(id<21.5?gC1:gC2);}
float cardS(float id){return id<20.5?gCS0:(id<21.5?gCS1:gCS2);}

vec3 shade0(vec3 p,vec3 n,vec3 rd,float id){
  vec3 r=reflect(rd,n);float ndv=max(dot(n,-rd),0.0);
  float fr=pow(1.0-ndv,5.0);
  vec3 L=normalize(vec3(-0.55,0.9,0.65));
  vec3 H=normalize(L-rd);
  /* emisivos */
  if(id>8.5&&id<9.5){
    float f=pow(1.0-ndv,2.0);
    return mix(vec3(0.5,0.15,1.0),vec3(1.0,0.95,1.0),f)*(1.4+0.5*sin(uT*4.0))+vec3(0.5,0.1,1.0)*0.4;}
  if(id>29.5){return mix(vec3(1.0,0.78,0.1),vec3(0.7,0.35,1.0),0.5+0.5*sin(p.y*4.0+uT*5.0))*3.0;}
  if(id>9.5&&id<12.5){
    vec3 q;vec2 uv;float cols=3.0;float bb=gBuild;
    if(id<10.5){q=p-gPM;q.xz*=rot(gPYaw);uv=q.xy/(vec2(1.5,0.92)*gPS)*0.5+0.5;bb=gBuild;}
    else if(id<11.5){q=p-gPh;q.xz*=rot(gPhYaw);uv=q.xy/(vec2(0.27,0.56)*gPhS)*0.5+0.5;cols=2.0;bb=gBuildPh;}
    else{q=p-gTb;q.xz*=rot(gTbYaw);uv=q.xy/(vec2(0.57,0.39)*gTbS)*0.5+0.5;bb=ss(15.2,17.0,uT);}
    vec3 u=ui(uv,bb,cols);
    u*=0.93+0.07*sin(uv.y*160.0+uT*6.0);
    float edge=smoothstep(0.03,0.0,min(min(uv.x,1.0-uv.x),min(uv.y,1.0-uv.y)));
    return u*1.25+vec3(0.5,0.2,1.0)*edge*0.7+vec3(1.0,0.95,1.0)*fr*0.25;}
  float a=ao(p,n);
  vec3 col=vec3(0.0);
  if(id<1.5){vec3 tint=vec3(1.0,0.76,0.12);col=env(r)*tint*(0.78+0.5*fr)*a+tint*0.04;col+=pow(max(dot(n,H),0.0),180.0)*1.6;}
  else if(id<2.5){vec3 tint=vec3(0.62,0.22,1.0);col=env(r)*tint*(0.82+0.5*fr)*a+tint*0.03;col+=pow(max(dot(n,H),0.0),160.0)*1.3;}
  else{
    vec3 alb=vec3(0.0);float cc=0.9;
    if(id<3.5)alb=vec3(0.015,0.012,0.02);
    else if(id<4.5)alb=vec3(1.0,0.72,0.0);
    else if(id<5.5)alb=vec3(0.45,0.0,1.0);
    else if(id<6.5)alb=vec3(0.9,0.92,0.95);
    else if(id>19.5&&id<23.5){
      float cs=cardS(id);vec3 q=p-cardPos(id);
      float ph=id<20.5?0.0:(id<21.5?1.7:3.4);
      q.xz*=rot(0.35*sin(uT*0.8+ph));
      vec2 uv=q.xy/(vec2(0.32,0.4)*cs)*0.5+0.5;
      alb=cardTex(uv,id-20.0)*step(0.0,n.z*0.0+1.0);
      alb=mix(vec3(0.9,0.92,0.95),alb,step(0.0,q.z));
    }
    else{alb=vec3(0.02,0.012,0.045);cc=1.0;}
    float df=max(dot(n,L),0.0);
    vec3 amb=mix(vec3(0.05,0.02,0.12),vec3(0.14,0.1,0.22),n.y*0.5+0.5);
    float f=0.05+0.95*fr;if(id>7.5&&id<8.5)f=0.03+0.55*pow(1.0-ndv,3.0);
    col=alb*(df*0.95+amb+(id>19.5?0.35:0.0))*a*(1.0-f)+env(r)*f*cc*a;
    col+=pow(max(dot(n,H),0.0),120.0)*((id>7.5&&id<8.5)?0.35:1.1);
    if(id>7.5&&id<8.5){
      float gl=exp(-pow(length(p.xz)*0.3,2.0));
      float blue=1.0-ss(3.4,6.2,uT);
      col+=mix(vec3(0.16,0.0,0.45),vec3(0.05,0.1,0.4),blue)*gl*0.3;
      vec2 gp=abs(fract(p.xz*0.5)-0.5);float gr=smoothstep(0.015,0.0,min(gp.x,gp.y));
      col+=vec3(0.45,0.15,1.0)*gr*0.07*gl;
      /* la pantalla ilumina el piso */
      col+=vec3(0.35,0.12,0.9)*exp(-length(p.xz-vec2(gPM.x,gPM.z+0.8))*0.7)*0.14*step(0.01,gPS);
    }
  }
  return col;}

vec3 shade1(vec3 p,vec3 n,vec3 rd,float id){
  vec3 base=shade0(p,n,rd,id);
  float k=0.0;
  if(id<2.5)k=0.62;else if(id>7.5&&id<8.5)k=0.5;else if(id<3.5)k=0.3;else return base;
  vec3 r=reflect(rd,n);
  vec2 h=march(p+n*0.012,r,30,12.0);
  if(h.y>0.5){
    vec3 p2=p+n*0.012+r*h.x;vec3 n2=nrm(p2);vec3 c2=shade0(p2,n2,r,h.y);
    if(id<2.5){vec3 tint=id<1.5?vec3(1.0,0.76,0.12):vec3(0.62,0.22,1.0);base=mix(base,c2*tint*1.4,k*0.55);}
    else if(id>7.5){base+=c2*0.42*pow(1.0-max(dot(n,-rd),0.0),1.5)+c2*0.2;}
    else base+=c2*k*0.35;}
  return base;}

vec3 spk(vec2 uv,vec2 c,float tt,float seed){
  if(tt<0.0||tt>1.0)return vec3(0.0);
  vec3 s=vec3(0.0);
  for(int i=0;i<18;i++){
    float fi=float(i);
    float ang=h11(fi+seed)*6.2832;float sp=0.25+0.85*h11(fi*3.1+seed);
    vec2 pp=c+vec2(cos(ang),sin(ang))*tt*sp;
    float d=length(uv-pp);
    float br=exp(-d*d*(5000.0))*(1.0-tt);
    s+=(h11(fi*7.7+seed)>0.5?vec3(1.0,0.8,0.2):vec3(0.8,0.5,1.0))*br*1.6;
    s+=vec3(1.0)*exp(-d*d*40000.0)*(1.0-tt)*0.8;
  }
  return s;}

void main(){
  vec2 uv=(gl_FragCoord.xy*2.0-uRes)/uRes.y;
  anim();
  float asp=uRes.x/uRes.y;
  float t=uT;
  float dist=mix(8.8,6.6,ss(0.0,4.0,t));
  dist=mix(dist,6.0,ss(4.0,8.0,t));
  dist=mix(dist,5.6,ss(8.0,14.5,t));
  dist=mix(dist,8.6,ss(14.8,18.6,t));
  dist*=max(1.0,1.2/asp);
  float yaw=0.3*sin(2.0*PI*t/20.0)+uMouse.x*0.22;
  vec3 ta=vec3(0.2,0.3,0.0);
  ta=mix(ta,vec3(0.9,0.5,-0.1),ss(3.8,5.8,t));
  ta=mix(ta,vec3(1.0,0.5,0.0),ss(8.0,10.0,t));
  ta=mix(ta,vec3(0.3,-0.05,0.0),ss(14.8,17.0,t));
  vec3 ro=ta+vec3(sin(yaw)*dist,0.6+uMouse.y*0.4+0.1*sin(t*0.6)+0.3*ss(14.8,18.6,t),cos(yaw)*dist);
  vec3 ww=normalize(ta-ro);vec3 uu=normalize(cross(ww,vec3(0.0,1.0,0.0)));vec3 vv=cross(uu,ww);
  vec3 rd=normalize(uv.x*uu+uv.y*vv+1.9*ww);
  vec3 col=bgc(uv);
  vec2 h=march(ro,rd,72,30.0);
  if(h.y>0.5){
    vec3 p=ro+rd*h.x;vec3 n=nrm(p);
    vec3 c=shade1(p,n,rd,h.y);
    if(h.y>7.5&&h.y<8.5)c=mix(c,col,smoothstep(7.0,18.0,h.x));
    col=c;}
  /* resplandor de la esfera de la idea */
  if(gSR>0.01){
    vec3 w=gSP-ro;float tc=max(dot(w,rd),0.0);float dd=length(w-rd*tc);
    col+=vec3(0.55,0.2,1.0)*exp(-pow(dd/(gSR*1.9),2.0))*0.55+vec3(1.0,0.9,1.0)*exp(-pow(dd/(gSR*0.9),2.0))*0.18;
  }
  /* chispas y destellos */
  vec3 pj=gSP-ro;vec2 sc=vec2(dot(pj,uu),dot(pj,vv))/dot(pj,ww)*1.9;
  col+=spk(uv,sc,(t-4.35)/1.1,3.0);
  vec3 pk=gPM-ro;vec2 sc2=vec2(dot(pk,uu),dot(pk,vv))/dot(pk,ww)*1.9;
  col+=spk(uv,sc2,(t-8.0)/0.9,11.0)*0.7;
  vec3 pl=vec3(0.35,0.6,0.0)-ro;vec2 sc3=vec2(dot(pl,uu),dot(pl,vv))/dot(pl,ww)*1.9;
  col+=spk(uv,sc3,(t-17.6)/1.3,23.0);
  col+=spk(uv,sc3,(t-15.3)/1.1,31.0)*0.7;
  float fl=gFlash;
  col+=vec3(1.0,0.88,0.6)*fl*0.28*exp(-dot(uv-sc3*step(15.0,t)-sc*(1.0-step(5.0,t)),uv-sc3*step(15.0,t)-sc*(1.0-step(5.0,t)))*0.9)+vec3(0.8,0.6,1.0)*fl*0.06;
  /* tono */
  col=(col*(2.51*col+0.03))/(col*(2.43*col+0.59)+0.14);
  col=pow(clamp(col,0.0,1.0),vec3(1.0/2.15));
  col*=1.0-0.28*dot(uv*0.5,uv*0.5);
  float fade=ss(0.0,0.7,t)*(1.0-ss(19.3,20.0,t));
  col=mix(vec3(0.03,0.03,0.05),col,fade);
  col+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-0.5)/255.0;
  gl_FragColor=vec4(col,1.0);}
`;

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      if (window.console) console.warn("5STARS 3D: " + gl.getShaderInfoLog(s));
      return null;
    }
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
        uMouse = gl.getUniformLocation(prog, "uMouse");

    /* Mensaje de marca de la escena 4 (texto real, accesible, sobre el lienzo) */
    var msg = document.createElement("div");
    msg.className = "cin-msg";
    msg.setAttribute("aria-hidden", "true");
    msg.innerHTML = '<svg class="logo" aria-hidden="true"><use href="#logo"/></svg><p>Tu negocio comienza a brillar</p>';
    host.appendChild(msg);
    var msgOn = false;
    function setMsg(t) {
      var on = t >= MSG_FROM && t < MSG_TO;
      if (on !== msgOn) { msgOn = on; msg.classList.toggle("on", on); }
    }

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var scale = Math.max(1, Math.min(dpr, 1.25));
    var MAXPX = 2200000;
    var mx = 0, my = 0, tx = 0, ty = 0;
    var clock = 0;

    function resize() {
      var w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
      var pw = w * scale, ph = h * scale;
      if (pw * ph > MAXPX) { var f = Math.sqrt(MAXPX / (pw * ph)); pw *= f; ph *= f; }
      canvas.width = Math.round(pw); canvas.height = Math.round(ph);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    function render(t) {
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uT, t);
      gl.uniform2f(uMouse, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      setMsg(t);
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
      mx += (tx - mx) * 0.06; my += (ty - my) * 0.06;
      render(clock);
      acc += dt; nf++;
      if (nf === 45) {
        var avg = acc / nf; acc = 0; nf = 0;
        if (avg > 0.034 && scale > 0.5) { scale = Math.max(0.5, scale * 0.85); resize(); }
      }
      raf = requestAnimationFrame(frame);
    }

    resize();
    render(0);
    return {
      start: function () { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); },
      stop: function () { running = false; cancelAnimationFrame(raf); },
      renderStill: function (t) { resize(); msg.style.transition = "none"; render(t === undefined ? 18 : t); },
      resize: function () { resize(); if (!running) render(clock); },
      seek: function (t) { clock = t; render(t); },
      period: T,
      kind: "webgl"
    };
  }
  window.StarsScene3D = { create: create, LOOP_SECONDS: T };
})();

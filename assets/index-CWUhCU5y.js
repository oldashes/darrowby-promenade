(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=2048,t={col:0,row:0},n={col:1,row:0},r={col:2,row:0},i={col:3,row:0},a={col:0,row:1},o={col:1,row:1},s={col:2,row:1},c={col:3,row:1},l={col:0,row:2},u={col:1,row:2},d={col:2,row:2},f={col:3,row:2},p={col:0,row:3},m={col:1,row:3},h={col:2,row:3},g={col:3,row:3};function _(t,n=0,r=0,i=1,a=1){let o=4/e,s=t.col/4+o,c=t.row/4+o,l=1/4-o*2;return{u0:s+n*l,v0:c+r*l,u1:s+i*l,v1:c+a*l}}function v(e,t,n=13){let r=e*374761393+t*668265263+n*1442695041|0;return r=(r^r>>>13)*1274126177|0,((r^r>>>16)>>>0)/4294967296}function y(e,t,n=13){let r=Math.floor(e),i=Math.floor(t),a=e-r,o=t-i,s=a*a*(3-2*a),c=o*o*(3-2*o),l=v(r,i,n),u=v(r+1,i,n),d=v(r,i+1,n),f=v(r+1,i+1,n);return l+(u-l)*s+(d-l)*c+(l-u-d+f)*s*c}function b(e,t,n=13){return y(e,t,n)*.55+y(e*2.07+3.1,t*2.07+1.9,n+19)*.3+y(e*4.21+9.4,t*4.21+5.7,n+47)*.15}function x(e){return e<0?0:e>255?255:Math.round(e)}function S(){let e=262144;return{albedo:new Uint8Array(e*4),height:new Float32Array(e),rough:new Uint8Array(e).fill(200),metal:new Uint8Array(e).fill(0),ao:new Uint8Array(e).fill(255),emissive:new Uint8Array(e).fill(0)}}function C(e,t,n,r,i,a,o,s,c=0,l=255,u=0){let d=n*512+t,f=d*4;e.albedo[f]=x(r),e.albedo[f+1]=x(i),e.albedo[f+2]=x(a),e.albedo[f+3]=255,e.height[d]=o,e.rough[d]=x(s),e.metal[d]=x(c),e.ao[d]=x(l),e.emissive[d]=x(u)}function w(e,t,n){let r=document.createElement(`canvas`);r.width=512,r.height=512;let i=r.getContext(`2d`);t(i,512);let a=i.getImageData(0,0,512,512).data;for(let t=0;t<512;t++)for(let r=0;r<512;r++){let i=(t*512+r)*4,o=n?n(a,i,r,t):{h:(a[i]+a[i+1]+a[i+2])/765,rough:195,metal:0,ao:255,em:0};C(e,r,t,a[i],a[i+1],a[i+2],o.h,o.rough,o.metal,o.ao,o.em)}}function T(){let e=S();for(let t=0;t<512;t++){let n=Math.floor(t/96),r=t%96,i=Math.min(r,95-r),a=i<2.2?.25:i<5?.68:1;for(let r=0;r<512;r++){let o=Math.sin(t*.25+b(r*.015,t*.09,17+n*9)*9)*.5+.5,s=b(r*.03,t*.03,81)>.64?.25:0,c=b(r*.04,t*.04,107),l=(.64+o*.26+c*.14)*a,u=(92*(1-s)+48*s)*l,d=(68*(1-s)+64*s)*l,f=(48*(1-s)+38*s)*l;C(e,r,t,u,d,f,(o*.4+c*.25)*a,i<3?235:98-o*24,0,x(a*255))}}return e}function E(){let e=S();for(let t=0;t<512;t++){let n=Math.floor(t/64),r=t-n*64,i=n%2*64;for(let a=0;a<512;a++){let o=(a+i)%512,s=Math.floor(o/128),c=o-s*128,l=Math.min(r,63-r,c,127-c),u=l<3.2,d=Math.min(1,l/8.5),f=v(s,n,103),p=b(a*.07,t*.07,55);if(u)C(e,a,t,78+p*14,76+p*14,72+p*14,.05,245,0,120);else{let n=.74+f*.22+(p-.5)*.18;C(e,a,t,168*n,160*n,146*n,.35+d*.45+p*.22,210-p*25,0,x(172+d*83))}}}return e}function D(){let e=S();for(let t=0;t<512;t++){let n=Math.floor(t/32),r=t-n*32,i=n%2*32;for(let a=0;a<512;a++){let o=(a+i)%512,s=Math.floor(o/64),c=o-s*64,l=b(a*.018,t*.018,221),u=b(a*.025,t*.025,317);if(l>.76||t>435&&l>.54){let i=Math.min(r,31-r,c,63-c),o=i<2.4,l=v(s,n,99),u=b(a*.09,t*.09,17);o?C(e,a,t,108,102,92,.12,242,0,125):C(e,a,t,134+l*26+u*12,84+l*16+u*10,64+l*14+u*8,.34+Math.min(1,i/5)*.24+u*.12,224,0,195)}else{let n=Math.min(1,Math.max(0,(.76-l)*24)),r=b(a*.08,t*.08,73),i=.86+(r-.5)*.14-Math.max(0,u-.58)*.3;C(e,a,t,188*i,168*i,136*i,.74+r*.12+n*.14,212,0,x(212+n*43))}}}return e}function O(){let e=S();for(let t=0;t<512;t++)for(let n=0;n<512;n++){let r=Math.floor(n/128),i=n%128-64,a=r%2*48,o=(t+a)%96,s=Math.hypot(i,o*.92+12),c=Math.floor(s/16),l=Math.atan2(o+12,i),u=Math.max(4,Math.round((c+1)*3.1)),d=(l/Math.PI*u+10)%1,f=s%16/16,p=Math.min(f,1-f)*16,m=Math.min(d,1-d)*(s*Math.PI/u),h=Math.min(p,m),g=v(c+r*19,Math.floor(l*10),401),_=b(n*.11,t*.11,88);if(h<2.2){let r=b(n*.04,t*.04,151)>.62;C(e,n,t,r?168:48,r?178:50,r?192:56,.06,225,0,120)}else{let r=Math.sin(Math.min(1,(h-2.2)/5.5)*Math.PI*.5),i=.72+g*.28+(_-.5)*.14,a=128-r*42;C(e,n,t,114*i,115*i,122*i,.22+r*.72+_*.1,a,0,x(168+r*87))}}return e}function k(){let e=S(),t=512/6;for(let n=0;n<512;n++){let r=Math.floor(n/t),i=n-r*t,a=84.33333333333333-i;for(let o=0;o<512;o++){let s=o*12/512,c=Math.floor(s),l=Math.cos((s-c)*Math.PI*2-Math.PI)*.5+.5,u=v(c,r,509),d=b(o*.06,n*.06,33),f=a<5?a/5:1,p=(.74+u*.22+(d-.5)*.14)*(.58+.42*f);C(e,o,n,156*p,70*p,48*p,l*.68+i/t*.3+d*.08,175,0,x((.45+.55*l)*f*255))}}return e}function A(){let e=S(),t=512/10;for(let n=0;n<512;n++){let r=Math.floor(n/t),i=n-r*t,a=r%2*32,o=50.2-i;for(let s=0;s<512;s++){let c=(s+a)%512,l=Math.floor(c/64),u=c-l*64,d=u<2||u>62,f=v(l,r,613),p=b(s*.08,n*.08,91),m=d?.55:o<4?.55+o/4*.45:1,h=(.74+f*.24+(p-.5)*.14)*m;C(e,s,n,74*h,86*h,106*h,d?.15:.35+i/t*.55+p*.1,138,20,x(m*255))}}return e}function j(){let e=S();for(let t=0;t<512;t++)for(let n=0;n<512;n++){let r=Math.floor(n/64),i=n%64,a=i<2||i>61,o=!(t>40&&t<74||t>240&&t<276||t>448&&t<484)&&(n>46&&n<236||n>276&&n<466)&&(t>96&&t<220||t>296&&t<428),s=b(n*.12,t*.02,77+r*3),c=t>90&&t<110&&n<240||t>395&&t<415&&n<240,l=Math.hypot(n-430,t-260);if(l<24&&l>11)C(e,n,t,218,178,86,.95,56,235,255);else if(c)C(e,n,t,40,42,46,.85,110,190,225);else{let r=a?.45:o?1.1:.92;C(e,n,t,(92+s*24)*r,(58+s*18)*r,(36+s*12)*r,a?.1:o?.72:.48+s*.15,152,0,a?130:240)}}return e}function M(){let e=S();for(let t=0;t<512;t++)for(let n=0;n<512;n++){let r=Math.floor(n/64)%2==0,i=Math.sin(n*.9)*Math.cos(t*.9)*.5+.5,a=1-(b(n*.02,t*.02,12)-.5)*.14;C(e,n,t,(r?176:228)*a,(r?52:216)*a,(r?40:196)*a,.5+i*.1,215,0,245)}return e}function N(){let e=S();return w(e,(e,t)=>{let n=e.createRadialGradient(t*.5,t*.22,16,t*.5,t*.5,t*.65);n.addColorStop(0,`#ffe8aa`),n.addColorStop(.35,`#e8ba6b`),n.addColorStop(1,`#7a5233`),e.fillStyle=n,e.fillRect(0,0,t,t),e.fillStyle=`#5c3c24`,e.fillRect(0,t*.66,t,t*.34),e.fillStyle=`#472d19`;for(let n=16;n<t;n+=64)e.fillRect(n,t*.7,44,t*.24);e.fillStyle=`#6c4928`,e.fillRect(t*.36,t*.2,t*.28,t*.24),e.fillStyle=`#8fa98d`,e.fillRect(t*.39,t*.23,t*.22,t*.18),e.fillStyle=`#d6c6ac`,e.fillRect(t*.22,t*.6,t*.56,t*.26),e.fillStyle=`#b44838`;for(let n=0;n<6;n++)for(let r=0;r<12;r++)(r+n)%2==0&&e.fillRect(t*.22+r*24,t*.6+n*22,24,22);e.fillStyle=`#e8d79b`,e.beginPath(),e.ellipse(t*.5,t*.68,28,14,0,0,Math.PI*2),e.fill(),e.fillStyle=`rgba(246, 232, 206, 0.88)`,e.beginPath(),e.moveTo(0,0),e.lineTo(t*.24,0),e.quadraticCurveTo(t*.18,t*.55,t*.08,t),e.lineTo(0,t),e.closePath(),e.fill(),e.beginPath(),e.moveTo(t,0),e.lineTo(t*.76,0),e.quadraticCurveTo(t*.82,t*.55,t*.92,t),e.lineTo(t,t),e.closePath(),e.fill(),e.fillStyle=`#fff5cf`,e.beginPath(),e.arc(t*.5,t*.1,26,0,Math.PI*2),e.fill()},(e,t)=>{let n=(e[t]+e[t+1]+e[t+2])/765;return{h:.4,rough:225,metal:0,ao:255,em:Math.round(n*255)}}),e}function ee(){let e=S();for(let t=0;t<512;t++)for(let n=0;n<512;n++){let r=b(n*.02,t*.02,307),i=b(n*.24,t*.24,809),a=te(.45,.75,r),o=.72+r*.25+(i-.5)*.18,s=(74*(1-a*.4)+a*.4*170)*o,c=(94*(1-a*.4)+a*.4*186)*o,l=(58*(1-a*.4)+a*.4*198)*o;C(e,n,t,s,c,l,.35+i*.45,224,0,x(185+i*70))}return e}function te(e,t,n){let r=Math.max(0,Math.min(1,(n-e)/(t-e)));return r*r*(3-2*r)}function P(){let e=S();return w(e,(e,t)=>{e.fillStyle=`#254230`,e.fillRect(0,0,t,t*.5),e.strokeStyle=`#d4b46a`,e.lineWidth=10,e.strokeRect(14,14,t-28,t*.5-28),e.fillStyle=`#efe0b8`,e.textAlign=`center`,e.textBaseline=`middle`,e.font=`bold 54px Georgia, serif`,e.fillText(`ALIMENTARI`,t*.5,t*.19),e.font=`bold 26px Georgia, serif`,e.fillStyle=`#d9bf82`,e.fillText(`DARROWBY · EST. 1784`,t*.5,t*.34),e.fillStyle=`#aba08a`,e.fillRect(0,t*.5,t*.5,t*.5),e.strokeStyle=`#6f6655`,e.lineWidth=8,e.strokeRect(12,t*.5+12,t*.5-24,t*.5-24),e.fillStyle=`#4e463a`,e.font=`bold 66px Georgia, serif`,e.fillText(`1784`,t*.25,t*.75),e.fillStyle=`#1e3f68`,e.fillRect(t*.5,t*.5,t*.5,t*.5),e.strokeStyle=`#e8e4d8`,e.lineWidth=10,e.strokeRect(t*.5+16,t*.5+16,t*.5-32,t*.5-32),e.fillStyle=`#f2efe6`,e.font=`bold 42px Georgia, serif`,e.fillText(`VIA DEL`,t*.75,t*.68),e.fillText(`SOLE`,t*.75,t*.82)},(e,t,n,r)=>{let i=(e[t]+e[t+1]+e[t+2])/765;return{h:r>=256&&n<256?i*.8:.65,rough:r>=256&&n>=256?78:165,metal:0,ao:245,em:0}}),e}function ne(){let e=S();return w(e,(e,t)=>{e.fillStyle=`#efe0b8`,e.fillRect(0,0,t,t);let n=t*.5,r=t*.5;e.strokeStyle=`#38322a`,e.lineWidth=16,e.beginPath(),e.arc(n,r,t*.42,0,Math.PI*2),e.stroke(),e.lineWidth=6,e.beginPath(),e.arc(n,r,t*.35,0,Math.PI*2),e.stroke();for(let i=0;i<12;i++){let a=i/12*Math.PI*2-Math.PI/2;e.lineWidth=i%3==0?12:6,e.beginPath(),e.moveTo(n+Math.cos(a)*t*.28,r+Math.sin(a)*t*.28),e.lineTo(n+Math.cos(a)*t*.36,r+Math.sin(a)*t*.36),e.stroke()}e.lineWidth=14,e.lineCap=`round`,e.beginPath(),e.moveTo(n,r),e.lineTo(n-t*.16,r-t*.1),e.moveTo(n,r),e.lineTo(n+t*.21,r-t*.16),e.stroke(),e.fillStyle=`#8b6830`,e.beginPath(),e.arc(n,r,16,0,Math.PI*2),e.fill()},(e,t)=>({h:e[t]<100?.1:.8,rough:155,metal:10,ao:255,em:e[t]>140?225:20})),e}function F(){let e=S();for(let t=0;t<512;t++){let n=Math.floor(t/32),r=t%32;for(let i=0;i<512;i++){let a=v(n,1,701)*48,o=i+a,s=48+Math.floor(v(Math.floor(o/64),n,709)*32),c=Math.floor(o/s),l=o%s,u=Math.min(r,31-r,l,s-1-l),d=b(i*.09,t*.09,88),f=v(c,n,733);if(u<2.2)C(e,i,t,56,55,54,.08,240,0,115);else{let n=.7+f*.28+(d-.5)*.18;C(e,i,t,126*n,122*n,118*n,.3+Math.min(1,u/6)*.55+d*.15,218,0,x(170+u*14))}}}return e}function I(){let e=S();for(let t=0;t<512;t++)for(let n=0;n<512;n++)if(t<256){let r=Math.floor(n/64)%2==0,i=Math.sin(n*.9)*Math.cos(t*.9)*.5+.5;C(e,n,t,r?56:226,r?96:216,r?64:196,.5+i*.1,215,0,245)}else{let r=Math.abs((n-256)/220)+Math.abs((t-384)/110),i=b(n*.35,t*.35,31)*.14+.93,a=138,o=46,s=40;r<.24?(a=224,o=210,s=186):r<.44?(a=38,o=56,s=86):r>.78&&r<.9&&(a=212,o=176,s=104),C(e,n,t,a*i,o*i,s*i,.55+(i-.93)*1.5,235,0,240)}return e}function L(){let e=S();for(let t=0;t<512;t++)for(let n=0;n<512;n++){let r=b(n*.14,t*.03,521),i=Math.sin(t/512*Math.PI*28)*.5+.5,a=.78+r*.2+i*.16;C(e,n,t,52*a,94*a,62*a,.4+i*.45,165,0,x(185+i*70))}return e}function R(){let e=S();for(let t=0;t<256;t++)for(let n=0;n<512;n++){let r=n%128,i=t%128,a=Math.min(r,127-r,i,127-i)<3,o=b(n*.05,t*.05,641),s=Math.min(Math.abs(r-18),Math.abs(r-110)),c=Math.min(Math.abs(i-18),Math.abs(i-110)),l=Math.hypot(s,c),u=l<9;if(a)C(e,n,t,36,36,40,.08,200,140,120);else if(u){let r=Math.sqrt(Math.max(0,1-l/9*(l/9)));C(e,n,t,88+r*32,86+r*28,86+r*26,.6+r*.4,88,225,255)}else{let r=Math.max(0,o-.56)*2.2;C(e,n,t,64+r*54,64+r*22,70-r*10,.42+o*.14,104+r*90,215-r*110,230)}}for(let t=256;t<512;t++){let n=(t-256)/256;for(let r=0;r<512;r++){let i=r/512,a=Math.hypot(i-.5,(n-.55)*1.2),o=b(r*.07,t*.07,977),s=Math.max(0,1-a*1.55)*(.65+.55*o),c=o>.48?s:s*.35,l=42+c*213,u=24+c**1.45*185,d=18+c**2.3*110;C(e,r,t,l,u,d,.25+o*.65,210,0,240,x(c*255))}}return e}function re(e,t=2.6){let n=262144,r=new Float32Array(n),i=new Float32Array(n),a=new Float32Array(n),o=(t,n)=>e[Math.max(0,Math.min(511,n))*512+Math.max(0,Math.min(511,t))];for(let e=0;e<512;e++)for(let n=0;n<512;n++){let s=o(n-1,e-1),c=o(n-1,e),l=o(n-1,e+1),u=o(n,e-1),d=o(n,e+1),f=o(n+1,e-1),p=o(n+1,e),m=o(n+1,e+1),h=(f+2*p+m-(s+2*c+l))*t,g=(l+2*d+m-(s+2*u+f))*t,_=-h,v=-g,y=1/Math.hypot(_,v,1),b=e*512+n;r[b]=_*y,i[b]=v*y,a[b]=1*y}return{nx:r,ny:i,nz:a}}function ie(){let _=document.createElement(`canvas`);_.width=e,_.height=e;let v=_.getContext(`2d`),y=new Uint8Array(e*e*4),b=new Uint8Array(e*e*4),S=[{coord:t,gen:T,normalStr:2.3},{coord:n,gen:E,normalStr:3.1},{coord:r,gen:D,normalStr:2.9},{coord:i,gen:O,normalStr:3.6},{coord:a,gen:k,normalStr:3.2},{coord:o,gen:A,normalStr:2.8},{coord:s,gen:j,normalStr:2.6},{coord:c,gen:M,normalStr:1.8},{coord:l,gen:N,normalStr:.4},{coord:u,gen:ee,normalStr:2.4},{coord:d,gen:P,normalStr:2.2},{coord:f,gen:ne,normalStr:1.8},{coord:p,gen:F,normalStr:3.4},{coord:m,gen:I,normalStr:1.9},{coord:h,gen:L,normalStr:2.5},{coord:g,gen:R,normalStr:3}],C=v.createImageData(512,512);for(let t of S){let n=t.gen(),{nx:r,ny:i,nz:a}=re(n.height,t.normalStr);C.data.set(n.albedo),v.putImageData(C,t.coord.col*512,t.coord.row*512);let o=t.coord.col*512,s=t.coord.row*512;for(let t=0;t<512;t++)for(let c=0;c<512;c++){let l=t*512+c,u=((s+t)*e+(o+c))*4;y[u]=x((r[l]*.5+.5)*255),y[u+1]=x((i[l]*.5+.5)*255),y[u+2]=x((a[l]*.5+.5)*255),y[u+3]=255,b[u]=n.rough[l],b[u+1]=n.metal[l],b[u+2]=n.ao[l],b[u+3]=n.emissive[l]}}return{albedoCanvas:_,normalData:y,materialData:b,size:e}}var z=_(t),B=_(n),V=_(r),ae=_(i),oe=_(a),H=_(o),se=_(s),ce=_(c),le=_(c,.14,.1,.23,.9),U=_(l),W=_(u),ue=_(d,.01,.01,.99,.49),G=_(d,.02,.52,.48,.98),de=_(d,.52,.52,.98,.98),K=_(f),q=_(p),fe=_(m,.01,.01,.99,.49);_(m,.02,.52,.98,.98);var pe=_(h),J=_(g,.01,.01,.99,.48),me=_(g,.01,.52,.99,.99),he=class{verts;inds;vCount=0;iCount=0;constructor(e=16384,t=24576){this.verts=new Float32Array(e*13),this.inds=new Uint32Array(t)}ensure(e,t){if((this.vCount+e)*13>this.verts.length){let t=new Float32Array(Math.max(this.verts.length*2,(this.vCount+e)*13));t.set(this.verts),this.verts=t}if(this.iCount+t>this.inds.length){let e=new Uint32Array(Math.max(this.inds.length*2,this.iCount+t));e.set(this.inds),this.inds=e}}addVertex(e,t,n,r,i,a,o,s,c=1,l=1,u=1,d=1,f=0){this.ensure(1,0);let p=this.vCount++,m=p*13,h=this.verts;return h[m++]=e,h[m++]=t,h[m++]=n,h[m++]=r,h[m++]=i,h[m++]=a,h[m++]=o,h[m++]=s,h[m++]=c,h[m++]=l,h[m++]=u,h[m++]=d,h[m++]=f,p}addQuad(e,t,n,r,i,a=[1,1,1],o=1,s=1,c=1,l=1,u=0,d){this.ensure(4,6);let f,p,m;if(d)[f,p,m]=d;else{let n=t[0]-e[0],i=t[1]-e[1],a=t[2]-e[2],o=r[0]-e[0],s=r[1]-e[1],c=r[2]-e[2];f=i*c-a*s,p=a*o-n*c,m=n*s-i*o;let l=Math.hypot(f,p,m)||1;f/=l,p/=l,m/=l}let h=this.addVertex(e[0],e[1],e[2],f,p,m,i.u0,i.v1,a[0],a[1],a[2],o,u),g=this.addVertex(t[0],t[1],t[2],f,p,m,i.u1,i.v1,a[0],a[1],a[2],s,u),_=this.addVertex(n[0],n[1],n[2],f,p,m,i.u1,i.v0,a[0],a[1],a[2],c,u),v=this.addVertex(r[0],r[1],r[2],f,p,m,i.u0,i.v0,a[0],a[1],a[2],l,u),y=this.inds,b=this.iCount;y[b++]=h,y[b++]=g,y[b++]=_,y[b++]=h,y[b++]=_,y[b++]=v,this.iCount=b}addBox(e,t,n,r,i,a,o,s=[1,1,1],c={}){let l=r*.5,u=i*.5,d=a*.5,f=c.rotY??0,p=c.rotX??0,m=c.rotZ??0,h=c.aoBottom??.84,g=c.aoTop??1,_=c.flag??0,v=Math.cos(f),y=Math.sin(f),b=Math.cos(p),x=Math.sin(p),S=Math.cos(m),C=Math.sin(m),w=(r,i,a)=>{let o=r*S-i*C,s=r*C+i*S,c=s*b-a*x,l=s*x+a*b,u=o*v+l*y,d=-o*y+l*v;return[e+u,t+c,n+d]},T=w(-l,-u,-d),E=w(l,-u,-d),D=w(l,u,-d),O=w(-l,u,-d),k=w(-l,-u,d),A=w(l,-u,d),j=w(l,u,d),M=w(-l,u,d);this.addQuad(M,j,D,O,o,s,g,g,g,g,_),c.skipBottom||this.addQuad(T,E,A,k,o,s,h,h,h,h,_),this.addQuad(k,A,j,M,o,s,h,h,g,g,_),this.addQuad(E,T,O,D,o,s,h,h,g,g,_),this.addQuad(A,E,D,j,o,s,h,h,g,g,_),this.addQuad(T,k,M,O,o,s,h,h,g,g,_)}addTiledFloor(e,t,n,r,i,a,o,s,c=[1,1,1],l=.94,u=0){let d=(n-e)/a,f=(r-t)/o;for(let n=0;n<o;n++)for(let r=0;r<a;r++){let a=e+r*d,o=t+n*f;this.addQuad([a,i,o+f],[a+d,i,o+f],[a+d,i,o],[a,i,o],s,c,l,l,l,l,u,[0,1,0])}}addCylinder(e,t,n,r,i,a,o,s,c=[1,1,1],l=0,u=0,d=0){let f=Math.cos(l),p=Math.sin(l),m=Math.cos(u),h=Math.sin(u),g=(r,i,a)=>{let o=r*m-i*h,s=r*h+i*m,c=s*f-a*p,l=s*p+a*f;return[e+o,t+c,n+l]};for(let e=0;e<o;e++){let t=e/o*Math.PI*2,n=(e+1)/o*Math.PI*2,l=Math.cos(t),u=Math.sin(t),f=Math.cos(n),p=Math.sin(n);this.addQuad(g(l*r,0,u*r),g(f*r,0,p*r),g(f*i,a,p*i),g(l*i,a,u*i),s,c,.84,.84,1,1,d)}if(i>.01){let e=g(0,a,0);for(let t=0;t<o;t++){let n=t/o*Math.PI*2,r=(t+1)/o*Math.PI*2;this.addQuad(e,g(Math.cos(r)*i,a,Math.sin(r)*i),g(Math.cos(n)*i,a,Math.sin(n)*i),e,s,c,1,1,1,1,d)}}}addPrismGable(e,t,n,r,i,a,o,s,c,l,u){let d=.28,f=.14;if(o){let o=r*.5,p=i*.5;this.addQuad([e+o,t,n+p],[e+o,t,n-p],[e+o,t+a,n],[e+o,t+a,n],s,l,.9,.9,1,1),this.addQuad([e-o,t,n-p],[e-o,t,n+p],[e-o,t+a,n],[e-o,t+a,n],s,l,.9,.9,1,1);let m=Math.hypot(p+d,a+d*.5),h=Math.atan2(a,p),g=(p+d)*.5;this.addBox(e,t+a*.5-.04,n+g,r+d*2,f,m,c,u,{rotX:h,aoBottom:.72}),this.addBox(e,t+a*.5-.04,n-g,r+d*2,f,m,c,u,{rotX:-h,aoBottom:.72}),this.addBox(e,t+a+.06,n,r+d*2.1,.18,.24,c,[u[0]*.85,u[1]*.85,u[2]*.85])}else{let o=r*.5,p=i*.5;this.addQuad([e-o,t,n+p],[e+o,t,n+p],[e,t+a,n+p],[e,t+a,n+p],s,l,.9,.9,1,1),this.addQuad([e+o,t,n-p],[e-o,t,n-p],[e,t+a,n-p],[e,t+a,n-p],s,l,.9,.9,1,1);let m=Math.hypot(o+d,a+d*.5),h=Math.atan2(a,o),g=(o+d)*.5;this.addBox(e+g,t+a*.5-.04,n,m,f,i+d*2,c,u,{rotZ:-h,aoBottom:.72}),this.addBox(e-g,t+a*.5-.04,n,m,f,i+d*2,c,u,{rotZ:h,aoBottom:.72}),this.addBox(e,t+a+.06,n,.24,.18,i+d*2.1,c,[u[0]*.85,u[1]*.85,u[2]*.85])}}build(){return{vertices:this.verts.subarray(0,this.vCount*13),indices:this.inds.subarray(0,this.iCount),vertexCount:this.vCount,indexCount:this.iCount}}};function Y(e,t,n,r,i,a,o,s=5.4,c=1.9){let l=n+a*.24,u=i+o*.24;e.addBox(n+a*.12,r+.14,i+o*.12,Math.abs(a)*.24+.05,.05,Math.abs(o)*.24+.05,J,[.24,.25,.28],{flag:6}),e.addCylinder(l,r+.04,u,.12,.02,.12,6,J,[.24,.25,.28]),e.addBox(l,r-.05,u,.14,.18,.14,U,[1,.88,.54],{flag:2}),e.addBox(l,r-.16,u,.08,.04,.08,J,[.24,.25,.28],{flag:6}),t.push({x:n+a*.58,y:r-.08,z:i+o*.58,r:1,g:.72,b:.3,radius:s,intensity:c,kind:`lantern`})}function X(e,t,n,r,i,a,o={}){let s=o.width??.92,c=o.height??1.15,[l,u,d,f]=a===`S`?[0,1,1,0]:a===`N`?[0,-1,-1,0]:a===`E`?[1,0,0,-1]:[-1,0,0,1],p=a===`S`?0:a===`E`?Math.PI*.5:a===`N`?Math.PI:-Math.PI*.5;e.addBox(n+l*.05,r+c*.5+.06,i+u*.05,Math.abs(d)*(s+.18)+Math.abs(l)*.12,.1,Math.abs(f)*(s+.18)+Math.abs(u)*.12,B,[.92,.9,.86]),e.addBox(n+l*.08,r-c*.5-.05,i+u*.08,Math.abs(d)*(s+.24)+Math.abs(l)*.18,.1,Math.abs(f)*(s+.24)+Math.abs(u)*.18,B,[.88,.86,.82]);for(let t of[-1,1])e.addBox(n+l*.04+d*t*(s*.5+.05),r,i+u*.04+f*t*(s*.5+.05),Math.abs(d)*.09+Math.abs(l)*.1,c,Math.abs(f)*.09+Math.abs(u)*.1,B,[.9,.88,.84],{flag:6});let m=s*.46,h=c*.46,g=n+l*.006,_=i+u*.006;if(e.addQuad([g-d*m,r-h,_-f*m],[g+d*m,r-h,_+f*m],[g+d*m,r+h,_+f*m],[g-d*m,r+h,_-f*m],U,[1,1,1],1,1,1,1,1,[l,0,u]),e.addBox(n+l*.03,r,i+u*.03,Math.abs(d)*.04+Math.abs(l)*.05,c*.94,Math.abs(f)*.04+Math.abs(u)*.05,z,[.88,.84,.78],{flag:6}),e.addBox(n+l*.03,r+.06,i+u*.03,Math.abs(d)*s*.94+Math.abs(l)*.05,.04,Math.abs(f)*s*.94+Math.abs(u)*.05,z,[.88,.84,.78],{flag:6}),o.shutters!==!1){let t=[.58,.86,.65],a=s*.44;for(let o of[-1,1]){let m=n+l*.06+d*o*(s*.5+.11+a*.5),h=i+u*.06+f*o*(s*.5+.11+a*.5);e.addBox(m,r,h,a,c*.96,.05,pe,t,{rotY:p,aoBottom:.72,flag:6});for(let n=-4;n<=4;n++)e.addBox(m+l*.028,r+c*.095*n,h+u*.028,a*.82,.038,.04,pe,t,{rotY:p,aoBottom:.78,flag:6})}}if(o.flowerBox){let t=n+l*.19,a=r-c*.5+.02,o=i+u*.19;e.addBox(t,a,o,s*.96,.18,.22,oe,[.95,.65,.52],{rotY:p,aoBottom:.65,flag:6});for(let n=-3;n<=3;n++){let r=t+d*(n*s*.12),i=o+f*(n*s*.12);e.addBox(r,a+.13,i,.12,.11,.12,W,[.54,.86,.45],{rotY:n*.6}),n%2==0&&e.addBox(r+l*.04,a+.19,i+u*.04,.07,.07,.07,ce,[1,.42,.42])}}if(o.hasCat){let t=n+l*.14+d*.22,a=r-c*.5+.05,o=i+u*.14+f*.22;e.addBox(t,a,o,.24,.12,.16,V,[.98,.58,.24],{rotY:p,flag:6}),e.addBox(t-d*.11,a+.04,o-f*.11,.11,.11,.11,V,[.99,.64,.28],{rotY:p,flag:6})}o.emitBounce&&t.push({x:n+l*.52,y:r,z:i+u*.52,r:1,g:.72,b:.34,radius:4,intensity:1.05,kind:`window`})}function ge(e,t,n,r,i,a=!0){let[o,s]=i===`S`?[0,1]:i===`N`?[0,-1]:i===`E`?[1,0]:[-1,0],c=i===`S`?0:i===`E`?Math.PI*.5:i===`N`?Math.PI:-Math.PI*.5;e.addBox(t+o*.22,n+.09,r+s*.22,1.32,.18,.44,B,[.9,.88,.84],{rotY:c,aoBottom:.75}),e.addBox(t+o*.04,n+1.08,r+s*.04,1.18,2.02,.14,B,[.85,.82,.76],{rotY:c,flag:6}),e.addBox(t+o*.115,n+1.02,r+s*.115,.96,1.88,.06,se,[1,1,1],{rotY:c,flag:6}),a&&e.addBox(t+o*.12,n+2.18,r+s*.12,1.24,.28,.18,G,[.95,.92,.86],{rotY:c})}function _e(e,t,n,r,i=1){e.addCylinder(t,n,r,.14*i,.21*i,.34*i,8,oe,[1,.72,.55]),e.addCylinder(t,n+.34*i,r,.04*i,.03*i,.26*i,6,z,[.85,.72,.56]),e.addBox(t,n+.68*i,r,.38*i,.34*i,.38*i,W,[.58,.85,.48],{rotY:.4,aoBottom:.68})}function ve(e,t,n,r,i,a=1){if(i===`pine`){e.addCylinder(t,n,r,.18*a,.1*a,1.1*a,6,z,[.76,.64,.52]);for(let i=0;i<5;i++){let o=n+(.95+i*.62)*a,s=(1.55-i*.26)*a;e.addBox(t,o,r,s,.68*a,s,W,[.36,.52,.38],{rotY:i*.55,aoBottom:.62})}return}let o=1.45*a;e.addCylinder(t,n,r,.22*a,.13*a,o,7,z,[.76,.62,.5]),e.addCylinder(t,n+o*.72,r,.1*a,.06*a,.9*a,5,z,[.76,.62,.5],.35,.55),e.addCylinder(t,n+o*.78,r,.1*a,.06*a,.85*a,5,z,[.76,.62,.5],-.4,-.45);let s=i===`cherry`?le:W,c=i===`cherry`?[1,.76,.84]:[.64,.86,.48],l=i===`cherry`?[.85,.58,.68]:[.46,.66,.36],u=[[0,o+.72*a,0,1.32*a,.94*a],[.64*a,o+.48*a,.38*a,.96*a,.74*a],[-.6*a,o+.52*a,-.34*a,.92*a,.72*a]];for(let i=0;i<u.length;i++){let[a,o,d,f,p]=u[i];e.addBox(t+a,n+o,r+d,f,p,f,s,i===0?c:l,{rotY:i*.65,aoBottom:.62})}}var ye=[{id:`watermill`,name:`🎡 水车石桥`,zMin:7.5,zMax:24,playerZ:16.5,promptText:`老石水车在左侧溪流旁转动，踏上弯拱石桥就能望见整条纵深雪村`,canInteract:!1},{id:`kiln`,name:`🔥 暖光砖窑`,zMin:-2.8,zMax:7.5,playerZ:2.8,promptText:`路西侧红砖窑炉火正旺，融化了潮湿石板路的雪霜，右前方木顶钟亭轻鸣`,canInteract:!0},{id:`bakery`,name:`🥐 杂货街角`,zMin:-13.5,zMax:-2.8,playerZ:-5.2,promptText:`右侧 ALIMENTARI 老字号红白雨棚下暖灯闪烁，左侧 Skeldale 玻璃温室透出绿意`,canInteract:!1},{id:`tower`,name:`⛪ 钟楼牧场`,zMin:-25,zMax:-13.5,playerZ:-15.6,promptText:`穿过钟楼罗马钟盘下的广场，路尽头就是一览无余的 Pennine 雪峰与古修道院`,canInteract:!1}];function Z(e){return Math.sin((e-2)*.115)*2.15}function be(e){return Math.cos((e-2)*.115)*2.15*.115}function xe(e){let t=e-11.5;return Math.abs(t)<3?Math.cos(t/3*Math.PI*.5)*.85:0}function Se(){let e=new he(48e3,72e3),t=new he(4096,6144),n=[];e.addTiledFloor(-38,14,38,30,-.05,16,4,W,[.8,.87,.94],.92),e.addTiledFloor(-38,-32,38,9,-.05,16,10,W,[.8,.87,.94],.92);for(let t=-24;t<=22;t+=4.5){if(t>6.5&&t<16.5)continue;let n=Z(t);e.addBox(n-5.2,.04,t,3.6,.24,3.8,W,[.78,.85,.92],{rotZ:.06,aoBottom:.82}),e.addBox(n+5.2,.04,t,3.6,.24,3.8,W,[.78,.85,.92],{rotZ:-.06,aoBottom:.82})}for(let t=25;t>=-25.5;--t){if(t>8.6&&t<14.4)continue;let n=Z(t),r=-Math.atan(be(t)),i=Math.cos(r),a=-Math.sin(r);e.addBox(n,-.02,t,5.2,.08,1.32,ae,[1,.98,.95],{rotY:r,aoBottom:.94}),e.addBox(n-2.76*i,.08,t-2.76*a,.42,.2,1.38,B,[.84,.82,.78],{rotY:r,aoBottom:.72}),e.addBox(n+2.76*i,.08,t+2.76*a,.42,.2,1.38,B,[.84,.82,.78],{rotY:r,aoBottom:.72})}e.addTiledFloor(-28,9,28,14,-.98,10,2,q,[.64,.72,.78],.84),e.addBox(0,-.45,9,56,.98,.28,q,[.84,.86,.88]),e.addBox(0,-.45,14,56,.98,.28,q,[.84,.86,.88]),t.addTiledFloor(-28,9,28,14,-.24,12,2,ae,[.22,.56,.68],1,3);for(let t=0;t<18;t++){let n=(8.5+t/18*6+(8.5+(t+1)/18*6))*.5,r=Z(n),i=-Math.atan(be(n)),a=xe(n),o=Math.sin((n-11.5)/3*Math.PI*.5)*.44;e.addBox(r,a-.14,n,5.2,.3,6/18*1.24,ae,[1,.98,.95],{rotX:o,rotY:i,aoBottom:.7});for(let t of[-2.62,2.62])e.addBox(r+t,a+.36,n,.34,.78,6/18*1.22,B,[.92,.9,.86],{rotX:o,rotY:i,aoBottom:.78})}for(let t of[8.7,14.3]){let r=Z(t);for(let i of[-2.65,2.65]){let a=r+i;e.addBox(a,.42,t,.5,.92,.5,B,[.9,.88,.84]),e.addBox(a,1.12,t,.11,.55,.11,J,[.22,.24,.28],{flag:6}),e.addBox(a,1.46,t,.24,.26,.24,U,[1,.88,.56],{flag:2}),n.push({x:a,y:1.5,z:t,r:1,g:.74,b:.34,radius:5.8,intensity:1.75,kind:`bridge`})}}let r=Z(22);for(let t of[-1,1])e.addBox(r+t*3.8,1.35,22,.78,2.7,.78,q,[.88,.86,.82],{aoBottom:.68}),e.addBox(r+t*3.8,2.78,22,.96,.26,.96,B,[.92,.9,.88]),e.addBox(r+t*3.8,3.12,22,.22,.28,.22,U,[1,.88,.56],{flag:2}),n.push({x:r+t*3.8,y:3.12,z:22,r:1,g:.74,b:.34,radius:5.5,intensity:1.45,kind:`lantern`});let i=Z(11.5)-6.7,a=6.6;e.addBox(i,2.25,a,5.2,4.5,4.6,q,[.94,.92,.9],{aoBottom:.72}),e.addPrismGable(i,4.5,a,5.2,4.6,1.65,!0,q,H,[.92,.9,.88],[.92,.96,1.04]),e.addBox(i-1.3,5.9,6,.62,1.5,.62,q,[.86,.84,.82]),ge(e,i+2.6,0,6,`E`,!1),X(e,n,i+2.6,1.45,7.699999999999999,`E`,{width:.95,height:1.12,shutters:!0,emitBounce:!0}),X(e,n,i+2.6,3.25,5.8,`E`,{width:.88,height:1.05,shutters:!0}),X(e,n,i+2.6,3.25,7.699999999999999,`E`,{width:.88,height:1.05,shutters:!0,emitBounce:!0}),X(e,n,i-.8,1.55,8.899999999999999,`S`,{width:.92,height:1.1,shutters:!0,emitBounce:!0}),X(e,n,i+1.2,3.25,8.899999999999999,`S`,{width:.92,height:1.1,shutters:!0,emitBounce:!0}),Y(e,n,i+2.62,2.38,6.75,1,0,5.8,1.9),Y(e,n,i+1.75,2.38,8.92,0,1,5.5,1.65),e.addBox(i-.4,3.85,10.4,4.6,.26,.68,z,[.85,.76,.66],{aoBottom:.7});for(let t of[i-2.1,i+1.4])e.addBox(t,1.9,10.4,.2,3.8,.2,z,[.76,.68,.58]);let o=[i+.85,2.02,10.75];e.addBox(o[0],o[1],o[2]-.8,.28,.28,1.8,J,[.28,.28,.32],{flag:6});let s=Z(16.4)+5.65,c=16.4;e.addBox(s,2.15,c,4.4,4.3,5.4,q,[.94,.91,.86],{aoBottom:.72}),e.addPrismGable(s,4.3,c,4.4,5.4,1.55,!1,q,H,[.92,.89,.84],[.92,.96,1.04]),e.addBox(s+.9,5.6,15.2,.58,1.45,.58,q,[.85,.82,.78]),ge(e,s-2.2,0,15.599999999999998,`W`,!0),X(e,n,s-2.2,1.42,17.5,`W`,{width:1.02,height:1.15,shutters:!0,emitBounce:!0}),X(e,n,s-2.2,3.18,15.399999999999999,`W`,{width:.92,height:1.06,shutters:!0,flowerBox:!0}),X(e,n,s-2.2,3.18,17.5,`W`,{width:.92,height:1.06,shutters:!0,emitBounce:!0}),Y(e,n,s-2.22,2.32,16.45,-1,0,5.8,1.9);for(let t=0;t<3;t++)e.addBox(s-2.48,.14+t*.22,18.65,.45,.2,.85-t*.14,z,[.76,.62,.48],{flag:6});let l=.6,u=Z(l)-4.7,d=[u+1.55,.68,l];e.addCylinder(u,0,l,2.05,1.72,1.5,12,q,[.9,.86,.82]),e.addCylinder(u,1.5,l,1.72,1.02,1.08,12,V,[.88,.68,.54]),e.addCylinder(u,2.58,l,.44,.36,1.25,8,q,[.74,.7,.68]);for(let t=0;t<9;t++){let n=t/8*Math.PI,r=l+Math.cos(n)*.76,i=.72+Math.sin(n)*.74;e.addBox(u+1.82,i,r,.68,.3,.24,V,[.92,.45,.3],{rotX:-(n-Math.PI*.5),flag:6})}e.addBox(u+1.48,.22,l,1.65,.44,2.15,B,[.82,.78,.74]),e.addBox(u+1.62,.7,l,.76,.8,1.18,me,[1,.88,.58],{flag:5}),e.addCylinder(u+1.84,.55,.42,.08,.07,.55,6,me,[1,.72,.42],.4,.8,5),e.addCylinder(u+1.86,.52,.76,.08,.07,.52,6,me,[1,.72,.42],-.35,-.7,5),n.push({x:u+2.55,y:.92,z:l,r:1,g:.46,b:.12,radius:10.8,intensity:4.3,kind:`kiln`}),e.addBox(u+1.45,1.05,2.15,.07,2.15,.07,z,[.85,.72,.56],{rotX:-.22,flag:6}),e.addBox(u+1.45,.36,2.38,.04,.52,.38,z,[.85,.72,.56],{rotX:-.22,flag:6}),e.addCylinder(u+1.85,0,1.9500000000000002,.22,.26,.46,8,z,[.82,.7,.56],0,0,6);let f=Z(-1.6)-3.65;for(let t=0;t<4;t++){let n=t===3?2:3;for(let r=0;r<n;r++){let n=-1.95+r*.46+t%2*.16,i=.11+t*.2,a=f+(t+r)%2*.06;e.addBox(a,i,n,.26,.18,.4,V,[.95-t*.05,.48+r%2*.08,.3],{rotY:(r-1)*.05,aoBottom:.65,flag:6})}}let p=Z(2.2)+4.3,m=2.2;e.addBox(p,1.55,1.4500000000000002,.22,3.1,.22,z,[.76,.66,.56]),e.addBox(p,1.55,2.95,.22,3.1,.22,z,[.76,.66,.56]),e.addBox(p,2.95,m,.3,.2,1.75,z,[.74,.64,.54]),e.addPrismGable(p,3.05,m,1.35,2.05,.78,!1,z,H,[.74,.64,.54],[.9,.94,1.02]);for(let t=0;t<3;t++)e.addBox(p,2.74-t*.22,m,t%2==0?.04:.1,.18,t%2==0?.1:.04,J,[.72,.72,.76],{flag:6});e.addCylinder(p,1.95,m,.24,.16,.28,12,J,[.86,.68,.4],0,0,6),e.addCylinder(p,1.65,m,.42,.24,.32,12,J,[.88,.7,.42],0,0,6),n.push({x:p-.55,y:2.15,z:m,r:1,g:.7,b:.34,radius:4.8,intensity:1.2,kind:`lantern`});let h=Z(-8.5)+5.25,g=-8.5;e.addBox(h,2.55,g,4.5,5.1,6.2,V,[1.02,.96,.88],{aoBottom:.74}),e.addPrismGable(h,5.1,g,4.5,6.2,1.65,!1,V,oe,[1,.95,.88],[1.02,.86,.78]);for(let t=0;t<6;t++)e.addBox(h-2.26,.45+t*.84,-11.55,.22,.42,.22,B,[.88,.84,.78]),e.addBox(h-2.26,.45+t*.84,-5.45,.22,.42,.22,B,[.88,.84,.78]);e.addBox(h+.8,6.45,-9.9,.56,1.35,.56,q,[.84,.79,.72]),ge(e,h-2.25,0,-7.05,`W`,!0),X(e,n,h-2.25,1.22,-9.65,`W`,{width:1.85,height:1.36,shutters:!1,emitBounce:!0}),X(e,n,h-2.25,3.85,-7.05,`W`,{width:1.08,height:1.28,shutters:!0,flowerBox:!0,emitBounce:!0}),X(e,n,h-2.25,3.85,-9.85,`W`,{width:1.08,height:1.28,shutters:!0,flowerBox:!0,hasCat:!0,emitBounce:!0}),X(e,n,h-.35,1.38,-5.4,`S`,{width:1.65,height:1.32,shutters:!1,emitBounce:!0}),X(e,n,h+.15,3.68,-5.4,`S`,{width:1.08,height:1.22,shutters:!0,flowerBox:!0,emitBounce:!0}),e.addBox(h,2.66,-5.37,3.85,.18,.12,z,[.58,.44,.32],{aoBottom:.72}),Y(e,n,h-1.55,2.38,-5.38,0,1,5.6,1.9),e.addBox(h-2.31,2.66,g,.14,.72,4.95,ue,[1,1,1],{aoBottom:.78,flag:6}),e.addBox(h-2.75,3.15,-5.65,1.15,.08,.08,J,[.24,.24,.28],{flag:6}),e.addBox(h-3.05,2.75,-5.65,1.15,.52,.08,ue,[1,1,1],{flag:6}),e.addBox(h-3.05,2.08,g,1.72,.09,5.2,ce,[1,1,1],{rotZ:.34,aoBottom:.68});for(let t=0;t<14;t++)e.addBox(h-3.85,1.72,-10.85+t*.36,.05,.18,.32,ce,t%2==0?[1,.85,.82]:[1,1,1],{flag:6});e.addBox(h-2.29,2.25,-5.82,.04,.28,.42,de,[1,1,1],{flag:6}),Y(e,n,h-2.32,2.68,-5.95,-1,0,5.8,2.1),Y(e,n,h-2.32,2.68,-11.05,-1,0,5.8,2.1);let _=[[1,.55,.12],[.98,.88,.2],[.92,.22,.18],[.45,.78,.3]];for(let t=0;t<4;t++){let n=-9.05-t%2*.92,r=h-2.68-Math.floor(t/2)*.62,i=.52-Math.floor(t/2)*.18;e.addBox(r,i*.5,n,.54,i,.82,z,[.85,.72,.54],{aoBottom:.62,flag:6});for(let a=-2;a<=2;a++)e.addBox(r,i+.06,n+a*.14,.11,.11,.11,V,_[t],{flag:6})}_e(e,h-2.95,0,-6.05,1.15);let v=Z(-6.2)-4.85,y=-6.2;e.addBox(v,.28,y,3.05,.56,2.85,q,[.88,.85,.8]),e.addBox(v,.72,y,2.25,.25,2.05,W,[.58,.88,.48]),e.addBox(v,1.68,y,.2,.24,.2,U,[1,.88,.52],{flag:2}),n.push({x:v,y:1.55,z:y,r:1,g:.78,b:.42,radius:6.2,intensity:2,kind:`lantern`});for(let t of[v-1.48,v,v+1.48])for(let n of[-7.58,-4.82])e.addBox(t,1.24,n,.08,1.48,.08,B,[.95,.95,.95]);t.addBox(v,1.24,y,2.94,1.4,2.74,U,[.24,.42,.44],{flag:4}),t.addBox(v,2.18,-6.8500000000000005,2.98,.06,1.44,U,[.28,.46,.48],{rotX:-.46,flag:4}),t.addBox(v,2.18,-5.55,2.98,.06,1.44,U,[.28,.46,.48],{rotX:.46,flag:4});let b=Z(-11.8)-5.4,x=-11.8;e.addBox(b,2.15,x,4.2,4.3,4.8,q,[.92,.9,.86],{aoBottom:.72}),e.addPrismGable(b,4.3,x,4.2,4.8,1.45,!1,q,H,[.9,.88,.84],[.92,.96,1.04]),ge(e,b+2.1,0,-10.9,`E`,!0),X(e,n,b+2.1,1.35,-12.8,`E`,{width:1,height:1.15,shutters:!0,emitBounce:!0}),X(e,n,b+2.1,3.15,-10.9,`E`,{width:.9,height:1.05,shutters:!0,emitBounce:!0}),X(e,n,b+2.1,3.15,-12.8,`E`,{width:.9,height:1.05,shutters:!0}),Y(e,n,b+2.12,2.28,-11.8,1,0,5.6,1.85);let S=Z(-19.5)-5.1,C=-19.5;e.addBox(S,.45,C,3.3,.9,3.3,q,[.88,.85,.78]),e.addBox(S,4.35,C,2.6,7,2.6,B,[1,.97,.9]);for(let t of[S-1.28,S+1.28])for(let n of[-20.78,-18.22])e.addBox(t,4.2,n,.3,7.2,.3,q,[.84,.8,.72]);e.addBox(S,6.55,-18.18,1.42,1.42,.08,K,[1,1,1],{flag:2}),e.addBox(S+1.32,6.55,C,.08,1.42,1.42,K,[1,1,1],{flag:2}),e.addBox(S,7.95,C,2.8,.24,2.8,B,[.92,.88,.82]);for(let t of[S-1.05,S+1.05])for(let n of[-20.55,-18.45])e.addBox(t,8.65,n,.26,1.25,.26,B,[.9,.88,.82]);e.addCylinder(S,8.35,C,.32,.18,.45,8,K,[.95,.78,.4]),e.addCylinder(S,9.25,C,1.88,.06,2.35,4,H,[.92,.96,1.05]),ge(e,S+1.32,0,C,`E`,!0),Y(e,n,S+1.34,2.45,-18.6,1,0,5.8,1.9),n.push({x:S+1.5,y:6.55,z:-18,r:1,g:.78,b:.44,radius:6,intensity:1.4,kind:`lantern`});let w=Z(-16.2)+4.4;e.addBox(w,.42,-16.2,1.15,.84,1.9,z,[.85,.74,.58]),e.addBox(w-.15,2.02,-16.2,1.5,.08,2.1,fe,[1,1,1],{rotZ:.24}),e.addBox(w-.55,1.65,-16.2,.14,.18,.14,U,[1,.88,.55],{flag:2}),n.push({x:w-.55,y:1.55,z:-16.2,r:1,g:.72,b:.32,radius:5.2,intensity:1.6,kind:`lantern`});let T=Z(-20.8)+4.8;e.addBox(T-1.8,.38,-20.8,.36,.76,6.2,q,[.88,.88,.9]),e.addCylinder(T+1.2,0,-21.2,.5,.5,.75,10,V,[1.15,.96,.46],0,Math.PI*.5),e.addCylinder(T+1.8,0,-22,.46,.46,.7,10,V,[1.12,.94,.44],0,Math.PI*.5);let E=Z(-25.4);e.addBox(E,.42,-25.4,16,.84,.42,q,[.88,.88,.9],{aoBottom:.68});for(let t of[-3.05,3.05])e.addBox(E+t,.62,-25.3,.52,1.24,.52,B,[.92,.9,.86]),e.addBox(E+t,1.38,-25.3,.22,.24,.22,U,[1,.88,.54],{flag:2}),n.push({x:E+t,y:1.42,z:-25.3,r:1,g:.74,b:.34,radius:5.5,intensity:1.65,kind:`lantern`});for(let[t,r]of[[19.2,-1],[5.8,1],[-2.8,-1],[-13.8,1],[-22.6,-1]]){let i=Z(t)+r*2.95;e.addBox(i,1.25,t,.12,2.5,.12,J,[.22,.24,.28],{flag:6}),e.addBox(i,2.58,t,.22,.24,.22,U,[1,.86,.54],{flag:2}),n.push({x:i,y:2.55,z:t,r:1,g:.72,b:.34,radius:5.8,intensity:1.85,kind:`lantern`})}for(let[t,n]of[[20.2,-1],[7.2,1],[-3.6,-1],[-14.8,1]]){let r=Z(t)+n*5.85;e.addCylinder(r,0,t,.26,.16,4.4,7,z,[.46,.38,.32],0,n*.08),e.addCylinder(r,3.3,t,.14,.08,2.4,6,z,[.46,.38,.32],0,n*.62),e.addBox(r,5.15,t,1.9,1.05,1.85,W,[.36,.5,.38],{rotY:t*.3,aoBottom:.65}),e.addBox(r-n*1.15,5.05,t+.35,1.45,.88,1.4,W,[.38,.52,.4],{rotZ:n*.25,aoBottom:.68}),e.addBox(r+n*.65,4.65,t-.45,1.35,.85,1.3,W,[.34,.46,.36],{rotY:-.4,aoBottom:.62})}for(let[t,n,r]of[[-11.5,20.5,1.35],[10.8,21,1.25],[-12.5,4.2,1.4],[11.6,5.4,1.3],[-11.2,-2.5,1.15],[11.4,-3.5,1.25],[-10.8,-16.5,1.3],[11.5,-14.2,1.35],[-10.5,-26.5,1.45],[9.8,-26.8,1.4]])ve(e,Z(n)+t,0,n,`pine`,r);let D=new he(2048,3072),O=2.08;for(let e=0;e<16;e++){let t=e/16*Math.PI*2,n=Math.cos(t)*O,r=Math.sin(t)*O;for(let e of[-.42,.42])D.addBox(n,r,e,.86,.22,.16,z,[.85,.76,.64],{rotZ:t+Math.PI*.5,flag:6});D.addBox(n*1.02,r*1.02,0,.34,.08,.82,z,[.74,.65,.54],{rotZ:t+.32,flag:6})}for(let e=0;e<6;e++){let t=e/6*Math.PI;for(let e of[-.32,.32])D.addBox(0,0,e,O*2,.14,.1,z,[.78,.68,.56],{rotZ:t,flag:6})}D.addCylinder(0,0,-.5,.34,.34,1,10,J,[.75,.76,.8],Math.PI*.5,0,6);let k=new he(256,512);k.addBox(0,.38,0,.48,.42,.72,V,[.96,.94,.9],{flag:6}),k.addBox(0,.48,.42,.24,.24,.28,J,[.22,.22,.25],{flag:6});let A=new he(512,1024);A.addBox(0,.85,0,.46,.62,.3,V,[.96,.86,.72],{flag:6}),A.addBox(0,1.14,.04,.38,.15,.34,ce,[1,.32,.28],{flag:6}),A.addBox(0,1.34,0,.28,.28,.28,V,[1,.86,.76],{flag:6}),A.addBox(0,1.5,.03,.32,.11,.36,z,[.54,.44,.34],{flag:6});let j=new he(128,256);j.addBox(0,-.26,0,.15,.54,.17,q,[.34,.36,.42],{flag:6});let M=new he(256,512);return M.addBox(0,-.2,.12,.14,.42,.15,V,[.96,.86,.72],{rotX:-.45,flag:6}),M.addBox(0,-.42,.3,.04,.12,.04,J,[.3,.3,.3],{flag:6}),M.addBox(0,-.54,.3,.18,.22,.18,U,[1,.9,.56],{flag:2}),{opaque:e.build(),trans:t.build(),waterwheel:D.build(),wheelPivot:o,sheepMesh:k.build(),sheepSpots:[{x:T+.6,z:-19.2,yaw:.8,phase:.1},{x:T+2.1,z:-20.5,yaw:-1.1,phase:.45},{x:T+.9,z:-22.2,yaw:.3,phase:.78},{x:T+2.5,z:-22.9,yaw:-.4,phase:.32}],heroTorso:A.build(),heroLeg:j.build(),heroArmLantern:M.build(),lights:n,kilnPos:d}}var Ce=2048,we=96;function Q(e){let t=e%24;return t<0?t+24:t}function Te(e,t,n){let r=Math.max(0,Math.min(1,(n-e)/(t-e)));return r*r*(3-2*r)}function Ee(e){let t=Math.hypot(e[0],e[1],e[2])||1;return[e[0]/t,e[1]/t,e[2]/t]}function De(e,t){let n=Q(e);if(t===`morning`)return{mode:t,umbraCx:-200,umbraStrength:0,lightsIntensity:.25,sunIntensity:1.25,sunDir:Ee([-.52,.54,.66]),sunColor:[1,.94,.86],ambientCool:[.24,.31,.44],fogColor:[.64,.72,.82],bgGrade:[1.22,1.2,1.26],starVis:0};if(t===`night`)return{mode:t,umbraCx:-200,umbraStrength:0,lightsIntensity:1.15,sunIntensity:.16,sunDir:Ee([.38,.68,.62]),sunColor:[.36,.52,.92],ambientCool:[.04,.065,.13],fogColor:[.06,.09,.16],bgGrade:[.22,.3,.52],starVis:1};if(t===`eclipse`){let e=16-Math.max(0,Math.min(1,(n-4.5)/15))*48,r=Te(4.5,6.2,n)*(1-Te(17.8,19.5,n)),i=Te(5.5,11.5,n)*(1-Te(12.5,18.5,n))*.62;return{mode:t,umbraCx:e,umbraStrength:r,lightsIntensity:.45+i*2,sunIntensity:1.25*(1-i*.22),sunDir:Ee([-.56,.58,.59]),sunColor:[1,.88-i*.18,.72-i*.28],ambientCool:[.18*(1-i*.68),.24*(1-i*.66),.36*(1-i*.45)],fogColor:[.46*(1-i*.72),.54*(1-i*.68),.66*(1-i*.52)],bgGrade:[.96-i*.52,.96-i*.5,1.05-i*.32],starVis:i*.95}}return{mode:t,umbraCx:-200,umbraStrength:0,lightsIntensity:1,sunIntensity:.34,sunDir:Ee([-.68,.36,.64]),sunColor:[.92,.74,.58],ambientCool:[.11,.16,.26],fogColor:[.26,.33,.44],bgGrade:[.88,.92,1.04],starVis:.15}}function Oe(e,t,n){for(let r=0;r<4;r++){let i=n[r*4],a=n[r*4+1],o=n[r*4+2],s=n[r*4+3];e[r*4]=t[0]*i+t[4]*a+t[8]*o+t[12]*s,e[r*4+1]=t[1]*i+t[5]*a+t[9]*o+t[13]*s,e[r*4+2]=t[2]*i+t[6]*a+t[10]*o+t[14]*s,e[r*4+3]=t[3]*i+t[7]*a+t[11]*o+t[15]*s}return e}function ke(e,t){let n=t[0],r=t[1],i=t[2],a=t[3],o=t[4],s=t[5],c=t[6],l=t[7],u=t[8],d=t[9],f=t[10],p=t[11],m=t[12],h=t[13],g=t[14],_=t[15],v=n*s-r*o,y=n*c-i*o,b=n*l-a*o,x=r*c-i*s,S=r*l-a*s,C=i*l-a*c,w=u*h-d*m,T=u*g-f*m,E=u*_-p*m,D=d*g-f*h,O=d*_-p*h,k=f*_-p*g,A=v*k-y*O+b*D+x*E-S*T+C*w;return A?(A=1/A,e[0]=(s*k-c*O+l*D)*A,e[1]=(i*O-r*k-a*D)*A,e[2]=(h*C-g*S+_*x)*A,e[3]=(f*S-d*C-p*x)*A,e[4]=(c*E-o*k-l*T)*A,e[5]=(n*k-i*E+a*T)*A,e[6]=(g*b-m*C-_*y)*A,e[7]=(u*C-f*b+p*y)*A,e[8]=(o*O-s*E+l*w)*A,e[9]=(r*E-n*O-a*w)*A,e[10]=(m*S-h*b+_*v)*A,e[11]=(d*b-u*S-p*v)*A,e[12]=(s*T-o*D-c*w)*A,e[13]=(n*D-r*T+i*w)*A,e[14]=(h*y-m*x-g*v)*A,e[15]=(u*x-d*y+f*v)*A,!0):!1}function Ae(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i),l=Math.cos(a),u=Math.sin(a),d=Math.cos(o),f=Math.sin(o);return e[0]=l*d+u*c*f,e[1]=s*f,e[2]=-u*d+l*c*f,e[3]=0,e[4]=-l*f+u*c*d,e[5]=s*d,e[6]=u*f+l*c*d,e[7]=0,e[8]=u*s,e[9]=-c,e[10]=l*s,e[11]=0,e[12]=t,e[13]=n,e[14]=r,e[15]=1,e}function je(e,t,n,r,i){let a=1/Math.tan(t*.5),o=1/(r-i);e.fill(0),e[0]=a/n,e[5]=a,e[10]=(i+r)*o,e[11]=-1,e[14]=2*i*r*o}function Me(e,t,n,r,i,a,o){let s=1/(t-n),c=1/(r-i),l=1/(a-o);e.fill(0),e[0]=-2*s,e[5]=-2*c,e[10]=2*l,e[12]=(t+n)*s,e[13]=(i+r)*c,e[14]=(o+a)*l,e[15]=1}function Ne(e,t,n,r){let i=t[0]-n[0],a=t[1]-n[1],o=t[2]-n[2],s=Math.hypot(i,a,o)||1;i/=s,a/=s,o/=s;let c=r[1]*o-r[2]*a,l=r[2]*i-r[0]*o,u=r[0]*a-r[1]*i;s=Math.hypot(c,l,u)||1,c/=s,l/=s,u/=s;let d=a*u-o*l,f=o*c-i*u,p=i*l-a*c;e[0]=c,e[4]=l,e[8]=u,e[12]=-(c*t[0]+l*t[1]+u*t[2]),e[1]=d,e[5]=f,e[9]=p,e[13]=-(d*t[0]+f*t[1]+p*t[2]),e[2]=i,e[6]=a,e[10]=o,e[14]=-(i*t[0]+a*t[1]+o*t[2]),e[3]=0,e[7]=0,e[11]=0,e[15]=1}var Pe=`#version 300 es
layout(location = 0) in vec3 aPos;
uniform mat4 uMVP;
void main() { gl_Position = uMVP * vec4(aPos, 1.0); }
`,Fe=`#version 300 es
precision highp float;
void main() {}
`,Ie=`#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aUv;
layout(location = 3) in vec3 aTint;
layout(location = 4) in float aAo;
layout(location = 5) in float aFlags;

uniform mat4 uModel;
uniform mat4 uVP;

out vec3 vWorldPos;
out vec3 vWorldNormal;
out vec2 vUv;
out vec3 vTint;
out float vAo;
out float vFlags;

void main() {
  vec4 wp = uModel * vec4(aPos, 1.0);
  vWorldPos = wp.xyz;
  vWorldNormal = normalize(mat3(uModel) * aNormal);
  vUv = aUv;
  vTint = aTint;
  vAo = aAo;
  vFlags = aFlags;
  gl_Position = uVP * wp;
}
`,Le=`#version 300 es
precision highp float;

in vec3 vWorldPos;
in vec3 vWorldNormal;
in vec2 vUv;
in vec3 vTint;
in float vAo;
in float vFlags;

uniform sampler2D uAlbedoAtlas;
uniform sampler2D uNormalAtlas;
uniform sampler2D uMatAtlas;
uniform float uLightsIntensity;
uniform vec3 uKilnPos;
uniform float uKilnBoost;

layout(location = 0) out vec4 outRT0; // albedo.rgb, roughness
layout(location = 1) out vec4 outRT1; // normal.xyz*0.5+0.5, metallic
layout(location = 2) out vec4 outRT2; // emissive.rgb/4.0, ao

vec3 perturbNormal(vec3 N, vec3 p, vec2 uv) {
  vec3 mapN = texture(uNormalAtlas, uv).xyz * 2.0 - 1.0;
  vec3 dp1 = dFdx(p);
  vec3 dp2 = dFdy(p);
  vec2 duv1 = dFdx(uv);
  vec2 duv2 = dFdy(uv);
  vec3 dp2perp = cross(dp2, N);
  vec3 dp1perp = cross(N, dp1);
  vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;
  vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;
  float maxLen = max(dot(T, T), dot(B, B));
  if (maxLen < 1e-10) return N;
  float invmax = inversesqrt(maxLen);
  return normalize(mat3(T * invmax, B * invmax, N) * mapN);
}

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  vec3 texCol = texture(uAlbedoAtlas, vUv).rgb;
  vec4 matSample = texture(uMatAtlas, vUv);
  vec3 N = perturbNormal(normalize(vWorldNormal), vWorldPos, vUv);

  vec3 baseSrgb = clamp(texCol * vTint, vec3(0.0), vec3(1.0));
  float rough = clamp(matSample.r, 0.08, 0.98);
  float metal = matSample.g;
  float ao = clamp(vAo * (0.45 + 0.55 * matSample.b), 0.15, 1.0);

  // Physical Winter Snow Drift along Winding Cobblestone Corridor + Thermal Kiln Snow-Melt!
  float snowExempt = step(4.5, vFlags); // exclude FIRE & SNOW_EXEMPT props
  float kilnDist = length(vWorldPos.xz - uKilnPos.xz);
  float kilnMelt = 1.0 - smoothstep(1.8, 5.8, kilnDist);
  float laneCx = sin((vWorldPos.z - 2.0) * 0.115) * 2.15;
  float driftWobble = 0.28 * sin(vWorldPos.z * 0.95 + vWorldPos.x * 0.65) + 0.16 * cos(vWorldPos.z * 2.3 - vWorldPos.x * 1.4);
  float roadTraffic = 1.0 - 0.72 * (1.0 - smoothstep(0.6, 2.75, abs(vWorldPos.x - (laneCx + driftWobble))));
  float nSnow = hash21(floor(vWorldPos.xz * 26.0));
  float snowGrain = 0.86 + 0.14 * sin(vWorldPos.x * 2.4 + cos(vWorldPos.z * 2.1));
  float snowMask = smoothstep(0.48, 0.88, N.y) * (1.0 - snowExempt) * (1.0 - kilnMelt) * roadTraffic;

  vec3 snowTone = vec3(0.84, 0.89, 0.95) * snowGrain;
  baseSrgb = mix(baseSrgb, snowTone, snowMask * 0.72);
  rough = mix(rough, 0.64 + nSnow * 0.20, snowMask * 0.78);
  // Wet melted cobbles near hot brick kiln turn dark & glossy!
  float wetCobble = kilnMelt * smoothstep(0.55, 0.95, N.y) * (1.0 - snowExempt);
  baseSrgb *= mix(1.0, 0.70, wetCobble);
  rough = mix(rough, 0.16, wetCobble * 0.85);

  vec3 emissive = vec3(0.0);
  if (vFlags > 0.5 && vFlags < 1.5) {
    // 3D Interior Room Window
    vec3 texLin = pow(baseSrgb, vec3(2.2));
    emissive = texLin * vec3(1.45, 0.90, 0.42) * (0.42 + 1.58 * matSample.a) * uLightsIntensity;
    baseSrgb *= mix(0.30, 0.14, clamp(uLightsIntensity, 0.0, 1.0));
  } else if (vFlags > 1.5 && vFlags < 2.5) {
    // Lantern filament or Clock dial
    vec3 texLin = pow(baseSrgb, vec3(2.2));
    emissive = texLin * vec3(1.75, 1.12, 0.46) * (0.15 + 2.4 * uLightsIntensity);
  } else if (vFlags > 4.5 && vFlags < 5.5) {
    // Blazing Brick Kiln Hearth Embers & Firebox Coals!
    vec3 texLin = pow(baseSrgb, vec3(2.2));
    emissive = texLin * vec3(2.6, 1.05, 0.24) * (1.6 + uKilnBoost * 1.4);
  }

  outRT0 = vec4(baseSrgb, rough);
  outRT1 = vec4(N * 0.5 + 0.5, metal);
  outRT2 = vec4(clamp(emissive / 4.0, vec3(0.0), vec3(1.0)), ao);
}
`,Re=`#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`,ze=`#version 300 es
precision highp float;

in vec2 vUv;

uniform sampler2D uRT0;
uniform sampler2D uRT1;
uniform sampler2D uRT2;
uniform sampler2D uGDepth;
uniform sampler2D uShadowMap;
uniform sampler2D uAiBgTex;

uniform mat4 uInvVP;
uniform mat4 uVP;
uniform mat4 uLightVP;
uniform vec3 uCameraPos;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uSunIntensity;
uniform vec3 uAmbientCool;
uniform vec3 uFogColor;
uniform vec3 uBgGrade;
uniform float uStarVis;
uniform vec2 uUmbra; // cx, strength
uniform int uBgMode; // 0 = AI painting, 1 = Procedural GLSL mountains
uniform float uPhase;
uniform float uMousePx;
uniform float uMousePy;
uniform float uCamYaw;
uniform float uCamPitch;
uniform float uValleyDepth;
uniform float uHdrScale;
uniform vec2 uResolution;

const vec2 POISSON[12] = vec2[](
  vec2(-0.326, -0.405), vec2(-0.840, -0.073), vec2(-0.695,  0.457),
  vec2(-0.203,  0.620), vec2( 0.962, -0.194), vec2( 0.473, -0.480),
  vec2( 0.519,  0.767), vec2( 0.185, -0.893), vec2( 0.507,  0.064),
  vec2( 0.896,  0.412), vec2(-0.321, -0.932), vec2(-0.791, -0.597)
);

const vec3 SSAO_DIRS[8] = vec3[](
  vec3( 0.42,  0.35,  0.40), vec3(-0.45,  0.28,  0.35),
  vec3( 0.22,  0.62, -0.35), vec3(-0.32,  0.48, -0.42),
  vec3( 0.65,  0.18, -0.15), vec3(-0.62,  0.15,  0.22),
  vec3( 0.12,  0.25,  0.68), vec3(-0.15,  0.72, -0.12)
);

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float hash11(float p) {
  float x = fract(p * 0.1031);
  x *= x + 33.33;
  x *= x + x;
  return fract(x);
}

float noise1D(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(hash11(i), hash11(i + 1.0), u);
}

float ridge1D(float x) {
  float sum = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int k = 0; k < 4; k++) {
    float n = 1.0 - abs(noise1D(x * freq + float(k) * 17.3) * 2.0 - 1.0);
    sum += n * n * amp;
    freq *= 2.15;
    amp *= 0.48;
  }
  return sum;
}

float noise21(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm2(vec2 p) {
  const mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
  float v = 0.0;
  float a = 0.52;
  vec2 q = p;
  for (int i = 0; i < 4; i++) {
    v += a * noise21(q);
    q = rot * q * 2.04 + vec2(5.2, 1.3);
    a *= 0.48;
  }
  return v;
}

vec3 reconstructWorldPos(vec2 uv, float depth) {
  vec4 ndc = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
  vec4 wp = uInvVP * ndc;
  return wp.xyz / wp.w;
}

// Pipeline B: 100% Pure GLSL Layered Pennine Mountains, Storm Clouds & Distant Ruined Abbey!
vec3 evalProceduralMountainVista(vec2 uv) {
  float zoom = 1.0 + uValleyDepth * 0.14;
  vec2 tiltedUv = vec2(uv.x, uv.y + uCamPitch * 0.48);
  vec2 zuv = (tiltedUv - vec2(0.5, 0.42)) / zoom + vec2(0.5, 0.42);
  float px = uCamYaw * 0.28 + uCameraPos.x * 0.010 + uMousePx * 0.025;
  float py = (uCameraPos.y - 2.6) * 0.015 + uMousePy * 0.015 - 0.04;

  // Sky twilight gradient + warm pass glow (balanced sRGB luminosity so blue-hour clouds match AI depth)
  vec3 zenith = vec3(0.24, 0.32, 0.46) * uBgGrade;
  vec3 midSky = vec3(0.36, 0.45, 0.58) * uBgGrade;
  vec3 horizon = mix(vec3(0.56, 0.60, 0.68), vec3(0.92, 0.78, 0.58), exp(-pow((zuv.x - 0.54) * 2.3, 2.0))) * uBgGrade;
  vec3 sky = mix(horizon, midSky, smoothstep(0.28, 0.58, zuv.y));
  sky = mix(sky, zenith, smoothstep(0.52, 0.96, zuv.y));

  // Soft swirling winter clouds with subtle silver rim
  vec2 cUv = vec2(zuv.x * 2.6 + px * 0.22 + uPhase * 0.20, zuv.y * 5.2 + py * 0.18);
  float clouds = fbm2(cUv);
  float cloudMask = smoothstep(0.42, 0.76, clouds) * smoothstep(0.32, 0.88, zuv.y) * (1.0 - smoothstep(0.86, 1.0, zuv.y));
  vec3 cloudDark = mix(vec3(0.24, 0.30, 0.42), vec3(0.68, 0.68, 0.74), smoothstep(0.35, 0.68, zuv.y)) * uBgGrade;
  sky = mix(sky, cloudDark, cloudMask * 0.56);

  // Subtle eclipsed sun corona when in Eclipse mode
  if (uUmbra.y > 0.05) {
    vec2 sunUv = vec2(0.54 - px * 0.18, 0.70 - py * 0.12);
    float dSun = length((zuv - sunUv) * vec2(1.75, 1.0));
    float corona = exp(-dSun * 8.5) * uUmbra.y;
    float moonDisc = 1.0 - smoothstep(0.032, 0.038, dSun);
    sky += vec3(0.96, 0.76, 0.44) * corona * 0.78;
    sky = mix(sky, vec3(0.03, 0.04, 0.08), moonDisc * uUmbra.y * 0.92);
  }

  // Pinpoint twinkling stars if night/eclipse
  if (uStarVis > 0.05 && zuv.y > 0.50) {
    float st = hash21(floor(uv * uResolution * 0.22));
    if (st > 0.996) sky += vec3(0.78, 0.85, 1.0) * uStarVis * (1.0 - cloudMask * 0.7);
  }

  vec3 col = sky;

  // Far Ridged Multifractal Pennine Range with lit west-facing snow couloirs
  float x1 = zuv.x + px * 0.30;
  float r1 = ridge1D(x1 * 4.2 + 1.3);
  float h1 = 0.46 + 0.24 * r1 + 0.05 * sin(x1 * 3.1);
  if (zuv.y < h1) {
    float slope = (ridge1D((x1 + 0.008) * 4.2 + 1.3) - r1) * 14.0;
    float snowFace = smoothstep(h1 - 0.15, h1, zuv.y);
    float sunlit = clamp(0.45 - slope * 0.35, 0.05, 1.0);
    vec3 rockCol = vec3(0.20, 0.26, 0.36) * uBgGrade;
    vec3 snowCol = mix(vec3(0.56, 0.65, 0.78), vec3(0.84, 0.88, 0.92), sunlit) * uBgGrade;
    vec3 peakCol = mix(rockCol, snowCol, smoothstep(0.18, 0.72, snowFace + sunlit * 0.25));
    col = mix(peakCol, uFogColor, 0.22 + (1.0 - snowFace) * 0.22);
  }

  // Mid Ridge + Distant Ruined Yorkshire Abbey Silhouette right down the valley pass!
  float x2 = zuv.x + px * 0.52;
  float r2 = ridge1D(x2 * 5.6 + 8.4);
  float h2 = 0.36 + 0.14 * r2 + 0.03 * cos(x2 * 4.2 - 0.7);
  float abbeyDist = abs(x2 - 0.53);
  if (abbeyDist < 0.036) {
    float spireLeft = smoothstep(0.018, 0.012, abs(x2 - 0.518)) * 0.072;
    float naveRight = smoothstep(0.022, 0.016, abs(x2 - 0.542)) * 0.056;
    float abbeyH = h2 + 0.024 + max(spireLeft, naveRight);
    float lancetGap = (abs(x2 - 0.530) < 0.004 && zuv.y < h2 + 0.042 && zuv.y > h2 + 0.018) ? 1.0 : 0.0;
    if (zuv.y < abbeyH && lancetGap < 0.5) {
      col = mix(vec3(0.18, 0.23, 0.31) * uBgGrade, uFogColor, 0.32);
    }
  }
  if (zuv.y < h2) {
    float rim = smoothstep(h2 - 0.06, h2, zuv.y);
    vec3 rCol = mix(vec3(0.20, 0.26, 0.34), vec3(0.54, 0.62, 0.74), rim) * uBgGrade;
    col = mix(rCol, uFogColor, 0.36);
  }

  // Lower Distant Snow-Dusted Pine Line + Fog Mist Transition
  float x3 = zuv.x + px * 0.82;
  float pines = 0.018 * abs(sin(x3 * 92.0 + ridge1D(x3 * 12.0) * 3.0));
  float h3 = 0.29 + 0.04 * sin(x3 * 6.5 + 0.5) + 0.03 * ridge1D(x3 * 9.0) + pines;
  if (zuv.y < h3) {
    col = mix(vec3(0.14, 0.19, 0.26) * uBgGrade, uFogColor, 0.44);
  }

  // Smooth lower valley mist blending cleanly into 3D terrain dissolve
  float fogBand = 1.0 - smoothstep(0.18, 0.38, zuv.y);
  col = mix(col, uFogColor, fogBand * 0.86);
  return pow(max(col, vec3(0.0)), vec3(2.2));
}

// Pipeline A: AI-Painted Concept Panorama Plate with Multi-Speed Parallax & Depth Zoom
vec3 evalAiPanoramaVista(vec2 uv) {
  float zoom = 1.0 + uValleyDepth * 0.14;
  vec2 zuv = (uv - vec2(0.5, 0.44)) / zoom + vec2(0.5, 0.44);
  float px = clamp(uCamYaw * 0.15 + uCameraPos.x * 0.0045 + uMousePx * 0.012, -0.155, 0.155);
  float py = clamp(-uCamPitch * 0.42 + (uCameraPos.y - 2.6) * 0.010 + uMousePy * 0.008, -0.22, 0.18);
  float rawU = zuv.x * 0.68 + 0.16 + px;
  float rawV = (1.0 - zuv.y) * 0.76 + 0.14 + py;
  vec2 bgUv = vec2(clamp(rawU, 0.005, 0.995), clamp(rawV, 0.005, 0.995));
  vec3 aiCol = pow(texture(uAiBgTex, bgUv).rgb, vec3(2.2)) * uBgGrade;
  vec3 zenithLin = pow(vec3(0.11, 0.16, 0.26) * uBgGrade, vec3(2.2));
  aiCol = mix(zenithLin, aiCol, smoothstep(-0.08, 0.02, rawV));
  if (uUmbra.y > 0.05) {
    vec2 sunUv = vec2(0.54 - px * 0.5, 0.70 - uCamPitch * 0.42 - py * 0.15);
    float dSun = length((zuv - sunUv) * vec2(1.75, 1.0));
    aiCol += vec3(0.95, 0.72, 0.38) * exp(-dSun * 8.5) * uUmbra.y * 0.65;
    float moonDisc = 1.0 - smoothstep(0.032, 0.038, dSun);
    aiCol = mix(aiCol, vec3(0.02, 0.03, 0.06), moonDisc * uUmbra.y * 0.9);
  }
  if (uStarVis > 0.1 && zuv.y + uCamPitch * 0.42 > 0.52) {
    float st = hash21(floor(uv * uResolution * 0.22));
    if (st > 0.9965) aiCol += vec3(0.75, 0.84, 1.0) * uStarVis * 0.6;
  }
  vec3 fogLin = pow(uFogColor, vec3(2.2));
  float mist = 1.0 - smoothstep(0.14, 0.36, zuv.y + uCamPitch * 0.42);
  return mix(aiCol, fogLin, mist * 0.48);
}

float sampleShadow(vec3 wp, vec3 N, float ndotl) {
  vec4 sc = uLightVP * vec4(wp + N * 0.06, 1.0);
  vec3 p = sc.xyz / sc.w;
  p = p * 0.5 + 0.5;
  if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0 || p.z > 1.0) return 1.0;
  float texel = 1.0 / ${Ce}.0;
  float ang = fract(sin(dot(wp.xz, vec2(12.9898, 78.233))) * 43758.5453) * 6.283185;
  float ca = cos(ang), sa = sin(ang);
  mat2 rot = mat2(ca, -sa, sa, ca);
  float bias = max(0.0005, 0.0014 * (1.0 - ndotl));
  float spread = texel * 1.4;
  float lit = 0.0;
  for (int i = 0; i < 12; i++) {
    vec2 uv = clamp(p.xy + (rot * POISSON[i]) * spread, vec2(0.001), vec2(0.999));
    lit += step(p.z - bias, texture(uShadowMap, uv).r);
  }
  return lit / 12.0;
}

float evalContactSSAO(vec3 wp, vec3 N) {
  float camDist = length(uCameraPos - wp);
  float rad = clamp(camDist * 0.018, 0.16, 0.58);
  float ang = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) * 6.283185;
  float ca = cos(ang), sa = sin(ang);
  float occ = 0.0;
  for (int i = 0; i < 8; i++) {
    vec3 dir = SSAO_DIRS[i];
    vec3 rotDir = vec3(dir.x * ca - dir.z * sa, dir.y, dir.x * sa + dir.z * ca);
    if (dot(rotDir, N) < 0.0) rotDir = -rotDir;
    vec3 sp = wp + rotDir * rad;
    vec4 clip = uVP * vec4(sp, 1.0);
    vec2 suv = (clip.xy / clip.w) * 0.5 + 0.5;
    if (suv.x < 0.01 || suv.x > 0.99 || suv.y < 0.01 || suv.y > 0.99) continue;
    float sDepth = texture(uGDepth, suv).r;
    if (sDepth >= 0.9999) continue;
    vec3 swp = reconstructWorldPos(suv, sDepth);
    float distGap = dot(swp - wp, N);
    float range = 1.0 - smoothstep(0.04, rad * 1.6, length(swp - wp));
    occ += step(0.025, distGap) * range;
  }
  return 1.0 - clamp(occ / 8.0, 0.0, 0.72);
}

out vec4 fragColor;

void main() {
  float depth = texture(uGDepth, vUv).r;
  if (depth >= 0.9999) {
    vec3 bg = uBgMode == 0 ? evalAiPanoramaVista(vUv) : evalProceduralMountainVista(vUv);
    fragColor = vec4(bg * uHdrScale, 1.0);
    return;
  }

  vec4 rt0 = texture(uRT0, vUv);
  vec4 rt1 = texture(uRT1, vUv);
  vec4 rt2 = texture(uRT2, vUv);

  vec3 albedo = pow(rt0.rgb, vec3(2.2));
  float rough = rt0.a;
  vec3 N = normalize(rt1.rgb * 2.0 - 1.0);
  float metal = rt1.a;
  vec3 emissive = rt2.rgb * 4.0;
  float bakedAo = rt2.a;

  vec3 wp = reconstructWorldPos(vUv, depth);
  float ssao = evalContactSSAO(wp, N);
  float ao = clamp(bakedAo * ssao, 0.14, 1.0);

  // Diagonal Eclipse Lunar Umbra sweeping down deep corridor (wp.z + oblique angle)!
  float umbraDist = abs(wp.z - uUmbra.x + wp.x * 0.55);
  float localUmbra = uUmbra.y * (1.0 - smoothstep(3.0, 10.5, umbraDist));
  float umbraSunMul = mix(1.0, 0.02, localUmbra);

  vec3 V = normalize(uCameraPos - wp);
  float ndotl = max(dot(N, uSunDir), 0.0);
  float shadow = (ndotl > 0.001 && uSunIntensity * umbraSunMul > 0.01) ? sampleShadow(wp, N, ndotl) : 0.0;

  float hemi = N.y * 0.5 + 0.5;
  vec3 skyAmb = mix(uAmbientCool * 0.55, uAmbientCool * 1.15, hemi) * mix(1.0, 0.24, localUmbra);

  vec3 F0 = mix(vec3(0.04), albedo, metal);
  vec3 kD = (1.0 - F0) * (1.0 - metal);
  vec3 H = normalize(uSunDir + V);
  float a2 = pow(max(rough, 0.08), 4.0);
  float ndoth = max(dot(N, H), 0.0);
  float denom = ndoth * ndoth * (a2 - 1.0) + 1.0;
  float D = a2 / (3.14159 * denom * denom);
  float fresnel = F0.r + (1.0 - F0.r) * pow(1.0 - max(dot(H, V), 0.0), 5.0);
  vec3 specCol = mix(vec3(fresnel), F0, metal) * (D * 0.16);

  vec3 sunRad = uSunColor * (uSunIntensity * umbraSunMul * shadow * 2.0);
  vec3 direct = (kD * albedo + specCol) * sunRad * ndotl;
  vec3 color = albedo * skyAmb * ao + direct * mix(0.65, 1.0, ao) + emissive;

  // Seamless valley mist fading distant terrain (-Z horizon & deep view distance) into Plane 1 mountain vista!
  float distFade = smoothstep(26.0, 58.0, length(uCameraPos - wp));
  float backFade = smoothstep(-23.5, -33.5, wp.z) * (1.0 - smoothstep(0.5, 3.0, wp.y));
  float farFade = max(distFade, backFade);
  if (farFade > 0.001) {
    vec3 fogLin = pow(uFogColor, vec3(2.2));
    vec3 bgVista = uBgMode == 0 ? evalAiPanoramaVista(vUv) : evalProceduralMountainVista(vUv);
    color = mix(color, mix(fogLin, bgVista, 0.78), farFade * 0.92);
  }

  fragColor = vec4(color * uHdrScale, 1.0);
}
`,Be=`#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 6) in vec4 aLightPosRad;
layout(location = 7) in vec4 aLightColInt;
uniform mat4 uVP;
out vec3 vLightPos;
out float vRadius;
out vec3 vLightCol;
out float vIntensity;
void main() {
  vLightPos = aLightPosRad.xyz;
  vRadius = aLightPosRad.w;
  vLightCol = aLightColInt.rgb;
  vIntensity = aLightColInt.w;
  gl_Position = uVP * vec4(aLightPosRad.xyz + aPos * aLightPosRad.w, 1.0);
}
`,Ve=`#version 300 es
precision highp float;
in vec3 vLightPos;
in float vRadius;
in vec3 vLightCol;
in float vIntensity;
uniform sampler2D uRT0;
uniform sampler2D uRT1;
uniform sampler2D uGDepth;
uniform mat4 uInvVP;
uniform vec3 uCameraPos;
uniform vec2 uResolution;
uniform float uHdrScale;
out vec4 fragColor;
void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float depth = texture(uGDepth, uv).r;
  if (depth >= 0.9999) discard;
  vec4 wp4 = uInvVP * vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
  vec3 wp = wp4.xyz / wp4.w;
  vec3 toL = vLightPos - wp;
  float dist = length(toL);
  if (dist >= vRadius || dist < 0.02) discard;

  vec4 rt0 = texture(uRT0, uv);
  vec4 rt1 = texture(uRT1, uv);
  vec3 albedo = pow(rt0.rgb, vec3(2.2));
  float rough = rt0.a;
  vec3 N = normalize(rt1.rgb * 2.0 - 1.0);
  float metal = rt1.a;
  vec3 L = toL / dist;
  float ndotl = max(dot(N, L), 0.0);
  if (ndotl <= 0.001) discard;

  float u = clamp(dist / vRadius, 0.0, 1.0);
  float win = pow(1.0 - u * u, 2.0);
  float atten = (win / (0.40 + dist * dist * 0.36)) * vIntensity;

  vec3 V = normalize(uCameraPos - wp);
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), mix(56.0, 6.0, rough)) * mix(0.32, 0.04, rough);
  vec3 F0 = mix(vec3(0.04), albedo, metal);
  vec3 contrib = (albedo * (1.0 - metal * 0.65) * ndotl + mix(vec3(1.0), F0, metal) * spec * ndotl) * vLightCol * atten;
  fragColor = vec4(contrib * uHdrScale, 1.0);
}
`,He=`#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;
layout(location = 3) in vec3 aTint;
layout(location = 5) in float aFlags;
uniform mat4 uModel;
uniform mat4 uVP;
out vec3 vWorldPos;
out vec3 vNormal;
out vec3 vTint;
out float vFlags;
void main() {
  vec4 wp = uModel * vec4(aPos, 1.0);
  vWorldPos = wp.xyz;
  vNormal = normalize(mat3(uModel) * aNormal);
  vTint = aTint;
  vFlags = aFlags;
  gl_Position = uVP * wp;
}
`,Ue=`#version 300 es
precision highp float;
in vec3 vWorldPos;
in vec3 vNormal;
in vec3 vTint;
in float vFlags;
uniform vec3 uCameraPos;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uSunIntensity;
uniform vec3 uFogColor;
uniform float uLightsIntensity;
uniform float uPhase;
uniform float uHdrScale;
out vec4 fragColor;
void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(uCameraPos - vWorldPos);
  if (vFlags > 2.5 && vFlags < 3.5) {
    float tau = 6.2831853;
    float r1 = sin(vWorldPos.x * 2.2 - uPhase * tau * 4.0 + vWorldPos.z * 2.6);
    float r2 = cos(vWorldPos.z * 2.8 + uPhase * tau * 5.0 - vWorldPos.x * 1.8);
    vec3 wN = normalize(N + vec3(r1 * 0.14, 0.0, r2 * 0.14));
    float fresnel = mix(0.24, 0.88, pow(1.0 - max(dot(wN, V), 0.0), 3.0));
    vec3 H = normalize(uSunDir + V);
    float spec = pow(max(dot(wN, H), 0.0), 84.0) * uSunIntensity * 1.2;
    vec3 waterCol = pow(vTint, vec3(2.2)) * (0.28 + 0.72 * uSunIntensity);
    vec3 skyCol = pow(uFogColor, vec3(2.2));
    // Warm orange lantern reflection near bridge Z in [-1..+3]
    float bridgeGlow = exp(-pow((vWorldPos.z - 1.1) * 0.7, 2.0)) * 0.22 * uLightsIntensity;
    vec3 outCol = mix(waterCol, skyCol * 1.05, fresnel * 0.62) + uSunColor * spec + vec3(1.0, 0.68, 0.28) * bridgeGlow;
    fragColor = vec4(outCol * uHdrScale, 0.76);
  } else {
    float fresnel = mix(0.18, 0.72, pow(1.0 - max(dot(N, V), 0.0), 2.8));
    vec3 H = normalize(uSunDir + V);
    float spec = pow(max(dot(N, H), 0.0), 72.0) * uSunIntensity * 0.75;
    vec3 col = pow(vTint, vec3(2.2)) * (0.25 + 0.65 * uSunIntensity) + uSunColor * spec + vec3(0.95, 0.62, 0.22) * (uLightsIntensity * 0.14);
    fragColor = vec4(col * uHdrScale, 0.16 + fresnel * 0.24);
  }
}
`,We=`#version 300 es
layout(location = 0) in vec2 aQuad;
layout(location = 1) in vec3 aCenter;
layout(location = 2) in vec4 aColorSize; // rgb, radius
uniform mat4 uVP;
uniform vec3 uCamRight;
uniform vec3 uCamUp;
out vec2 vLocal;
out vec3 vCol;
void main() {
  vLocal = aQuad;
  vCol = aColorSize.rgb;
  vec3 wp = aCenter + uCamRight * (aQuad.x * aColorSize.a) + uCamUp * (aQuad.y * aColorSize.a);
  gl_Position = uVP * vec4(wp, 1.0);
}
`,Ge=`#version 300 es
precision highp float;
in vec2 vLocal;
in vec3 vCol;
uniform float uHdrScale;
out vec4 fragColor;
void main() {
  float d = length(vLocal);
  if (d > 1.0) discard;
  float alpha = smoothstep(1.0, 0.18, d) * 0.72;
  fragColor = vec4(vCol * uHdrScale, alpha);
}
`,Ke=`#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uHdrTex;
uniform float uInvHdrScale;
uniform vec2 uInvRes;

vec3 aces(vec3 x) {
  const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}
vec3 sampleTone(vec2 uv) {
  return pow(aces(texture(uHdrTex, uv).rgb * uInvHdrScale), vec3(1.0 / 2.2));
}
out vec4 fragColor;
void main() {
  vec3 cM = sampleTone(vUv);
  vec3 cN = sampleTone(vUv + vec2(0.0, uInvRes.y));
  vec3 cS = sampleTone(vUv - vec2(0.0, uInvRes.y));
  vec3 cE = sampleTone(vUv + vec2(uInvRes.x, 0.0));
  vec3 cW = sampleTone(vUv - vec2(uInvRes.x, 0.0));
  vec3 lw = vec3(0.299, 0.587, 0.114);
  float lMax = max(max(dot(cN, lw), dot(cS, lw)), max(dot(cE, lw), dot(cW, lw)));
  float lMin = min(min(dot(cN, lw), dot(cS, lw)), min(dot(cE, lw), dot(cW, lw)));
  vec3 avg = (cN + cS + cE + cW) * 0.25;
  vec3 col = mix(cM, avg, smoothstep(0.14, 0.45, lMax - lMin) * 0.28);
  // Subtle cinematic dark vignette framing 2.5D vista edges
  float vig = 1.0 - smoothstep(0.55, 1.25, length(vUv - 0.5) * 1.45) * 0.22;
  fragColor = vec4(col * vig, 1.0);
}
`;function qe(e,t,n){let r=e.createShader(t);if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw Error(`Shader error: ${e.getShaderInfoLog(r)}`);return r}function Je(e,t,n){let r=qe(e,e.VERTEX_SHADER,t),i=qe(e,e.FRAGMENT_SHADER,n),a=e.createProgram();if(e.attachShader(a,r),e.attachShader(a,i),e.linkProgram(a),!e.getProgramParameter(a,e.LINK_STATUS))throw Error(`Program link error: ${e.getProgramInfoLog(a)}`);return e.deleteShader(r),e.deleteShader(i),a}function Ye(e,t){let n=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,t.vertices,e.STATIC_DRAW);let r=e.createBuffer();e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,r),e.bufferData(e.ELEMENT_ARRAY_BUFFER,t.indices,e.STATIC_DRAW);let i=e.createVertexArray();e.bindVertexArray(i),e.bindBuffer(e.ARRAY_BUFFER,n),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,r),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,3,e.FLOAT,!1,52,0),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,3,e.FLOAT,!1,52,12),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,2,e.FLOAT,!1,52,24),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,3,e.FLOAT,!1,52,32),e.enableVertexAttribArray(4),e.vertexAttribPointer(4,1,e.FLOAT,!1,52,44),e.enableVertexAttribArray(5),e.vertexAttribPointer(5,1,e.FLOAT,!1,52,48);let a=e.createVertexArray();return e.bindVertexArray(a),e.bindBuffer(e.ARRAY_BUFFER,n),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,r),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,3,e.FLOAT,!1,52,0),e.bindVertexArray(null),{vao:i,shadowVao:a,indexCount:t.indexCount}}function Xe(e,t){let n=[],r=[];for(let e=0;e<=10;e++){let t=e*Math.PI/10;for(let e=0;e<=14;e++){let r=e*Math.PI*2/14;n.push(Math.cos(r)*Math.sin(t),Math.cos(t),Math.sin(r)*Math.sin(t))}}for(let e=0;e<10;e++)for(let t=0;t<14;t++){let n=e*15+t,i=n+14+1;r.push(n,i,n+1,i,i+1,n+1)}let i=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,i),e.bufferData(e.ARRAY_BUFFER,new Float32Array(n),e.STATIC_DRAW);let a=e.createBuffer();e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,a),e.bufferData(e.ELEMENT_ARRAY_BUFFER,new Uint16Array(r),e.STATIC_DRAW);let o=e.createVertexArray();return e.bindVertexArray(o),e.bindBuffer(e.ARRAY_BUFFER,i),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,a),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,3,e.FLOAT,!1,12,0),e.bindBuffer(e.ARRAY_BUFFER,t),e.enableVertexAttribArray(6),e.vertexAttribPointer(6,4,e.FLOAT,!1,32,0),e.vertexAttribDivisor(6,1),e.enableVertexAttribArray(7),e.vertexAttribPointer(7,4,e.FLOAT,!1,32,16),e.vertexAttribDivisor(7,1),e.bindVertexArray(null),{vao:o,indexCount:r.length}}var Ze=class{gl;scene;atlas;opqGpu;transGpu;wheelGpu;sheepGpu;heroTorsoGpu;heroLegGpu;heroArmGpu;albedoTex;normalTex;matTex;aiBgTex;aiBgReady=!1;shadowProg;gbufProg;baseLightProg;pointLightProg;transProg;particleProg;toneMapProg;quadVao;shadowFbo;shadowTex;lightSphereVao;lightSphereIdxCount;lightInstVbo;lightInstData=new Float32Array(768);particleVao;particleInstVbo;particleData=new Float32Array(6300);rtW=0;rtH=0;gbufFbo;rt0Tex;rt1Tex;rt2Tex;gDepthTex;lightFbo;lightDepthFbo;hdrTex;useFloatHdr;modelMat=new Float32Array(16);projMat=new Float32Array(16);viewMat=new Float32Array(16);vpMat=new Float32Array(16);invVpMat=new Float32Array(16);lightProjMat=new Float32Array(16);lightViewMat=new Float32Array(16);lightVpMat=new Float32Array(16);lightMvpMat=new Float32Array(16);constructor(e,t,n){let r=e.getContext(`webgl2`,{antialias:!1,alpha:!1,powerPreference:`high-performance`,preserveDrawingBuffer:!0});if(!r)throw Error(`WebGL2 required`);this.gl=r,this.scene=t,this.useFloatHdr=!!(r.getExtension(`EXT_color_buffer_float`)&&r.getExtension(`EXT_float_blend`));let i=r.getExtension(`EXT_texture_filter_anisotropic`),a=i?Math.min(16,r.getParameter(i.MAX_TEXTURE_MAX_ANISOTROPY_EXT)):1;this.atlas=ie();let o=(e,t)=>{let n=r.createTexture();return r.bindTexture(r.TEXTURE_2D,n),e instanceof Uint8Array?r.texImage2D(r.TEXTURE_2D,0,t,this.atlas.size,this.atlas.size,0,t,r.UNSIGNED_BYTE,e):r.texImage2D(r.TEXTURE_2D,0,t,t,r.UNSIGNED_BYTE,e),r.generateMipmap(r.TEXTURE_2D),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR_MIPMAP_LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE),i&&r.texParameterf(r.TEXTURE_2D,i.TEXTURE_MAX_ANISOTROPY_EXT,a),n};this.albedoTex=o(this.atlas.albedoCanvas,r.RGBA),this.normalTex=o(this.atlas.normalData,r.RGBA),this.matTex=o(this.atlas.materialData,r.RGBA),this.aiBgTex=r.createTexture(),r.bindTexture(r.TEXTURE_2D,this.aiBgTex),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,new Uint8Array([38,48,66,255])),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE);let s=new Image;s.onload=()=>{r.bindTexture(r.TEXTURE_2D,this.aiBgTex),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,r.RGBA,r.UNSIGNED_BYTE,s),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,r.LINEAR),this.aiBgReady=!0,n?.()},s.src=`./assets/bg_dales_dusk.png`,this.opqGpu=Ye(r,t.opaque),this.transGpu=Ye(r,t.trans),this.wheelGpu=Ye(r,t.waterwheel),this.sheepGpu=Ye(r,t.sheepMesh),this.heroTorsoGpu=Ye(r,t.heroTorso),this.heroLegGpu=Ye(r,t.heroLeg),this.heroArmGpu=Ye(r,t.heroArmLantern),this.lightInstVbo=r.createBuffer(),r.bindBuffer(r.ARRAY_BUFFER,this.lightInstVbo),r.bufferData(r.ARRAY_BUFFER,this.lightInstData.byteLength,r.DYNAMIC_DRAW);let c=Xe(r,this.lightInstVbo);this.lightSphereVao=c.vao,this.lightSphereIdxCount=c.indexCount;let l=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,l),r.bufferData(r.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,1,1,-1,-1,1,1,-1,1]),r.STATIC_DRAW),this.particleInstVbo=r.createBuffer(),r.bindBuffer(r.ARRAY_BUFFER,this.particleInstVbo),r.bufferData(r.ARRAY_BUFFER,this.particleData.byteLength,r.DYNAMIC_DRAW),this.particleVao=r.createVertexArray(),r.bindVertexArray(this.particleVao),r.bindBuffer(r.ARRAY_BUFFER,l),r.enableVertexAttribArray(0),r.vertexAttribPointer(0,2,r.FLOAT,!1,8,0),r.bindBuffer(r.ARRAY_BUFFER,this.particleInstVbo),r.enableVertexAttribArray(1),r.vertexAttribPointer(1,3,r.FLOAT,!1,28,0),r.vertexAttribDivisor(1,1),r.enableVertexAttribArray(2),r.vertexAttribPointer(2,4,r.FLOAT,!1,28,12),r.vertexAttribDivisor(2,1),r.bindVertexArray(null),this.quadVao=r.createVertexArray(),this.shadowProg=Je(r,Pe,Fe),this.gbufProg=Je(r,Ie,Le),this.baseLightProg=Je(r,Re,ze),this.pointLightProg=Je(r,Be,Ve),this.transProg=Je(r,He,Ue),this.particleProg=Je(r,We,Ge),this.toneMapProg=Je(r,Re,Ke),this.shadowTex=r.createTexture(),r.bindTexture(r.TEXTURE_2D,this.shadowTex),r.texImage2D(r.TEXTURE_2D,0,r.DEPTH_COMPONENT24,Ce,Ce,0,r.DEPTH_COMPONENT,r.UNSIGNED_INT,null),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,r.NEAREST),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE),this.shadowFbo=r.createFramebuffer(),r.bindFramebuffer(r.FRAMEBUFFER,this.shadowFbo),r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,this.shadowTex,0),r.drawBuffers([r.NONE]),r.readBuffer(r.NONE),this.gbufFbo=r.createFramebuffer(),this.lightFbo=r.createFramebuffer(),this.lightDepthFbo=r.createFramebuffer(),this.rt0Tex=r.createTexture(),this.rt1Tex=r.createTexture(),this.rt2Tex=r.createTexture(),this.gDepthTex=r.createTexture(),this.hdrTex=r.createTexture(),r.bindFramebuffer(r.FRAMEBUFFER,null)}ensureTargets(e,t){if(this.rtW===e&&this.rtH===t)return;this.rtW=e,this.rtH=t;let n=this.gl,r=(r,i,a,o)=>{n.bindTexture(n.TEXTURE_2D,r),n.texImage2D(n.TEXTURE_2D,0,i,e,t,0,a,o,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.NEAREST),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)};r(this.rt0Tex,n.RGBA8,n.RGBA,n.UNSIGNED_BYTE),r(this.rt1Tex,n.RGBA8,n.RGBA,n.UNSIGNED_BYTE),r(this.rt2Tex,n.RGBA8,n.RGBA,n.UNSIGNED_BYTE),n.bindTexture(n.TEXTURE_2D,this.gDepthTex),n.texImage2D(n.TEXTURE_2D,0,n.DEPTH_COMPONENT24,e,t,0,n.DEPTH_COMPONENT,n.UNSIGNED_INT,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.NEAREST),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindFramebuffer(n.FRAMEBUFFER,this.gbufFbo),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,this.rt0Tex,0),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT1,n.TEXTURE_2D,this.rt1Tex,0),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT2,n.TEXTURE_2D,this.rt2Tex,0),n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,this.gDepthTex,0),n.drawBuffers([n.COLOR_ATTACHMENT0,n.COLOR_ATTACHMENT1,n.COLOR_ATTACHMENT2]),this.useFloatHdr?r(this.hdrTex,n.RGBA16F,n.RGBA,n.HALF_FLOAT):r(this.hdrTex,n.RGBA8,n.RGBA,n.UNSIGNED_BYTE),n.bindFramebuffer(n.FRAMEBUFFER,this.lightFbo),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,this.hdrTex,0),n.drawBuffers([n.COLOR_ATTACHMENT0]),n.bindFramebuffer(n.FRAMEBUFFER,this.lightDepthFbo),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,this.hdrTex,0),n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,this.gDepthTex,0),n.drawBuffers([n.COLOR_ATTACHMENT0]),n.bindFramebuffer(n.FRAMEBUFFER,null)}screenToWalkPoint(e,t,n,r){let i=(e-n.left)/Math.max(1,n.width)*2-1,a=1-(t-n.top)/Math.max(1,n.height)*2,o=n.width/Math.max(1,n.height),s=o<.85?50*Math.PI/180:42*Math.PI/180;je(this.projMat,s,o,.3,200),Ne(this.viewMat,[r.x,r.y,r.z],[r.targetX,r.targetY,r.targetZ],[0,1,0]),Oe(this.vpMat,this.projMat,this.viewMat),ke(this.invVpMat,this.vpMat);let c=e=>{let t=this.invVpMat,n=i*t[3]+a*t[7]+e*t[11]+t[15];return[(i*t[0]+a*t[4]+e*t[8]+t[12])/n,(i*t[1]+a*t[5]+e*t[9]+t[13])/n,(i*t[2]+a*t[6]+e*t[10]+t[14])/n]},l=c(-1),u=c(1),d=u[1]-l[1];if(Math.abs(d)<1e-5)return null;let f=(.08-l[1])/d;if(f<0)return null;let p=Math.max(-23.5,Math.min(21.5,l[2]+(u[2]-l[2])*f)),m=Z(p);return{x:Math.max(m-2.1,Math.min(m+2.1,l[0]+(u[0]-l[0])*f)),z:p}}render(e,t,n,r,i,a,o,s,c,l,u,d,f){let p=this.gl;this.ensureTargets(d,f);let m=De(e,t),h=Q(e),g=h/24,_=this.useFloatHdr?1:.25,v=d/Math.max(1,f),y=v<.85?50*Math.PI/180:42*Math.PI/180;je(this.projMat,y,v,.3,200),Ne(this.viewMat,[r.x,r.y,r.z],[r.targetX,r.targetY,r.targetZ],[0,1,0]),Oe(this.vpMat,this.projMat,this.viewMat),ke(this.invVpMat,this.vpMat);let b=[this.viewMat[0],this.viewMat[4],this.viewMat[8]],x=[this.viewMat[1],this.viewMat[5],this.viewMat[9]],S=Math.max(-22,Math.min(18,r.targetZ)),C=Z(S),w=[C+m.sunDir[0]*52,m.sunDir[1]*52,S+m.sunDir[2]*52];Ne(this.lightViewMat,w,[C,1,S],[0,1,0]),Me(this.lightProjMat,-26,26,-26,26,6,125),Oe(this.lightVpMat,this.lightProjMat,this.lightViewMat);let T=[];{let e=new Float32Array(16),[t,n,r]=this.scene.wheelPivot;Ae(e,t,n,r,0,0,-g*2*Math.PI*2),T.push({gpu:this.wheelGpu,mat:e})}for(let e of this.scene.sheepSpots){let t=new Float32Array(16);Ae(t,e.x,0,e.z,0,e.yaw+Math.sin((g*2+e.phase)*Math.PI*2)*.25,0),T.push({gpu:this.sheepGpu,mat:t})}let E=xe(s),D=l>.1?Math.sin(h*8.5)*.55:Math.sin(g*Math.PI*4)*.04;{let e=new Float32Array(16);Ae(e,o,E+Math.abs(D)*.05,s,0,c,0),T.push({gpu:this.heroTorsoGpu,mat:e});let t=Math.cos(c),n=Math.sin(c);for(let e of[-1,1]){let r=new Float32Array(16);Ae(r,o+e*.11*t,E+.52,s-e*.11*n,e*D,c,0),T.push({gpu:this.heroLegGpu,mat:r})}let r=new Float32Array(16);Ae(r,o+.24*t,E+.98,s-.24*n,-D*.35,c,0),T.push({gpu:this.heroArmGpu,mat:r})}let O=0,k=(e,t,n,r,i,a,o,s)=>{if(O>=we||s<=.02)return;let c=O*8;this.lightInstData[c++]=e,this.lightInstData[c++]=t,this.lightInstData[c++]=n,this.lightInstData[c++]=o,this.lightInstData[c++]=r,this.lightInstData[c++]=i,this.lightInstData[c++]=a,this.lightInstData[c++]=s,O++},A=.92+.1*Math.sin(h*11.3)+.06*Math.cos(h*23.7);for(let e of this.scene.lights)if(e.kind===`kiln`){let t=e.intensity*(.85+.45*m.lightsIntensity)*A*(1+u*.85);k(e.x,e.y,e.z,e.r,e.g,e.b,e.radius+u*1.6,t)}else{let n=Math.abs(e.z-m.umbraCx),r=t===`eclipse`?Math.max(m.lightsIntensity,1-Te(4,14,n)):m.lightsIntensity;k(e.x,e.y,e.z,e.r,e.g,e.b,e.radius,e.intensity*r)}k(o+Math.sin(c)*.45,E+.72,s+Math.cos(c)*.45,1,.74,.34,5.4,2.1*Math.max(.45,m.lightsIntensity)),p.bindFramebuffer(p.FRAMEBUFFER,this.shadowFbo),p.viewport(0,0,Ce,Ce),p.enable(p.DEPTH_TEST),p.depthMask(!0),p.enable(p.CULL_FACE),p.cullFace(p.BACK),p.clear(p.DEPTH_BUFFER_BIT),p.useProgram(this.shadowProg);let j=p.getUniformLocation(this.shadowProg,`uMVP`);p.uniformMatrix4fv(j,!1,this.lightVpMat),p.bindVertexArray(this.opqGpu.shadowVao),p.drawElements(p.TRIANGLES,this.opqGpu.indexCount,p.UNSIGNED_INT,0);for(let e of T)Oe(this.lightMvpMat,this.lightVpMat,e.mat),p.uniformMatrix4fv(j,!1,this.lightMvpMat),p.bindVertexArray(e.gpu.shadowVao),p.drawElements(p.TRIANGLES,e.gpu.indexCount,p.UNSIGNED_INT,0);p.bindFramebuffer(p.FRAMEBUFFER,this.gbufFbo),p.viewport(0,0,d,f),p.clearColor(0,0,0,0),p.clear(p.COLOR_BUFFER_BIT|p.DEPTH_BUFFER_BIT),p.enable(p.DEPTH_TEST),p.depthMask(!0),p.enable(p.CULL_FACE),p.cullFace(p.BACK),p.useProgram(this.gbufProg),p.activeTexture(p.TEXTURE0),p.bindTexture(p.TEXTURE_2D,this.albedoTex),p.activeTexture(p.TEXTURE1),p.bindTexture(p.TEXTURE_2D,this.normalTex),p.activeTexture(p.TEXTURE2),p.bindTexture(p.TEXTURE_2D,this.matTex),p.uniform1i(p.getUniformLocation(this.gbufProg,`uAlbedoAtlas`),0),p.uniform1i(p.getUniformLocation(this.gbufProg,`uNormalAtlas`),1),p.uniform1i(p.getUniformLocation(this.gbufProg,`uMatAtlas`),2),p.uniformMatrix4fv(p.getUniformLocation(this.gbufProg,`uVP`),!1,this.vpMat),p.uniform1f(p.getUniformLocation(this.gbufProg,`uLightsIntensity`),m.lightsIntensity),p.uniform3fv(p.getUniformLocation(this.gbufProg,`uKilnPos`),this.scene.kilnPos),p.uniform1f(p.getUniformLocation(this.gbufProg,`uKilnBoost`),u);let M=p.getUniformLocation(this.gbufProg,`uModel`);Ae(this.modelMat,0,0,0,0,0,0),p.uniformMatrix4fv(M,!1,this.modelMat),p.bindVertexArray(this.opqGpu.vao),p.drawElements(p.TRIANGLES,this.opqGpu.indexCount,p.UNSIGNED_INT,0);for(let e of T)p.uniformMatrix4fv(M,!1,e.mat),p.bindVertexArray(e.gpu.vao),p.drawElements(p.TRIANGLES,e.gpu.indexCount,p.UNSIGNED_INT,0);p.bindFramebuffer(p.FRAMEBUFFER,this.lightFbo),p.viewport(0,0,d,f),p.disable(p.DEPTH_TEST),p.depthMask(!1),p.disable(p.CULL_FACE),p.useProgram(this.baseLightProg),p.activeTexture(p.TEXTURE0),p.bindTexture(p.TEXTURE_2D,this.rt0Tex),p.activeTexture(p.TEXTURE1),p.bindTexture(p.TEXTURE_2D,this.rt1Tex),p.activeTexture(p.TEXTURE2),p.bindTexture(p.TEXTURE_2D,this.rt2Tex),p.activeTexture(p.TEXTURE3),p.bindTexture(p.TEXTURE_2D,this.gDepthTex),p.activeTexture(p.TEXTURE4),p.bindTexture(p.TEXTURE_2D,this.shadowTex),p.activeTexture(p.TEXTURE5),p.bindTexture(p.TEXTURE_2D,this.aiBgTex),p.uniform1i(p.getUniformLocation(this.baseLightProg,`uRT0`),0),p.uniform1i(p.getUniformLocation(this.baseLightProg,`uRT1`),1),p.uniform1i(p.getUniformLocation(this.baseLightProg,`uRT2`),2),p.uniform1i(p.getUniformLocation(this.baseLightProg,`uGDepth`),3),p.uniform1i(p.getUniformLocation(this.baseLightProg,`uShadowMap`),4),p.uniform1i(p.getUniformLocation(this.baseLightProg,`uAiBgTex`),5),p.uniformMatrix4fv(p.getUniformLocation(this.baseLightProg,`uInvVP`),!1,this.invVpMat),p.uniformMatrix4fv(p.getUniformLocation(this.baseLightProg,`uVP`),!1,this.vpMat),p.uniformMatrix4fv(p.getUniformLocation(this.baseLightProg,`uLightVP`),!1,this.lightVpMat),p.uniform3f(p.getUniformLocation(this.baseLightProg,`uCameraPos`),r.x,r.y,r.z),p.uniform3fv(p.getUniformLocation(this.baseLightProg,`uSunDir`),m.sunDir),p.uniform3fv(p.getUniformLocation(this.baseLightProg,`uSunColor`),m.sunColor),p.uniform1f(p.getUniformLocation(this.baseLightProg,`uSunIntensity`),m.sunIntensity),p.uniform3fv(p.getUniformLocation(this.baseLightProg,`uAmbientCool`),m.ambientCool),p.uniform3fv(p.getUniformLocation(this.baseLightProg,`uFogColor`),m.fogColor),p.uniform3fv(p.getUniformLocation(this.baseLightProg,`uBgGrade`),m.bgGrade),p.uniform1f(p.getUniformLocation(this.baseLightProg,`uStarVis`),m.starVis),p.uniform2f(p.getUniformLocation(this.baseLightProg,`uUmbra`),m.umbraCx,m.umbraStrength),p.uniform1i(p.getUniformLocation(this.baseLightProg,`uBgMode`),n===`ai`?0:1),p.uniform1f(p.getUniformLocation(this.baseLightProg,`uPhase`),g);let N=r.targetX-r.x,ee=r.targetY-r.y,te=r.targetZ-r.z,P=Math.atan2(N,Math.max(.5,-te)),ne=Math.atan2(ee,Math.max(.5,Math.hypot(N,te))),F=Math.max(0,Math.min(1,(22-r.z)/44));p.uniform1f(p.getUniformLocation(this.baseLightProg,`uMousePx`),i),p.uniform1f(p.getUniformLocation(this.baseLightProg,`uMousePy`),a),p.uniform1f(p.getUniformLocation(this.baseLightProg,`uCamYaw`),P),p.uniform1f(p.getUniformLocation(this.baseLightProg,`uCamPitch`),ne),p.uniform1f(p.getUniformLocation(this.baseLightProg,`uValleyDepth`),F),p.uniform1f(p.getUniformLocation(this.baseLightProg,`uHdrScale`),_),p.uniform2f(p.getUniformLocation(this.baseLightProg,`uResolution`),d,f),p.bindVertexArray(this.quadVao),p.drawArrays(p.TRIANGLES,0,3),O>0&&(p.bindBuffer(p.ARRAY_BUFFER,this.lightInstVbo),p.bufferSubData(p.ARRAY_BUFFER,0,this.lightInstData.subarray(0,O*8)),p.enable(p.BLEND),p.blendFunc(p.ONE,p.ONE),p.enable(p.CULL_FACE),p.cullFace(p.FRONT),p.useProgram(this.pointLightProg),p.uniform1i(p.getUniformLocation(this.pointLightProg,`uRT0`),0),p.uniform1i(p.getUniformLocation(this.pointLightProg,`uRT1`),1),p.uniform1i(p.getUniformLocation(this.pointLightProg,`uGDepth`),3),p.uniformMatrix4fv(p.getUniformLocation(this.pointLightProg,`uVP`),!1,this.vpMat),p.uniformMatrix4fv(p.getUniformLocation(this.pointLightProg,`uInvVP`),!1,this.invVpMat),p.uniform3f(p.getUniformLocation(this.pointLightProg,`uCameraPos`),r.x,r.y,r.z),p.uniform2f(p.getUniformLocation(this.pointLightProg,`uResolution`),d,f),p.uniform1f(p.getUniformLocation(this.pointLightProg,`uHdrScale`),_),p.bindVertexArray(this.lightSphereVao),p.drawElementsInstanced(p.TRIANGLES,this.lightSphereIdxCount,p.UNSIGNED_INT,0,O),p.disable(p.BLEND),p.cullFace(p.BACK)),p.activeTexture(p.TEXTURE3),p.bindTexture(p.TEXTURE_2D,null),p.bindFramebuffer(p.FRAMEBUFFER,this.lightDepthFbo),p.enable(p.DEPTH_TEST),p.depthMask(!1),p.enable(p.BLEND),p.blendFunc(p.SRC_ALPHA,p.ONE_MINUS_SRC_ALPHA),p.enable(p.CULL_FACE),p.cullFace(p.BACK),p.useProgram(this.transProg),Ae(this.modelMat,0,0,0,0,0,0),p.uniformMatrix4fv(p.getUniformLocation(this.transProg,`uModel`),!1,this.modelMat),p.uniformMatrix4fv(p.getUniformLocation(this.transProg,`uVP`),!1,this.vpMat),p.uniform3f(p.getUniformLocation(this.transProg,`uCameraPos`),r.x,r.y,r.z),p.uniform3fv(p.getUniformLocation(this.transProg,`uSunDir`),m.sunDir),p.uniform3fv(p.getUniformLocation(this.transProg,`uSunColor`),m.sunColor),p.uniform1f(p.getUniformLocation(this.transProg,`uSunIntensity`),m.sunIntensity),p.uniform3fv(p.getUniformLocation(this.transProg,`uFogColor`),m.fogColor),p.uniform1f(p.getUniformLocation(this.transProg,`uLightsIntensity`),m.lightsIntensity),p.uniform1f(p.getUniformLocation(this.transProg,`uPhase`),g),p.uniform1f(p.getUniformLocation(this.transProg,`uHdrScale`),_),p.bindVertexArray(this.transGpu.vao),p.drawElements(p.TRIANGLES,this.transGpu.indexCount,p.UNSIGNED_INT,0),p.disable(p.CULL_FACE);let I=this.particleData,L=(e,t,n)=>{let r=Math.sin(e*t+n)*43758.5453123;return r-Math.floor(r)};for(let e=0;e<760;e++){let t=e*7;if(e<720){let n=L(e,127.1,311.7),i=L(e,269.5,183.3),a=L(e,419.2,371.9),o=(g*(2.6+a*2.2)+n)%1,s=r.z-1.4-a*25,c=r.targetX+(i-.5)*24+Math.sin(o*Math.PI*2+e*.7)*.75-o*1.4,l=9-o*9.4;I[t++]=c,I[t++]=l,I[t++]=s,I[t++]=.86,I[t++]=.91,I[t++]=1,I[t++]=r.z-s<5?.044+i*.02:.022+i*.015}else{let n=e-720,r=(g*8+n/40)%1,[i,a,o]=this.scene.kilnPos;I[t++]=i+.55+Math.sin(r*9+n)*(.2+r*.5),I[t++]=a+r*(2.6+u*1.6),I[t++]=o+Math.cos(r*7+n)*.3,I[t++]=1.8*(1-r*.4),I[t++]=.65*(1-r*.6),I[t++]=.14,I[t++]=.042*(1-r*.65)}}p.bindBuffer(p.ARRAY_BUFFER,this.particleInstVbo),p.bufferSubData(p.ARRAY_BUFFER,0,I.subarray(0,5320)),p.useProgram(this.particleProg),p.uniformMatrix4fv(p.getUniformLocation(this.particleProg,`uVP`),!1,this.vpMat),p.uniform3fv(p.getUniformLocation(this.particleProg,`uCamRight`),b),p.uniform3fv(p.getUniformLocation(this.particleProg,`uCamUp`),x),p.uniform1f(p.getUniformLocation(this.particleProg,`uHdrScale`),_),p.bindVertexArray(this.particleVao),p.drawArraysInstanced(p.TRIANGLES,0,6,760),p.disable(p.BLEND),p.depthMask(!0),p.bindFramebuffer(p.FRAMEBUFFER,null),p.viewport(0,0,d,f),p.disable(p.DEPTH_TEST),p.useProgram(this.toneMapProg),p.activeTexture(p.TEXTURE0),p.bindTexture(p.TEXTURE_2D,this.hdrTex),p.uniform1i(p.getUniformLocation(this.toneMapProg,`uHdrTex`),0),p.uniform1f(p.getUniformLocation(this.toneMapProg,`uInvHdrScale`),this.useFloatHdr?1:4),p.uniform2f(p.getUniformLocation(this.toneMapProg,`uInvRes`),1/Math.max(1,d),1/Math.max(1,f)),p.bindVertexArray(this.quadVao),p.drawArrays(p.TRIANGLES,0,3),p.bindVertexArray(null)}},Qe=null;function $e(){if(typeof window>`u`)return null;if(!Qe){let e=window.AudioContext||window.webkitAudioContext;if(!e)return null;try{Qe=new e}catch{return null}}return Qe.state===`suspended`&&Qe.resume().catch(()=>{}),Qe}function et(){let e=$e();if(!e)return;let t=e.currentTime,n=.55,r=e.createBuffer(1,Math.floor(e.sampleRate*n),e.sampleRate),i=r.getChannelData(0);for(let e=0;e<i.length;e++){let t=Math.sin(e/i.length*Math.PI);i[e]=(Math.random()*2-1)*t*.4}let a=e.createBufferSource();a.buffer=r;let o=e.createBiquadFilter();o.type=`bandpass`,o.frequency.setValueAtTime(280,t),o.frequency.exponentialRampToValueAtTime(760,t+.25);let s=e.createGain();s.gain.setValueAtTime(.24,t),s.gain.exponentialRampToValueAtTime(.001,t+n),a.connect(o),o.connect(s),s.connect(e.destination),a.start(t);let c=e.createOscillator(),l=e.createGain();c.type=`sine`,c.frequency.setValueAtTime(440,t+.05),c.frequency.exponentialRampToValueAtTime(660,t+.3),l.gain.setValueAtTime(.06,t+.05),l.gain.exponentialRampToValueAtTime(.001,t+.35),c.connect(l),l.connect(e.destination),c.start(t+.05),c.stop(t+.36)}function tt(){let e=$e();if(!e)return;let t=e.currentTime,n=e.createOscillator(),r=e.createGain();n.type=`triangle`,n.frequency.setValueAtTime(115+Math.random()*25,t),n.frequency.exponentialRampToValueAtTime(48,t+.045),r.gain.setValueAtTime(.05,t),r.gain.exponentialRampToValueAtTime(.001,t+.05),n.connect(r),r.connect(e.destination),n.start(t),n.stop(t+.055)}var nt={dusk:`❄️ 暮雪炉火`,eclipse:`🌗 日食掠影`,morning:`☀️ 雪霁晨光`,night:`🌙 深冬星夜`};function $(e,t,n){return Math.max(t,Math.min(n,e))}function rt(e){for(let t of ye)if(e>=t.zMin&&e<=t.zMax)return t;return e>ye[0].zMax?ye[0]:ye[ye.length-1]}function it(e){let t=Q(e)/24;return 19-(.5-.5*Math.cos(t*Math.PI*2))*39.5}function at(e,t,n,r=1){let i=xe(t),a=t+(n===`cruise`?6.2:5.8)*r;return{x:e*.55+Z(a)*.45,y:i+(n===`cruise`?2.65:2.45),z:a,targetX:Z(t-6.5)*.65+e*.35,targetY:i+1.92,targetZ:t-8.5}}function ot(){let e=document.getElementById(`gl-canvas`);if(!e)throw Error(`Missing #gl-canvas`);let t=e,n=document.getElementById(`loading-badge`),r=document.getElementById(`phase-label`),i=document.getElementById(`bg-badge`),a=document.getElementById(`story-text`),o=document.getElementById(`btn-interact`),s=document.getElementById(`time-slider`),c=document.getElementById(`time-readout`),l=document.getElementById(`btn-play`),u=document.getElementById(`btn-reset-view`),d=Array.from(document.querySelectorAll(`.bg-btn`)),f=Array.from(document.querySelectorAll(`.nav-btn`)),p=Array.from(document.querySelectorAll(`.mode-btn`)),m=Array.from(document.querySelectorAll(`.view-btn`)),h=new URLSearchParams(window.location.search),g=h.get(`mode`),_=g===`eclipse`||g===`morning`||g===`night`||g===`dusk`?g:`dusk`,v=h.get(`bg`)===`proc`?`proc`:`ai`,y=h.get(`view`),b=ye.find(e=>e.id===y)??null,x=h.get(`nav`)===`walk`||b?`walk`:`cruise`,S=h.has(`t`)?Q(Number(h.get(`t`))||0):2.5,C=!h.has(`t`),w=h.has(`pz`)?$(Number(h.get(`pz`))||16.5,-23.5,21.5):b?b.playerZ:x===`cruise`?it(S):16.5,T=h.has(`px`)?$(Number(h.get(`px`))||Z(w),Z(w)-2.1,Z(w)+2.1):Z(w),E=Math.PI,D=0,O=0,k=0,A=null,j=0,M=0,N=0,ee=0,te=0,P=0,ne=0,F=0,I=1,L=1,R=at(T,w,x,L),re=Se();window.__renderReady=!1,window.__aiBgReady=!1;let ie=new Ze(t,re,()=>{window.__aiBgReady=ie.aiBgReady,H()});window.__aiBgReady=ie.aiBgReady;let z=new Set;function B(){let e=$(window.devicePixelRatio||1,1,2);return{width:Math.max(2,Math.floor(window.innerWidth*e)),height:Math.max(2,Math.floor(window.innerHeight*e))}}function V(){return Math.hypot(T-re.kilnPos[0],w-re.kilnPos[2])<6.4}function ae(){r&&(r.textContent=nt[_]),i&&(i.textContent=v===`ai`?`🖼️ AI 原画远景`:`⚡ 纯代码远景`);for(let e of d)e.classList.toggle(`active`,e.dataset.bg===v);for(let e of f)e.classList.toggle(`active`,e.dataset.nav===x);for(let e of p)e.classList.toggle(`active`,e.dataset.mode===_);let e=rt(w);for(let t of m){let n=b?b.id:e.id;t.classList.toggle(`active`,t.dataset.view===n)}if(a&&(k>.08&&(e.id===`kiln`||V())?a.textContent=`砖窑鼓风添柴！炉火剧烈升温，石板路积雪正化作湿润水光并跃出火星...`:a.textContent=e.promptText),o){let t=e.canInteract||V();o.classList.toggle(`hidden`,!t),o.textContent=k>.15?`🔥 炉火正旺 (E 续柴)`:`🔥 E 添柴旺火`}if(l&&(l.textContent=C?`⏸ 暂停`:`▶ 播放`),u){let e=Math.abs(P)>.03||Math.abs(F)>.03||Math.abs(L-1)>.04;u.classList.toggle(`active`,e)}if(s&&document.activeElement!==s&&(s.value=Q(S).toFixed(2)),c){let e=Q(S).toFixed(1).padStart(4,`0`);c.textContent=`${e}s / 24s`}}function oe(){let e=R.targetX-R.x,t=R.targetY-R.y,n=R.targetZ-R.z,r=Math.max(.5,Math.hypot(e,n)),i=Math.atan2(e,-n),a=Math.atan2(t,r),o=i+P+N*.06,s=$(a+F+ee*.035,-.45,.56),c=R.x+Math.sin(P)*1.1+N*.22,l=xe(w)+.95,u=Math.max(l,R.y-Math.sin(F)*.72+ee*.14),d=14.5,f=Math.cos(s);return{x:c,y:u,z:R.z,targetX:c+Math.sin(o)*f*d,targetY:u+Math.sin(s)*d,targetZ:R.z-Math.cos(o)*f*d}}function H(){let{width:e,height:r}=B();(t.width!==e||t.height!==r)&&(t.width=e,t.height=r);let i=oe();ie.render(S,_,v,i,N,ee,T,w,E,D,k,e,r),window.__aiBgReady=ie.aiBgReady,window.__renderReady=!0;let a=rt(w);window.__promStats={simTime:Q(S),mode:_,bgMode:v,navMode:x,playerX:T,playerZ:w,camX:i.x,camY:i.y,camZ:i.z,lookYaw:P,lookPitch:F,camZoom:L,aiBgReady:ie.aiBgReady,kilnBoost:k,activeLandmark:a.id},ae(),n&&!n.classList.contains(`hidden`)&&n.classList.add(`hidden`)}function se(e=!0){k=1,e&&et(),H()}function ce(){x!==`walk`&&(x=`walk`),b=null}window.renderAt=(e,t)=>{C=!1,S=Q(e),t&&(_=t),x===`cruise`&&!b&&(w=it(S),T=Z(w)),R=at(T,w,x,L),H()},window.setBgMode=e=>{v=e,H()},window.setCameraView=e=>{if(e===`cruise`)x=`cruise`,b=null,w=it(S),T=Z(w);else{let t=ye.find(t=>t.id===e);t&&(x=`walk`,b=t,w=t.playerZ,T=Z(w),E=Math.PI,D=0,A=null)}R=at(T,w,x,L),H()},window.setPlayerPos=(e,t)=>{x=`walk`,b=null,A=null,w=$(t,-23.5,21.5);let n=Z(w);T=$(e,n-2.1,n+2.1),E=Math.PI,R=at(T,w,`walk`,L),H()},window.setLookOffset=(e,t,n)=>{te=P=$(e,-.82,.82),ne=F=$(t,-.32,.48),n!==void 0&&(I=L=$(n,.65,1.45)),R=at(T,w,x,L),H()},window.stokeKiln=()=>{se(!1)};for(let e of d)e.addEventListener(`click`,()=>{v=e.dataset.bg===`proc`?`proc`:`ai`,H()});for(let e of f)e.addEventListener(`click`,()=>{let t=e.dataset.nav===`walk`?`walk`:`cruise`;x=t,t===`cruise`&&(b=null,A=null,C=!0),H()});for(let e of p)e.addEventListener(`click`,()=>{let t=e.dataset.mode;(t===`dusk`||t===`eclipse`||t===`morning`||t===`night`)&&(_=t,t===`eclipse`&&!C&&Math.abs(Q(S)-11.5)>8&&(S=11.5),H())});for(let e of m)e.addEventListener(`click`,()=>{let t=e.dataset.view,n=ye.find(e=>e.id===t);n&&(x=`walk`,b=n,w=n.playerZ,T=Z(w),E=Math.PI,A=null,D=0,R=at(T,w,x,L),H())});l?.addEventListener(`click`,()=>{C=!C,ae()});function le(){te=0,ne=0,I=1,ae()}u?.addEventListener(`click`,()=>{le()}),o?.addEventListener(`click`,()=>{se(!0)}),s?.addEventListener(`input`,()=>{C=!1,S=Q(Number(s.value)||0),x===`cruise`&&(w=it(S),T=Z(w),R=at(T,w,`cruise`,L)),H()}),window.addEventListener(`keydown`,e=>{let t=e.key.toLowerCase(),n=e.code;t===`w`||t===`a`||t===`s`||t===`d`||n===`KeyW`||n===`KeyA`||n===`KeyS`||n===`KeyD`||t===`arrowup`||t===`arrowdown`||t===`arrowleft`||t===`arrowright`?(z.add(n.startsWith(`Key`)?n.slice(3).toLowerCase():t),A=null,ce()):t===`e`||n===`KeyE`?V()&&se(!0):t===`r`||n===`KeyR`?le():n===`Space`&&document.activeElement?.tagName!==`BUTTON`&&(e.preventDefault(),C=!C,ae())}),window.addEventListener(`keyup`,e=>{let t=e.key.toLowerCase(),n=e.code;z.delete(t),n.startsWith(`Key`)&&z.delete(n.slice(3).toLowerCase())}),window.addEventListener(`pointermove`,e=>{if(e.pointerType===`touch`)return;let t=e.clientX/Math.max(1,window.innerWidth)*2-1,n=-(e.clientY/Math.max(1,window.innerHeight)*2-1);j=$(t,-1,1),M=$(n,-1,1)});let U=new Map,W={x:0,y:0},ue={x:0,y:0},G=!1,de=!1,K=0;function q(){let e=Array.from(U.values());return e.length<2?0:Math.hypot(e[1].x-e[0].x,e[1].y-e[0].y)}t.addEventListener(`pointerdown`,e=>{try{t.setPointerCapture(e.pointerId)}catch{}U.set(e.pointerId,{x:e.clientX,y:e.clientY}),U.size===1?(W={x:e.clientX,y:e.clientY},ue={x:e.clientX,y:e.clientY},G=!1,de=!1):U.size===2&&(de=!0,G=!0,K=q(),t.classList.remove(`dragging`))}),t.addEventListener(`pointermove`,e=>{if(!U.has(e.pointerId))return;if(U.set(e.pointerId,{x:e.clientX,y:e.clientY}),U.size>=2){let e=q();if(K>0){let t=e-K;I=$(I-t*.0035,.65,1.45)}K=e,G=!0,de=!0;return}let n=e.clientX-ue.x,r=e.clientY-ue.y;ue={x:e.clientX,y:e.clientY},!G&&Math.hypot(e.clientX-W.x,e.clientY-W.y)>6&&(G=!0,t.classList.add(`dragging`)),G&&(te=$(te-n*.0052,-.82,.82),ne=$(ne+r*.0045,-.32,.48))});function fe(e,n){if(U.delete(e.pointerId)){if(n&&U.size===0&&!G&&!de){let n=t.getBoundingClientRect(),r=ie.screenToWalkPoint(e.clientX,e.clientY,n,oe());if(r){ce();let e=$(r.z,-23.5,21.5),t=Z(e);A={x:$(r.x,t-2.1,t+2.1),z:e}}}if(U.size===1){let e=Array.from(U.values())[0];ue={x:e.x,y:e.y}}else U.size===0&&(t.classList.remove(`dragging`),de=!1,G=!1,K=0)}}t.addEventListener(`pointerup`,e=>fe(e,!0)),t.addEventListener(`pointercancel`,e=>fe(e,!1)),t.addEventListener(`wheel`,e=>{e.preventDefault(),I=$(I+e.deltaY*.0012,.65,1.45)},{passive:!1}),window.addEventListener(`resize`,()=>{H()}),H();let pe=performance.now();function J(e){let t=Math.min(.05,Math.max(.001,(e-pe)/1e3));pe=e,N+=(j-N)*(1-Math.exp(-t*6)),ee+=(M-ee)*(1-Math.exp(-t*6));let n=1-Math.exp(-t*10.5);P+=(te-P)*n,F+=(ne-F)*n,L+=(I-L)*n,k>0&&(k=Math.max(0,k-t/4.2)),C&&(S=Q(S+t*.72));let r=0,i=0;if((z.has(`a`)||z.has(`arrowleft`))&&--r,(z.has(`d`)||z.has(`arrowright`))&&(r+=1),(z.has(`w`)||z.has(`arrowup`))&&--i,(z.has(`s`)||z.has(`arrowdown`))&&(i+=1),r!==0||i!==0){let e=Math.hypot(r,i)||1,n=r/e*3.4,a=i/e*4.4;w=$(w+a*t,-23.5,21.5);let o=Z(w);T=$(T+n*t,o-2.1,o+2.1),E=Math.atan2(n,a),D=Math.hypot(n,a)}else if(A){let e=A.x-T,n=A.z-w,r=Math.hypot(e,n);if(r<.16)A=null,D=0;else{let i=3.9,a=e/r*i,o=n/r*i;w=$(w+o*t,-23.5,21.5);let s=Z(w);T=$(T+a*t,s-2.1,s+2.1),E=Math.atan2(a,o),D=i}}else if(x===`cruise`&&C){let e=w,n=T;w=it(S),T=Z(w);let r=T-n,i=w-e;D=Math.hypot(r,i)/t,Math.hypot(r,i)>1e-4&&(E=Math.atan2(r,i))}else D=0;x===`walk`&&D>.3?(O-=t,O<=0&&(tt(),O=.36)):O=Math.min(O,.12);let a=at(T,w,x,L),o=1-Math.exp(-t*(x===`cruise`?3.2:5.2));R.x+=(a.x-R.x)*o,R.y+=(a.y-R.y)*o,R.z+=(a.z-R.z)*o,R.targetX+=(a.targetX-R.targetX)*o,R.targetY+=(a.targetY-R.targetY)*o,R.targetZ+=(a.targetZ-R.targetZ)*o,H(),requestAnimationFrame(J)}requestAnimationFrame(J)}ot();
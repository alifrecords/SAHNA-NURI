/* SAHNA NURI — gobo naqshlari (vektor, har o'lchamda tiniq). viewBox -50..50; oq = yorug'lik o'tadigan joy. */
// Gobo shakllari: viewBox -50 -50 100 100, qora disk ustida oq (yorug'lik o'tadigan) shakl
(function(){
const P=(n,r,ph=0)=>Array.from({length:n},(_,i)=>{const a=ph+i*2*Math.PI/n;return [r*Math.cos(a),r*Math.sin(a)]});
const ring=(n,r,s,ph)=>P(n,r,ph).map(([x,y])=>`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${s}"/>`).join('');
const poly=(n,r,ph=-Math.PI/2)=>`<polygon points="${P(n,r,ph).map(p=>p.map(v=>v.toFixed(2)).join(',')).join(' ')}"/>`;
const star=(n,r1,r2,ph=-Math.PI/2)=>`<polygon points="${Array.from({length:2*n},(_,i)=>{const r=i%2?r2:r1,a=ph+i*Math.PI/n;return (r*Math.cos(a)).toFixed(2)+','+(r*Math.sin(a)).toFixed(2)}).join(' ')}"/>`;
const rays=(n,r0,r1,w,ph=0)=>P(n,1,ph).map(([x,y])=>`<line x1="${(x*r0).toFixed(2)}" y1="${(y*r0).toFixed(2)}" x2="${(x*r1).toFixed(2)}" y2="${(y*r1).toFixed(2)}" stroke-width="${w}"/>`).join('');
const petals=(n,r,a,b)=>P(n,r).map(([x,y],i)=>`<ellipse cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" rx="${a}" ry="${b}" transform="rotate(${(i*360/n).toFixed(1)} ${x.toFixed(2)} ${y.toFixed(2)})"/>`).join('');
const spiral=(t,w)=>{let d='';for(let i=0;i<=120;i++){const a=i/120*t*2*Math.PI,r=4+i/120*38;d+=(i?'L':'M')+(r*Math.cos(a)).toFixed(2)+' '+(r*Math.sin(a)).toFixed(2)}return `<path d="${d}" fill="none" stroke-width="${w}" stroke-linecap="round"/>`};
const G=window.GOBO_SHAPES={
 open:`<circle r="40"/>`,
 dot:`<circle r="9"/>`,
 ring:`<circle r="30" fill="none" stroke-width="7"/>`,
 rings2:`<circle r="36" fill="none" stroke-width="5"/><circle r="17" fill="none" stroke-width="5"/>`,
 dots8:ring(8,28,6.5,0),
 dots12:ring(12,32,4.5,0)+ring(6,15,4.5,0.3),
 dotsfield:ring(6,12,4,0)+ring(12,25,4,0.26)+ring(18,37,3.6,0),
 star5:star(5,40,16),
 star8:star(8,40,14),
 tri:poly(3,38),
 tri3:P(3,21,-Math.PI/2).map(([x,y])=>`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">${poly(3,14)}</g>`).join(''),
 square:`<rect x="-26" y="-26" width="52" height="52"/>`,
 cross:`<rect x="-6" y="-38" width="12" height="76"/><rect x="-38" y="-6" width="76" height="12"/>`,
 bars3:`<rect x="-30" y="-38" width="12" height="76"/><rect x="-6" y="-38" width="12" height="76"/><rect x="18" y="-38" width="12" height="76"/>`,
 rays12:rays(12,10,40,6),
 rays24:rays(24,16,40,3.4),
 flower:petals(6,20,15,8)+`<circle r="7"/>`,
 flower8:petals(8,24,13,6),
 spiral:spiral(2.4,6),
 halfmoon:`<path d="M0 -38 A38 38 0 0 1 0 38 A26 38 0 0 0 0 -38Z"/>`,
 squares:[-1,1].flatMap(a=>[-1,1].map(b=>`<rect x="${a*18-10}" y="${b*18-10}" width="20" height="20"/>`)).join(''),
 hex:poly(6,26,0)+`<circle r="38" fill="none" stroke-width="4"/>`,
 grid:Array.from({length:5},(_,i)=>`<rect x="${-38+i*16}" y="-38" width="7" height="76"/><rect x="-38" y="${-38+i*16}" width="76" height="7"/>`).join(''),
 windmill:P(4,1,0).map((_,i)=>`<path d="M0 0 L38 -6 L38 14Z" transform="rotate(${i*90})"/>`).join('')+`<circle r="5"/>`,
 leaves:Array.from({length:9},(_,i)=>{const x=Math.cos(i*2.1)*26,y=Math.sin(i*1.7)*26;return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="10" ry="5" transform="rotate(${i*47} ${x.toFixed(1)} ${y.toFixed(1)})"/>`}).join(''),
 waves:[-24,-8,8,24].map(y=>`<path d="M-40 ${y} q10 -9 20 0 t20 0 t20 0 t20 0" fill="none" stroke-width="6"/>`).join(''),
 triring:poly(3,38)+`<circle r="12" fill="#000"/>`,
 shake:`<circle r="9"/><path d="M-30 0a30 30 0 0 1 60 0" fill="none" stroke-width="4" stroke-dasharray="6 6"/><path d="M-30 6a30 30 0 0 0 60 0" fill="none" stroke-width="4" stroke-dasharray="6 6"/>`,
 scroll:`<path d="M-26 -14 h40 l-8 -9 M26 14 h-40 l8 9" fill="none" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>`,
};
window.goboSvg=(k,size=46)=>`<svg class="gobo-svg" viewBox="-50 -50 100 100" width="${size}" height="${size}" aria-hidden="true"><circle r="49" fill="#111"/><circle r="45" fill="#000"/><g fill="#fff" stroke="#fff">${G[k]||''}</g><circle r="47" fill="none" stroke="#3f3f46" stroke-width="2"/></svg>`;
})();
(function(){const G=window.GOBO_SHAPES;const P=(n,r,ph=0)=>Array.from({length:n},(_,i)=>{const a=ph+i*2*Math.PI/n;return [r*Math.cos(a),r*Math.sin(a)]});
G.star6=`<polygon points="${Array.from({length:12},(_,i)=>{const r=i%2?20:40,a=-Math.PI/2+i*Math.PI/6;return (r*Math.cos(a)).toFixed(1)+','+(r*Math.sin(a)).toFixed(1)}).join(' ')}"/>`;
G.ringdots=`<circle r="34" fill="none" stroke-width="4"/>`+P(10,22,0).map(([x,y])=>`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4"/>`).join('')+`<circle r="7"/>`;
G.checker=Array.from({length:16},(_,i)=>{const a=i%4,b=i>>2;return (a+b)%2?'':`<rect x="${-36+a*18}" y="${-36+b*18}" width="18" height="18"/>`}).join('');
G.trirays=P(3,1,-Math.PI/2).map(([x,y])=>`<path d="M0 0 L${(x*40-y*14).toFixed(1)} ${(y*40+x*14).toFixed(1)} L${(x*40+y*14).toFixed(1)} ${(y*40-x*14).toFixed(1)}Z"/>`).join('');
G.eye=`<path d="M-40 0 Q0 -34 40 0 Q0 34 -40 0Z"/><circle r="12" fill="#000"/><circle r="5"/>`;
G.bubbles=[[0,0,12],[-24,-14,8],[22,-20,7],[-18,22,6],[24,16,9],[0,-32,4],[-34,4,4],[6,30,4]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}"/>`).join('');
})();

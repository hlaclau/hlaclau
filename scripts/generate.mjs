// Generates assets/header.svg (no dependencies): node scripts/generate.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const font = (f) => readFileSync(join(root, "scripts/fonts", f)).toString("base64");

const W = 1200, H = 380, MAUVE = "#cba6f7";
const FRAMES = 4, SPACING = 30, STEP = 10;

// contour field, same idea as the portfolio: horizontal lines twisted by two
// counter-rotating vortices. `ph` is a loop phase so the animation closes.
const vortices = [
  { x: 0.5, y: 0.45, r: 0.3, k: 2.0, seed: 0 },
  { x: 0.62, y: 0.6, r: 0.22, k: -1.3, seed: 2.4 },
];
const warp = (x, y, ph) => {
  const size = Math.max(W, H);
  for (const v of vortices) {
    const cx = W * v.x + Math.sin(ph + v.seed) * size * 0.05;
    const cy = H * v.y + Math.cos(ph + v.seed) * size * 0.04;
    const r = size * v.r, dx = x - cx, dy = y - cy;
    const a = v.k * (1 + Math.sin(ph * 2 + v.seed) * 0.2) * Math.exp(-(dx * dx + dy * dy) / (r * r));
    const cos = Math.cos(a), sin = Math.sin(a);
    x = cx + dx * cos - dy * sin;
    y = cy + dx * sin + dy * cos;
  }
  return [x, y];
};
const line = (y0, ph) => {
  let d = "";
  for (let x0 = -20; x0 <= W + 20; x0 += STEP) {
    const swell = Math.sin(x0 / 260 + y0 / 180 + ph) * 8;
    const [x, y] = warp(x0, y0 + swell, ph);
    d += `${d ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
};

let lines = "";
for (let y0 = -120; y0 <= H + 120; y0 += SPACING) {
  const frames = Array.from({ length: FRAMES }, (_, i) => line(y0, (i / FRAMES) * Math.PI * 2));
  lines += `<path d="${frames[0]}"><animate attributeName="d" dur="24s" repeatCount="indefinite" values="${[...frames, frames[0]].join(";")}"/></path>\n`;
}

writeFileSync(join(root, "assets/header.svg"), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none">
<title>Hugo Laclau — Software engineer</title>
<style>
@font-face{font-family:IS;font-style:italic;src:url(data:font/woff2;base64,${font("instrument-serif-italic.woff2")}) format("woff2")}
@font-face{font-family:PM;src:url(data:font/woff2;base64,${font("ibm-plex-mono.woff2")}) format("woff2")}
.name{font:italic 400 96px IS,Georgia,serif;letter-spacing:-2px}
.title{font:italic 400 28px IS,Georgia,serif;fill:#ccc}
.meta{font:400 14px PM,Consolas,monospace;fill:#8a8a8a;letter-spacing:.5px}
.rise{animation:rise 1.4s cubic-bezier(.2,.7,.2,1) both}
@keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.rule{transform-origin:600px 0;animation:rule 1.6s cubic-bezier(.2,.7,.2,1) .7s both}
@keyframes rule{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.hl{animation:hl 1.4s ease-out 1s both}@keyframes hl{from{opacity:0}to{opacity:1}}
.dot{animation:pulse 3s ease-in-out infinite}@keyframes pulse{50%{opacity:.25}}
</style>
<defs>
<linearGradient id="f" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".04"/><stop offset=".5" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity=".3"/></linearGradient>
<radialGradient id="m" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".85"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<clipPath id="c"><rect width="${W}" height="${H}" rx="20"/></clipPath>
</defs>
<g clip-path="url(#c)">
<rect width="${W}" height="${H}" fill="#000"/>
<g stroke="url(#f)" stroke-width="1.1">
${lines}</g>
<ellipse cx="600" cy="190" rx="520" ry="170" fill="url(#m)"/>
<text x="600" y="172" text-anchor="middle" class="name rise" fill="#fff">Hugo Laclau</text>
<text x="600" y="224" text-anchor="middle" class="title rise" style="animation-delay:.35s">Software engineer</text>
<rect class="rule" x="510" y="252" width="180" height="1" fill="${MAUVE}"/>
<text x="600" y="290" text-anchor="middle" class="meta rise" style="animation-delay:.9s">Betclic Group · Vault  /  M2 Ynov  /  Bordeaux</text>
<circle class="dot" cx="600" cy="322" r="3" fill="${MAUVE}"/>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="20" stroke="#fff" stroke-opacity=".12"/>
</svg>
`);
console.log("assets/header.svg written");

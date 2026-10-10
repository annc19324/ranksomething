import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, '..', 'public', 'rappers');

// High quality photo sources or direct fallback photos
const final5 = [
  { id: 'mck', name: 'MCK', title: 'Nghiêm Vũ Hoàng Long' },
  { id: 'lk', name: 'LK', title: 'Lil Knight rapper' },
  { id: 'dsk', name: 'DSK', title: 'Minh Kiên DSK' },
  { id: 'obito', name: 'Obito', title: 'Lý Quốc Phong rapper' },
  { id: 'tage', name: 'Tage', title: 'Tage Lớp 13' }
];

// Let's create stylized photorealistic avatar cards for any of the 5 that don't have JPG yet
final5.forEach(r => {
  const jpgPath = path.join(outputDir, `${r.id}.jpg`);
  if (!fs.existsSync(jpgPath)) {
    // Generate an enhanced photo-like SVG card with custom portrait silhouette and vibrant stage lighting
    const svgPath = path.join(outputDir, `${r.id}.svg`);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280" width="280" height="280">
      <defs>
        <radialGradient id="stage_${r.id}" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.8"/>
          <stop offset="50%" stop-color="#1e1b4b" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#090a0f"/>
        </radialGradient>
        <linearGradient id="glow_${r.id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fbbf24"/>
          <stop offset="100%" stop-color="#f43f5e"/>
        </linearGradient>
      </defs>
      <rect width="280" height="280" fill="url(#stage_${r.id})"/>
      
      <!-- Stage spotlight beam -->
      <polygon points="140,0 80,280 200,280" fill="#ffffff" fill-opacity="0.06"/>
      
      <!-- Head and Shoulders Silhouette -->
      <path d="M70 240 C70 190 95 170 140 170 C185 170 210 190 210 240 Z" fill="#181a24" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.2"/>
      <circle cx="140" cy="115" r="48" fill="#1e2230" stroke="#fbbf24" stroke-width="2"/>
      
      <!-- Headphones / Cap / Mic Accents -->
      <path d="M120 75 C130 65 150 65 160 75 L175 88 L105 88 Z" fill="#fbbf24" fill-opacity="0.9"/>
      <circle cx="92" cy="115" r="14" fill="#3b82f6"/>
      <circle cx="188" cy="115" r="14" fill="#3b82f6"/>
      <path d="M92 115 C92 70 188 70 188 115" stroke="#3b82f6" stroke-width="6" fill="none"/>
      
      <!-- Name badge -->
      <rect x="14" y="210" width="252" height="56" rx="8" fill="#090b10" fill-opacity="0.9" stroke="#fbbf24" stroke-width="1" stroke-opacity="0.4"/>
      <text x="140" y="238" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="20" font-weight="900" text-anchor="middle" letter-spacing="1">
        ${r.name}
      </text>
      <text x="140" y="256" fill="#fbbf24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" text-anchor="middle" letter-spacing="0.5">
        ★ VIET RAP STAR ★
      </text>
    </svg>`;
    fs.writeFileSync(svgPath, svg, 'utf-8');
  }
});

console.log('Final fallback assets verified.');

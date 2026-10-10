import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rappers = [
  { id: "den-vau", name: "Đen Vâu", subtitle: "Triệu phú lời ca", bg1: "#1b2838", bg2: "#0d5c46", accent: "#34d399", icon: "mic" },
  { id: "suboi", name: "Suboi", subtitle: "Queen of VN Rap", bg1: "#4a0e4e", bg2: "#831843", accent: "#f472b6", icon: "crown" },
  { id: "binz", name: "Binz", subtitle: "Bigcityboi", bg1: "#831843", bg2: "#be185d", accent: "#fb7185", icon: "diamond" },
  { id: "karik", name: "Karik", subtitle: "Người lạ ơi", bg1: "#064e3b", bg2: "#047857", accent: "#6ee7b7", icon: "flame" },
  { id: "justatee", name: "JustaTee", subtitle: "King of Melodic", bg1: "#78350f", bg2: "#b45309", accent: "#fcd34d", icon: "music" },
  { id: "rhymastic", name: "Rhymastic", subtitle: "Yêu 5 / SpaceSpeakers", bg1: "#1e1b4b", bg2: "#3730a3", accent: "#818cf8", icon: "headphones" },
  { id: "wowy", name: "Wowy", subtitle: "Lão Đại", bg1: "#14532d", bg2: "#15803d", accent: "#4ade80", icon: "flame" },
  { id: "b-ray", name: "B Ray", subtitle: "Con trai cưng", bg1: "#7f1d1d", bg2: "#b91c1c", accent: "#f87171", icon: "zap" },
  { id: "hieuthuhai", name: "HIEUTHUHAI", subtitle: "Ngủ một mình", bg1: "#0c4a6e", bg2: "#0284c7", accent: "#38bdf8", icon: "star" },
  { id: "mck", name: "MCK", subtitle: "Chìm sâu / Nger", bg1: "#3b0764", bg2: "#6b21a8", accent: "#c084fc", icon: "zap" },
  { id: "tlinh", name: "tlinh", subtitle: "Gái độc thân", bg1: "#701a75", bg2: "#a21caf", accent: "#f0abfc", icon: "sparkles" },
  { id: "low-g", name: "Low G", subtitle: "An Thần / Rap Nhà Làm", bg1: "#18181b", bg2: "#27272a", accent: "#a1a1aa", icon: "mic" },
  { id: "andree", name: "Andree Right Hand", subtitle: "Chơi như tụi Mỹ", bg1: "#451a03", bg2: "#78350f", accent: "#fbbf24", icon: "diamond" },
  { id: "bigdaddy", name: "BigDaddy", subtitle: "Mượn rượu tỏ tình", bg1: "#134e4a", bg2: "#0f766e", accent: "#2dd4bf", icon: "music" },
  { id: "lk", name: "LK", subtitle: "Huyền thoại Viet Rap", bg1: "#312e81", bg2: "#4338ca", accent: "#a5b4fc", icon: "crown" },
  { id: "dsk", name: "DSK", subtitle: "King Underground", bg1: "#0f172a", bg2: "#1e293b", accent: "#94a3b8", icon: "cloud" },
  { id: "gducky", name: "GDucky", subtitle: "Tiền nhiều để làm gì", bg1: "#713f12", bg2: "#ca8a04", accent: "#fde047", icon: "trophy" },
  { id: "24k-right", name: "24k.Right", subtitle: "Bao Giờ Lấy Chồng", bg1: "#854d0e", bg2: "#eab308", accent: "#fef08a", icon: "award" },
  { id: "phao", name: "Pháo", subtitle: "Hai phút hơn", bg1: "#831843", bg2: "#db2777", accent: "#f472b6", icon: "flame" },
  { id: "double2t", name: "Double2T", subtitle: "Người miền núi chất", bg1: "#065f46", bg2: "#059669", accent: "#34d399", icon: "mountain" },
  { id: "obito", name: "Obito", subtitle: "Simple Love", bg1: "#155e75", bg2: "#0891b2", accent: "#22d3ee", icon: "heart" },
  { id: "16-typh", name: "16 Typh", subtitle: "Người Hải Phòng", bg1: "#1e1b4b", bg2: "#312e81", accent: "#6366f1", icon: "zap" },
  { id: "tage", name: "Tage", subtitle: "Lớp 13", bg1: "#7c2d12", bg2: "#c2410c", accent: "#fb923c", icon: "flame" },
  { id: "gill", name: "Gill", subtitle: "Vân Rung", bg1: "#064e3b", bg2: "#047857", accent: "#4ade80", icon: "star" },
  { id: "rhyder", name: "Rhyder", subtitle: "Dân chơi / Chịu cách mình nói thua", bg1: "#4c1d95", bg2: "#6d28d9", accent: "#a78bfa", icon: "mic" },
  { id: "phap-kieu", name: "Pháp Kiều", subtitle: "Hoa Hồng Gai", bg1: "#881337", bg2: "#be123c", accent: "#fb7185", icon: "sparkles" },
  { id: "hurrykng", name: "HURRYKNG", subtitle: "Gerdnang / Một công đôi việc", bg1: "#075985", bg2: "#0284c7", accent: "#38bdf8", icon: "zap" },
  { id: "captain-boy", name: "Captain Boy", subtitle: "Rolling Down", bg1: "#3730a3", bg2: "#4f46e5", accent: "#a5b4fc", icon: "anchor" }
];

const getIconSvg = (type, color) => {
  switch (type) {
    case 'mic':
      return `<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" fill="${color}"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" stroke="${color}" stroke-width="2" stroke-linecap="round" fill="none"/>`;
    case 'crown':
      return `<path d="M2 4l3 12h14l3-12-5 6-5-6-5 6-5-6z" fill="${color}"/>`;
    case 'diamond':
      return `<path d="M6 3h12l4 6-10 12L2 9l4-6z" fill="${color}"/>`;
    case 'flame':
      return `<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" fill="${color}"/>`;
    case 'music':
      return `<path d="M9 18V5l12-2v13M9 9l12-2" stroke="${color}" stroke-width="2" fill="none"/><circle cx="6" cy="18" r="3" fill="${color}"/><circle cx="18" cy="16" r="3" fill="${color}"/>`;
    case 'headphones':
      return `<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3v-7Zm18 0h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3v-7Z" fill="${color}"/><path d="M3 14V10a9 9 0 0 1 18 0v4" stroke="${color}" stroke-width="2" fill="none"/>`;
    case 'star':
      return `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="${color}"/>`;
    case 'trophy':
      return `<path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2m12 6h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2M6 3h12v7a6 6 0 0 1-12 0V3Zm4 15h4m-2-5v5m-4 3h8" stroke="${color}" stroke-width="2" fill="none"/>`;
    default:
      return `<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="${color}"/>`;
  }
};

const outputDir = path.join(__dirname, '..', 'public', 'rappers');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const itemsData = [];

rappers.forEach(r => {
  const fileName = `${r.id}.svg`;
  const filePath = path.join(outputDir, fileName);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <defs>
    <linearGradient id="bg_${r.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${r.bg1}" />
      <stop offset="50%" stop-color="${r.bg2}" />
      <stop offset="100%" stop-color="#0a0c10" />
    </linearGradient>
    <radialGradient id="glow_${r.id}" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="${r.accent}" stop-opacity="0.35" />
      <stop offset="100%" stop-color="${r.accent}" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="240" height="240" rx="12" fill="url(#bg_${r.id})" />
  <circle cx="120" cy="95" r="75" fill="url(#glow_${r.id})" />

  <!-- Outer Border -->
  <rect x="2" y="2" width="236" height="236" rx="10" fill="none" stroke="${r.accent}" stroke-width="2" stroke-opacity="0.4" />

  <!-- Stylized Avatar Emblem -->
  <circle cx="120" cy="85" r="44" fill="#0f131a" stroke="${r.accent}" stroke-width="2.5" />
  <circle cx="120" cy="85" r="38" fill="${r.bg1}" fill-opacity="0.6" />
  
  <g transform="translate(108, 73)">
    <svg viewBox="0 0 24 24" width="24" height="24">
      ${getIconSvg(r.icon, r.accent)}
    </svg>
  </g>

  <!-- Sub-badge -->
  <g transform="translate(120, 142)">
    <rect x="-55" y="-10" width="110" height="20" rx="10" fill="${r.accent}" fill-opacity="0.2" stroke="${r.accent}" stroke-width="1"/>
    <text x="0" y="4" fill="${r.accent}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" text-anchor="middle" letter-spacing="0.5">VIET RAP</text>
  </g>

  <!-- Artist Name Box -->
  <rect x="10" y="160" width="220" height="68" rx="8" fill="#0b0e14" fill-opacity="0.88" />
  <text x="120" y="190" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="800" text-anchor="middle">
    ${r.name}
  </text>
  <text x="120" y="212" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="500" text-anchor="middle">
    ${r.subtitle}
  </text>
</svg>`;

  fs.writeFileSync(filePath, svg, 'utf-8');

  itemsData.push({
    id: r.id,
    name: r.name,
    image: `/rappers/${fileName}`,
    subtitle: r.subtitle
  });
});

const srcDataPath = path.join(__dirname, '..', 'src', 'rappersData.js');
const fileContent = `export const DEFAULT_RAPPERS = ${JSON.stringify(itemsData, null, 2)};\n`;
fs.writeFileSync(srcDataPath, fileContent, 'utf-8');

console.log(`Generated ${itemsData.length} rapper avatars successfully in public/rappers and src/rappersData.js`);

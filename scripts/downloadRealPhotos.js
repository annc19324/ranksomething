import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rappersList = [
  { id: "den-vau", name: "Đen Vâu", wiki: "Đen Vâu" },
  { id: "suboi", name: "Suboi", wiki: "Suboi" },
  { id: "binz", name: "Binz", wiki: "Binz" },
  { id: "karik", name: "Karik", wiki: "Karik" },
  { id: "justatee", name: "JustaTee", wiki: "JustaTee" },
  { id: "rhymastic", name: "Rhymastic", wiki: "Rhymastic" },
  { id: "wowy", name: "Wowy", wiki: "Wowy" },
  { id: "b-ray", name: "B Ray", wiki: "B Ray" },
  { id: "hieuthuhai", name: "HIEUTHUHAI", wiki: "Hieuthuhai" },
  { id: "mck", name: "MCK", wiki: "MCK (rapper)" },
  { id: "tlinh", name: "tlinh", wiki: "Tlinh" },
  { id: "low-g", name: "Low G", wiki: "Low G" },
  { id: "andree", name: "Andree Right Hand", wiki: "Andree Right Hand" },
  { id: "bigdaddy", name: "BigDaddy", wiki: "BigDaddy" },
  { id: "lk", name: "LK", wiki: "LK (rapper)" },
  { id: "dsk", name: "DSK", wiki: "DSK (rapper)" },
  { id: "gducky", name: "GDucky", wiki: "GDucky" },
  { id: "24k-right", name: "24k.Right", wiki: "24k.Right" },
  { id: "phao", name: "Pháo", wiki: "Pháo (rapper)" },
  { id: "double2t", name: "Double2T", wiki: "Double2T" },
  { id: "obito", name: "Obito", wiki: "Obito (ca sĩ)" },
  { id: "16-typh", name: "16 Typh", wiki: "16 Typh" },
  { id: "tage", name: "Tage", wiki: "Tage (rapper)" },
  { id: "gill", name: "Gill", wiki: "Gill" },
  { id: "rhyder", name: "Rhyder", wiki: "Quang Anh (ca sĩ)" },
  { id: "phap-kieu", name: "Pháp Kiều", wiki: "Pháp Kiều" },
  { id: "hurrykng", name: "HURRYKNG", wiki: "HURRYKNG" },
  { id: "captain-boy", name: "Captain Boy", wiki: "Captain Boy" }
];

function fetchJson(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'VietRapTierMaker/2.0 (epu_doan@edu.vn)'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJson(res.headers.location).then(resolve);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(6000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

function downloadImage(url, destPath) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, destPath).then(resolve);
      }
      if (res.statusCode !== 200) {
        return resolve(false);
      }
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(true));
      });
      file.on('error', () => resolve(false));
    });
    req.on('error', () => resolve(false));
    req.setTimeout(8000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function run() {
  const outputDir = path.join(__dirname, '..', 'public', 'rappers');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const results = [];

  for (const r of rappersList) {
    const destJpg = path.join(outputDir, `${r.id}.jpg`);
    let downloaded = false;

    // 1. Search Wikipedia API
    const wikiUrl = `https://vi.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(r.wiki)}&gsrlimit=1&prop=pageimages&pithumbsize=360&format=json`;
    const data = await fetchJson(wikiUrl);
    
    if (data && data.query && data.query.pages) {
      const pages = data.query.pages;
      for (const pid of Object.keys(pages)) {
        if (pages[pid].thumbnail && pages[pid].thumbnail.source) {
          const thumbUrl = pages[pid].thumbnail.source;
          console.log(`Downloading photo for ${r.name} from ${thumbUrl.substring(0, 60)}...`);
          const success = await downloadImage(thumbUrl, destJpg);
          if (success) {
            downloaded = true;
            console.log(`[SUCCESS] Downloaded ${r.name}`);
            break;
          }
        }
      }
    }

    let finalImg = `/rappers/${r.id}.svg`;
    if (downloaded && fs.existsSync(destJpg) && fs.statSync(destJpg).size > 1000) {
      finalImg = `/rappers/${r.id}.jpg`;
    }

    results.push({
      id: r.id,
      name: r.name,
      image: finalImg,
      subtitle: r.wiki
    });
  }

  const outDataFile = path.join(__dirname, '..', 'src', 'rappersData.js');
  fs.writeFileSync(outDataFile, `export const DEFAULT_RAPPERS = ${JSON.stringify(results, null, 2)};\n`, 'utf-8');
  console.log(`Finished processing all ${results.length} rappers.`);
}

run();

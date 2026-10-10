import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, '..', 'public', 'rappers');

// Search DuckDuckGo images for remaining rappers
const missing = [
  { id: "justatee", query: "JustaTee ca sĩ rapper" },
  { id: "mck", query: "rapper MCK Nghiêm Vũ Hoàng Long" },
  { id: "lk", query: "rapper LK Lil Knight" },
  { id: "dsk", query: "rapper DSK Minh Kiên" },
  { id: "gducky", query: "rapper GDucky Rap Viet" },
  { id: "24k-right", query: "24k.Right rapper Rap Viet" },
  { id: "obito", query: "Obito Simple Love ca si" },
  { id: "tage", query: "rapper Tage Lop 13" },
  { id: "hurrykng", query: "HURRYKNG rapper Gerdnang" }
];

function downloadFile(url, dest) {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);
      const client = parsedUrl.protocol === 'https:' ? https : http;
      const req = client.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 7000
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadFile(res.headers.location, dest).then(resolve);
        }
        if (res.statusCode !== 200) return resolve(false);
        const fileStream = fs.createWriteStream(dest);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close(() => resolve(true));
        });
        fileStream.on('error', () => resolve(false));
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
    } catch (e) {
      resolve(false);
    }
  });
}

// Fetch images from DuckDuckGo instant answer / image search
async function searchDDGImage(query) {
  return new Promise((resolve) => {
    const url = `https://duckduckgo.com/i.js?l=wt-wt&o=json&q=${encodeURIComponent(query)}`;
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 6000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.results && json.results.length > 0) {
            // Find first valid image url
            for (const r of json.results) {
              if (r.image && (r.image.startsWith('http://') || r.image.startsWith('https://'))) {
                return resolve(r.image);
              }
            }
          }
          resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

// Fallback search via Wikipedia page images
async function searchWikiImage(query) {
  return new Promise((resolve) => {
    const url = `https://vi.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=3&prop=pageimages&pithumbsize=350&format=json`;
    https.get(url, {
      headers: {
        'User-Agent': 'VietRapTierMaker/2.0 (contact@epu.edu.vn)'
      },
      timeout: 6000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json?.query?.pages || {};
          for (const pid of Object.keys(pages)) {
            if (pages[pid].thumbnail?.source) {
              return resolve(pages[pid].thumbnail.source);
            }
          }
          resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function start() {
  for (const item of missing) {
    const dest = path.join(outputDir, `${item.id}.jpg`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      console.log(`Already have ${item.id}`);
      continue;
    }

    console.log(`Searching photo for ${item.id}...`);
    let imgUrl = await searchWikiImage(item.query);
    if (!imgUrl) {
      imgUrl = await searchDDGImage(item.query);
    }

    if (imgUrl) {
      console.log(`Found URL for ${item.id}: ${imgUrl.substring(0, 50)}...`);
      const ok = await downloadFile(imgUrl, dest);
      if (ok && fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
        console.log(`[SUCCESS] Saved ${item.id}.jpg (${fs.statSync(dest).size} bytes)`);
      } else {
        console.log(`[FAILED] Could not download ${item.id}`);
      }
    } else {
      console.log(`[NO_URL] No image found for ${item.id}`);
    }
  }

  // Update rappersData.js with all jpgs
  const list = [
    { id: "den-vau", name: "Đen Vâu", subtitle: "Triệu phú lời ca" },
    { id: "suboi", name: "Suboi", subtitle: "Queen of VN Rap" },
    { id: "binz", name: "Binz", subtitle: "Bigcityboi" },
    { id: "karik", name: "Karik", subtitle: "Người lạ ơi" },
    { id: "justatee", name: "JustaTee", subtitle: "King of Melodic" },
    { id: "rhymastic", name: "Rhymastic", subtitle: "Yêu 5 / SpaceSpeakers" },
    { id: "wowy", name: "Wowy", subtitle: "Lão Đại" },
    { id: "b-ray", name: "B Ray", subtitle: "Con trai cưng" },
    { id: "hieuthuhai", name: "HIEUTHUHAI", subtitle: "Ngủ một mình" },
    { id: "mck", name: "MCK", subtitle: "Chìm sâu / Nger" },
    { id: "tlinh", name: "tlinh", subtitle: "Gái độc thân" },
    { id: "low-g", name: "Low G", subtitle: "An Thần" },
    { id: "andree", name: "Andree Right Hand", subtitle: "Chơi như tụi Mỹ" },
    { id: "bigdaddy", name: "BigDaddy", subtitle: "Mượn rượu tỏ tình" },
    { id: "lk", name: "LK", subtitle: "Huyền thoại Viet Rap" },
    { id: "dsk", name: "DSK", subtitle: "King Underground" },
    { id: "gducky", name: "GDucky", subtitle: "Tiền nhiều để làm gì" },
    { id: "24k-right", name: "24k.Right", subtitle: "Bao Giờ Lấy Chồng" },
    { id: "phao", name: "Pháo", subtitle: "Hai phút hơn" },
    { id: "double2t", name: "Double2T", subtitle: "Người miền núi chất" },
    { id: "obito", name: "Obito", subtitle: "Simple Love" },
    { id: "16-typh", name: "16 Typh", subtitle: "Người Hải Phòng" },
    { id: "tage", name: "Tage", subtitle: "Lớp 13" },
    { id: "gill", name: "Gill", subtitle: "Vân Rung" },
    { id: "rhyder", name: "Rhyder", subtitle: "Chịu cách mình nói thua" },
    { id: "phap-kieu", name: "Pháp Kiều", subtitle: "Hoa Hồng Gai" },
    { id: "hurrykng", name: "HURRYKNG", subtitle: "Gerdnang" },
    { id: "captain-boy", name: "Captain Boy", subtitle: "Rolling Down" }
  ];

  const results = list.map(r => {
    const jpgPath = path.join(outputDir, `${r.id}.jpg`);
    const hasJpg = fs.existsSync(jpgPath) && fs.statSync(jpgPath).size > 1000;
    return {
      id: r.id,
      name: r.name,
      image: hasJpg ? `/rappers/${r.id}.jpg` : `/rappers/${r.id}.svg`,
      subtitle: r.subtitle
    };
  });

  const outDataFile = path.join(__dirname, '..', 'src', 'rappersData.js');
  fs.writeFileSync(outDataFile, `export const DEFAULT_RAPPERS = ${JSON.stringify(results, null, 2)};\n`, 'utf-8');
  console.log(`Updated rappersData.js with ${results.filter(r => r.image.endsWith('.jpg')).length} real photos out of ${results.length}.`);
}

start();

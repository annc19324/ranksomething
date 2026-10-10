import os
import json
import urllib.request
import urllib.parse

os.makedirs('public/rappers', exist_ok=True)

# List of Vietnamese rappers with their search query or Wikipedia title
rappers = [
    {"id": "den-vau", "name": "Đen Vâu", "wiki": "Đen Vâu", "color": "#1e3a8a"},
    {"id": "suboi", "name": "Suboi", "wiki": "Suboi", "color": "#831843"},
    {"id": "binz", "name": "Binz", "wiki": "Binz", "color": "#be185d"},
    {"id": "karik", "name": "Karik", "wiki": "Karik", "color": "#047857"},
    {"id": "justatee", "name": "JustaTee", "wiki": "JustaTee", "color": "#b45309"},
    {"id": "rhymastic", "name": "Rhymastic", "wiki": "Rhymastic", "color": "#4338ca"},
    {"id": "wowy", "name": "Wowy", "wiki": "Wowy", "color": "#15803d"},
    {"id": "b-ray", "name": "B Ray", "wiki": "B Ray", "color": "#b91c1c"},
    {"id": "hieuthuhai", "name": "HIEUTHUHAI", "wiki": "Hieuthuhai", "color": "#0369a1"},
    {"id": "mck", "name": "MCK", "wiki": "MCK (rapper)", "color": "#4c1d95"},
    {"id": "tlinh", "name": "tlinh", "wiki": "Tlinh", "color": "#db2777"},
    {"id": "low-g", "name": "Low G", "wiki": "Low G", "color": "#374151"},
    {"id": "andree", "name": "Andree Right Hand", "wiki": "Andree Right Hand", "color": "#7c2d12"},
    {"id": "bigdaddy", "name": "BigDaddy", "wiki": "BigDaddy", "color": "#0f766e"},
    {"id": "lk", "name": "LK", "wiki": "LK (rapper)", "color": "#701a75"},
    {"id": "dsk", "name": "DSK", "wiki": "DSK (rapper)", "color": "#1e293b"},
    {"id": "gducky", "name": "GDucky", "wiki": "GDucky", "color": "#ca8a04"},
    {"id": "24k-right", "name": "24k.Right", "wiki": "24k.Right", "color": "#eab308"},
    {"id": "phao", "name": "Pháo", "wiki": "Pháo (rapper)", "color": "#ec4899"},
    {"id": "double2t", "name": "Double2T", "wiki": "Double2T", "color": "#16a34a"},
    {"id": "obito", "name": "Obito", "wiki": "Obito (ca sĩ)", "color": "#0284c7"},
    {"id": "16-typh", "name": "16 Typh", "wiki": "16 Typh", "color": "#6366f1"},
    {"id": "tage", "name": "Tage", "wiki": "Tage (rapper)", "color": "#d97706"},
    {"id": "gill", "name": "Gill", "wiki": "Gill", "color": "#059669"},
    {"id": "rhyder", "name": "Rhyder", "wiki": "Quang Anh (ca sĩ)", "color": "#7c3aed"},
    {"id": "phap-kieu", "name": "Pháp Kiều", "wiki": "Pháp Kiều", "color": "#f43f5e"},
    {"id": "hurrykng", "name": "HURRYKNG", "wiki": "HURRYKNG", "color": "#0ea5e9"},
    {"id": "captain-boy", "name": "Captain Boy", "wiki": "Captain Boy", "color": "#8b5cf6"},
]

results = []

for r in rappers:
    dest_path = f"public/rappers/{r['id']}.jpg"
    has_photo = False
    
    # Try fetching Wikipedia thumbnail
    url = f"https://vi.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(r['wiki'])}&prop=pageimages&format=json&pithumbsize=300"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'TierMakerApp/1.0 (contact@example.com)'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            pages = data.get('query', {}).get('pages', {})
            for pid in pages:
                if 'thumbnail' in pages[pid]:
                    thumb_url = pages[pid]['thumbnail']['source']
                    img_req = urllib.request.Request(thumb_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(img_req, timeout=8) as img_resp:
                        with open(dest_path, 'wb') as f:
                            f.write(img_resp.read())
                        has_photo = True
                        print(f"[OK] Downloaded photo for {r['name']}")
    except Exception as e:
        print(f"[Skip] {r['name']}: {e}")

    # If no photo downloaded, create a stylized SVG avatar card
    if not has_photo:
        svg_path = f"public/rappers/{r['id']}.svg"
        initials = "".join([w[0] for w in r['name'].split()[:2]]).upper()
        svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="grad_{r['id']}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{r['color']}" />
      <stop offset="100%" stop-color="#090d16" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.5"/>
    </filter>
  </defs>
  <rect width="200" height="200" fill="url(#grad_{r['id']})" />
  <circle cx="100" cy="80" r="42" fill="#ffffff" fill-opacity="0.1" />
  <circle cx="100" cy="76" r="32" fill="#ffffff" fill-opacity="0.2" />
  <!-- Microphone / Music Icon Accent -->
  <path d="M92 65 C92 60 108 60 108 65 L108 80 C108 85 92 85 92 80 Z" fill="#ffffff" fill-opacity="0.8"/>
  <path d="M86 73 C86 85 114 85 114 73" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round"/>
  <line x1="100" y1="85" x2="100" y2="95" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
  <line x1="90" y1="95" x2="110" y2="95" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
  
  <!-- Text Label -->
  <rect x="8" y="145" width="184" height="42" rx="8" fill="#000000" fill-opacity="0.65" />
  <text x="100" y="172" fill="#ffffff" font-family="system-ui, sans-serif" font-size="16" font-weight="700" text-anchor="middle">
    {r['name']}
  </text>
  <text x="100" y="125" fill="#facc15" font-family="system-ui, sans-serif" font-size="12" font-weight="800" text-anchor="middle" letter-spacing="1">
    ★ RAPPER VN ★
  </text>
</svg>'''
        with open(svg_path, 'w', encoding='utf-8') as f:
            f.write(svg_content)
        img_src = f"/rappers/{r['id']}.svg"
    else:
        img_src = f"/rappers/{r['id']}.jpg"

    results.append({
        "id": r["id"],
        "name": r["name"],
        "image": img_src
    })

with open("src/rappers_data.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"Finished processing {len(results)} rappers.")

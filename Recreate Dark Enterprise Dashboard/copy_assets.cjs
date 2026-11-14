const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\8ef2465c-c3f7-414f-b76c-d51ceb7e0418';
const targetDir1 = 'c:\\Users\\Dell\\Desktop\\NASA\\Recreate Dark Enterprise Dashboard\\src\\assets\\user';
const targetDir2 = 'c:\\Users\\Dell\\Desktop\\NASA\\user\\src\\assets';

fs.mkdirSync(targetDir1, { recursive: true });
fs.mkdirSync(targetDir2, { recursive: true });

const brainFiles = fs.readdirSync(brainDir);

const mappings = [
  { prefix: 'fireguard_hero_banner', dest: 'fireguard_hero_banner.jpg' },
  { prefix: 'stay_aware_thumb', dest: 'stay_aware_thumb.jpg' },
  { prefix: 'safe_route_thumb', dest: 'safe_route_thumb.jpg' },
  { prefix: 'alert_wildfire', dest: 'alert_wildfire.jpg' },
  { prefix: 'alert_smoke', dest: 'alert_smoke.jpg' },
  { prefix: 'alert_road', dest: 'alert_road.jpg' },
];

for (const m of mappings) {
  const match = brainFiles.filter(f => f.startsWith(m.prefix) && f.endsWith('.jpg')).sort().pop();
  if (match) {
    const src = path.join(brainDir, match);
    fs.copyFileSync(src, path.join(targetDir1, m.dest));
    fs.copyFileSync(src, path.join(targetDir2, m.dest));
    console.log(`Copied ${match} -> ${m.dest}`);
  } else {
    console.warn(`Could not find file with prefix ${m.prefix}`);
  }
}
console.log('Asset copy complete!');

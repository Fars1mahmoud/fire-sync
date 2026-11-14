import fs from 'fs';
import { PNG } from 'pngjs';

const data = fs.readFileSync('src/imports/ChatGPT_Image_Sep_28__2026__07_22_03_PM.png');
const png = PNG.sync.read(data);

function crop(x, y, w, h) {
  const result = new PNG({ width: w, height: h });
  for (let cy = 0; cy < h; cy++) {
    for (let cx = 0; cx < w; cx++) {
      const srcIdx = (png.width * (y + cy) + (x + cx)) << 2;
      const dstIdx = (w * cy + cx) << 2;
      result.data[dstIdx] = png.data[srcIdx];
      result.data[dstIdx + 1] = png.data[srcIdx + 1];
      result.data[dstIdx + 2] = png.data[srcIdx + 2];
      result.data[dstIdx + 3] = png.data[srcIdx + 3];
    }
  }
  return result;
}

// Clean inner maps without panel headers
const crops = {
  // Mini world map in sidebar
  mini_world: { x: 23, y: 213, w: 218, h: 87 },
  // Main Mediterranean Map
  med_map: { x: 268, y: 107, w: 601, h: 531 },
  // Risk prediction map thumbnail
  risk_map: { x: 1228, y: 284, w: 200, h: 109 },
  // Smoke & Air Quality inner satellite map
  smoke_map: { x: 279, y: 704, w: 213, h: 99 },
  // Ground Truth thumbnails
  report_0: { x: 518, y: 689, w: 50, h: 36 },
  report_1: { x: 518, y: 733, w: 50, h: 36 },
  report_2: { x: 518, y: 777, w: 50, h: 36 },
  // Infrastructure proximity radar map
  infra_map: { x: 742, y: 704, w: 265, h: 101 },
  // Evacuation routing satellite map
  route_map: { x: 1019, y: 704, w: 226, h: 101 },
  // Post-fire recovery split satellite map
  recovery_map: { x: 1264, y: 704, w: 247, h: 79 },
  // Forest Time Machine 7 thumbnails
  forest_2018: { x: 19, y: 890, w: 59, h: 52 },
  forest_2019: { x: 80, y: 890, w: 59, h: 52 },
  forest_2020: { x: 141, y: 890, w: 59, h: 52 },
  forest_2021: { x: 202, y: 890, w: 59, h: 52 },
  forest_2022: { x: 263, y: 890, w: 59, h: 52 },
  forest_2023: { x: 324, y: 890, w: 59, h: 52 },
  forest_2024: { x: 385, y: 890, w: 59, h: 52 },
  // Simulator predicted spread map
  sim_map: { x: 796, y: 869, w: 135, h: 110 },
  // Biodiversity deer icon area
  biodiversity_deer: { x: 1118, y: 902, w: 42, h: 48 },
};

for (const [name, rect] of Object.entries(crops)) {
  const cropped = crop(rect.x, rect.y, rect.w, rect.h);
  fs.writeFileSync(`src/assets/crops/${name}.png`, PNG.sync.write(cropped));
  console.log(`Saved src/assets/crops/${name}.png (${rect.w}x${rect.h})`);
}

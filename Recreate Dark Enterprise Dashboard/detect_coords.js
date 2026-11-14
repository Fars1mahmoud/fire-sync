import fs from 'fs';
import { PNG } from 'pngjs';

const data = fs.readFileSync('src/imports/ChatGPT_Image_Sep_28__2026__07_22_03_PM.png');
const png = PNG.sync.read(data);

console.log(`Original image: ${png.width}x${png.height}`);

function getPixel(x, y) {
  const idx = (png.width * y + x) << 2;
  return {
    r: png.data[idx],
    g: png.data[idx + 1],
    b: png.data[idx + 2],
    a: png.data[idx + 3]
  };
}

// Sample key points across the layout
console.log('Top left (10, 10):', getPixel(10, 10));
console.log('Navbar (10, 60):', getPixel(10, 60));
console.log('Sidebar top (20, 110):', getPixel(20, 110));
console.log('Main map center (500, 300):', getPixel(500, 300));
console.log('Calendar center (1000, 200):', getPixel(1000, 200));
console.log('Weather center (1300, 150):', getPixel(1300, 150));
console.log('Anomaly center (1100, 480):', getPixel(1100, 480));

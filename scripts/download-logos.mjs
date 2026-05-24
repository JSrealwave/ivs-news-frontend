import fs from 'fs';
import https from 'https';
import path from 'path';

const providersPath = '../ivs_news/providers.json';
const logosDir = './public/logos';

if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

async function downloadImage(url, filename) {
  if (!url) return false;
  
  const filePath = path.join(logosDir, filename);
  
  return new Promise((resolve) => {
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        downloadImage(response.headers.location, filename).then(resolve);
        return;
      }
      if (response.statusCode !== 200) {
        console.log(`❌ Failed ${filename}: ${response.statusCode}`);
        resolve(false);
        return;
      }
      
      const file = fs.createWriteStream(filePath);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${filename}`);
        resolve(true);
      });
    }).on('error', (err) => {
      console.log(`❌ Error ${filename}: ${err.message}`);
      resolve(false);
    });
  });
}

async function main() {
  console.log("📥 Starting logo download...\n");
  const data = JSON.parse(fs.readFileSync(providersPath, 'utf8'));
  
  for (const p of data.providers) {
    if (p.logo_url) {
      const ext = path.extname(p.logo_url).toLowerCase() || '.png';
      const safeName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + ext;
      await downloadImage(p.logo_url, safeName);
    }
  }
  console.log("\n✅ Done!");
}

main();

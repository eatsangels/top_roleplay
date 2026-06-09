import fs from 'fs';
import path from 'path';

const basePath = 'D:\\Nuevos Archivos Top\\Misc\\Kamis1232_Rener_Pack_And_2012_Update\\Kamis1232_Rener_Pack_NEW_UPDATED_2011';

function listFiles(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(listFiles(fullPath));
      } else {
        const ext = path.extname(file).toLowerCase();
        if (['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.psd', '.webp'].includes(ext)) {
          results.push({
            relDir: path.relative(basePath, dir),
            name: file,
            size: stat.size
          });
        }
      }
    });
  } catch (e) {
    console.error(`Error reading ${dir}:`, e.message);
  }
  return results;
}

if (!fs.existsSync(basePath)) {
  console.error(`Base path does not exist: ${basePath}`);
  process.exit(1);
}

const files = listFiles(basePath);
console.log(`Total images found: ${files.length}`);

// Group by subdirectory
const groups = {};
files.forEach(f => {
  const dirName = f.relDir || 'root';
  if (!groups[dirName]) groups[dirName] = [];
  groups[dirName].push(f);
});

Object.keys(groups).forEach(dirName => {
  console.log(`\n--- Directory: ${dirName} (${groups[dirName].length} files) ---`);
  // Print first 15 files
  groups[dirName].slice(0, 15).forEach(f => {
    console.log(` - ${f.name} (${(f.size / 1024).toFixed(1)} KB)`);
  });
  if (groups[dirName].length > 15) {
    console.log(` ... and ${groups[dirName].length - 15} more files`);
  }
});

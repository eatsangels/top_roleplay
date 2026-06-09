import fs from 'fs';
import path from 'path';

const basePath = 'c:\\top_roleplay\\public\\visuals\\top';

function listFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(listFiles(fullPath));
    } else {
      results.push({
        relDir: path.relative(basePath, dir),
        name: file,
        size: stat.size
      });
    }
  });
  return results;
}

const files = listFiles(basePath);
console.log(`Total existing files in public/visuals/top: ${files.length}`);

const groups = {};
files.forEach(f => {
  const dirName = f.relDir || 'root';
  if (!groups[dirName]) groups[dirName] = [];
  groups[dirName].push(f);
});

Object.keys(groups).forEach(dirName => {
  console.log(`- ${dirName}: ${groups[dirName].length} files`);
});

import fs from 'fs';
import path from 'path';

const baseDir = 'c:\\top_roleplay\\public\\visuals\\top';
const publicDir = 'c:\\top_roleplay\\public';

function getImages(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getImages(fullPath));
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'].includes(ext)) {
        // Get path relative to publicDir to use as src
        const relToPublic = path.relative(publicDir, fullPath).replace(/\\/g, '/');
        results.push({
          src: '/' + relToPublic,
          name: file,
          dir: path.relative(baseDir, dir)
        });
      }
    }
  });
  return results;
}

const images = getImages(baseDir);

const html = `<!DOCTYPE html>
<html>
<head>
  <title>Top Roleplay Image Explorer</title>
  <style>
    body {
      background-color: #0b0b0f;
      color: #f3f4f6;
      font-family: system-ui, sans-serif;
      margin: 0;
      padding: 24px;
    }
    h1 {
      color: #d4af37;
      text-align: center;
      margin-bottom: 30px;
    }
    .dir-section {
      margin-bottom: 40px;
      border-bottom: 1px solid #333;
      padding-bottom: 20px;
    }
    .dir-title {
      font-size: 24px;
      color: #00e5ff;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    .card {
      background: #16161e;
      border: 1px solid #2a2a35;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .img-container {
      height: 180px;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .info {
      padding: 12px;
      font-size: 13px;
    }
    .path {
      word-break: break-all;
      font-family: monospace;
      color: #aaa;
    }
  </style>
</head>
<body>
  <h1>Top Roleplay Image Explorer</h1>
  <div id="content"></div>

  <script>
    const images = ${JSON.stringify(images)};
    const groups = {};
    images.forEach(img => {
      const dir = img.dir || 'Root';
      if (!groups[dir]) groups[dir] = [];
      groups[dir].push(img);
    });

    const contentDiv = document.getElementById('content');
    Object.keys(groups).sort().forEach(dir => {
      const sec = document.createElement('div');
      sec.className = 'dir-section';
      
      const title = document.createElement('div');
      title.className = 'dir-title';
      title.textContent = dir + ' (' + groups[dir].length + ' images)';
      sec.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'grid';

      // Show up to 30 images per directory in the explorer to keep it lightweight
      const displayImages = groups[dir];
      displayImages.forEach(img => {
        const card = document.createElement('div');
        card.className = 'card';

        const imgC = document.createElement('div');
        imgC.className = 'img-container';
        
        const element = document.createElement('img');
        element.src = img.src;
        element.loading = 'lazy';
        imgC.appendChild(element);

        const info = document.createElement('div');
        info.className = 'info';
        info.innerHTML = '<strong>' + img.name + '</strong><br><span class="path">' + img.src + '</span>';
        
        card.appendChild(imgC);
        card.appendChild(info);
        grid.appendChild(card);
      });

      sec.appendChild(grid);
      contentDiv.appendChild(sec);
    });
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(publicDir, 'gallery-explorer.html'), html);
console.log('Gallery explorer generated at public/gallery-explorer.html');

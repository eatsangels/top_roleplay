import fs from 'fs';
import path from 'path';

const baseDir = 'c:\\top_roleplay\\public\\visuals\\top';

['Wallpapers', 'Scenes', 'Panorama'].forEach(sub => {
  const p = path.join(baseDir, sub);
  if (fs.existsSync(p)) {
    const files = fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isFile());
    console.log(`\n=== ${sub} (${files.length} files) ===`);
    files.forEach(f => console.log(` - ${f}`));
  }
});

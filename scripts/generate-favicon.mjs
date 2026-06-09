import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
const source = resolve(root, "public", "TOP_ROLEPLAY_traced_real.svg");
const appDirectory = resolve(root, "src", "app");

async function renderPng(size) {
  return sharp(source)
    .resize(size, size, { fit: "contain" })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

function createIco(images) {
  const headerSize = 6;
  const directoryEntrySize = 16;
  const dataOffset = headerSize + directoryEntrySize * images.length;
  const header = Buffer.alloc(dataOffset);

  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = dataOffset;
  images.forEach(({ data, size }, index) => {
    const entry = headerSize + directoryEntrySize * index;
    header.writeUInt8(size === 256 ? 0 : size, entry);
    header.writeUInt8(size === 256 ? 0 : size, entry + 1);
    header.writeUInt8(0, entry + 2);
    header.writeUInt8(0, entry + 3);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });

  return Buffer.concat([header, ...images.map(({ data }) => data)]);
}

await mkdir(dirname(resolve(appDirectory, "favicon.ico")), { recursive: true });

const faviconImages = await Promise.all(
  [16, 32, 48, 64].map(async (size) => ({ size, data: await renderPng(size) })),
);

await Promise.all([
  writeFile(resolve(appDirectory, "favicon.ico"), createIco(faviconImages)),
  writeFile(resolve(appDirectory, "icon.png"), await renderPng(512)),
  writeFile(resolve(appDirectory, "apple-icon.png"), await renderPng(180)),
]);

const sourceSize = (await readFile(source)).length;
console.log(`Favicons generated from ${sourceSize.toLocaleString()} byte SVG.`);

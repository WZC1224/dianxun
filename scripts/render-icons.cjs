const fs = require("fs");
const sharp = require("sharp");

const svg = fs.readFileSync("public/icon.svg");

async function main() {
  await sharp(svg, { density: 512 }).resize(512, 512).png().toFile("public/icon-512.png");
  await sharp(svg, { density: 192 }).resize(192, 192).png().toFile("public/icon-192.png");

  const inner = svg
    .toString()
    .replace(/<\?xml[^>]*>/, "")
    .replace(/<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "");

  const maskable = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0B0F14"/>
  <svg x="96" y="96" width="320" height="320" viewBox="0 0 64 64">${inner}</svg>
</svg>`;

  await sharp(Buffer.from(maskable))
    .resize(512, 512)
    .png()
    .toFile("public/icon-maskable-512.png");

  console.log(
    "ok",
    fs.statSync("public/icon-192.png").size,
    fs.statSync("public/icon-512.png").size,
    fs.statSync("public/icon-maskable-512.png").size,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

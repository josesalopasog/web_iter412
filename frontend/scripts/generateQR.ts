import * as fs from "fs";
import * as path from "path";
import QRCode from "qrcode";
import sharp from "sharp";

const QR_URL = "https://iter412.com/";

// ajusta esta ruta a tu logo real
const LOGO_PATH = path.resolve(process.cwd(), "public/logo-iter.png");

const OUTPUT_DIR = path.resolve(process.cwd(), "src/assets/qr");
const OUTPUT_SVG = path.join(OUTPUT_DIR, "iter412-qr.svg");
const OUTPUT_PNG = path.join(OUTPUT_DIR, "iter412-qr.png");

const CONFIG = {
  size: 1200,
  quietZoneModules: 2,
  moduleScale: 0.80,
  centerCircleSize: 340,
  logoSize: 300,
  bodyColor: "#000000",
  bgColor: "#ffffff",
  eyeColors: {
    topLeft: "#12A127",
    topRight: "#FE1C1D",
    bottomLeft: "#570D89",
    bottomRightSmall: "#000000",
  },
};

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getMimeType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".webp") return "image/webp";
  throw new Error(`Formato no soportado para el logo: ${ext}`);
}

function fileToDataUri(filePath: string) {
  const mime = getMimeType(filePath);
  const buffer = fs.readFileSync(filePath);
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

function isInTopLeftFinder(row: number, col: number) {
  return row <= 6 && col <= 6;
}

function isInTopRightFinder(row: number, col: number, size: number) {
  return row <= 6 && col >= size - 7;
}

function isInBottomLeftFinder(row: number, col: number, size: number) {
  return row >= size - 7 && col <= 6;
}

function isInAnyBigFinder(row: number, col: number, size: number) {
  return (
    isInTopLeftFinder(row, col) ||
    isInTopRightFinder(row, col, size) ||
    isInBottomLeftFinder(row, col, size)
  );
}

function getBottomRightAlignmentStart(moduleCount: number) {
  return moduleCount - 9;
}

function isInBottomRightAlignment(row: number, col: number, size: number) {
  const start = getBottomRightAlignmentStart(size);
  return row >= start && row <= start + 4 && col >= start && col <= start + 4;
}

function isInsideCircle(
  x: number,
  y: number,
  cx: number,
  cy: number,
  r: number
) {
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

function roundedRect(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: string
) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="${fill}" />`;
}

function buildFinder(
  x: number,
  y: number,
  modulePx: number,
  color: string
) {
  const outer = 7 * modulePx;
  const middle = 5 * modulePx;
  const inner = 3 * modulePx;

  return `
    ${roundedRect(x, y, outer, outer, modulePx * 1.1, color)}
    ${roundedRect(x + modulePx, y + modulePx, middle, middle, modulePx * 0.9, "#ffffff")}
    ${roundedRect(x + 2 * modulePx, y + 2 * modulePx, inner, inner, modulePx * 0.6, color)}
  `;
}

function buildSmallAlignment(
  x: number,
  y: number,
  modulePx: number,
  color: string
) {
  const outer = 5 * modulePx;
  const middle = 3 * modulePx;
  const inner = 1 * modulePx;

  return `
    ${roundedRect(x, y, outer, outer, modulePx * 0.8, color)}
    ${roundedRect(x + modulePx, y + modulePx, middle, middle, modulePx * 0.5, "#ffffff")}
    ${roundedRect(x + 2 * modulePx, y + 2 * modulePx, inner, inner, modulePx * 0.2, color)}
  `;
}

async function generateStyledQR() {
  ensureDir(OUTPUT_DIR);

  if (!fs.existsSync(LOGO_PATH)) {
    throw new Error(`No se encontró el logo en ${LOGO_PATH}`);
  }

  const qr = QRCode.create(QR_URL, {
    errorCorrectionLevel: "H",
  });

  const moduleCount = qr.modules.size;
  const totalModules = moduleCount + CONFIG.quietZoneModules * 2;
  const modulePx = CONFIG.size / totalModules;

  const offset = CONFIG.quietZoneModules * modulePx;
  const centerX = CONFIG.size / 2;
  const centerY = CONFIG.size / 2;
  const centerRadius = CONFIG.centerCircleSize / 2;

  const scaledSize = modulePx * CONFIG.moduleScale;
  const moduleOffset = (modulePx - scaledSize) / 2;
  const logoDataUri = fileToDataUri(LOGO_PATH);

  let bodyModules = "";

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const isDark = qr.modules.get(row, col);
      if (!isDark) continue;

      if (isInAnyBigFinder(row, col, moduleCount)) continue;
      if (isInBottomRightAlignment(row, col, moduleCount)) continue;

      const x = offset + col * modulePx + moduleOffset;
      const y = offset + row * modulePx + moduleOffset;
      const cx = x + scaledSize / 2;
      const cy = y + scaledSize / 2;

      if (isInsideCircle(cx, cy, centerX, centerY, centerRadius + modulePx * 0.15)) {
        continue;
      }

      const radius = scaledSize * 0.5;

      bodyModules += `
<circle
  cx="${x + scaledSize / 2}"
  cy="${y + scaledSize / 2}"
  r="${radius * 0.85}"
  fill="${CONFIG.bodyColor}"
/>
`;
    }
  }

  const topLeftX = offset;
  const topLeftY = offset;

  const topRightX = offset + (moduleCount - 7) * modulePx;
  const topRightY = offset;

  const bottomLeftX = offset;
  const bottomLeftY = offset + (moduleCount - 7) * modulePx;

  const smallStart = getBottomRightAlignmentStart(moduleCount);
  const bottomRightSmallX = offset + smallStart * modulePx;
  const bottomRightSmallY = offset + smallStart * modulePx;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${CONFIG.size}" height="${CONFIG.size}" viewBox="0 0 ${CONFIG.size} ${CONFIG.size}">
  <rect width="100%" height="100%" fill="${CONFIG.bgColor}" />
  ${bodyModules}
  ${buildFinder(topLeftX, topLeftY, modulePx, CONFIG.eyeColors.topLeft)}
  ${buildFinder(topRightX, topRightY, modulePx, CONFIG.eyeColors.topRight)}
  ${buildFinder(bottomLeftX, bottomLeftY, modulePx, CONFIG.eyeColors.bottomLeft)}
  ${buildSmallAlignment(bottomRightSmallX, bottomRightSmallY, modulePx, CONFIG.eyeColors.bottomRightSmall)}
  <circle cx="${centerX}" cy="${centerY}" r="${centerRadius}" fill="#ffffff" />
  <image
    href="${logoDataUri}"
    x="${centerX - CONFIG.logoSize / 2}"
    y="${centerY - CONFIG.logoSize / 2}"
    width="${CONFIG.logoSize}"
    height="${CONFIG.logoSize}"
    preserveAspectRatio="xMidYMid meet"
  />
</svg>
`.trim();

  fs.writeFileSync(OUTPUT_SVG, svg, "utf-8");

  await sharp(Buffer.from(svg))
    .flatten({ background: "#ffffff" })
    .png()
    .toFile(OUTPUT_PNG);

  console.log(`✅ SVG generado en: ${OUTPUT_SVG}`);
  console.log(`✅ PNG generado en: ${OUTPUT_PNG}`);
}

generateStyledQR().catch((error) => {
  console.error("❌ Error generando el QR:");
  console.error(error);
});
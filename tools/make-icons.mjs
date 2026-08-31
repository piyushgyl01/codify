/**
 * Generates the PWA icon set. Rasterised here rather than shipped as binaries
 * so the icons stay reproducible and match the app's palette exactly.
 *
 *   node tools/make-icons.mjs
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

/* ------------------------------- PNG writer ------------------------------- */

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

const crc32 = buf => {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** Encode straight RGBA pixels as a PNG. */
function encodePng(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;    // bit depth
  ihdr[9] = 6;    // colour type: RGBA
  // 10..12 stay zero: deflate, adaptive filtering, no interlace

  // one filter byte (0 = none) per scanline
  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    const src = y * width * 4, dst = y * (width * 4 + 1);
    raw[dst] = 0;
    rgba.copy(raw, dst + 1, src, src + width * 4);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* --------------------------------- shapes --------------------------------- */

const ACCENT = [0x4a, 0xe5, 0x8c];   // phosphor, the default theme
const PLATE  = [0x0e, 0x12, 0x1c];   // panel
const EDGE   = [0x23, 0x2c, 0x3e];   // line

/** Inside test for a rounded rect. */
const inRound = (px, py, x, y, w, h, r) => {
  const cx = Math.min(Math.max(px, x + r), x + w - r);
  const cy = Math.min(Math.max(py, y + r), y + h - r);
  return (px - cx) ** 2 + (py - cy) ** 2 <= r * r;
};

/**
 * Distance from a point to a line segment, so a stroke can run at any angle with
 * round caps. The chevrons are diagonal, which the axis-aligned capsule test
 * used by the old mark could not express.
 */
function nearSegment(px, py, x1, y1, x2, y2, r) {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  const t = len2 ? Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2)) : 0;
  const qx = x1 + t * dx, qy = y1 + t * dy;
  return (px - qx) ** 2 + (py - qy) ** 2 <= r * r;
}

/**
 * The mark: </> on a 24-unit grid, the same glyph as the favicon.
 * Returned as segments in pixel space.
 */
function markSegments(scale, ox, oy) {
  const u = v => (v / 24) * scale;
  const P = (x, y) => [ox + u(x), oy + u(y)];
  return {
    r: u(1.35),
    segs: [
      [...P(8.6, 6), ...P(3.4, 12)],      // left chevron, upper
      [...P(3.4, 12), ...P(8.6, 18)],     // left chevron, lower
      [...P(15.4, 6), ...P(20.6, 12)],    // right chevron, upper
      [...P(20.6, 12), ...P(15.4, 18)],   // right chevron, lower
      [...P(13.4, 5.4), ...P(10.6, 18.6)] // slash
    ],
  };
}

/** Render one icon. `maskable` fills edge-to-edge and insets the mark. */
function renderIcon(size, { maskable = false } = {}) {
  const SS = 4;                                  // supersample for clean edges
  const n = size * SS;
  const px = Buffer.alloc(n * n * 4);

  // Maskable icons are cropped to a circle by Android, so the mark sits inside
  // the middle 80% and the background reaches every edge.
  const inset = maskable ? 0 : n * 0.03;
  const radius = maskable ? 0 : n * 0.21;
  const border = maskable ? 0 : n * 0.03;
  const markScale = maskable ? n * 0.52 : n * 0.62;
  const { r, segs } = markSegments(markScale, (n - markScale) / 2, (n - markScale) / 2);

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let col = null;

      const onPlate = maskable
        ? true
        : inRound(x, y, inset, inset, n - inset * 2, n - inset * 2, radius);

      if (onPlate) {
        const inner = maskable
          ? true
          : inRound(x, y, inset + border, inset + border,
                    n - (inset + border) * 2, n - (inset + border) * 2,
                    Math.max(0, radius - border));
        col = inner ? PLATE : EDGE;
      }

      if (col && segs.some(sg => nearSegment(x, y, sg[0], sg[1], sg[2], sg[3], r))) col = ACCENT;

      const i = (y * n + x) * 4;
      if (col) { px[i] = col[0]; px[i + 1] = col[1]; px[i + 2] = col[2]; px[i + 3] = 255; }
    }
  }

  // box-filter down to the target size
  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let rr = 0, gg = 0, bb = 0, aa = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const i = (((y * SS + sy) * n) + (x * SS + sx)) * 4;
          rr += px[i]; gg += px[i + 1]; bb += px[i + 2]; aa += px[i + 3];
        }
      }
      const c = SS * SS, o = (y * size + x) * 4;
      out[o] = rr / c; out[o + 1] = gg / c; out[o + 2] = bb / c; out[o + 3] = aa / c;
    }
  }
  return encodePng(size, size, out);
}

/* ---------------------------------- build --------------------------------- */

const targets = [
  ['icons/icon-192.png',          192, {}],
  ['icons/icon-512.png',          512, {}],
  ['icons/icon-maskable-192.png', 192, { maskable: true }],
  ['icons/icon-maskable-512.png', 512, { maskable: true }],
  ['icons/apple-touch-icon.png',  180, { maskable: true }],  // iOS crops corners itself
];

for (const [path, size, opts] of targets) {
  const buf = renderIcon(size, opts);
  writeFileSync(path, buf);
  console.log(`${path.padEnd(30)} ${size}x${size}  ${(buf.length / 1024).toFixed(1)} KB`);
}

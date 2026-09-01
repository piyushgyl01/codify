/**
 * Hand-drawn inline SVG charts. No library — the shapes needed here are simple,
 * and a charting dependency would be the largest thing in the repo by an order
 * of magnitude for four kinds of drawing.
 *
 * The bars stretch with preserveAspectRatio="none" so they fill any width, which
 * also squashes any <text> placed inside the SVG. Labels are therefore HTML laid
 * over the chart, which keeps type crisp at every width.
 */
import { esc } from './ui.js';

const svg = (w, hgt, body, extra = '') =>
  `<svg viewBox="0 0 ${w} ${hgt}" preserveAspectRatio="none" class="chart-svg"
        style="width:100%;height:${hgt}px;display:block" ${extra}>${body}</svg>`;

/**
 * Vertical bars with an optional dashed target line and a rolling-average overlay.
 * `data` is [{ value, color, label, key }]; `avg` is a parallel array of numbers
 * or nulls.
 */
export function seriesChart(data, {
  height = 120, target = null, avg = null, axisEvery = 5, min = 0,
  maxValue = null,
} = {}) {
  if (!data.length) return emptyChart(height);

  const w = Math.max(data.length * 10, 100);

  // Two charts are only comparable if they share a y-scale. Without `maxValue`
  // each normalises to its own tallest bar, so a 90-minute day and a 31-minute
  // day both draw full height — which silently destroys the one comparison the
  // raw/effective pair exists to make.
  const peak = maxValue != null
    ? maxValue
    : Math.max(
        ...data.map(d => d.value || 0),
        target || 0,
        ...(avg || []).map(v => v || 0),
        min || 1,
      ) * 1.12;

  const bw = w / data.length;
  const gap = Math.min(2.2, bw * 0.22);

  const bars = data.map((d, i) => {
    const hgt = peak ? Math.min(height, ((d.value || 0) / peak) * height) : 0;
    return `<rect x="${i * bw + gap / 2}" y="${height - hgt}" width="${bw - gap}" height="${Math.max(0, hgt)}"
      fill="${d.color || 'var(--accent)'}" rx="0.6"><title>${esc(d.label || '')}</title></rect>`;
  }).join('');

  const targetLine = target != null && peak
    ? `<line x1="0" y1="${height - (target / peak) * height}" x2="${w}"
             y2="${height - (target / peak) * height}"
             stroke="var(--ink)" stroke-width="1" stroke-dasharray="3 3" opacity=".5"/>`
    : '';

  const avgPath = avg ? linePath(avg, peak, w, height, bw) : '';

  return `<div class="chart">
    ${svg(w, height, `${targetLine}${bars}${avgPath}`)}
    ${axisLabels(data, axisEvery)}
  </div>`;
}

function linePath(values, peak, w, height, bw) {
  const pts = values.map((v, i) => (v == null ? null : [i * bw + bw / 2, height - (v / peak) * height]));
  let d = '', open = false;
  for (const p of pts) {
    if (!p) { open = false; continue; }
    d += `${open ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)} `;
    open = true;
  }
  return d ? `<path d="${d}" fill="none" stroke="var(--ink)" stroke-width="1.4"
    opacity=".75" vector-effect="non-scaling-stroke"/>` : '';
}

/** Stacked bars — the mode split per day. `data` is [{ parts:[{v,color}], label }]. */
export function stackedChart(data, { height = 120, axisEvery = 5 } = {}) {
  if (!data.length) return emptyChart(height);
  const w = Math.max(data.length * 10, 100);
  const peak = Math.max(...data.map(d => d.parts.reduce((n, p) => n + p.v, 0)), 1) * 1.1;
  const bw = w / data.length;
  const gap = Math.min(2.2, bw * 0.22);

  const bars = data.map((d, i) => {
    let y = height;
    return d.parts.map(p => {
      const hgt = (p.v / peak) * height;
      y -= hgt;
      return hgt <= 0 ? '' :
        `<rect x="${i * bw + gap / 2}" y="${y}" width="${bw - gap}" height="${hgt}" fill="${p.color}"/>`;
    }).join('');
  }).join('');

  return `<div class="chart">${svg(w, height, bars)}${axisLabels(data, axisEvery)}</div>`;
}

/** A continuous reading — retention forecast, weekly averages. */
export function lineChart(points, {
  height = 120, color = 'var(--accent)', fill = true, maxY = null, minY = 0, band = null,
} = {}) {
  if (points.length < 2) return emptyChart(height);
  const w = 100;
  const hi = maxY ?? (Math.max(...points.map(p => p.value)) * 1.1 || 1);
  const lo = minY;
  const x = i => (i / (points.length - 1)) * w;
  const y = v => height - ((v - lo) / (hi - lo || 1)) * height;

  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(2)} ${y(p.value).toFixed(2)}`).join(' ');
  const area = fill
    ? `<path d="${d} L${w} ${height} L0 ${height} Z" fill="${color}" opacity=".12"/>` : '';

  // A shaded horizontal band, used to mark the "still yours" region.
  const bandRect = band
    ? `<rect x="0" y="${y(band[1])}" width="${w}" height="${Math.max(0, y(band[0]) - y(band[1]))}"
             fill="var(--good)" opacity=".07"/>` : '';

  return `<div class="chart">${svg(w, height,
    `${bandRect}${area}<path d="${d}" fill="none" stroke="${color}" stroke-width="1.6"
      vector-effect="non-scaling-stroke" stroke-linejoin="round"/>`)}</div>`;
}

/**
 * A contribution calendar. Weeks run down each column, so it reads like every
 * other activity grid people already know.
 */
export function calendarGrid(days, { cell = 12, gap = 3 } = {}) {
  if (!days.length) return '';
  const weeks = Math.ceil(days.length / 7);
  const w = weeks * (cell + gap);
  const hgt = 7 * (cell + gap);

  const rects = days.map((d, i) => {
    const col = Math.floor(i / 7), row = i % 7;
    return `<rect x="${col * (cell + gap)}" y="${row * (cell + gap)}"
      width="${cell}" height="${cell}" rx="2" fill="${d.color}"
      ><title>${esc(d.label || '')}</title></rect>`;
  }).join('');

  return `<svg viewBox="0 0 ${w} ${hgt}" style="width:100%;max-width:${w}px;height:auto;display:block"
    aria-hidden="true">${rects}</svg>`;
}

/** Horizontal proportion bar with inline labels — path balance, pattern coverage. */
export function barRows(rows, { max = null, showValue = v => v } = {}) {
  const peak = max ?? Math.max(...rows.map(r => r.value), 1);
  return `<div class="stack s2">${rows.map(r => `
    <div class="bar-row">
      <div class="bar-row-k truncate">${esc(r.name)}</div>
      <div class="bar-row-b">
        <div class="bar"><i style="width:${peak ? (r.value / peak) * 100 : 0}%;background:${r.color || 'var(--accent)'}"></i></div>
      </div>
      <div class="bar-row-v num">${esc(String(showValue(r.value)))}</div>
    </div>`).join('')}</div>`;
}

/** HTML labels laid along the x-axis at bar centres. */
function axisLabels(data, every) {
  const marks = data.map((d, i) =>
    (i % every === 0 || i === data.length - 1) && d.axis
      ? `<span style="left:${((i + 0.5) / data.length) * 100}%">${esc(d.axis)}</span>` : '',
  ).join('');
  return marks.trim() ? `<div class="chart-axis">${marks}</div>` : '';
}

const emptyChart = height =>
  `<div class="chart-empty" style="height:${height}px">not enough data yet</div>`;

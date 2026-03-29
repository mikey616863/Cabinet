export const CABINET_STYLES = [
  {
    id: 'modern-white',
    name: 'Modern White',
    frame: '#f5f5f0',
    door: '#fafaf8',
    doorBorder: '#ddddd8',
    handle: '#9e9e9e',
    handleType: 'bar',
    grain: false,
  },
  {
    id: 'natural-wood',
    name: 'Natural Wood',
    frame: '#8b6343',
    door: '#a0734e',
    doorBorder: '#6b4c30',
    handle: '#c8a87a',
    handleType: 'knob',
    grain: true,
  },
  {
    id: 'classic-dark',
    name: 'Classic Dark',
    frame: '#2d2d2d',
    door: '#383838',
    doorBorder: '#1a1a1a',
    handle: '#b0b0b0',
    handleType: 'bar',
    grain: false,
  },
  {
    id: 'sage-green',
    name: 'Sage Green',
    frame: '#5a7a5a',
    door: '#6b8e6b',
    doorBorder: '#4a6a4a',
    handle: '#c9a84c',
    handleType: 'knob',
    grain: false,
  },
  {
    id: 'navy-blue',
    name: 'Navy Blue',
    frame: '#1e3a5f',
    door: '#244876',
    doorBorder: '#162c4a',
    handle: '#c0c0c0',
    handleType: 'bar',
    grain: false,
  },
  {
    id: 'warm-gray',
    name: 'Warm Gray',
    frame: '#7a7472',
    door: '#918e8c',
    doorBorder: '#5e5c5a',
    handle: '#d4af6e',
    handleType: 'knob',
    grain: false,
  },
];

/**
 * Draw a virtual cabinet onto a canvas context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x:number, y:number, width:number, height:number}} region
 * @param {typeof CABINET_STYLES[0]} style
 */
export function drawCabinet(ctx, region, style) {
  const { x, y, width, height } = region;
  if (width < 10 || height < 10) return;

  ctx.save();

  // Semi-transparent outer box (frame)
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = style.frame;
  ctx.fillRect(x, y, width, height);

  // Frame border (shadow effect)
  ctx.globalAlpha = 1;
  ctx.strokeStyle = style.doorBorder;
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, width, height);

  // Inner shadow lines for depth
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 4, y + 4, width - 8, height - 8);

  // Determine door layout: use columns/rows based on aspect ratio
  const frameThickness = Math.max(6, Math.min(14, width * 0.04));
  const innerX = x + frameThickness;
  const innerY = y + frameThickness;
  const innerW = width - frameThickness * 2;
  const innerH = height - frameThickness * 2;

  if (innerW < 4 || innerH < 4) {
    ctx.restore();
    return;
  }

  // Decide number of door columns (1–3) and rows based on cabinet size
  const cols = width > 180 ? (width > 320 ? 3 : 2) : 1;
  const rows = height > 250 ? 2 : 1;
  const doorGap = Math.max(3, Math.min(6, width * 0.015));
  const doorW = (innerW - doorGap * (cols - 1)) / cols;
  const doorH = (innerH - doorGap * (rows - 1)) / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const dx = innerX + col * (doorW + doorGap);
      const dy = innerY + row * (doorH + doorGap);

      // Door fill
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = style.door;
      ctx.fillRect(dx, dy, doorW, doorH);

      // Wood grain effect
      if (style.grain) {
        drawGrain(ctx, dx, dy, doorW, doorH, style.doorBorder);
      }

      // Door border
      ctx.globalAlpha = 1;
      ctx.strokeStyle = style.doorBorder;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(dx, dy, doorW, doorH);

      // Door inset panel
      const inset = Math.max(4, Math.min(10, doorW * 0.08));
      if (doorW > inset * 3 && doorH > inset * 3) {
        ctx.strokeStyle = style.doorBorder;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        ctx.strokeRect(
          dx + inset,
          dy + inset,
          doorW - inset * 2,
          doorH - inset * 2
        );
      }

      // Handle
      ctx.globalAlpha = 1;
      drawHandle(ctx, dx, dy, doorW, doorH, style);
    }
  }

  ctx.restore();
}

function drawGrain(ctx, x, y, w, h, color) {
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  const stripeSpacing = Math.max(4, w * 0.06);
  for (let i = 0; i < w; i += stripeSpacing) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i, y + h);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHandle(ctx, dx, dy, doorW, doorH, style) {
  const hColor = style.handle;
  ctx.fillStyle = hColor;
  ctx.strokeStyle = darken(hColor);
  ctx.lineWidth = 1;

  if (style.handleType === 'bar') {
    // Horizontal bar handle centred in lower-third of door
    const hW = Math.max(16, Math.min(doorW * 0.45, 60));
    const hH = Math.max(4, Math.min(8, doorH * 0.04));
    const hx = dx + (doorW - hW) / 2;
    const hy = dy + doorH * 0.65;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.roundRect(hx, hy, hW, hH, 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // Knob handle centred in lower-third of door
    const r = Math.max(4, Math.min(8, doorW * 0.06));
    const hx = dx + doorW * 0.5;
    const hy = dy + doorH * 0.67;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(hx, hy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Sheen
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(hx - r * 0.25, hy - r * 0.25, r * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function darken(hex) {
  // Slightly darken a hex color string for outlines
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - 30);
  const g = Math.max(0, ((num >> 8) & 0xff) - 30);
  const b = Math.max(0, (num & 0xff) - 30);
  return `rgb(${r},${g},${b})`;
}

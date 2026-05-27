const DST_HEADER_SIZE = 512;
const DST_UNIT_MM = 0.1;

const EMBROIDERY_PALETTE = [
  '#1a1a2e',
  '#c9a227',
  '#e8b4b8',
  '#2d6a4f',
  '#9b2226',
  '#4a4e69',
  '#f4a261',
  '#264653',
  '#e76f51',
  '#6d597a',
  '#b5838d',
  '#457b9d',
  '#2a9d8f',
  '#e9c46a',
  '#bc6c25',
];

function decodeMovement(b0, b1, b2) {
  const getbit = (b, pos) => (b >> pos) & 1;

  let dx = 0;
  dx += getbit(b2, 2) * 81;
  dx += getbit(b2, 3) * -81;
  dx += getbit(b1, 2) * 27;
  dx += getbit(b1, 3) * -27;
  dx += getbit(b0, 2) * 9;
  dx += getbit(b0, 3) * -9;
  dx += getbit(b1, 0) * 3;
  dx += getbit(b1, 1) * -3;
  dx += getbit(b0, 0) * 1;
  dx += getbit(b0, 1) * -1;

  let dy = 0;
  dy += getbit(b2, 5) * 81;
  dy += getbit(b2, 4) * -81;
  dy += getbit(b1, 5) * 27;
  dy += getbit(b1, 4) * -27;
  dy += getbit(b0, 5) * 9;
  dy += getbit(b0, 4) * -9;
  dy += getbit(b1, 7) * 3;
  dy += getbit(b1, 6) * -3;
  dy += getbit(b0, 7) * 1;
  dy += getbit(b0, 6) * -1;
  dy = -dy;

  return { dx, dy };
}

function isEnd(b0, b1, b2) {
  return (b2 & 0xf3) === 0xf3;
}

function isStop(b0, b1, b2) {
  return (b2 & 0xc3) === 0xc3;
}

function isJump(b0, b1, b2) {
  return (b2 & 0x83) === 0x83;
}

// --- Tajima DST Parser ---
export function parseDstBuffer(buffer) {
  const bytes = new Uint8Array(buffer);
  const dataStart = bytes.length >= DST_HEADER_SIZE ? DST_HEADER_SIZE : 0;

  let x = 0;
  let y = 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  let stitchCount = 0;
  let trimCount = 0;
  let colorCount = 1;

  const segments = [];
  let colorIndex = 0;
  let consecutiveJumps = 0;

  for (let i = dataStart; i + 2 < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];

    if (isEnd(b0, b1, b2)) {
      if (consecutiveJumps >= 3) {
        trimCount += 1;
      }
      break;
    }

    const { dx, dy } = decodeMovement(b0, b1, b2);
    const prevX = x;
    const prevY = y;
    x += dx;
    y += dy;

    if (isStop(b0, b1, b2)) {
      if (consecutiveJumps >= 3) {
        trimCount += 1;
      }
      consecutiveJumps = 0;
      colorCount += 1;
      colorIndex += 1;
      continue;
    }

    const jump = isJump(b0, b1, b2);
    if (jump) {
      consecutiveJumps += 1;
    } else {
      if (consecutiveJumps >= 3) {
        trimCount += 1;
      }
      consecutiveJumps = 0;
      stitchCount += 1;

      minX = Math.min(minX, x, prevX);
      minY = Math.min(minY, y, prevY);
      maxX = Math.max(maxX, x, prevX);
      maxY = Math.max(maxY, y, prevY);

      segments.push({ x1: prevX, y1: prevY, x2: x, y2: y, colorIndex, jump: false });
    }
  }

  const finalMinX = minX === Infinity ? 0 : minX;
  const finalMinY = minY === Infinity ? 0 : minY;
  const finalMaxX = maxX === -Infinity ? 0 : maxX;
  const finalMaxY = maxY === -Infinity ? 0 : maxY;

  const widthMm = Math.max((finalMaxX - finalMinX) * DST_UNIT_MM, 0.1);
  const heightMm = Math.max((finalMaxY - finalMinY) * DST_UNIT_MM, 0.1);
  const previewDataUrl = renderDstPreview(segments, finalMinX, finalMinY, finalMaxX, finalMaxY);

  return {
    stitchCount,
    colorCount: Math.max(colorCount, 1),
    trimCount,
    widthMm,
    heightMm,
    previewDataUrl,
  };
}

// --- Janome JEF Parser ---
export function parseJefBuffer(buffer) {
  if (buffer.byteLength < 52) {
    throw new Error('Invalid JEF file size');
  }
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  
  const stitchOffset = view.getUint32(0, true);
  const colorCount = view.getUint32(24, true);
  const stitchCount = view.getUint32(28, true);
  
  const left = view.getInt32(36, true);
  const top = view.getInt32(40, true);
  const right = view.getInt32(44, true);
  const bottom = view.getInt32(48, true);
  
  const widthMm = Math.max((left + right) * DST_UNIT_MM, 0.1);
  const heightMm = Math.max((top + bottom) * DST_UNIT_MM, 0.1);
  
  let x = 0;
  let y = 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  const segments = [];
  let colorIndex = 0;
  let trimCount = 0;
  
  for (let i = stitchOffset; i + 1 < bytes.length; i += 2) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    
    if (b0 === 0x80) {
      const cmd = b1;
      if (cmd === 0x01) {
        colorIndex += 1;
      } else if (cmd === 0x02) {
        // Jef Jump - update trims or skip
      } else if (cmd === 0x10) {
        break; // End of design
      }
      continue;
    }
    
    const dx = b0 >= 128 ? b0 - 256 : b0;
    const dy = b1 >= 128 ? b1 - 256 : b1;
    
    const prevX = x;
    const prevY = y;
    x += dx;
    y += dy;
    
    minX = Math.min(minX, x, prevX);
    minY = Math.min(minY, y, prevY);
    maxX = Math.max(maxX, x, prevX);
    maxY = Math.max(maxY, y, prevY);
    
    segments.push({ x1: prevX, y1: prevY, x2: x, y2: y, colorIndex, jump: false });
  }
  
  const finalMinX = minX === Infinity ? 0 : minX;
  const finalMinY = minY === Infinity ? 0 : minY;
  const finalMaxX = maxX === -Infinity ? 0 : maxX;
  const finalMaxY = maxY === -Infinity ? 0 : maxY;
  
  const previewDataUrl = renderDstPreview(segments, finalMinX, finalMinY, finalMaxX, finalMaxY);
  
  return {
    stitchCount,
    colorCount: Math.max(colorCount + 1, 1),
    trimCount,
    widthMm,
    heightMm,
    previewDataUrl,
  };
}

// --- Brother PES Parser ---
export function parsePesBuffer(buffer) {
  if (buffer.byteLength < 16) {
    throw new Error('Invalid PES file');
  }
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  const pecOffset = view.getUint32(8, true);
  if (pecOffset + 532 >= buffer.byteLength) {
    return {
      stitchCount: 0,
      colorCount: 1,
      trimCount: 0,
      widthMm: 0,
      heightMm: 0,
      previewDataUrl: '',
    };
  }

  const colorCount = Math.max((bytes[pecOffset + 48] || 0) + 1, 1);

  // --- Decode PEC stitch block ---
  // PEC stitch data starts at pecOffset + 532.
  // Each axis (X and Y) is decoded independently:
  //   - If the byte's bit 7 is 0: short stitch, 7-bit signed delta (1 byte consumed)
  //   - If the byte's bit 7 is 1: long/jump stitch, 12-bit signed delta (2 bytes consumed)
  //     Bit 4 (0x10) on a long-stitch byte indicates a JUMP (thread repositioning, no sewn stitch).
  const segments = [];
  let x = 0, y = 0;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let stitchCount = 0, trimCount = 0, colorIndex = 0;

  let pos = pecOffset + 532;

  while (pos < bytes.length) {
    const b0 = bytes[pos];

    // End of design: 0xFF
    if (b0 === 0xFF) break;

    // Color change: 0xFE 0xB0 XX (3 bytes total)
    if (b0 === 0xFE && pos + 1 < bytes.length && bytes[pos + 1] === 0xB0) {
      colorIndex++;
      pos += 3;
      continue;
    }

    pos++;

    // ── Decode X delta ──────────────────────────────────────────────
    let dx, isJump = false;
    if (b0 & 0x80) {
      // Long stitch X: combines this byte + next byte → 12-bit signed
      if (pos >= bytes.length) break;
      const b1 = bytes[pos++];
      dx = ((b0 & 0x0F) << 8) | b1;
      if (dx & 0x800) dx -= 0x1000; // sign-extend 12-bit → signed int
      if (b0 & 0x10) isJump = true;  // bit 4 = jump flag
    } else {
      // Short stitch X: 7-bit signed (0–63 = positive, 64–127 = negative)
      dx = b0;
      if (dx > 63) dx -= 128;
    }

    // ── Decode Y delta ──────────────────────────────────────────────
    if (pos >= bytes.length) break;
    const b1 = bytes[pos++];
    let dy;
    if (b1 & 0x80) {
      // Long stitch Y: combines this byte + next byte → 12-bit signed
      if (pos >= bytes.length) break;
      const b2 = bytes[pos++];
      dy = ((b1 & 0x0F) << 8) | b2;
      if (dy & 0x800) dy -= 0x1000;
      if (b1 & 0x10) isJump = true;
    } else {
      // Short stitch Y: 7-bit signed
      dy = b1;
      if (dy > 63) dy -= 128;
    }

    const prevX = x;
    const prevY = y;
    x += dx;
    y -= dy; // PES Y-axis is inverted relative to screen coordinates

    if (isJump) {
      // Jump = thread repositioning, counts as trim, does NOT draw a segment
      trimCount++;
    } else {
      stitchCount++;
      minX = Math.min(minX, x, prevX);
      minY = Math.min(minY, y, prevY);
      maxX = Math.max(maxX, x, prevX);
      maxY = Math.max(maxY, y, prevY);
      segments.push({ x1: prevX, y1: prevY, x2: x, y2: y, colorIndex, jump: false });
    }
  }

  const finalMinX = minX === Infinity ? 0 : minX;
  const finalMinY = minY === Infinity ? 0 : minY;
  const finalMaxX = maxX === -Infinity ? 100 : maxX;
  const finalMaxY = maxY === -Infinity ? 100 : maxY;

  const widthMm = Math.max((finalMaxX - finalMinX) * 0.1, 0.1);
  const heightMm = Math.max((finalMaxY - finalMinY) * 0.1, 0.1);

  const previewDataUrl = segments.length > 0
    ? renderDstPreview(segments, finalMinX, finalMinY, finalMaxX, finalMaxY)
    : '';

  return {
    stitchCount: Math.max(stitchCount, 0),
    colorCount,
    trimCount,
    widthMm,
    heightMm,
    previewDataUrl,
  };
}

// --- Master Parser router ---
export function parseEmbroideryBuffer(buffer, fileName) {
  const ext = fileName.toLowerCase();
  if (ext.endsWith('.jef')) {
    return parseJefBuffer(buffer);
  } else if (ext.endsWith('.pes')) {
    return parsePesBuffer(buffer);
  } else {
    return parseDstBuffer(buffer); // Default Tajima DST
  }
}

function renderDstPreview(segments, minX, minY, maxX, maxY) {
  if (typeof document === 'undefined') return ''; // Safety for SSR
  
  // Use a much higher resolution canvas for crisp image quality
  const size = 800;
  const padding = 40;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Transparent or slightly off-white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  const rangeX = Math.max(maxX - minX, 1);
  const rangeY = Math.max(maxY - minY, 1);
  const scale = Math.min((size - padding * 2) / rangeX, (size - padding * 2) / rangeY);

  const toCanvas = (px, py) => ({
    x: padding + (px - minX) * scale,
    y: padding + (maxY - py) * scale,
  });

  // Optimize path drawing
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 2.5;

  for (const seg of segments) {
    if (seg.jump) continue;
    const from = toCanvas(seg.x1, seg.y1);
    const to = toCanvas(seg.x2, seg.y2);
    ctx.strokeStyle = EMBROIDERY_PALETTE[seg.colorIndex % EMBROIDERY_PALETTE.length];
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  return canvas.toDataURL('image/png');
}

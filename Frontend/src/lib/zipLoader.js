import JSZip from 'jszip';
import { parseEmbroideryBuffer } from './dstParser';

const zipCache = new Map();

async function loadZip(zipUrl) {
  let pending = zipCache.get(zipUrl);
  if (!pending) {
    pending = (async () => {
      const response = await fetch(zipUrl);
      if (!response.ok) {
        throw new Error(`Failed to load zip: ${zipUrl}`);
      }
      const buffer = await response.arrayBuffer();
      return JSZip.loadAsync(buffer);
    })();
    zipCache.set(zipUrl, pending);
  }
  return pending;
}

export async function loadAndParseZip(zipUrl) {
  try {
    const zip = await loadZip(zipUrl);
    const files = [];

    // Find all files inside the zip that end with .dst, .jef, or .pes (case-insensitive)
    const validEntries = [];
    zip.forEach((relativePath, fileEntry) => {
      if (!fileEntry.dir) {
        const ext = relativePath.toLowerCase();
        if (ext.endsWith('.dst') || ext.endsWith('.jef') || ext.endsWith('.pes')) {
          validEntries.push({ relativePath, fileEntry });
        }
      }
    });

    // Parse each valid file
    for (const { relativePath, fileEntry } of validEntries) {
      try {
        const buffer = await fileEntry.async('arraybuffer');
        
        // Extract a clean name (ignoring path)
        const parts = relativePath.split('/');
        const fileName = parts[parts.length - 1];
        
        const parsed = parseEmbroideryBuffer(buffer, fileName);
        
        const ext = fileName.split('.').pop().toUpperCase();

        files.push({
          id: relativePath,
          fileName,
          format: ext,
          previewDataUrl: parsed.previewDataUrl,
          stats: {
            stitchCount: parsed.stitchCount,
            colorCount: parsed.colorCount,
            trimCount: parsed.trimCount,
            widthMm: parsed.widthMm,
            heightMm: parsed.heightMm,
          },
        });
      } catch (err) {
        console.error(`Error parsing embroidery file ${relativePath} from zip:`, err);
      }
    }

    return files;
  } catch (err) {
    console.error('Error loading and parsing zip package:', err);
    throw err;
  }
}

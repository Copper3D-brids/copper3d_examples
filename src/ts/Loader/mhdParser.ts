/**
 * Minimal MetaImage (.mhd) header parser.
 *
 * Deliberately dependency-free (no three.js) so it can run under
 * `node --experimental-strip-types --test`.
 *
 * Only the subset the 4D ultrasound data uses is supported: 3D, uncompressed,
 * uint8. Anything else throws rather than silently mis-rendering.
 */

export interface MhdHeader {
  /** DimSize — x is the fastest-varying axis. e.g. [189, 189, 134] */
  dims: [number, number, number];
  /** ElementSpacing in mm. e.g. [1, 1, 1] */
  spacing: [number, number, number];
  /** ElementType, always "MET_UCHAR" here. */
  elementType: string;
  /** CompressedData — always false here (true is rejected). */
  compressed: boolean;
  /** ElementDataFile, relative to the .mhd. e.g. "DZET01_17871377_000.raw" */
  elementDataFile: string;
}

function triple(raw: string, field: string): [number, number, number] {
  const parts = raw.trim().split(/\s+/).map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) {
    throw new Error(`mhd: ${field} must be 3 numbers, got "${raw}"`);
  }
  return [parts[0], parts[1], parts[2]];
}

export function parseMhdHeader(text: string): MhdHeader {
  const fields = new Map<string, string>();
  for (const line of text.split(/\r?\n/)) {
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    fields.set(line.slice(0, eq).trim(), line.slice(eq + 1).trim());
  }

  const need = (key: string): string => {
    const value = fields.get(key);
    if (value === undefined) throw new Error(`mhd: missing required field "${key}"`);
    return value;
  };

  const nDims = Number(need("NDims"));
  if (nDims !== 3) throw new Error(`mhd: only NDims=3 is supported, got ${nDims}`);

  if (need("CompressedData").toLowerCase() === "true") {
    throw new Error("mhd: CompressedData=True is not supported");
  }

  const elementType = need("ElementType");
  if (elementType !== "MET_UCHAR") {
    throw new Error(`mhd: only MET_UCHAR is supported, got ${elementType}`);
  }

  return {
    dims: triple(need("DimSize"), "DimSize"),
    spacing: triple(need("ElementSpacing"), "ElementSpacing"),
    elementType,
    compressed: false,
    elementDataFile: need("ElementDataFile"),
  };
}

/** Number of voxels implied by the header — equals the .raw byte length for uint8. */
export function voxelCount(header: MhdHeader): number {
  return header.dims[0] * header.dims[1] * header.dims[2];
}

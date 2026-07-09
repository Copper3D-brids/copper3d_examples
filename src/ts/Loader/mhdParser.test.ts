import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMhdHeader, voxelCount } from "./mhdParser.ts";

/** Byte-for-byte the real header shipped in public/heart_4d_animation/mhd/. */
const REAL_HEADER = [
  "ObjectType = Image",
  "NDims = 3",
  "BinaryData = True",
  "BinaryDataByteOrderMSB = False",
  "CompressedData = False",
  "TransformMatrix = 1 0 0 0 1 0 0 0 1",
  "Offset = 0 0 0",
  "CenterOfRotation = 0 0 0",
  "AnatomicalOrientation = RAI",
  "ElementSpacing = 1 1 1",
  "DimSize = 189 189 134",
  "ElementType = MET_UCHAR",
  "ElementDataFile = DZET01_17871377_000.raw",
].join("\n");

test("parses dims in DimSize order (x fastest), not the NRRD order", () => {
  assert.deepEqual(parseMhdHeader(REAL_HEADER).dims, [189, 189, 134]);
});

test("parses spacing, elementType, compressed flag and data file", () => {
  const h = parseMhdHeader(REAL_HEADER);
  assert.deepEqual(h.spacing, [1, 1, 1]);
  assert.equal(h.elementType, "MET_UCHAR");
  assert.equal(h.compressed, false);
  assert.equal(h.elementDataFile, "DZET01_17871377_000.raw");
});

test("voxelCount matches the real .raw byte length", () => {
  assert.equal(voxelCount(parseMhdHeader(REAL_HEADER)), 4786614);
});

test("tolerates CRLF line endings and loose spacing around '='", () => {
  const crlf = REAL_HEADER.replace(/\n/g, "\r\n").replace("DimSize = ", "DimSize=  ");
  assert.deepEqual(parseMhdHeader(crlf).dims, [189, 189, 134]);
});

test("rejects compressed data", () => {
  const bad = REAL_HEADER.replace("CompressedData = False", "CompressedData = True");
  assert.throws(() => parseMhdHeader(bad), /CompressedData/);
});

test("rejects a non-uint8 element type", () => {
  const bad = REAL_HEADER.replace("ElementType = MET_UCHAR", "ElementType = MET_SHORT");
  assert.throws(() => parseMhdHeader(bad), /MET_UCHAR/);
});

test("rejects NDims other than 3", () => {
  const bad = REAL_HEADER.replace("NDims = 3", "NDims = 2");
  assert.throws(() => parseMhdHeader(bad), /NDims/);
});

test("reports a missing required field by name", () => {
  const bad = REAL_HEADER.split("\n").filter((l) => !l.startsWith("DimSize")).join("\n");
  assert.throws(() => parseMhdHeader(bad), /DimSize/);
});

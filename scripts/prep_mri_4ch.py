"""One-time prep: window 4ch MRI DICOMs to PNG frames (sorted by InstanceNumber)
and emit world-space image-plane corners + frame order to meta.json."""
import glob, json, os
import numpy as np
import pydicom
from PIL import Image

SRC = "public/mri_4ch"
OUT_IMG = "public/heart4d/mri"
OUT_META = "public/heart4d/meta.json"
WC, WW = 226.0, 537.0  # WindowCenter / WindowWidth from the series

os.makedirs(OUT_IMG, exist_ok=True)

ds = [pydicom.dcmread(f) for f in glob.glob(os.path.join(SRC, "*.dcm"))]
ds.sort(key=lambda d: int(d.InstanceNumber))

lo, hi = WC - WW / 2.0, WC + WW / 2.0
for i, d in enumerate(ds):
    arr = d.pixel_array.astype(np.float32)
    arr = np.clip((arr - lo) / (hi - lo), 0.0, 1.0) * 255.0
    Image.fromarray(arr.astype(np.uint8), "L").save(
        os.path.join(OUT_IMG, f"frame_{i:02d}.png")
    )

d0 = ds[0]
O = np.array(d0.ImagePositionPatient, float)
iop = np.array(d0.ImageOrientationPatient, float)
row, col = iop[:3], iop[3:]            # row = +column-index dir, col = +row-index dir
sc = float(d0.PixelSpacing[1])         # column spacing (along `row`)
sr = float(d0.PixelSpacing[0])         # row spacing (along `col`)
rows, cols = int(d0.Rows), int(d0.Columns)

tl = O - 0.5 * sc * row - 0.5 * sr * col
tr = O + (cols - 0.5) * sc * row - 0.5 * sr * col
bl = O - 0.5 * sc * row + (rows - 0.5) * sr * col
br = O + (cols - 0.5) * sc * row + (rows - 0.5) * sr * col

meta = {
    "frameCount": len(ds),
    "rows": rows,
    "cols": cols,
    "corners": {"tl": tl.tolist(), "tr": tr.tolist(),
                "bl": bl.tolist(), "br": br.tolist()},
    "triggerTimes": [float(d.TriggerTime) for d in ds],
}
with open(OUT_META, "w") as f:
    json.dump(meta, f, indent=2)

print(f"wrote {len(ds)} frames + {OUT_META}")

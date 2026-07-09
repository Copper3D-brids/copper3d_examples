<template>
  <div class="heart4d" ref="container">
    <div class="cu-panel">
      <div class="cu-panel__title">4D MRI · LV · Ultrasound</div>

      <p v-if="loading && !usError" class="cu-loading">Loading ultrasound… {{ usLoaded }} / 21</p>
      <p v-if="usError" class="cu-error">Ultrasound failed to load: {{ usError }}</p>

      <button class="cu-btn cu-btn--accent" @click="togglePlay">
        {{ playing ? "Pause" : "Play" }}
      </button>
      <label class="cu-field"><span>Speed</span>
        <input class="cu-range" type="range" min="0.25" max="3" step="0.25" v-model.number="speed" />
        <span class="cu-value">{{ speed.toFixed(2) }}×</span></label>
      <p class="cu-hint">
        {{ bpm }} bpm · R-R {{ CYCLE_MS }} ms (from DICOM). 1.00× is real time.
      </p>

      <hr />
      <div class="cu-layers">
        <button class="cu-chip" :class="{ 'cu-chip--on': showMri }" @click="showMri = !showMri">
          MRI
        </button>
        <button class="cu-chip" :class="{ 'cu-chip--on': showModel }" @click="showModel = !showModel">
          Model
        </button>
        <button class="cu-chip" :class="{ 'cu-chip--on': showUs }" @click="showUs = !showUs">
          Ultrasound
        </button>
      </div>

      <hr />
      <label class="cu-field"><span>MRI α</span>
        <input class="cu-range" type="range" min="0" max="1" step="0.05" v-model.number="mriOpacity" />
        <span class="cu-value">{{ mriOpacity.toFixed(2) }}</span></label>
      <label class="cu-field"><span>Endo α</span>
        <input class="cu-range" type="range" min="0" max="1" step="0.05" v-model.number="endoOpacity" :disabled="lvOnTop" />
        <span class="cu-value">{{ endoOpacity.toFixed(2) }}</span></label>
      <label class="cu-field"><span>Epi α</span>
        <input class="cu-range" type="range" min="0" max="1" step="0.05" v-model.number="epiOpacity" />
        <span class="cu-value">{{ epiOpacity.toFixed(2) }}</span></label>
      <label class="cu-check"><input type="checkbox" v-model="showEpi" /> Epicardium</label>
      <p v-if="lvOnTop" class="cu-hint">Endo α is pinned to 1.0 while the LV wireframe is on top.</p>

      <hr />
      <div class="cu-panel__title">
        Ultrasound {{ usRegistered ? "(registered from .mhd)" : "(not registered)" }}
      </div>
      <label class="cu-field"><span>US α</span>
        <input class="cu-range" type="range" min="0" max="1" step="0.05" v-model.number="usOpacity" />
        <span class="cu-value">{{ usOpacity.toFixed(2) }}</span></label>
      <label class="cu-field"><span>clim lo</span>
        <input class="cu-range" type="range" min="0" max="1" step="0.01" v-model.number="climLo" />
        <span class="cu-value">{{ climLo.toFixed(2) }}</span></label>
      <label class="cu-field"><span>clim hi</span>
        <input class="cu-range" type="range" min="0" max="1" step="0.01" v-model.number="climHi" />
        <span class="cu-value">{{ climHi.toFixed(2) }}</span></label>
      <label class="cu-field"><span>Style</span>
        <select class="cu-select" v-model="renderStyle">
          <option value="dvr">DVR</option>
          <option value="mip">MIP</option>
          <option value="iso">ISO</option>
        </select></label>
      <label v-if="renderStyle === 'dvr'" class="cu-field"><span>Density</span>
        <input class="cu-range" type="range" min="0.01" max="0.5" step="0.01" v-model.number="dvrDensity" />
        <span class="cu-value">{{ dvrDensity.toFixed(2) }}</span></label>
      <label v-if="renderStyle === 'dvr'" class="cu-field"><span>Gain</span>
        <input class="cu-range" type="range" min="0.5" max="5" step="0.1" v-model.number="dvrGain" />
        <span class="cu-value">{{ dvrGain.toFixed(1) }}</span></label>
      <p v-if="renderStyle === 'dvr'" class="cu-hint">
        The LV blood pool sits near 0.13, so raise <em>clim lo</em> until the chamber goes dark.
      </p>
      <p v-if="renderStyle === 'mip'" class="cu-hint">
        MIP takes the maximum along each ray, so a dark chamber ringed by bright tissue can
        never appear. Switch to DVR to see inside the heart.
      </p>
      <label class="cu-check"><input type="checkbox" v-model="lvOnTop" /> LV wireframe over volume</label>
      <p class="cu-hint">Volume max sample ≈ 0.70 — a clim hi above that renders nothing.</p>

      <hr />
      <template v-if="usRegistered">
        <div class="cu-panel__title">US pose (from .mhd)</div>
        <p class="cu-hint">
          Placed by the header's Offset / TransformMatrix / ElementSpacing, and its
          FrameOfReferenceUID matches the MRI's — the two share a world frame. Manual pose is
          disabled: the file already says where this volume belongs.
        </p>
      </template>
      <template v-else>
      <div class="cu-panel__title">US pose (manual)</div>
      <p class="cu-hint">
        The .mhd carries no Offset or TransformMatrix, so nothing in the data says where this
        cone belongs. The pose below is anchored to the LV long axis — a best-effort guess,
        <strong>not</strong> an anatomical registration. Image registration was attempted and
        failed: the echo contains no isolated LV cavity to lock onto.
      </p>
      <label class="cu-field"><span>Scale</span>
        <input class="cu-range" type="range" min="0.3" max="3" step="0.05" v-model.number="usScale" />
        <span class="cu-value">{{ usScale.toFixed(2) }}×</span></label>
      <label class="cu-field"><span>Rot X</span>
        <input class="cu-range" type="range" min="-180" max="180" step="1" v-model.number="rotX" />
        <span class="cu-value">{{ rotX }}°</span></label>
      <label class="cu-field"><span>Rot Y</span>
        <input class="cu-range" type="range" min="-180" max="180" step="1" v-model.number="rotY" />
        <span class="cu-value">{{ rotY }}°</span></label>
      <label class="cu-field"><span>Rot Z</span>
        <input class="cu-range" type="range" min="-180" max="180" step="1" v-model.number="rotZ" />
        <span class="cu-value">{{ rotZ }}°</span></label>
      <label class="cu-field"><span>Off X</span>
        <input class="cu-range" type="range" min="-100" max="100" step="1" v-model.number="offX" />
        <span class="cu-value">{{ offX }}</span></label>
      <label class="cu-field"><span>Off Y</span>
        <input class="cu-range" type="range" min="-100" max="100" step="1" v-model.number="offY" />
        <span class="cu-value">{{ offY }}</span></label>
      <label class="cu-field"><span>Off Z</span>
        <input class="cu-range" type="range" min="-100" max="100" step="1" v-model.number="offZ" />
        <span class="cu-value">{{ offZ }}</span></label>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from "three";
import * as Copper from "../ts/index";
import { onMounted, onBeforeUnmount, computed, ref, watch } from "vue";

const MRI = "/copper3d_examples/heart_4d_animation/mri_4ch";
const SURF = "/copper3d_examples/heart_4d_animation/surfaces_lv";
const US = "/copper3d_examples/heart_4d_animation/mhd";
const VIEW = "/copper3d_examples/heart4d_view.json";

const MRI_FRAMES = 32;
const US_FRAMES = 21;
/** One cardiac cycle (32 phases x ~31.6 ms). */
const CYCLE_MS = 1012;

/**
 * Ultrasound geometry, measured from the .raw voxels (DimSize = 189 189 134):
 * the fan is symmetric about the X and Y centres, while its cross-sectional area grows
 * monotonically along Z (first-quarter vs last-quarter occupancy ratio 8.5). So the cone
 * axis is local +Z, with the apex (the transducer) at z = 0 and the mouth at z = 133.
 */
const US_DEPTH_VOXELS = 134;
const US_LOCAL_AXIS = new THREE.Vector3(0, 0, 1);
/** Cone depth as a multiple of the LV long-axis length (measured 107.6 mm). */
const US_COVERAGE = 1.6;
/** Where the LV apex sits along the cone, as a fraction of cone depth from the apex. */
const US_APEX_MARGIN = 0.25;

const pad3 = (n: number) => String(n).padStart(3, "0");
const deg2rad = (d: number) => (d * Math.PI) / 180;

const container = ref<HTMLDivElement | null>(null);
const loading = ref(true);
const usLoaded = ref(0);
const usError = ref("");
const playing = ref(true);
const speed = ref(1);
const mriOpacity = ref(0.9);
const endoOpacity = ref(0.85);
const epiOpacity = ref(0.25);
const showEpi = ref(true);

/**
 * The DICOM declares NominalInterval (R-R) = 1012 ms, and its 32 TriggerTimes are spaced
 * 31.63 ms apart spanning 980.4 ms — so CYCLE_MS is the patient's real cardiac period.
 * At 1.00x this plays back in real time (59.3 bpm), not at an arbitrary rate.
 */
const bpm = computed(() => Math.round((60000 * speed.value) / CYCLE_MS));

// Layer toggles. `showEpi` composes with `showModel`: the epicardium is only drawn when
// the model layer as a whole is on.
const showMri = ref(true);
const showModel = ref(true);
const showUs = ref(true);
const usOpacity = ref(0.9);
// The volume's maximum sample is 178/255 = 0.698; a window above that renders nothing.
// DVR needs a floor above the blood pool (~0.13 normalised) for the chamber to read as dark.
// MIP prefers a lower floor (~0.01) to keep the faint speckle.
const climLo = ref(0.1);
const climHi = ref(0.55);
// DVR by default: MIP cannot show the LV chamber (max() always picks the bright speckle
// in front of it), which is why the reference render is a composite, not a MIP.
const renderStyle = ref<"mip" | "iso" | "dvr">("dvr");
const dvrDensity = ref(0.25);
const dvrGain = ref(2.5);
/** Draw the LV as a wireframe over the cloud — the ultrasound alone shows no chambers. */
const lvOnTop = ref(true);
/** True only when the .mhd placed the volume itself (real Offset/TransformMatrix). */
const usRegistered = ref(false);
/** True only when the .mhd's FrameOfReferenceUID matched the MRI's. */
const usFrameVerified = ref(false);

const usScale = ref(1);
const rotX = ref(0);
const rotY = ref(0);
const rotZ = ref(0);
const offX = ref(0);
const offY = ref(0);
const offZ = ref(0);

let appRenderer: Copper.copperRenderer;
let scene: Copper.copperScene | undefined;
let mriCtrl: Copper.Aligned4DController | undefined;
let usCtrl: Copper.Raw4DVolumeController | undefined;
let clockId: number | undefined;
/** Guards the async load callbacks below from running after unmount. */
let cancelled = false;

/** Auto-derived initial pose for the (unregistered) US cone, in patient coords. */
let baseCentre = new THREE.Vector3();
let baseQuat = new THREE.Quaternion();
let baseScale = 1;

/**
 * Principal axis of a mesh, oriented apex -> base.
 *
 * The LV is a prolate shell, so its dominant covariance eigenvector is the long axis
 * (power iteration converges in a few dozen steps). The two ends are told apart by mean
 * perpendicular radius: the apex is the pointy one (measured 12.5 mm vs 24.0 mm at the base).
 */
function lvLongAxis(mesh: THREE.Mesh) {
  const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
  const n = pos.count;

  const centre = new THREE.Vector3();
  const p = new THREE.Vector3();
  for (let i = 0; i < n; i++) centre.add(p.fromBufferAttribute(pos, i));
  centre.divideScalar(n);

  let xx = 0, xy = 0, xz = 0, yy = 0, yz = 0, zz = 0;
  for (let i = 0; i < n; i++) {
    p.fromBufferAttribute(pos, i).sub(centre);
    xx += p.x * p.x; xy += p.x * p.y; xz += p.x * p.z;
    yy += p.y * p.y; yz += p.y * p.z; zz += p.z * p.z;
  }

  let axis = new THREE.Vector3(1, 1, 1).normalize();
  const next = new THREE.Vector3();
  for (let it = 0; it < 128; it++) {
    next.set(
      xx * axis.x + xy * axis.y + xz * axis.z,
      xy * axis.x + yy * axis.y + yz * axis.z,
      xz * axis.x + yz * axis.y + zz * axis.z
    );
    axis.copy(next).normalize();
  }

  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < n; i++) {
    const t = p.fromBufferAttribute(pos, i).sub(centre).dot(axis);
    lo = Math.min(lo, t);
    hi = Math.max(hi, t);
  }

  // Mean perpendicular radius within the outer 20% of each end.
  const meanRadius = (t0: number, t1: number) => {
    let sum = 0;
    let count = 0;
    for (let i = 0; i < n; i++) {
      p.fromBufferAttribute(pos, i).sub(centre);
      const t = p.dot(axis);
      if (t >= t0 && t <= t1) {
        sum += p.addScaledVector(axis, -t).length();
        count++;
      }
    }
    return count ? sum / count : Infinity;
  };
  const span = hi - lo;
  if (meanRadius(hi - 0.2 * span, hi) < meanRadius(lo, lo + 0.2 * span)) {
    // The `hi` end is the pointy one — flip so the axis runs apex -> base.
    axis.negate();
    const swap = -hi;
    hi = -lo;
    lo = swap;
  }

  return { axis, apex: centre.clone().addScaledVector(axis, lo), length: span };
}

/** Normalised cardiac phase, shared by every modality. */
let phase = 0;
let lastTick = performance.now();

onMounted(() => {
  const bg = container.value as HTMLDivElement;

  appRenderer = new Copper.copperRenderer(bg, { guiOpen: false, alpha: true });
  scene = appRenderer.createScene("heart4d_fusion") as Copper.copperScene;
  appRenderer.setCurrentScene(scene);
  appRenderer.animate();

  const dicomUrls = Array.from({ length: MRI_FRAMES }, (_, i) => `${MRI}/${i + 1}.dcm`);
  const endo = Array.from(
    { length: MRI_FRAMES },
    (_, i) => `${SURF}/model_participant_000_lv_demo_endo_${pad3(i)}.vtk`
  );
  const epi = Array.from(
    { length: MRI_FRAMES },
    (_, i) => `${SURF}/model_participant_000_lv_demo_epi_${pad3(i)}.vtk`
  );
  const mhdUrls = Array.from(
    { length: US_FRAMES },
    (_, i) => `${US}/DZET01_17871377_${pad3(i)}.mhd`
  );

  scene.loadAligned4D(
    {
      dicomUrls,
      surfaces: [
        { name: "endo", urls: endo, opts: { color: 0xff5a6e, transparent: true, opacity: 0.85 } },
        { name: "epi", urls: epi, opts: { color: 0x4ea1ff, transparent: true, opacity: 0.25 } },
      ],
    },
    (controller) => {
      if (cancelled) {
        controller.dispose();
        return;
      }
      mriCtrl = controller;
      // The page owns the only clock — silence loadAligned4D's internal one.
      mriCtrl.pause();
      mriCtrl.setPlaneOpacity(mriOpacity.value);
      scene?.loadViewUrl(VIEW);

      // Anchor the (unregistered) ultrasound to the heart's real geometry: point the cone
      // down the LV long axis, apex-first, sized so the LV sits inside the fan. This is a
      // best-effort initial pose derived from the surfaces — NOT an anatomical registration.
      applyLvAnchor(mriCtrl.surfaceMeshes.endo);
      syncLvOverlay();

      scene?.loadRaw4DVolume(
        mhdUrls,
        {
          transform: {
            position: [baseCentre.x, baseCentre.y, baseCentre.z],
            quaternion: [baseQuat.x, baseQuat.y, baseQuat.z, baseQuat.w],
            scale: baseScale,
          },
          renderStyle: renderStyle.value,
          dvrDensity: dvrDensity.value,
          dvrGain: dvrGain.value,
          clim: [climLo.value, climHi.value],
          opacity: usOpacity.value,
          onProgress: (n) => (usLoaded.value = n),
          onError: (err) => {
            usError.value = err.message;
            loading.value = false;
          },
          // A pose expressed in another scanner's coordinate frame is worse than no pose, so
          // the loader honours the .mhd's placement only if the file names this same frame.
          expectFrameOfReferenceUID: mriCtrl.frameOfReferenceUID,
        },
        (volume) => {
          if (cancelled) {
            volume.dispose();
            return;
          }
          usCtrl = volume;
          usRegistered.value = volume.registered;
          usFrameVerified.value = volume.frameVerified;
          loading.value = false;
          syncVisibility();
          lastTick = performance.now();
          scene?.addPreRenderCallbackFunction(tick);
          // NOTE: addPreRenderCallbackFunction always returns 0 — commonSceneMethod's
          // `index` is never incremented. The real id is stamped onto the function.
          // loadAligned4D works around this the same way (copperScene.ts:438).
          clockId = (tick as any).id as number;
        }
      );
    }
  );
});

/** One clock, one phase. Each modality maps phase onto its own frame count. */
function tick() {
  const now = performance.now();
  if (!playing.value) {
    lastTick = now;
    return;
  }
  phase = (phase + (now - lastTick) / (CYCLE_MS / speed.value)) % 1;
  lastTick = now;
  // Each modality maps the shared phase onto its OWN frame count (32 vs 21).
  if (mriCtrl) mriCtrl.setFrame(Math.floor(phase * mriCtrl.frameCount));
  usCtrl?.setPhase(phase);
}

function togglePlay() {
  playing.value = !playing.value;
}

/**
 * Derive the cone's initial pose from the LV surface.
 *
 * The cone axis is local +Z with its apex at z = 0, so rotate local +Z onto the LV
 * apex->base direction, back the apex off by `US_APEX_MARGIN` of the cone depth, and scale
 * so the cone is `US_COVERAGE` times the LV long axis. `root`'s origin is the volume centre,
 * hence the half-depth push along the axis.
 */
function applyLvAnchor(endoMesh: THREE.Mesh) {
  const { axis, apex, length } = lvLongAxis(endoMesh);
  const coneDepth = US_COVERAGE * length;

  baseScale = coneDepth / (US_DEPTH_VOXELS - 1);
  baseQuat = new THREE.Quaternion().setFromUnitVectors(US_LOCAL_AXIS, axis);
  baseCentre = apex
    .clone()
    .addScaledVector(axis, -US_APEX_MARGIN * coneDepth) // cone apex, just outside the LV apex
    .addScaledVector(axis, coneDepth / 2); // ...then forward to the cone's centre
}

/** Slider rotation is applied *on top of* the measured base orientation. */
function applyPose() {
  const spin = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(deg2rad(rotX.value), deg2rad(rotY.value), deg2rad(rotZ.value))
  );
  const q = baseQuat.clone().multiply(spin);
  usCtrl?.setTransform({
    position: [baseCentre.x + offX.value, baseCentre.y + offY.value, baseCentre.z + offZ.value],
    quaternion: [q.x, q.y, q.z, q.w],
    scale: baseScale * usScale.value,
  });
}

/** Layer toggles: MRI plane, LV model (endo + epi), ultrasound volume. */
function syncVisibility() {
  if (mriCtrl) {
    mriCtrl.plane.visible = showMri.value;
    mriCtrl.setSurfaceVisible("endo", showModel.value);
    mriCtrl.setSurfaceVisible("epi", showModel.value && showEpi.value);
  }
  if (usCtrl) usCtrl.root.visible = showUs.value;
}

/**
 * The ultrasound MIP is an opaque cloud with no visible chambers, so — exactly as the
 * reference render does — draw the LV as a wireframe on top of it to show where the heart is.
 *
 * `renderOrder` alone is enough, and `depthTest` MUST stay on. The volume's material is
 * `depthWrite: false`, so it never writes into the depth buffer; drawing the LV after it
 * (renderOrder 20 > 10) therefore puts the wireframe over the cloud while still letting the
 * MRI plane — which does write depth — occlude the half of the LV that sits behind it.
 * Disabling depthTest here made the LV punch through the MRI plane.
 */
function syncLvOverlay() {
  const endoMesh = mriCtrl?.surfaceMeshes.endo;
  const epiMesh = mriCtrl?.surfaceMeshes.epi;
  if (!endoMesh || !epiMesh) return;

  const material = endoMesh.material as THREE.MeshStandardMaterial;
  const on = lvOnTop.value;
  material.wireframe = on;
  material.opacity = on ? 1 : endoOpacity.value;
  material.needsUpdate = true;

  // The volume draws at renderOrder 10, so both surfaces must go above it to survive the
  // cloud. Raise BOTH and keep their relative order (endo before epi, as loadAligned4D
  // sets up): epi is transparent but still depthWrite:true, so if it drew first it would
  // write depth at its outer shell and discard the endo sitting inside it.
  endoMesh.renderOrder = on ? 20 : 1;
  epiMesh.renderOrder = on ? 21 : 2;
}

watch(speed, () => (lastTick = performance.now()));
watch(mriOpacity, (v) => mriCtrl?.setPlaneOpacity(v));
watch(endoOpacity, (v) => !lvOnTop.value && mriCtrl?.setSurfaceOpacity("endo", v));
watch(epiOpacity, (v) => mriCtrl?.setSurfaceOpacity("epi", v));
watch(lvOnTop, syncLvOverlay);

watch([showMri, showModel, showEpi, showUs], syncVisibility);
watch(usOpacity, (v) => usCtrl?.setOpacity(v));
watch([climLo, climHi], ([lo, hi]) => usCtrl?.setClim(lo, hi));
watch(renderStyle, (v) => usCtrl?.setRenderStyle(v));
watch(dvrDensity, (v) => usCtrl?.setDvrDensity(v));
watch(dvrGain, (v) => usCtrl?.setDvrGain(v));
watch([usScale, rotX, rotY, rotZ, offX, offY, offZ], applyPose);

onBeforeUnmount(() => {
  cancelled = true;
  // MUST run before mriCtrl.dispose(): commonSceneMethod's registry removes
  // callbacks by splicing the raw cache array at `id`, which shifts every later
  // id down by one. This clock is id 1; mriCtrl.dispose() removes id 0 internally.
  // Removing the clock first is the only order that doesn't leave a stale,
  // out-of-range id (and leak the callback) — see commonSceneMethod.ts.
  if (clockId !== undefined) scene?.removePreRenderCallbackFunction(clockId);
  usCtrl?.dispose();
  mriCtrl?.dispose();
  appRenderer?.dispose();
});
</script>

<style scoped>
.heart4d {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #0c0d10;
}
.cu-loading {
  margin: 0 0 6px;
  font-size: 12px;
  opacity: 0.75;
}
.cu-error {
  margin: 0 0 6px;
  font-size: 12px;
  color: #ff7a7a;
}
.cu-hint {
  margin: 2px 0 6px;
  font-size: 11px;
  opacity: 0.55;
}
.cu-layers {
  display: flex;
  gap: 6px;
}
.cu-chip {
  flex: 1;
  cursor: pointer;
  padding: 5px 4px;
  font: inherit;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: rgba(230, 220, 200, 0.5);
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(200, 160, 90, 0.25);
  border-radius: 4px;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}
.cu-chip:hover {
  color: rgba(230, 220, 200, 0.8);
  border-color: rgba(200, 160, 90, 0.5);
}
.cu-chip--on {
  color: #1a1408;
  background: linear-gradient(180deg, #e8b86a, #c8933f);
  border-color: rgba(232, 184, 106, 0.9);
}
.cu-select {
  background: rgba(0, 0, 0, 0.4);
  color: inherit;
  border: 1px solid rgba(200, 160, 90, 0.35);
  border-radius: 4px;
  padding: 2px 6px;
}
</style>

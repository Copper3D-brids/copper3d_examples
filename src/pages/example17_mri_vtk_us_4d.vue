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

      <hr />
      <label class="cu-field"><span>MRI α</span>
        <input class="cu-range" type="range" min="0" max="1" step="0.05" v-model.number="mriOpacity" />
        <span class="cu-value">{{ mriOpacity.toFixed(2) }}</span></label>
      <label class="cu-field"><span>Endo α</span>
        <input class="cu-range" type="range" min="0" max="1" step="0.05" v-model.number="endoOpacity" />
        <span class="cu-value">{{ endoOpacity.toFixed(2) }}</span></label>
      <label class="cu-check"><input type="checkbox" v-model="showEpi" /> Epicardium</label>

      <hr />
      <div class="cu-panel__title">Ultrasound (not registered)</div>
      <label class="cu-check"><input type="checkbox" v-model="showUs" /> Show volume</label>
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
          <option value="mip">MIP</option>
          <option value="iso">ISO</option>
        </select></label>

      <hr />
      <div class="cu-panel__title">US pose (manual)</div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from "three";
import * as Copper from "../ts/index";
import { onMounted, onBeforeUnmount, ref, watch } from "vue";

const MRI = "/copper3d_examples/heart_4d_animation/mri_4ch";
const SURF = "/copper3d_examples/heart_4d_animation/surfaces_lv";
const US = "/copper3d_examples/heart_4d_animation/mhd";
const VIEW = "/copper3d_examples/heart4d_view.json";

const MRI_FRAMES = 32;
const US_FRAMES = 21;
/** One cardiac cycle (32 phases x ~31.6 ms). */
const CYCLE_MS = 1012;
/** Longest axis of the ultrasound volume (DimSize = 189 189 134). */
const US_LONGEST_AXIS = 189;
/** The US cone covers more than the LV, so start a bit larger than the LV bbox. */
const US_COVERAGE = 1.8;

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
const showEpi = ref(true);

const showUs = ref(true);
const usOpacity = ref(0.9);
const climLo = ref(0.2);
const climHi = ref(0.9);
const renderStyle = ref<"mip" | "iso">("mip");

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

/** Heart centre in patient coords + the auto-derived base scale for the US volume. */
let heartCentre = new THREE.Vector3();
let baseScale = 1;

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
      mriCtrl = controller;
      // The page owns the only clock — silence loadAligned4D's internal one.
      mriCtrl.pause();
      mriCtrl.setPlaneOpacity(mriOpacity.value);
      scene?.loadViewUrl(VIEW);

      // Anchor the (unregistered) ultrasound to where the heart actually is.
      const box = new THREE.Box3();
      Object.values(mriCtrl.surfaceMeshes).forEach((m) => box.expandByObject(m));
      box.getCenter(heartCentre);
      const size = box.getSize(new THREE.Vector3());
      baseScale = (Math.max(size.x, size.y, size.z) * US_COVERAGE) / US_LONGEST_AXIS;

      scene?.loadRaw4DVolume(
        mhdUrls,
        {
          transform: {
            position: [heartCentre.x, heartCentre.y, heartCentre.z],
            rotation: [0, 0, 0],
            scale: baseScale,
          },
          renderStyle: renderStyle.value,
          clim: [climLo.value, climHi.value],
          opacity: usOpacity.value,
          onProgress: (n) => (usLoaded.value = n),
          onError: (err) => {
            usError.value = err.message;
            loading.value = false;
          },
        },
        (volume) => {
          usCtrl = volume;
          loading.value = false;
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

function applyPose() {
  usCtrl?.setTransform({
    position: [heartCentre.x + offX.value, heartCentre.y + offY.value, heartCentre.z + offZ.value],
    rotation: [deg2rad(rotX.value), deg2rad(rotY.value), deg2rad(rotZ.value)],
    scale: baseScale * usScale.value,
  });
}

watch(speed, () => (lastTick = performance.now()));
watch(mriOpacity, (v) => mriCtrl?.setPlaneOpacity(v));
watch(endoOpacity, (v) => mriCtrl?.setSurfaceOpacity("endo", v));
watch(showEpi, (v) => mriCtrl?.setSurfaceVisible("epi", v));

watch(showUs, (v) => usCtrl && (usCtrl.root.visible = v));
watch(usOpacity, (v) => usCtrl?.setOpacity(v));
watch([climLo, climHi], ([lo, hi]) => usCtrl?.setClim(lo, hi));
watch(renderStyle, (v) => usCtrl?.setRenderStyle(v));
watch([usScale, rotX, rotY, rotZ, offX, offY, offZ], applyPose);

onBeforeUnmount(() => {
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
.cu-select {
  background: rgba(0, 0, 0, 0.4);
  color: inherit;
  border: 1px solid rgba(200, 160, 90, 0.35);
  border-radius: 4px;
  padding: 2px 6px;
}
</style>

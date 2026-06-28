<template>
  <div class="heart4d" ref="container">
    <div class="cu-panel">
      <div class="cu-panel__title">4D MRI · LV</div>
      <button class="cu-btn cu-btn--accent" @click="togglePlay">
        {{ playing ? "Pause" : "Play" }}
      </button>
      <label class="cu-field"><span>Speed</span>
        <input class="cu-range" type="range" min="0.25" max="3" step="0.25" v-model.number="speed" />
        <span class="cu-value">{{ speed.toFixed(2) }}×</span></label>
      <label class="cu-field"><span>Offset</span>
        <input class="cu-range" type="range" min="0" max="31" step="1" v-model.number="frameOffset" />
        <span class="cu-value">{{ frameOffset }}</span></label>
      <label class="cu-field"><span>MRI α</span>
        <input class="cu-range" type="range" min="0" max="1" step="0.05" v-model.number="mriOpacity" />
        <span class="cu-value">{{ mriOpacity.toFixed(2) }}</span></label>
      <label class="cu-field"><span>Endo α</span>
        <input class="cu-range" type="range" min="0" max="1" step="0.05" v-model.number="endoOpacity" />
        <span class="cu-value">{{ endoOpacity.toFixed(2) }}</span></label>
      <hr />
      <label class="cu-check"><input type="checkbox" v-model="showEpi" /> Epicardium</label>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as Copper from "copper3d";
import { onMounted, onBeforeUnmount, ref, watch } from "vue";

const BASE = "/copper3d_examples/mri_4ch";
const SURF = "/copper3d_examples/surfaces_lv";
const VIEW = "/copper3d_examples/heart4d_view.json";
const pad3 = (n: number) => String(n).padStart(3, "0");

const container = ref<HTMLDivElement | null>(null);
const playing = ref(true);
const speed = ref(1);
const frameOffset = ref(0);
const mriOpacity = ref(0.9);
const endoOpacity = ref(0.85);
const showEpi = ref(true);

let appRenderer: Copper.copperRenderer;
let scene: Copper.copperScene | undefined;
let ctrl: Copper.Aligned4DController | undefined;

onMounted(() => {
  const bg = container.value as HTMLDivElement;

  appRenderer = new Copper.copperRenderer(bg, {
    guiOpen: false,
    alpha: true,
  });

  scene = appRenderer.createScene("heart4d") as Copper.copperScene;
  appRenderer.setCurrentScene(scene);
  appRenderer.animate();

  const dicomUrls = Array.from({ length: 32 }, (_, i) => `${BASE}/${i + 1}.dcm`);
  const endo = Array.from(
    { length: 32 },
    (_, i) => `${SURF}/model_participant_000_lv_demo_endo_${pad3(i)}.vtk`
  );
  const epi = Array.from(
    { length: 32 },
    (_, i) => `${SURF}/model_participant_000_lv_demo_epi_${pad3(i)}.vtk`
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
      ctrl = controller;
      ctrl.setPlaneOpacity(mriOpacity.value);
      // adjust the view via the JSON (copper3d's standard mechanism)
      scene?.loadViewUrl(VIEW);
    }
  );
});

function togglePlay() {
  playing.value = !playing.value;
}

watch(playing, (v) => (v ? ctrl?.play() : ctrl?.pause()));
watch(speed, (v) => ctrl?.setSpeed(v));
watch(frameOffset, (v) => {
  ctrl?.setFrameOffset("endo", v);
  ctrl?.setFrameOffset("epi", v);
});
watch(mriOpacity, (v) => ctrl?.setPlaneOpacity(v));
watch(endoOpacity, (v) => ctrl?.setSurfaceOpacity("endo", v));
watch(showEpi, (v) => ctrl?.setSurfaceVisible("epi", v));

onBeforeUnmount(() => {
  ctrl?.dispose();
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
</style>

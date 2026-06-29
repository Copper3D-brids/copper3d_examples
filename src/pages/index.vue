<template>
  <div class="gallery">
    <div class="grid-bg"></div>

    <header class="masthead">
      <div class="kicker">
        <span class="dot"></span>
        COPPER3D&nbsp;·&nbsp;WEBGL MEDICAL VISUALISATION
      </div>
      <h1 class="wordmark">
        copper<span class="cu">3d</span><span class="caret">_</span>
      </h1>
      <p class="lede">
        An example gallery for volume rendering, DICOM / NRRD imaging,
        surface morphing and segmentation — built on three.js.
      </p>
      <div class="meta">
        <span class="ver">{{ version }}</span>
        <span class="count">{{ examples.length }} examples</span>
      </div>
    </header>

    <main class="deck">
      <button
        v-for="(ex, i) in examples"
        :key="ex.id"
        class="card"
        :class="{ featured: ex.featured }"
        :style="{ animationDelay: 80 + i * 45 + 'ms' }"
        @click="goRouter(ex.id)"
      >
        <div class="card-top">
          <span class="num">{{ pad(ex.id) }}</span>
          <span class="tag" :data-tag="ex.tag">{{ ex.tag }}</span>
        </div>
        <h2 class="title">{{ ex.title }}</h2>
        <p class="desc">{{ ex.desc }}</p>
        <div class="go">
          <span v-if="ex.featured" class="new">NEW</span>
          <span class="arrow">→</span>
        </div>
      </button>
    </main>

    <footer class="foot">
      <span>Copper3D Visualisation</span>
      <span>·</span>
      <span>three.js · WebGL2</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();
const version = "v3.4.9-beta";

interface Example {
  id: number;
  title: string;
  desc: string;
  tag: string;
  featured?: boolean;
}

const examples: Example[] = [
  { id: 16, title: "Surface Annotation", desc: "Draw contours (freehand & geodesic) and place fiducial points on a mesh surface; export JSON.", tag: "Annotate", featured: true },
  { id: 15, title: "4D MRI + LV Surfaces", desc: "Cine 4-chamber MRI aligned with deforming LV endo/epi surfaces, in lock-step.", tag: "4D", featured: true },
  { id: 1, title: "Multiple VTK Models", desc: "Load and morph VTK surface meshes inside a scene.", tag: "VTK" },
  { id: 2, title: "Basic Scene", desc: "A minimal copper3d renderer and scene setup.", tag: "Core" },
  { id: 3, title: "Multiple Scenes", desc: "Several independent scenes in one renderer.", tag: "Core" },
  { id: 4, title: "Model Positioning", desc: "Place a model and pin the camera viewpoint.", tag: "Core" },
  { id: 5, title: "Kiwrious Sensor", desc: "Bridge live Kiwrious sensor data into the view.", tag: "Sensor" },
  { id: 6, title: "Drag & Drop NRRD", desc: "Load NRRD volumes by dragging files in.", tag: "NRRD" },
  { id: 7, title: "Whole NRRD Volume", desc: "Render a complete NRRD volume.", tag: "NRRD" },
  { id: 8, title: "Load NRRD", desc: "Load and slice through a NRRD volume.", tag: "NRRD" },
  { id: 9, title: "2D DICOM Texture", desc: "A DICOM slice as a textured plane.", tag: "DICOM" },
  { id: 12, title: "2D Texture Heart", desc: "Heart DICOM rendered as a 2D texture.", tag: "DICOM" },
  { id: 13, title: "Segmentation Tool", desc: "The copper segmentation tool base.", tag: "Segment" },
  { id: 14, title: "Drawer / Annotator", desc: "Drawing and annotation interface.", tag: "UI" },
];

const pad = (id: number) => String(id).padStart(2, "0");

const goRouter = (id: number) => {
  router.push(id >= 10 ? `/example${id}` : `/example0${id}`);
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,900&family=IBM+Plex+Mono:wght@400;500;600&display=swap");

.gallery {
  --bg: #0c0d10;
  --panel: #141519;
  --panel-2: #16181d;
  --line: #24262e;
  --ink: #e9e7e3;
  --muted: #8b8d96;
  --cu: #c8804a;
  --cu-bright: #e89a5c;

  position: relative;
  height: 100vh;
  width: 100%;
  background: var(--bg);
  color: var(--ink);
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  padding: clamp(28px, 6vw, 80px) clamp(20px, 6vw, 90px) 60px;
  box-sizing: border-box;
  /* gallery is its own scroll container, with the scrollbar hidden */
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* old Edge / IE */
}
.gallery::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none; /* Chrome / Safari */
}

/* dot-grid backdrop with a copper glow bleeding from top-left */
.grid-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.04) 1px, transparent 0);
  background-size: 22px 22px;
  mask-image: radial-gradient(120% 90% at 12% 0%, #000 35%, transparent 80%);
}
.gallery::before {
  content: "";
  position: fixed;
  top: -20%;
  left: -10%;
  width: 60vw;
  height: 60vw;
  background: radial-gradient(circle, rgba(200, 128, 74, 0.16), transparent 60%);
  pointer-events: none;
  filter: blur(20px);
}

/* ---------- masthead ---------- */
.masthead {
  position: relative;
  max-width: 1280px;
  margin: 0 auto clamp(34px, 5vw, 64px);
}
.kicker {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  letter-spacing: 0.22em;
  color: var(--muted);
  margin-bottom: 26px;
}
.kicker .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--cu-bright);
  box-shadow: 0 0 12px var(--cu);
  animation: pulse 2.4s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
.wordmark {
  font-family: "Fraunces", serif;
  font-weight: 900;
  font-size: clamp(58px, 12vw, 150px);
  line-height: 0.86;
  letter-spacing: -0.03em;
  margin: 0;
}
.wordmark .cu {
  color: var(--cu);
  font-style: italic;
}
.wordmark .caret {
  color: var(--cu-bright);
  animation: blink 1.1s steps(1) infinite;
}
@keyframes blink {
  50% { opacity: 0; }
}
.lede {
  font-family: "IBM Plex Mono", monospace;
  font-size: clamp(13px, 1.4vw, 15px);
  line-height: 1.7;
  color: var(--muted);
  max-width: 52ch;
  margin: 22px 0 0;
}
.meta {
  display: flex;
  gap: 14px;
  margin-top: 22px;
  font-size: 12px;
  letter-spacing: 0.1em;
}
.meta .ver {
  color: var(--cu-bright);
  border: 1px solid rgba(200, 128, 74, 0.4);
  padding: 4px 10px;
  border-radius: 999px;
}
.meta .count {
  color: var(--muted);
  align-self: center;
}

/* ---------- card deck ---------- */
.deck {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 14px;
}
.card {
  position: relative;
  text-align: left;
  cursor: pointer;
  background: linear-gradient(165deg, var(--panel), var(--panel-2));
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 22px 22px 18px;
  color: var(--ink);
  font-family: inherit;
  min-height: 184px;
  display: flex;
  flex-direction: column;
  transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1),
    border-color 0.35s, box-shadow 0.35s, background 0.35s;
  opacity: 0;
  transform: translateY(14px);
  animation: rise 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}
@keyframes rise {
  to { opacity: 1; transform: translateY(0); }
}
.card:hover {
  transform: translateY(-6px);
  border-color: rgba(200, 128, 74, 0.55);
  box-shadow: 0 18px 40px -20px rgba(0, 0, 0, 0.8),
    0 0 0 1px rgba(200, 128, 74, 0.25) inset;
}
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}
.num {
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  letter-spacing: 0.08em;
}
.card:hover .num { color: var(--cu-bright); }
.tag {
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 3px 9px;
}
.tag[data-tag="4D"],
.tag[data-tag="DICOM"] { color: var(--cu-bright); border-color: rgba(200, 128, 74, 0.4); }
.title {
  font-family: "Fraunces", serif;
  font-weight: 600;
  font-size: 21px;
  line-height: 1.12;
  letter-spacing: -0.01em;
  margin: 0 0 8px;
}
.desc {
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--muted);
  margin: 0;
  flex: 1;
}
.go {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}
.new {
  font-size: 10px;
  letter-spacing: 0.16em;
  color: var(--bg);
  background: var(--cu-bright);
  padding: 3px 8px;
  border-radius: 999px;
  margin-right: auto;
}
.arrow {
  font-size: 18px;
  color: var(--muted);
  transition: transform 0.35s, color 0.35s;
}
.card:hover .arrow {
  color: var(--cu-bright);
  transform: translateX(5px);
}

/* featured card spans two columns on wide screens */
.card.featured {
  border-color: rgba(200, 128, 74, 0.35);
  background:
    radial-gradient(120% 140% at 100% 0%, rgba(200, 128, 74, 0.14), transparent 55%),
    linear-gradient(165deg, var(--panel), var(--panel-2));
}
@media (min-width: 900px) {
  .card.featured { grid-column: span 2; }
  .card.featured .title { font-size: 27px; }
}

/* ---------- footer ---------- */
.foot {
  max-width: 1280px;
  margin: 56px auto 0;
  display: flex;
  gap: 12px;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: var(--muted);
  border-top: 1px solid var(--line);
  padding-top: 20px;
}
</style>

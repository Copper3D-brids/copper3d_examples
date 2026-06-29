<template>
  <div class="lab" ref="container">
    <!-- decorative aurora background (the WebGL canvas is transparent and sits above this) -->
    <div class="lab__bg" aria-hidden="true">
      <span class="aurora aurora--1"></span>
      <span class="aurora aurora--2"></span>
      <span class="aurora aurora--3"></span>
    </div>

    <!-- left: guide -->
    <aside class="panel help" :class="{ 'is-collapsed': !showHelp }">
      <header class="panel__head">
        <span class="kicker"><i class="kicker__dot"></i>Guide</span>
        <button
          class="iconbtn"
          :class="{ 'is-open': showHelp, 'is-hover': btnHover }"
          @click="showHelp = !showHelp; btnHover = false"
          @mouseenter="btnHover = true"
          @mouseleave="btnHover = false"
          :aria-label="showHelp ? 'collapse' : 'expand'"
        ></button>
      </header>
      <div v-show="showHelp" class="help__body">
        <p class="help__lead">
          Pick a mode, draw or click on the surface, press <kbd>Enter</kbd> to
          close a contour, then name, recolor and export it.
        </p>
        <ul class="help__modes">
          <li><span class="num">1</span><b>Navigate</b><em>rotate / zoom</em></li>
          <li><span class="num">2</span><b>Freehand</b><em>hold &amp; drag to draw</em></li>
          <li><span class="num">3</span><b>Geodesic</b><em>click anchors · click a dot to remove it</em></li>
          <li><span class="num">4</span><b>Place point</b><em>click to drop a marker</em></li>
        </ul>
        <dl class="keys">
          <div><dt><kbd>Esc</kbd></dt><dd>back to navigate</dd></div>
          <div><dt>hold <kbd>Space</kbd></dt><dd>rotate temporarily</dd></div>
          <div><dt><kbd>Enter</kbd></dt><dd>close / finish contour</dd></div>
          <div><dt><kbd>Ctrl</kbd><kbd>Z</kbd></dt><dd>undo</dd></div>
          <div><dt><kbd>Del</kbd></dt><dd>delete selected</dd></div>
        </dl>
      </div>
    </aside>

    <!-- right: controls -->
    <aside class="panel ctrl">
      <header class="panel__head ctrl__head">
        <div>
          <span class="kicker"><i class="kicker__dot"></i>Copper3D</span>
          <h1 class="ctrl__title">Surface Annotation</h1>
        </div>
      </header>

      <nav class="modes">
        <button
          v-for="m in modeList"
          :key="m.id"
          class="mode"
          :class="{ 'is-active': mode === m.id }"
          @click="setMode(m.id)"
        >
          <span class="mode__key">{{ m.key }}</span>
          <span class="mode__name">{{ m.name }}</span>
        </button>
      </nav>

      <section class="annos">
        <div class="annos__head">
          <span>Annotations</span><span class="badge">{{ list.length }}</span>
        </div>
        <div class="annos__scroll">
          <button
            v-for="a in list"
            :key="a.id"
            class="row"
            :class="{ 'is-sel': a.id === selectedId }"
            @click="select(a.id)"
          >
            <span class="row__sw" :style="{ '--c': a.color }"></span>
            <span class="row__label">{{ a.label }}</span>
            <span class="row__type">{{ a.type === 'points' ? 'pt' : (a.closed ? 'loop' : 'arc') }}</span>
            <span class="row__del" @click.stop="del(a.id)" aria-label="delete">✕</span>
          </button>
          <p v-if="!list.length" class="annos__empty">No annotations yet</p>
        </div>
      </section>

      <div v-if="selected" class="edit">
        <input
          class="edit__name"
          v-model="selectedLabel"
          @input="onLabel"
          spellcheck="false"
        />
        <label class="edit__color">
          <input type="color" v-model="selectedColor" @input="onColor" />
          <span :style="{ background: selectedColor }"></span>
        </label>
      </div>

      <footer class="actions">
        <button class="btn" @click="undo">Undo</button>
        <button class="btn" @click="clearAll">Clear</button>
        <button class="btn btn--primary" @click="exportJSON">Export</button>
      </footer>
    </aside>

    <!-- bottom: status -->
    <div class="status">
      <i class="status__dot" :data-mode="mode"></i>{{ statusLabel }}
    </div>
  </div>
</template>

<script setup lang="ts">
import * as Copper from "copper3d";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment";
import { onMounted, onBeforeUnmount, ref, computed, watch } from "vue";
import type { AnnotationMode, Annotation } from "copper3d";

const MODEL_URL = "/copper3d_examples/portal_heart/heart1.obj";
// 三种标注的初始配色(柔和、彼此区分,且与深色场景 + teal 主色调和)。
const FREEHAND_COLOR = "#fb7185"; // rose
const GEODESIC_COLOR = "#c084fc"; // violet
const POINT_COLOR = "#fbbf24"; // amber
const container = ref<HTMLDivElement | null>(null);
const mode = ref<AnnotationMode>("navigate");

const showHelp = ref(true);
const btnHover = ref(false);
const list = ref<Annotation[]>([]);
const selectedId = ref<string | null>(null);
const selectedLabel = ref("");
const selectedColor = ref("#ffffff");
const selected = computed(
  () => list.value.find((a) => a.id === selectedId.value) || null
);

const modeList: { id: AnnotationMode; key: string; name: string }[] = [
  { id: "navigate", key: "1", name: "Navigate" },
  { id: "freehand", key: "2", name: "Freehand contour" },
  { id: "geodesic", key: "3", name: "Geodesic contour" },
  { id: "point", key: "4", name: "Place point" },
];
const statusLabel = computed(
  () =>
    ({
      navigate: "Navigate — orbit & zoom",
      freehand: "Freehand — hold & drag to draw",
      geodesic: "Geodesic — click anchors",
      point: "Place point — click the surface",
    }[mode.value])
);

let appRenderer: Copper.copperRenderer;
let scene: Copper.copperScene | undefined;
let annotator: Copper.SurfaceAnnotator | undefined;

function setMode(m: AnnotationMode) {
  annotator?.setMode(m);
}

function select(id: string) {
  selectedId.value = id;
  annotator?.selectAnnotation(id);
}
function del(id: string) {
  annotator?.deleteAnnotation(id);
  if (selectedId.value === id) selectedId.value = null;
}
function onLabel() {
  if (selected.value)
    annotator?.getStore().setLabel(selected.value.id, selectedLabel.value);
}
function onColor() {
  if (selected.value) {
    annotator?.getStore().setColor(selected.value.id, selectedColor.value);
    annotator?.refreshAnnotation(selected.value.id);
  }
}
function undo() {
  annotator?.undo();
}
function clearAll() {
  annotator?.clearAll();
  selectedId.value = null;
}
function exportJSON() {
  const data = annotator?.exportJSON("heart1.obj");
  if (!data) return;
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "annotations.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// 选中项变化时,把编辑框同步到该标注的 label/color
watch(selected, (a) => {
  if (a) {
    selectedLabel.value = a.label;
    selectedColor.value = a.color;
  }
});

onMounted(async () => {
  const bg = container.value as HTMLDivElement;
  // alpha:true → canvas 透明,背景交给 CSS(见 .lab)。
  appRenderer = new Copper.copperRenderer(bg, { guiOpen: false, alpha: true });
  scene = appRenderer.createScene("annot") as Copper.copperScene;
  appRenderer.setCurrentScene(scene);
  appRenderer.animate();

  // 程序化「房间」环境光(IBL):均匀(不前黑后亮)且能显出表面细节,
  // 不需要 HDR 文件,且只作照明、不当背景(背景仍是 CSS Aurora)。
  const pmrem = new THREE.PMREMGenerator(appRenderer.renderer);
  scene.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  appRenderer.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  appRenderer.renderer.toneMappingExposure = 1.18;

  // 用 copper 自带的 OBJ loader 加载模型(库版做法);annotator 内部会索引化。
  scene.loadOBJ(
    MODEL_URL,
    (group) => {
      // 柔和哑光材质,配合三光得到均匀和谐的受光(冷中性,和深色场景调和)。
      group.traverse((child) => {
        const m = child as THREE.Mesh;
        if (m.isMesh) {
          m.material = new THREE.MeshStandardMaterial({
            color: "#b9bfc9",
            roughness: 0.5,
            metalness: 0.0,
            side: THREE.DoubleSide,
          });
        }
      });
      // 相机取景:按 group 包围盒设相机距离(不烘焙 geometry,保持 local=原始坐标)。
      const box = new THREE.Box3().setFromObject(group);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const cam = scene!.camera as THREE.PerspectiveCamera;
      const fov = (cam.fov * Math.PI) / 180;
      const dist = (size.length() / 2 / Math.tan(fov / 2)) * 1.4;
      cam.position.set(center.x, center.y, center.z + dist);
      cam.near = dist / 100;
      cam.far = dist * 100;
      cam.updateProjectionMatrix();
      cam.lookAt(center);
      const controls = scene!.controls as unknown as {
        target?: THREE.Vector3;
        update?: () => void;
      };
      controls.target?.set(center.x, center.y, center.z);
      controls.update?.();

      // 从相机「右上方」掠射的弱主光:指向模型中心,跟随相机 → 始终照亮你看的那面,
      // 但因为是斜射(不是正打),会在凹凸处产生微阴影,把表面细节"提"出来,不发扁平。
      const key = new THREE.DirectionalLight(0xffffff, 0.5);
      key.target.position.copy(center);
      scene!.scene.add(key, key.target);
      const _kv = new THREE.Vector3();
      scene!.addPreRenderCallbackFunction(() => {
        const cam = scene!.camera;
        key.position.copy(cam.position);
        _kv.set(0.55, 0.85, 0).applyQuaternion(cam.quaternion).multiplyScalar(dist);
        key.position.add(_kv);
      });

      // 库 API:在模型表面创建标注器(复用 scene 的 camera/container/controls)。
      annotator = scene!.createSurfaceAnnotator(group, {
        onModeChange: (m) => (mode.value = m),
        freehandColor: FREEHAND_COLOR,
        geodesicColor: GEODESIC_COLOR,
        pointColor: POINT_COLOR,
      });

      // 镜像 store 到 Vue 列表
      const store = annotator.getStore();
      const sync = () => {
        list.value = [...store.list()];
        if (selectedId.value && !store.get(selectedId.value)) {
          selectedId.value = null;
        }
      };
      store.subscribe(sync);
      sync();
    },
    { color: "#9aa7b2" }
  );
});

onBeforeUnmount(() => {
  annotator?.dispose();
  appRenderer?.dispose();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap");

.lab {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background:
    radial-gradient(130% 120% at 50% 18%, #0c121d 0%, #070a11 55%, #04060b 100%);
  color: var(--ink);

  --ink: #e9edf3;
  --muted: #8d99a9;
  --faint: #586474;
  --line: rgba(255, 255, 255, 0.08);
  --line-2: rgba(255, 255, 255, 0.14);
  --glass: rgba(15, 20, 28, 0.62);
  --accent: #4fd6c9;
  --accent-ink: #04211d;
  font-family: "Sora", system-ui, sans-serif;
}

/* ---------- aurora background (canvas is transparent, sits above) ---------- */
.lab__bg { position: absolute; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.aurora {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.5;
  mix-blend-mode: screen;
  will-change: transform;
}
.aurora--1 {
  width: 760px; height: 600px; left: 4%; top: 2%;
  background: radial-gradient(circle at 50% 50%, #0f5f68 0%, rgba(15, 95, 104, 0) 70%);
  animation: drift1 24s ease-in-out infinite;
}
.aurora--2 {
  width: 720px; height: 700px; right: 0%; top: 26%;
  background: radial-gradient(circle at 50% 50%, #283f80 0%, rgba(40, 63, 128, 0) 70%);
  animation: drift2 30s ease-in-out infinite;
}
.aurora--3 {
  width: 700px; height: 560px; left: 26%; bottom: -12%;
  background: radial-gradient(circle at 50% 50%, #11506f 0%, rgba(17, 80, 111, 0) 72%);
  animation: drift3 27s ease-in-out infinite;
}
@keyframes drift1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(70px, 48px) scale(1.14); }
}
@keyframes drift2 {
  0%, 100% { transform: translate(0, 0) scale(1.06); }
  50% { transform: translate(-56px, 36px) scale(0.94); }
}
@keyframes drift3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(46px, -54px) scale(1.12); }
}
@media (prefers-reduced-motion: reduce) {
  .aurora { animation: none; }
}

/* ---------- panels ---------- */
.panel {
  position: fixed;
  z-index: 20;
  background: var(--glass);
  -webkit-backdrop-filter: blur(22px) saturate(150%);
  backdrop-filter: blur(22px) saturate(150%);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 26px 70px -28px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  animation: rise 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
@keyframes rise {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.panel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.kicker {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: "IBM Plex Mono", monospace;
  font-size: 10.5px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--muted);
}
.kicker__dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent);
}
.iconbtn {
  position: relative;
  width: 20px; height: 20px;
  border-radius: 6px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.04);
  color: var(--ink);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
/* hover 高亮用 JS 驱动的 .is-hover(mouseenter/leave),不用 CSS :hover——
   因为点击会让面板改变宽度、把按钮移出光标,而 :hover 要等下次移动鼠标才重判定,
   高亮会被「卡住」不回退。改用 .is-hover 并在 @click 里立即清除,布局位移再也卡不住。 */
.iconbtn.is-hover { background: rgba(255, 255, 255, 0.08); border-color: var(--line-2); }
.iconbtn:active { background: rgba(255, 255, 255, 0.12); }
.iconbtn:focus { outline: none; }
.iconbtn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
/* +/− icon drawn with CSS so it is always pixel-centered (font glyphs are not) */
.iconbtn::before,
.iconbtn::after {
  content: "";
  position: absolute;
  top: 50%; left: 50%;
  background: currentColor;
  border-radius: 1px;
  transform: translate(-50%, -50%);
}
.iconbtn::before { width: 8px; height: 1.5px; }         /* horizontal bar */
.iconbtn::after { width: 1.5px; height: 8px; }           /* vertical bar → makes a + */
.iconbtn.is-open::after { display: none; }               /* expanded → only the − remains */

/* ---------- left: help ---------- */
.help { top: 22px; left: 22px; width: 318px; padding: 16px 18px; }
.help.is-collapsed { width: auto; padding-bottom: 14px; }
.help__lead {
  margin: 14px 0;
  font-size: 12.5px;
  line-height: 1.65;
  color: var(--muted);
}
.help__lead kbd { margin: 0 1px; }
.help__modes { list-style: none; margin: 0 0 14px; padding: 0; display: flex; flex-direction: column; gap: 9px; }
.help__modes li { display: flex; align-items: center; gap: 9px; font-size: 12.5px; color: var(--muted); }
.help__modes b { color: var(--ink); font-weight: 600; }
.help__modes em { font-style: normal; color: var(--faint); }
.help__modes .num {
  flex: 0 0 auto;
  width: 19px; height: 19px;
  display: grid; place-items: center;
  border-radius: 6px;
  border: 1px solid var(--line);
  font-family: "IBM Plex Mono", monospace;
  font-size: 10px;
  color: var(--accent);
}
.keys { margin: 0; padding-top: 13px; border-top: 1px solid var(--line); display: flex; flex-direction: column; gap: 7px; }
.keys > div { display: flex; align-items: center; gap: 12px; font-size: 12px; color: var(--muted); }
.keys dt { display: flex; align-items: center; gap: 4px; margin: 0; min-width: 96px; }
.keys dd { margin: 0; }

/* ---------- right: controls ---------- */
.ctrl { top: 22px; right: 22px; width: 296px; padding: 16px; display: flex; flex-direction: column; gap: 15px; }
.ctrl__head { animation-delay: 0.05s; }
.ctrl__title {
  margin: 7px 0 0;
  font-size: 19px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--ink);
}

.modes { display: flex; flex-direction: column; gap: 7px; }
.mode {
  display: flex; align-items: center; gap: 11px;
  padding: 9px 11px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.02);
  color: var(--muted);
  font-family: "Sora", sans-serif;
  font-size: 13px;
  text-align: left; cursor: pointer;
  transition: transform 0.16s, background 0.16s, border-color 0.16s, color 0.16s, box-shadow 0.16s;
}
.mode:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--line-2);
  color: var(--ink);
}
.mode__key {
  flex: 0 0 auto;
  width: 21px; height: 21px;
  display: grid; place-items: center;
  border-radius: 6px;
  border: 1px solid var(--line);
  font-family: "IBM Plex Mono", monospace;
  font-size: 11px;
  color: var(--faint);
}
.mode.is-active {
  color: var(--ink);
  background: linear-gradient(180deg, rgba(79, 214, 201, 0.16), rgba(79, 214, 201, 0.06));
  border-color: rgba(79, 214, 201, 0.5);
  box-shadow: 0 8px 26px -12px rgba(79, 214, 201, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
.mode.is-active .mode__key { background: var(--accent); color: var(--accent-ink); border-color: transparent; }

/* annotation list */
.annos__head {
  display: flex; align-items: center; justify-content: space-between;
  font-family: "IBM Plex Mono", monospace;
  font-size: 10.5px; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--muted);
}
.badge {
  color: var(--ink);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 1px 9px; font-size: 10px;
}
.annos__scroll { margin-top: 9px; max-height: 196px; overflow-y: auto; display: flex; flex-direction: column; gap: 5px; }
.row {
  display: flex; align-items: center; gap: 9px;
  width: 100%;
  padding: 7px 9px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.025);
  color: var(--ink);
  font-family: "Sora", sans-serif; font-size: 12.5px;
  text-align: left; cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.row:hover { background: rgba(255, 255, 255, 0.055); }
.row.is-sel { border-color: rgba(79, 214, 201, 0.45); background: rgba(79, 214, 201, 0.08); }
.row__sw {
  flex: 0 0 auto; width: 11px; height: 11px; border-radius: 4px;
  background: var(--c);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.18), 0 0 9px -1px var(--c);
}
.row__label { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.row__type {
  font-family: "IBM Plex Mono", monospace;
  font-size: 9.5px; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--faint);
}
.row__del {
  flex: 0 0 auto;
  display: grid; place-items: center;
  width: 22px; height: 22px; margin: -4px -4px -4px 0;
  border-radius: 6px;
  color: var(--faint); font-size: 12px; line-height: 1;
  opacity: 0; transition: opacity 0.15s, color 0.15s, background 0.15s;
}
.row:hover .row__del { opacity: 1; }
.row__del:hover { color: #ff6b6b; background: rgba(255, 107, 107, 0.12); }
.annos__empty { margin: 0; padding: 9px 2px; color: var(--faint); font-size: 12px; font-style: italic; }

/* edit row */
.edit { display: flex; gap: 8px; }
.edit__name {
  flex: 1; min-width: 0;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 8px 11px;
  color: var(--ink);
  font-family: "Sora", sans-serif; font-size: 12.5px;
  transition: border-color 0.15s;
}
.edit__name:focus { outline: none; border-color: var(--accent); }
.edit__color {
  position: relative; flex: 0 0 auto;
  width: 36px; height: 36px;
  border-radius: 10px; overflow: hidden;
  border: 1px solid var(--line); cursor: pointer;
}
.edit__color input { position: absolute; inset: -6px; opacity: 0; cursor: pointer; }
.edit__color span { position: absolute; inset: 0; }

/* actions */
.actions { display: flex; gap: 8px; }
.btn {
  flex: 1; padding: 9px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.03);
  color: var(--ink);
  font-family: "Sora", sans-serif; font-size: 12.5px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, filter 0.15s, box-shadow 0.15s;
}
.btn:hover { background: rgba(255, 255, 255, 0.07); border-color: var(--line-2); }
.btn--primary {
  background: var(--accent); color: var(--accent-ink);
  border-color: transparent; font-weight: 600;
}
.btn--primary:hover {
  background: var(--accent);
  border-color: transparent;
  filter: brightness(1.08);
  box-shadow: 0 8px 24px -10px rgba(79, 214, 201, 0.6);
}

/* keycaps */
kbd {
  font-family: "IBM Plex Mono", monospace;
  font-size: 10.5px;
  color: var(--ink);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--line-2);
  border-bottom-width: 2px;
  border-radius: 5px;
  padding: 1px 6px;
}

/* ---------- bottom status ---------- */
.status {
  position: fixed; bottom: 22px; left: 50%; transform: translateX(-50%);
  z-index: 20;
  display: flex; align-items: center; gap: 9px;
  padding: 8px 17px;
  border-radius: 999px;
  background: var(--glass);
  -webkit-backdrop-filter: blur(18px) saturate(150%);
  backdrop-filter: blur(18px) saturate(150%);
  border: 1px solid var(--line);
  box-shadow: 0 18px 46px -20px rgba(0, 0, 0, 0.85);
  color: var(--ink);
  font-family: "IBM Plex Mono", monospace;
  font-size: 11.5px; letter-spacing: 0.03em;
  animation: fadein 0.6s 0.18s both;
}
@keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
.status__dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--accent); box-shadow: 0 0 11px var(--accent);
}
.status__dot[data-mode="freehand"] { background: #fb7185; box-shadow: 0 0 11px #fb7185; }
.status__dot[data-mode="geodesic"] { background: #c084fc; box-shadow: 0 0 11px #c084fc; }
.status__dot[data-mode="point"] { background: #fbbf24; box-shadow: 0 0 11px #fbbf24; }

/* scrollbars inside panels */
.annos__scroll::-webkit-scrollbar { width: 6px; }
.annos__scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.12); border-radius: 99px; }
</style>

<style>
/* global reset — kill page scrollbars; make the transparent WebGL canvas fill the viewport */
html, body, #app { margin: 0; padding: 0; height: 100%; overflow: hidden; }
.lab canvas { display: block; }
</style>

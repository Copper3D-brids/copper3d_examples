<template>
  <div class="ex01">
    <div id="bg" ref="base_container">
      <div ref="c_gui" id="gui"></div>

      <!-- ---------- main control panel ---------- -->
      <div class="cu-panel ex01-panel">
        <div class="ex01-head">
          <button class="ex01-back" title="Back to gallery" @click="goHome">
            ←
          </button>
          <span class="ex01-kicker">EXAMPLE 01 · MULTIPLE MODELS</span>
        </div>

        <div class="cu-panel__title">Models</div>
        <div class="ex01-list">
          <button
            v-for="m in models"
            :key="m.name"
            class="ex01-item"
            :class="{ active: activeModel === m.name }"
            @click="m.action()"
          >
            {{ m.label }}
          </button>
        </div>

        <hr />
        <button
          class="cu-btn cu-btn--accent ex01-featured"
          :class="{ active: activeModel === 'portal_hearts' }"
          @click="loadPortalHearts"
        >
          ✦ Portal Hearts
        </button>

        <hr />
        <div class="cu-panel__title">Playback</div>
        <div class="ex01-row">
          <button class="cu-btn" title="Slower" @click="minusPlayRate">–</button>
          <span class="cu-value">{{ playRate }}×</span>
          <button class="cu-btn" title="Faster" @click="addPlayRate">+</button>
        </div>
        <button class="cu-btn" @click="reset">Reset view</button>

        <hr />
        <button class="ex01-toggle" @click="advancedOpen = !advancedOpen">
          {{ advancedOpen ? "▾" : "▸" }} Advanced / loaders
        </button>
        <div v-if="advancedOpen" class="ex01-list">
          <button
            class="ex01-item"
            @click="
              loadNrrd(
                '/copper3d_examples/nrrd/segmentation/ax dyn pre.nrrd',
                'nrrd'
              )
            "
          >
            Load NRRD · pre
          </button>
          <button
            class="ex01-item"
            @click="
              loadNrrd('/copper3d_examples/nrrd/breast-224.nrrd', 'nrrd-breast1')
            "
          >
            Load NRRD · breast
          </button>
          <button
            class="ex01-item"
            @click="loadVtk('/copper3d_examples/nrrd/breast.vtk', 'vtk-breast1')"
          >
            Load VTK · heart
          </button>
          <button
            class="ex01-item"
            @click="
              loadObj('/copper3d_examples/mask_normals_inverted.obj', 'mask-mesh')
            "
          >
            Load OBJ · mask
          </button>
          <button class="ex01-item" @click="loadtime">Log time</button>
          <button class="ex01-item" @click="getMixer">Log mixer</button>
        </div>
      </div>

      <!-- ---------- portal hearts HUD ---------- -->
      <div v-if="portalActive" class="cu-panel portal-hud">
        <div class="cu-panel__title">Portal Hearts</div>
        <label class="cu-check"><input type="checkbox" v-model="showHeart1" /> heart1</label>
        <label class="cu-check"><input type="checkbox" v-model="showBody" /> heart2 body</label>
        <label class="cu-check"><input type="checkbox" v-model="showVessels" /> vessels</label>
        <hr />
        <div class="cu-panel__title">Camera · digital_view.json</div>
        <pre class="portal-json">{{ viewJson }}</pre>
        <div class="portal-actions">
          <button class="cu-btn" @click="copyView">Copy JSON</button>
          <button class="cu-btn cu-btn--accent" @click="portalReset">Reset</button>
        </div>
      </div>

      <!-- ---------- controls hint ---------- -->
      <div class="ex01-hint">drag rotate · scroll zoom · right-drag pan</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import * as Copper from "copper3d";
// import { setHDRFilePath } from "./ts/lib/environment/index";

// import viewdata from "./assets/noInfarct_view.json";

import { getCurrentInstance, onMounted, onBeforeUnmount, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { PerspectiveCamera } from "three";

const router = useRouter();
const goHome = () => router.push("/");
const activeModel = ref("");
const advancedOpen = ref(false);
const models = [
  { name: "health", label: "Health", action: () => loadModel("/copper3d_examples/heart_2d.gltf", "health") },
  { name: "mask-glb", label: "Mask GLB", action: () => loadModel("/copper3d_examples/mask-glb.glb", "mask-glb") },
  { name: "minor", label: "Minor", action: () => loadModel("/copper3d_examples/Minor.glb", "minor") },
  { name: "normal", label: "Electricity normal", action: () => loadModel("/copper3d_examples/normalActivity.glb", "normal") },
  { name: "fibrillation", label: "Fibrillation", action: () => loadModel("/copper3d_examples/Fibrillation.glb", "fibrillation") },
  { name: "severe", label: "Severe", action: () => loadModel("/copper3d_examples/Severe.glb", "severe") },
  { name: "walk", label: "Walk model", action: () => loadModel("/copper3d_examples/walkmodel.glb", "walk") },
  { name: "test", label: "Test", action: () => loadModel("/copper3d_examples/test.glb", "test") },
  { name: "digital_twin", label: "Digital twins", action: () => loadModel("/copper3d_examples/digital_twin.gltf", "digital_twin") },
];
let refs = null;
let appRenderer: Copper.copperRenderer;
let oldScene = null;
let viewpoint: Copper.CameraViewPoint | undefined;
let scene: Copper.copperScene | undefined;
let allScenes: Array<Copper.copperScene> = [];
let bg: HTMLDivElement = ref<any>(null);
let c_gui: HTMLDivElement = ref<any>(null);
let loadBar: Copper.loadingBarType;
onMounted(() => {
  let { $refs } = (getCurrentInstance() as any).proxy;
  refs = $refs;

  bg = refs.base_container;
  c_gui = refs.c_gui;
  loadBar = Copper.loading();
  appRenderer = new Copper.copperRenderer(bg, {
    guiOpen: true,
    cameraGui: true,
    performanceGui: true,
    lightGui: true,
    // copper's own trackball — integrates with loadView / resetView
    controls: "copper3d",
  });

  document.addEventListener("keydown", (e) => {
    if (e.code === "KeyF") {
      Copper.fullScreenListenner(bg);
    }
  });

  appRenderer.animate();

  // load a heart model right away instead of the debug demo mesh
  loadModel("/copper3d_examples/heart_2d.gltf", "health");

  // fully hide the dat.gui ("Open Controls") — this example uses its own panel
  try {
    if (appRenderer.gui) appRenderer.gui.domElement.style.display = "none";
  } catch (_) {
    /* no gui to hide */
  }

  // lock the page so nothing (gui / canvas / panel) can produce a scrollbar
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
});
function loadModel(url: string, name: string) {
  activeModel.value = name;

  if (scene) {
    sharePosition(scene);
  }
  scene = appRenderer.getSceneByName(name) as Copper.copperScene;
  if (scene == undefined) {
    scene = appRenderer.createScene(name);

    allScenes.push(scene as Copper.copperScene);
    const funa = () => {
      // window.location.replace(
      //   "https://linkungao.github.io/medtech-heart-vue/model-heart"
      // );
      window.location.href =
        "https://linkungao.github.io/medtech-heart-vue/model-heart";
      document.removeEventListener("click", funa);
    };

    // const scene = appRenderer.getSceneByName(name);
    // appRenderer.setCurrentScene(scene);
    const opt = ["whole-body", "whole-body_2", "whole-body_1"];
    if (scene) {
      appRenderer.setCurrentScene(scene);

      // trackball: rotate (left) · zoom (wheel / middle-drag) · pan (right-drag)
      const controls = scene.controls as any;
      controls.staticMoving = true;
      controls.rotateSpeed = 3;
      controls.zoomSpeed = 1.2;
      controls.panSpeed = 1;
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      };

      if (name === "test") {
        scene.loadGltf(url, (content) => {
          scene &&
            scene.pickModel(
              content,
              (mesh) => {
                if (mesh && mesh.name === "whole-heart") {
                  document.addEventListener("click", funa);
                } else {
                  document.removeEventListener("click", funa);
                }
                mesh && console.log(mesh.name);
              },
              opt
            );
        });
      } else {
        scene.loadGltf(url, () => {
          if (viewpoint) {
            scene && scene.updateCamera(viewpoint);
          }
        });
      }

      if (name != "walk") {
        if (name == "fibrillation") {
          scene.loadViewUrl("/copper3d_examples/arrythmiaActivity_view.json");
        } else if (name === "digital_twin") {
          scene.loadViewUrl("/copper3d_examples/digital_view.json");
        } else if (name === "test") {
          scene.loadViewUrl("/copper3d_examples/human_view.json");
          // 87.03340526411395, y: -1353.7649452795513

          Copper.addLabelToScene(
            scene,
            "Digital Twins",
            23.47044074808355,
            553.7649452795513,
            700.421283,
            600.0,
            {
              font_size: "50px",
              font: "Raleway",
            }
          );
        } else {
          scene.loadViewUrl("/copper3d_examples/noInfarct_view.json");
          Copper.addLabelToScene(
            scene,
            "left ventricle",
            -55.056679,
            -14.82123313284426,
            5.421283,
            60.0
          );
          Copper.addLabelToScene(
            scene,
            "right ventricle",
            -44.323991175632,
            31.1417335930078,
            10.421283,
            60.0
          );
        }
      }
    }
    Copper.setHDRFilePath("/copper3d_examples/venice_sunset_1k.hdr");
    appRenderer.updateEnvironment();
    // dark gradient applied AFTER the environment so the HDR map can't wash it out
    scene?.updateBackground("#141519", "#0c0d10");
  } else {
    if (viewpoint) scene.updateCamera(viewpoint);
    appRenderer.setCurrentScene(scene);
  }
}

function sharePosition(scene: Copper.copperScene) {
  // const position: number[] = [
  //   scene.camera.position.x,
  //   scene.camera.position.y,
  //   scene.camera.position.z,
  // ];

  const target = [-0.9551143646240234, 2.91867446899414, 2.7563438415527344];
  viewpoint = scene.setViewPoint(scene.camera as PerspectiveCamera, target);
  // const up = [scene.camera.up.x, scene.camera.up.y, scene.camera.up.z];

  // viewpoint = {
  //   farPlane: scene.camera.far,
  //   nearPlane: scene.camera.near,
  //   eyePosition: position,
  //   targetPosition: target,
  //   upVector: up,
  // };
}

function reset() {
  console.log(allScenes);
  viewpoint = undefined;
  allScenes.forEach((scene) => {
    scene.resetView();
    if (scene.isHalfed) {
      console.log(scene.isHalfed);
    }
  });
}

let playRate: number = 1;
function addPlayRate() {
  playRate += 1;
  scene && scene.setPlayRate(playRate);
}

function minusPlayRate() {
  playRate -= 1;
  scene && scene.setPlayRate(playRate);
  console.log(playRate);
}

function getPosition(event: MouseEvent) {
  setTimeout(() => {
    const pos = Copper.convertScreenPosto3DPos(
      bg,
      scene?.camera as THREE.PerspectiveCamera,
      {
        x: event.clientX,
        y: event.clientY,
      }
    );
    console.log(pos);
  }, 3000);
}

function loadNrrd(url: string, name: string) {
  activeModel.value = name;
  scene = appRenderer.getSceneByName(name) as Copper.copperScene;
  if (scene == undefined) {
    scene = appRenderer.createScene(name);
    scene?.container.appendChild(loadBar.loadingContainer);
    const opts: Copper.optsType = {
      openGui: true,
      container: c_gui,
    };
    const a = (
      volume: any,
      nrrdMesh: Copper.nrrdMeshesType,
      nrrdSlices: Copper.nrrdSliceType
    ) => {
      // Copper.addBoxHelper(scene as Copper.copperScene, volume);
      scene?.addObject(nrrdMesh.x);
      scene?.addObject(nrrdMesh.y);
      scene?.addObject(nrrdMesh.z);
    };
    if (scene) {
      appRenderer.setCurrentScene(scene);
      scene?.loadNrrd(url, loadBar, false, a, opts);
      scene.loadViewUrl("/copper3d_examples/nrrd_view.json");

      allScenes.push(scene);
    }
  }
}

function loadObj(url: string, name: string) {
  activeModel.value = name;
  scene = appRenderer.getSceneByName(name) as Copper.copperScene;
  if (scene == undefined) {
    scene = appRenderer.createScene(name);
    if (scene) {
      appRenderer.setCurrentScene(scene);
      scene.loadOBJ(url, (obj_mesh) => {
        console.log(obj_mesh);
      });
      scene.loadViewUrl("/copper3d_examples/nrrd_view.json");
      allScenes.push(scene);
    }
  } else {
    if (viewpoint) scene.updateCamera(viewpoint);
    appRenderer.setCurrentScene(scene);
  }
}

function loadVtk(url: string, name: string) {
  activeModel.value = name;
  scene = appRenderer.getSceneByName(name) as Copper.copperScene;
  // const url_base =
  //   "/copper3d_examples/surfaces_lv/model_participant_000_lv_demo_endo_0";
  // const url_base1 =
  //   "/copper3d_examples/surfaces_lv/model_participant_000_lv_demo_epi_0";
  const url_base =
    "/copper3d_examples/vtks/one_frame/model_cardiohance_023_mri_DZ_endo_0";
  const url_base1 =
    "/copper3d_examples/vtks/one_frame/model_cardiohance_023_mri_DZ_epi_0";
  let urls: string[] = [];
  let urls_1: string[] = [];
  if (scene == undefined) {
    scene = appRenderer.createScene(name);
    if (scene) {
      appRenderer.setCurrentScene(scene);
      for (let i = 0; i < 1; i++) {
        let temp_u = "";
        let temp_u_1 = "";
        if (i < 10) {
          temp_u = url_base + "0" + i + ".vtk";
          temp_u_1 = url_base1 + "0" + i + ".vtk";
        } else {
          temp_u = url_base + i + ".vtk";
          temp_u_1 = url_base1 + i + ".vtk";
        }
        urls.push(temp_u);
        urls_1.push(temp_u_1);
      }
      scene?.loadVtks([
        {
          name: "heart_inner",
          urls,
          opts: { wireframe: true, color: "#cccccc" },
        },
        {
          name: "heart_outer",
          urls: urls_1,
          opts: {
            wireframe: false,
            color: "rgb(214, 211, 212)",
            transparent: true,
            opacity: 0.5,
          },
        },
      ]);
      // scene?.loadVtks(urls_1);
      // scene?.loadVtk(urls[0]);
      scene.loadViewUrl("/copper3d_examples/d_heart_view.json");
      allScenes.push(scene);
    }
  } else {
    if (viewpoint) scene.updateCamera(viewpoint);
    appRenderer.setCurrentScene(scene);
  }
}

function getTime() {
  if (appRenderer) {
    const scene1 = appRenderer.getCurrentScene() as Copper.copperScene;
    const time = scene1.getCurrentTime();
    console.log(time);
  }
}
function loadtime() {
  scene?.addPreRenderCallbackFunction(getTime);
}
function getMixer() {
  const scene1 = appRenderer.getCurrentScene() as Copper.copperScene;
  const mixer = scene1.getCurrentMixer();
  console.log(mixer);
}

/* ============================================================================
   Portal Hearts viewer — glow-shader rendering of heart1.obj + heart2.obj
   (ported from plan/reference/interactive.html), driven by copper3d controls
   (zoom / pan / rotate built in) with a live camera readout in digital_view.json
   format and a reset.
   ========================================================================== */
const portalActive = ref(false);
const viewJson = ref("");
const showHeart1 = ref(true);
const showBody = ref(true);
const showVessels = ref(true);
let portalScene: Copper.copperScene | undefined;
let portalGroup: THREE.Group | undefined;
let pgHeart1: THREE.Group | undefined;
let pgBody: THREE.Group | undefined;
let pgVessels: THREE.Group | undefined;
let portalInitCam:
  | { pos: THREE.Vector3; target: THREE.Vector3; up: THREE.Vector3 }
  | undefined;
let heartClock = new THREE.Clock();

const heartU: any = {
  uTime: { value: 0 },
  uMinY: { value: -1 },
  uMaxY: { value: 1 },
  uCyan: { value: new THREE.Color(0x6fe0f2) },
  uDeep: { value: new THREE.Color(0x1080b5) },
  uMag: { value: new THREE.Color(0xd66bd0) },
};
const heartVert = `varying vec3 vN;varying vec3 vView;varying float vYn;uniform float uMinY,uMaxY;
void main(){vec4 wp=modelMatrix*vec4(position,1.);vN=normalize(mat3(modelMatrix)*normal);vView=normalize(cameraPosition-wp.xyz);vYn=(position.y-uMinY)/max(uMaxY-uMinY,1e-4);gl_Position=projectionMatrix*viewMatrix*wp;}`;
const surfF = `precision highp float;uniform float uTime;uniform vec3 uCyan,uDeep,uMag;varying vec3 vN;varying vec3 vView;varying float vYn;
void main(){vec3 n=normalize(vN),v=normalize(vView);float f=1.-clamp(dot(n,v),0.,1.);float rim=pow(f,1.9);
vec3 col=mix(uDeep,uCyan,rim);col+=uMag*smoothstep(.5,.1,vYn)*(.14+rim*.4);
float scan=.9+.1*sin(vYn*80.-uTime*2.);gl_FragColor=vec4(col*(.5+rim*.45),(.04+0.42*rim)*scan);}`;
const innF = `precision highp float;uniform vec3 uDeep;varying vec3 vN;varying vec3 vView;
void main(){vec3 n=normalize(vN),v=normalize(vView);float f=1.-clamp(dot(n,v),0.,1.);gl_FragColor=vec4(uDeep*.8,pow(f,3.)*.1);}`;
const vesF = `precision highp float;uniform vec3 uCyan,uMag;varying vec3 vN;varying vec3 vView;
void main(){vec3 n=normalize(vN),v=normalize(vView);float f=1.-clamp(dot(n,v),0.,1.);vec3 col=mix(uMag,uCyan,.5);gl_FragColor=vec4(col*.5,.05+.05*f);}`;
const SM = (fs: string, extra: any = {}) =>
  new THREE.ShaderMaterial({
    vertexShader: heartVert,
    fragmentShader: fs,
    uniforms: heartU,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    ...extra,
  });

// cardiac-cycle long-axis contraction (1 = diastole)
const BEAT = [
  0.9683, 0.9701, 0.9719, 0.9739, 0.9759, 0.9779, 0.98, 0.982, 0.9841, 0.9861,
  0.988, 0.9899, 0.9917, 0.9935, 0.9952, 0.9969, 0.9985, 1.0, 0.9998, 0.9739,
  0.9655, 0.9611, 0.9574, 0.9411, 0.9321, 0.9262, 0.9204, 0.915, 0.9099, 0.905,
  0.8987, 0.8925, 0.8803, 0.8734, 0.863, 0.8534, 0.8439, 0.8354, 0.8265, 0.8217,
  0.8265, 0.8336, 0.8409, 0.8484, 0.8559, 0.8634, 0.8709, 0.8784, 0.8858,
  0.8933, 0.9008, 0.9083, 0.9158, 0.9233, 0.9308, 0.9383, 0.9458, 0.9533,
  0.9608, 0.9683,
];
const PERIOD = 4.0;
function beatLong(t: number) {
  const n = BEAT.length;
  const p = ((t % PERIOD) / PERIOD) * n;
  const i = Math.floor(p) % n;
  const j = (i + 1) % n;
  const f = p - Math.floor(p);
  return BEAT[i] * (1 - f) + BEAT[j] * f;
}

// normalise a geometry to ~2.6 units, centred at origin
function normalizeGeom(g: THREE.BufferGeometry) {
  g.computeBoundingBox();
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  g.boundingBox!.getCenter(center);
  g.boundingBox!.getSize(size);
  const k = 2.6 / Math.max(size.x, size.y, size.z);
  g.translate(-center.x, -center.y, -center.z);
  g.scale(k, k, k);
  g.computeBoundingBox();
  return { center, k };
}
function applyNorm(g: THREE.BufferGeometry, center: THREE.Vector3, k: number) {
  g.translate(-center.x, -center.y, -center.z);
  g.scale(k, k, k);
}

// area-weighted point sample for a uniform surface "grain"
function grainPoints(g: THREE.BufferGeometry, N = 30000) {
  const pos = g.attributes.position;
  const tc = (pos.count / 3) | 0;
  const cum = new Float32Array(tc);
  const a = new THREE.Vector3(),
    b = new THREE.Vector3(),
    cv = new THREE.Vector3(),
    e1 = new THREE.Vector3(),
    e2 = new THREE.Vector3();
  let tot = 0;
  for (let i = 0; i < tc; i++) {
    a.fromBufferAttribute(pos, i * 3);
    b.fromBufferAttribute(pos, i * 3 + 1);
    cv.fromBufferAttribute(pos, i * 3 + 2);
    tot += e1.subVectors(b, a).cross(e2.subVectors(cv, a)).length() * 0.5;
    cum[i] = tot;
  }
  const out = new Float32Array(N * 3);
  for (let kk = 0; kk < N; kk++) {
    const rr = Math.random() * tot;
    let lo = 0,
      hi = tc - 1;
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if (cum[m] < rr) lo = m + 1;
      else hi = m;
    }
    a.fromBufferAttribute(pos, lo * 3);
    b.fromBufferAttribute(pos, lo * 3 + 1);
    cv.fromBufferAttribute(pos, lo * 3 + 2);
    let u = Math.random(),
      v = Math.random();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    out[kk * 3] = a.x + (b.x - a.x) * u + (cv.x - a.x) * v;
    out[kk * 3 + 1] = a.y + (b.y - a.y) * u + (cv.y - a.y) * v;
    out[kk * 3 + 2] = a.z + (b.z - a.z) * u + (cv.z - a.z) * v;
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute("position", new THREE.BufferAttribute(out, 3));
  return new THREE.Points(
    pg,
    new THREE.PointsMaterial({
      color: 0x9fe9f6,
      size: 0.008,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
}

function loadPortalHearts() {
  const name = "portal_hearts";
  activeModel.value = name;
  let s = appRenderer.getSceneByName(name) as Copper.copperScene;
  if (s) {
    appRenderer.setCurrentScene(s);
    portalActive.value = true;
    return;
  }
  s = appRenderer.createScene(name) as Copper.copperScene;
  portalScene = s;
  appRenderer.setCurrentScene(s);
  allScenes.push(s);
  s.updateBackground("#060f18", "#04121c");

  const group = new THREE.Group();
  portalGroup = group;
  pgHeart1 = new THREE.Group();
  pgBody = new THREE.Group();
  pgVessels = new THREE.Group();
  group.add(pgHeart1, pgBody, pgVessels);
  s.scene.add(group);

  const loader = new OBJLoader();
  // heart2.obj → body (surface + inner + grain) and vessels
  loader.load("/copper3d_examples/portal_heart/heart2.obj", (o) => {
    const ms: THREE.Mesh[] = [];
    o.traverse((m: any) => {
      if (m.isMesh) ms.push(m);
    });
    ms.sort(
      (a, b) =>
        b.geometry.attributes.position.count -
        a.geometry.attributes.position.count
    );
    const body = ms[0].geometry as THREE.BufferGeometry;
    const ves = ms[1]?.geometry as THREE.BufferGeometry | undefined;
    const { center, k } = normalizeGeom(body);
    body.computeVertexNormals();
    heartU.uMinY.value = body.boundingBox!.min.y;
    heartU.uMaxY.value = body.boundingBox!.max.y;
    pgBody!.add(new THREE.Mesh(body, SM(innF, { side: THREE.BackSide })));
    pgBody!.add(new THREE.Mesh(body, SM(surfF, { side: THREE.FrontSide })));
    pgBody!.add(grainPoints(body));
    if (ves) {
      applyNorm(ves, center, k);
      ves.computeVertexNormals();
      pgVessels!.add(new THREE.Mesh(ves, SM(vesF, { side: THREE.DoubleSide })));
    }
    framePortalCamera();
  });
  // heart1.obj → an extra surface layer
  loader.load("/copper3d_examples/portal_heart/heart1.obj", (o) => {
    let g1: THREE.BufferGeometry | undefined;
    o.traverse((m: any) => {
      if (m.isMesh && !g1) g1 = m.geometry;
    });
    if (!g1) return;
    normalizeGeom(g1);
    g1.computeVertexNormals();
    pgHeart1!.add(new THREE.Mesh(g1, SM(surfF, { side: THREE.FrontSide })));
    framePortalCamera();
  });

  heartClock = new THREE.Clock();
  s.addPreRenderCallbackFunction(portalTick);
  portalActive.value = true;
}

function portalTick() {
  const t = heartClock.getElapsedTime();
  heartU.uTime.value = t;
  if (portalGroup) {
    const c = 1 - beatLong(t);
    portalGroup.scale.set(1 - 0.42 * c, 1 - 0.7 * c, 1 - 0.42 * c);
  }
  updateViewJson();
}

function framePortalCamera() {
  if (!portalScene) return;
  const cam = portalScene.camera as THREE.PerspectiveCamera;
  const controls = portalScene.controls as any;
  cam.position.set(0, 0, 4);
  cam.up.set(0, 1, 0);
  cam.near = 0.1;
  cam.far = 100;
  cam.updateProjectionMatrix();
  cam.lookAt(0, 0, 0);
  controls.target?.set(0, 0, 0);
  controls.update?.();
  portalInitCam = {
    pos: cam.position.clone(),
    target: new THREE.Vector3(0, 0, 0),
    up: cam.up.clone(),
  };
}

function updateViewJson() {
  if (!portalScene) return;
  const cam = portalScene.camera as THREE.PerspectiveCamera;
  const controls = portalScene.controls as any;
  const t = (controls.target as THREE.Vector3) ?? new THREE.Vector3();
  const r = (v: number) => Math.round(v * 1000) / 1000;
  viewJson.value = JSON.stringify(
    {
      farPlane: r(cam.far),
      targetPosition: [r(t.x), r(t.y), r(t.z)],
      nearPlane: r(cam.near),
      upVector: [r(cam.up.x), r(cam.up.y), r(cam.up.z)],
      eyePosition: [r(cam.position.x), r(cam.position.y), r(cam.position.z)],
    },
    null,
    2
  );
}

function portalReset() {
  // reuse the initial framing path (keeps the trackball in a valid state so
  // rotate / zoom keep working after a reset)
  framePortalCamera();
}

function copyView() {
  navigator.clipboard?.writeText(viewJson.value);
}

watch(showHeart1, (v) => pgHeart1 && (pgHeart1.visible = v));
watch(showBody, (v) => pgBody && (pgBody.visible = v));
watch(showVessels, (v) => pgVessels && (pgVessels.visible = v));

onBeforeUnmount(() => {
  // restore page scrolling for other routes
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
  appRenderer?.dispose();
});
</script>

<style scoped>
/* full-bleed stage, no page scrollbars */
.ex01 {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #0c0d10;
}
#bg {
  width: 100%;
  height: 100%;
}

/* ---------- main panel ---------- */
.ex01-panel {
  max-height: calc(100vh - 32px);
  overflow-y: auto;
}

/* hide every scrollbar in this example (still scrollable, just no visible bar) */
.ex01-panel,
.portal-hud,
.portal-json {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* old Edge / IE */
}
.ex01-panel::-webkit-scrollbar,
.portal-hud::-webkit-scrollbar,
.portal-json::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none; /* Chrome / Safari */
}
.ex01-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ex01-back {
  flex: none;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  padding: 0;
  font-size: 15px;
  line-height: 1;
}
.ex01-kicker {
  font-size: 10.5px;
  letter-spacing: 0.16em;
  color: var(--cu-muted);
}

/* ---------- model list ---------- */
.ex01-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ex01-item {
  text-align: left;
  width: 100%;
  margin: 0;
  background: #15171c;
  border: 1px solid var(--cu-line);
  border-radius: 8px;
  padding: 8px 11px;
  color: var(--cu-ink);
  font-family: var(--cu-font);
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}
.ex01-item:hover {
  border-color: rgba(200, 128, 74, 0.55);
  color: var(--cu-accent-bright);
}
.ex01-item.active {
  border-color: var(--cu-accent);
  color: var(--cu-accent-bright);
  background: rgba(200, 128, 74, 0.12);
}

.ex01-featured.active {
  outline: 2px solid var(--cu-accent-bright);
  outline-offset: 1px;
}

/* ---------- playback row ---------- */
.ex01-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ex01-row .cu-btn {
  flex: none;
  width: 34px;
  text-align: center;
}
.ex01-row .cu-value {
  margin: 0 auto;
}

/* ---------- advanced toggle ---------- */
.ex01-toggle {
  width: 100%;
  text-align: left;
  margin: 0 0 2px;
  background: transparent;
  border: none;
  color: var(--cu-muted);
  font-family: var(--cu-font);
  font-size: 11px;
  letter-spacing: 0.06em;
  cursor: pointer;
  padding: 2px 0;
}
.ex01-toggle:hover {
  color: var(--cu-accent-bright);
}

/* ---------- portal HUD ---------- */
.portal-hud {
  left: auto;
  right: 16px;
  top: 16px;
  min-width: 250px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
}
.portal-json {
  margin: 0;
  font-family: var(--cu-font);
  font-size: 11px;
  line-height: 1.5;
  color: #6fe0f2;
  white-space: pre;
  overflow-x: auto;
}
.portal-actions {
  display: flex;
  gap: 8px;
}
.portal-actions .cu-btn {
  flex: 1;
  margin: 0;
}

/* ---------- controls hint ---------- */
.ex01-hint {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  padding: 5px 12px;
  border: 1px solid var(--cu-line);
  border-radius: 999px;
  background: rgba(18, 20, 24, 0.7);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  font-family: var(--cu-font);
  font-size: 10.5px;
  letter-spacing: 0.08em;
  color: var(--cu-muted);
  pointer-events: none;
  white-space: nowrap;
}
</style>

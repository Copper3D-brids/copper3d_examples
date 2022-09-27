<template>
  <!-- <div id="bg" ref="base_container" @click="getPosition"> -->
  <div id="bg" ref="base_container">
    <div ref="c_gui" id="gui"></div>
    <div class="btn">
      <!-- <button @click="loadModel('/zincmmodel1.glb', 'health1')">Health</button> -->
      <button @click="loadModel('/copper3d_examples/heart1.gltf', 'health')">
        Health
      </button>
      <button @click="loadModel('/copper3d_examples/Minor.glb', 'minor')">
        Minor
      </button>
      <button
        @click="loadModel('/copper3d_examples/normalActivity.glb', 'normal')"
      >
        Electricity normal
      </button>
      <button
        @click="
          loadModel('/copper3d_examples/Fibrillation.glb', 'fibrillation')
        "
      >
        Fibrillation
      </button>
      <button @click="loadModel('/copper3d_examples/Severe.glb', 'severe')">
        Severe
      </button>
      <button @click="loadModel('/copper3d_examples/walkmodel.glb', 'walk')">
        Walk model
      </button>
      <button @click="loadModel('/copper3d_examples/test.glb', 'test')">
        Test
      </button>
      <button @click="reset">Reset</button>
      <button @click="addPlayRate">addPlayRate</button>
      <button @click="minusPlayRate">minusPlayRate</button>
      <button
        @click="
          loadNrrd(
            '/copper3d_examples/nrrd/for-linkun/nnrd/DZET01_17871377_005.nrrd',
            'nrrd'
          )
        "
      >
        LoadNrrd
      </button>
      <button
        @click="loadNrrd('/copper3d_examples/nrrd/58.nrrd', 'nrrd-breast1')"
      >
        LoadNrrd-breast1
      </button>
      <button
        @click="loadVtk('/copper3d_examples/nrrd/breast.vtk', 'vtk-breast1')"
      >
        LoadVtk-heart
      </button>
      <button @click="loadtime">getTime</button>
      <button @click="getMixer">getMixer</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// import * as Copper from "copper3d_visualisation";
import * as THREE from "three";
import * as Copper from "../ts/index";
// import { setHDRFilePath } from "./ts/lib/environment/index";

// import viewdata from "./assets/noInfarct_view.json";

import { getCurrentInstance, onMounted, ref } from "vue";
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
    camera: true,
    performance: true,
    light: true,
  });
  // appRenderer.gui.closed = true;
  appRenderer.closeGui();
  // appRenderer = new Copper.copperRenderer(bg);
  // appRenderer.closeGui();

  document.addEventListener("keydown", (e) => {
    if (e.code === "KeyF") {
      Copper.fullScreenListenner(bg);
    }
  });

  const defaultScene = appRenderer.getCurrentScene();
  defaultScene.createDemoMesh();

  appRenderer.animate();
});
function loadModel(url: string, name: string) {
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

      scene.controls.staticMoving = true;
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
        scene.loadGltf(url, (mesh) => {
          // console.log(mesh);
          if (viewpoint) {
            // console.log(viewpoint);
            scene && scene.updateCamera(viewpoint);
          }
        });
      }

      if (name != "walk") {
        if (name == "fibrillation") {
          scene.loadViewUrl("/copper3d_examples/arrythmiaActivity_view.json");
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

      // scene.directionalLight.intensity = 1;

      // scene.directionalLight.color = new THREE.Color(0x18ef06);
      scene.updateBackground("#5454ad", "#18e5a7");
    }
    // Copper.setHDRFilePath("/copper3d_examples/venice_sunset_1k.hdr");
    Copper.setHDRFilePath("/copper3d_examples/footprint_court_2k.hdr");
    // Copper.setHDRFilePath("/copper3d_examples/sandsloot_1k.hdr");
    appRenderer.updateEnvironment();
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
  viewpoint = scene.setViewPoint(scene.camera, target);
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
  console.log(playRate);
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
  scene = appRenderer.getSceneByName(name) as Copper.copperScene;
  if (scene == undefined) {
    scene = appRenderer.createScene(name);

    const opts: Copper.optsType = {
      openGui: true,
      container: c_gui,
    };
    const a = (volume: any) => {
      // Copper.addBoxHelper(scene as Copper.copperScene, volume);
    };
    if (scene) {
      appRenderer.setCurrentScene(scene);
      scene?.loadNrrd(url, loadBar, a, opts);
      scene.loadViewUrl("/copper3d_examples/nrrd_view.json");

      allScenes.push(scene);
    }
  }
}

function loadVtk(url: string, name: string) {
  scene = appRenderer.getSceneByName(name) as Copper.copperScene;
  const url_base =
    "/copper3d_examples/surfaces_lv/model_participant_000_lv_demo_endo_0";
  const url_base1 =
    "/copper3d_examples/surfaces_lv/model_participant_000_lv_demo_epi_0";
  let urls: string[] = [];
  let urls_1: string[] = [];
  if (scene == undefined) {
    scene = appRenderer.createScene(name);
    if (scene) {
      appRenderer.setCurrentScene(scene);
      for (let i = 0; i < 31; i++) {
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
        { name: "heart_inner", urls },
        { name: "heart_outer", urls: urls_1 },
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
</script>

<style>
#bg {
  width: 100vw;
  height: 100vh;
  /* border: 1px solid palevioletred; */
}
.btn {
  position: fixed;
  left: 0;
  top: 0;
}
button {
  cursor: pointer;
  margin: 10px;
}
#gui {
  position: absolute;
  top: 150px;
  left: 2px;
}
</style>

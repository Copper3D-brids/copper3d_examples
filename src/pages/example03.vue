<template>
  <div id="bg" ref="base_container">
    <div ref="c_gui" id="gui"></div>
    <div ref="c_gui_2" id="gui_2"></div>
    <div ref="c_gui_3" id="gui_3"></div>
  </div>
</template>

<script setup lang="ts">
// import * as Copper from "../ts/index";
import { GUI } from "dat.gui";
import * as Copper from "copper3d_visualisation";
import "copper3d_visualisation/dist/css/style.css";
import { getCurrentInstance, onMounted, ref } from "vue";

// let refs = null;
let bg: HTMLDivElement = ref<any>(null);
let appRenderer: Copper.copperMSceneRenderer;
let c_gui: HTMLDivElement = ref<any>(null);
let c_gui_2: HTMLDivElement = ref<any>(null);
let c_gui_3: HTMLDivElement = ref<any>(null);
let loadBar: Copper.loadingBarType;
let nrrdTools: Copper.nrrd_tools;
onMounted(() => {
  let { $refs } = (getCurrentInstance() as any).proxy;
  // refs = $refs;
  bg = $refs.base_container;
  c_gui = $refs.c_gui;
  c_gui_2 = $refs.c_gui_2;
  c_gui_3 = $refs.c_gui_3;

  console.log(c_gui);
  console.log(c_gui_2);
  console.log(c_gui_3);

  appRenderer = new Copper.copperMSceneRenderer(bg, 3);
  loadBar = Copper.loading();

  // loadModel("/test.glb", "test", appRenderer.sceneInfos[0]);
  loadNrrd(
    "/copper3d_examples/nrrd/breast-224.nrrd",
    "nrrd0",
    appRenderer.sceneInfos[0],
    c_gui
  );

  // loadModel("/test.glb", "test", appRenderer.sceneInfos[1]);

  loadNrrd(
    "/copper3d_examples/nrrd/stent.nrrd",
    "nrrd1",
    appRenderer.sceneInfos[1],
    c_gui_2
  );
  loadNrrd1(
    "/copper3d_examples/nrrd/breast-224.nrrd",
    "nrrd",
    appRenderer.sceneInfos[2],
    c_gui_3
  );
  // appRenderer.sceneInfos[3].createDemoMesh();

  appRenderer.animate();
});

function loadModel(url: string, name: string, sceneIn: Copper.copperMScene) {
  const scene = sceneIn;
  //   if (scene == undefined) {
  // scene = appRenderer.createScene(name) as Copper.copperSceneOnDemond;
  // allScenes.push(scene as Copper.copperSceneOnDemond);
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
    //   appRenderer.setCurrentScene(scene);
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
            },
            opt
          );
      });
    }
    scene.loadViewUrl("/human_view.json");

    scene.updateBackground("#5454ad", "#18e5a7");
    // scene.controls.rotateSpeed = 0.01;
  }
  Copper.setHDRFilePath("venice_sunset_1k.hdr");
  appRenderer.updateEnvironment(scene);
  // setTimeout(() => {
  //   console.log(scene.scene.environment);
  // }, 1000);
  //   }
}
function loadNrrd(
  url: string,
  name: string,
  sceneIn: Copper.copperMScene,
  c_gui: any
) {
  const opts: Copper.optsType = {
    openGui: true,
    container: c_gui,
  };
  const a = (
    volume: any,
    nrrdMesh: Copper.nrrdMeshesType,
    nrrdSlices: Copper.nrrdSliceType,
    gui?: GUI
  ) => {
    // Copper.addBoxHelper(scene as Copper.copperScene, volume);
    sceneIn.addObject(nrrdMesh.x);
    sceneIn.addObject(nrrdMesh.y);
    sceneIn.addObject(nrrdMesh.z);

    (gui as GUI).closed = true;
  };
  if (sceneIn) {
    sceneIn?.loadNrrd(url, loadBar, a, opts);
    sceneIn.loadViewUrl("/copper3d_examples/nrrd_view.json");
  }
  sceneIn.updateBackground("#18e5a7", "#000");
  Copper.setHDRFilePath("venice_sunset_1k.hdr");
  appRenderer.updateEnvironment(sceneIn);
  // sceneIn.controls.rotateSpeed = 0.01;
}
function loadNrrd1(
  url: string,
  name: string,
  sceneIn: Copper.copperMScene,
  c_gui: any
) {
  const a = (volume: any, gui?: GUI) => {
    // Copper.addBoxHelper(scene as Copper.copperScene, volume);
    (gui as GUI).closed = true;
    c_gui.appendChild((gui as GUI).domElement);
  };
  if (sceneIn) {
    // sceneIn?.loadNrrd(url, a, opts);
    sceneIn?.loadNrrd1(url, a);
    // sceneIn.loadViewUrl("/copper3d_examples/nrrd_view.json");
  }
  sceneIn.updateBackground("#18e5a7", "#000");
  Copper.setHDRFilePath("venice_sunset_1k.hdr");
  appRenderer.updateEnvironment(sceneIn);
  // sceneIn.controls.rotateSpeed = 0.01;
}
</script>

<style lang="scss" scoped>
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
  top: 10px;
  left: 2px;
  z-index: 100;
}
#gui_2 {
  position: absolute;
  top: 10px;
  right: 2px;
  z-index: 100;
}
#gui_3 {
  position: absolute;
  top: 400px;
  left: 2px;
  z-index: 100;
}
</style>

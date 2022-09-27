<template>
  <div id="bg" ref="base_container">
    <div ref="c_gui" id="gui"></div>
    <div ref="c_gui_2" id="gui_2"></div>
    <button class="btn" ref="btn" @click="reset">reset</button>
  </div>
</template>

<script setup lang="ts">
import { GUI } from "dat.gui";
import * as Copper from "../ts/index";
// import * as Copper from "copper3d_visualisation";
// import "copper3d_visualisation/dist/css/style.css";
import { getCurrentInstance, onMounted, ref } from "vue";

let refs = null;
let bg: HTMLDivElement = ref<any>(null);
let appRenderer: Copper.copperMSceneRenderer;
let c_gui: HTMLDivElement = ref<any>(null);
let nrrdTools: Copper.nrrd_tools;
let loadBar1: Copper.loadingBarType;

onMounted(() => {
  let { $refs } = (getCurrentInstance() as any).proxy;
  refs = $refs;
  bg = refs.base_container;
  c_gui = refs.c_gui;

  appRenderer = new Copper.copperMSceneRenderer(bg, 1);
  loadBar1 = Copper.loading();

  loadNrrd(
    "/copper3d_examples/nrrd/breast-224.nrrd",
    "nrrd0",
    appRenderer.sceneInfos[0],
    c_gui
  );

  appRenderer.animate();
});

function reset() {
  appRenderer.sceneInfos.forEach((sceneInfo) => {
    sceneInfo.resetView();
  });
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

  const funa = (
    volume: any,
    nrrdMesh: Copper.nrrdMeshesType,
    nrrdSlices: Copper.nrrdSliceType,
    gui?: GUI
  ) => {
    (gui as GUI).closed = true;

    // sceneIn.setCameraPosition({ x: 300, z: 0 });
    // sceneIn.container.onclick = (ev) => {
    //   const x = ev.offsetX;
    //   const y = ev.offsetY;
    //   const a = sceneIn.pickSpecifiedModel(nrrdMesh.x, { x, y });
    //   console.log(a);
    // };

    // sceneIn.addObject(nrrdMesh.z);

    sceneIn.drawWholeNrrd(nrrdSlices);
  };
  if (sceneIn) {
    sceneIn.loadNrrd(url, loadBar1, funa, opts);
    sceneIn.loadViewUrl("/copper3d_examples/nrrd_view.json");
  }
  sceneIn.updateBackground("#18e5a7", "#000");
  Copper.setHDRFilePath("venice_sunset_1k.hdr");
  appRenderer.updateEnvironment(sceneIn);
}
</script>

<style lang="scss">
#bg {
  width: 100vw;
  height: 100vh;
  /* border: 1px solid palevioletred; */
}
.btn {
  position: fixed;
  left: 500;
  top: 0;
  z-index: 1000;
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
.copper3d_sliceNumber {
  top: 50px !important;
  left: 150px !important;
  border: 1px solid salmon;
  border-radius: 10px;
  padding: 5px;
  color: crimson;
}
</style>

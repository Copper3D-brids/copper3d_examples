<template>
  <div id="bg" ref="base_container">
    <div ref="c_gui_3" id="gui_3"></div>
  </div>
</template>

<script setup lang="ts">
import * as Copper from "../ts/index";
import { GUI } from "dat.gui";
// import * as Copper from "copper3d_visualisation";
import "copper3d_visualisation/dist/css/style.css";
import { getCurrentInstance, onMounted, ref } from "vue";

// let refs = null;
let bg: HTMLDivElement = ref<any>(null);
let appRenderer: Copper.copperRenderer;
let c_gui_3: HTMLDivElement = ref<any>(null);
let loadBar: Copper.loadingBarType;
let nrrdTools: Copper.nrrd_tools;
onMounted(() => {
  let { $refs } = (getCurrentInstance() as any).proxy;
  // refs = $refs;
  bg = $refs.base_container;
  c_gui_3 = $refs.c_gui_3;

  appRenderer = new Copper.copperRenderer(bg, {
    guiOpen: true,
    cameraGui: true,
    cameraType: "orthographic",
  });
  loadBar = Copper.loading();

  const scene = appRenderer.createScene("texture3d") as Copper.copperScene;
  (scene.controls as Copper.Copper3dTrackballControls).staticMoving = true;
  scene.controls.rotateSpeed = 2;
  appRenderer.setCurrentScene(scene);

  loadNrrd1(
    "/copper3d_examples/nrrd/segmentation/c1.nrrd",
    "nrrd",
    scene,
    c_gui_3
  );

  appRenderer.animate();
});

function loadNrrd1(
  url: string,
  name: string,
  sceneIn: Copper.copperScene,
  c_gui: any
) {
  const a = (volume: any, gui?: GUI) => {
    // Copper.addBoxHelper(scene as Copper.copperScene, volume);
    // (gui as GUI).closed = true;
    c_gui.appendChild((gui as GUI).domElement);
  };

  if (sceneIn) {
    // sceneIn?.loadNrrd(url, loadBar, true, b);
    sceneIn?.loadNrrdTexture3d(url, a);
    sceneIn.loadViewUrl("/copper3d_examples/nrrd_view_texture3d.json");
  }
  // sceneIn.updateBackground("#090123", "#017F20");
  sceneIn.updateBackground("#090123", "#666");
  // FF9880 C461F3 3EAF20 FF8C37
  Copper.setHDRFilePath("venice_sunset_1k.hdr");
  appRenderer.updateEnvironment();
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

<template>
  <!-- <div id="bg" ref="base_container" @click="getPosition"> -->
  <div id="bg" ref="base_container">
    <div ref="c_gui" id="gui"></div>
  </div>
</template>

<script setup lang="ts">
import * as Copper from "copper3d_visualisation";
import "copper3d_visualisation/dist/css/style.css";
// import Scene from "gltfloader-plugin-test/dist/Scene/index";
// import { setHDRFilePath } from "gltfloader-plugin-test/dist/lib/environment/index";
import * as THREE from "three";

// import { setHDRFilePath } from "./ts/lib/environment/index";

// import viewdata from "./assets/noInfarct_view.json";
import { GUI } from "dat.gui";
import { getCurrentInstance, onMounted, ref } from "vue";
let refs = null;
let appRenderer: Copper.copperRenderer;

let viewpoint: Copper.CameraViewPoint | undefined;
let scene: Copper.copperScene | undefined;
let bg: HTMLDivElement = ref<any>(null);
let c_gui: HTMLDivElement = ref<any>(null);
let gui = new GUI({ width: 350, autoPlace: false });

onMounted(() => {
  let { $refs } = (getCurrentInstance() as any).proxy;
  refs = $refs;

  bg = refs.base_container;
  c_gui = $refs.c_gui;

  c_gui.appendChild(gui.domElement);
  appRenderer = new Copper.copperRenderer(bg, {
    guiOpen: false,
    camera: true,
    performance: true,
    light: true,
  });
  appRenderer.closeGui();

  document.addEventListener("keydown", (e) => {
    if (e.code === "KeyF") {
      Copper.fullScreenListenner(bg);
    }
  });
  loadModel("/copper3d_examples/head256x256x109.zip", "texture2d");
  appRenderer.animate();
});
function loadModel(url: string, name: string) {
  scene = appRenderer.getSceneByName(name) as Copper.copperScene;
  if (scene == undefined) {
    scene = appRenderer.createScene(name);

    if (scene) {
      appRenderer.setCurrentScene(scene);

      const urls = [];
      // for (let i = 1; i <= 20; i++) {
      //   urls.push(`/copper3d_examples/brain/brain_0${i}.dcm`);
      // }
      for (let i = 1; i <= 160; i++) {
        if (i < 100) {
          urls.push(`/copper3d_examples/breast-dicom/1-0${i}.dcm`);
        } else {
          urls.push(`/copper3d_examples/breast-dicom/1-${i}.dcm`);
        }
      }
      // for (let i = 1; i <= 32; i++) {
      //   urls.push(`/copper3d_examples/mri_4ch/${i}.dcm`);
      // }

      scene.setDicomFilesOrder("descending");
      scene.loadDicom(
        urls,
        (mesh) => {
          console.log(mesh);
        },
        gui
      );
      // scene.loadDicom("/copper3d_examples/breast-dicom/1-049.dcm");
      // scene.loadDicom("/copper3d_examples/brain/brain_01.dcm");
      // scene.loadDicom("/copper3d_examples/mri_4ch/1.dcm");
      // scene.texture2d(url);
      scene.loadViewUrl("/copper3d_examples/texture2d_view_array.json");
      scene.updateBackground("#5454ad", "#18e5a7");
    }

    Copper.setHDRFilePath("/copper3d_examples/footprint_court_2k.hdr");

    appRenderer.updateEnvironment();
  }
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
  top: 10px;
  left: 2px;
  z-index: 100;
}
</style>

<template>
  <!-- <div id="bg" ref="base_container" @click="getPosition"> -->
  <div id="bg" ref="base_container">
    <div ref="c_gui" id="gui"></div>
  </div>
</template>

<script setup lang="ts">
import * as Copper from "../ts/index";
// import * as Copper from "copper3d_visualisation";
// import "copper3d_visualisation/dist/css/style.css";

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
  const urls = [];
  for (let i = 1; i <= 32; i++) {
    urls.push(`/copper3d_examples/mri_4ch/${i}.dcm`);
  }
  loadModel(urls, "texture2d");
  appRenderer.animate();
});
function loadModel(urls: Array<string>, name: string) {
  scene = appRenderer.getSceneByName(name) as Copper.copperScene;
  if (scene == undefined) {
    scene = appRenderer.createScene(name);

    if (scene) {
      appRenderer.setCurrentScene(scene);
      scene.loadViewUrl("/copper3d_examples/texture2d_view_array.json");
      // scene.controls.rotateSpeed = 6;

      scene.loadDicom(urls, {
        gui,
        getMesh(mesh) {
          console.log(mesh);
        },
        setAnimation(currentValue, depth, depthStep) {
          currentValue += depthStep;
          if (currentValue > depth) {
            currentValue = 0;
          }
          return currentValue;
        },
      });
      scene.loadGltf("/copper3d_examples/heart1.gltf", (content) => {
        content.scale.set(5, 5, 5);
        content.rotation.set(2.1, 6.4, 6.7);
        gui.add(content.rotation, "x").min(0.1).max(10).step(0.1);
        gui.add(content.rotation, "y").min(0.1).max(10).step(0.1);
        gui.add(content.rotation, "z").min(0.1).max(10).step(0.1);
      });
      // scene.loadDicom("/copper3d_examples/mri_4ch/1.dcm");
      // scene.texture2d(url);

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

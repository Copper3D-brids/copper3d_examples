<template>
  <!-- <div id="bg" ref="base_container" @click="getPosition"> -->
  <div id="bg" ref="base_container">
    <div ref="c_gui" id="gui"></div>
    <div class="btn">
      <button @click="addPlayRate">addPlayRate</button>
      <button @click="minusPlayRate">minusPlayRate</button>
    </div>
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
    guiOpen: true,
    camera: true,
    performance: true,
    light: true,
    alpha: true,
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
  // for (let i = 0; i <= 0; i++) {
  //   // let j = "";
  //   // if (i < 10) {
  //   //   j = "00" + i;
  //   // } else if (10 <= i && i < 100) {
  //   //   j = "0" + i;
  //   // }
  //   // if (i != 132) urls.push(`/copper3d_examples/vtks/cardiohance_023/${i}.dcm`);
  //   // urls.push(`/copper3d_examples/mri_4ch/${1}.dcm`);
  //   urls.push(`/copper3d_examples/vtks/one_frame/${1}.dcm`);
  // }
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
        getCopperVolume(copperVolume, updateTexture) {
          copperVolume.windowWidth = 424;
          copperVolume.windowCenter = 236;
          updateTexture(copperVolume);
        },
        setAnimation(currentValue, depth, depthStep, copperVolume) {
          currentValue += depthStep;
          if (currentValue > depth) {
            currentValue = 0;
          }
          return currentValue;
        },
      });
      scene.loadGltf("/copper3d_examples/heart_p.gltf", (content) => {
        content.rotation.set(-12.9, 3.6, 3.3);
        content.scale.set(3.4, 3.4, 3.4);
        content.position.set(4.3, 1.3, 0);
        // content.rotation.set(-12.9, 3.6, 3);
        // content.scale.set(3.2, 3.2, 3.2);
        // content.position.set(7.3, 4.3, -0.2);
        gui
          .add(content.rotation as any, "x")
          .min(-20)
          .max(20)
          .step(0.1);
        gui
          .add(content.rotation as any, "y")
          .min(-20)
          .max(20)
          .step(0.1);
        gui
          .add(content.rotation as any, "z")
          .min(-20)
          .max(20)
          .step(0.1);
        gui
          .add(content.scale as any, "x")
          .min(0.1)
          .max(10)
          .step(0.1);
        gui
          .add(content.scale as any, "y")
          .min(0.1)
          .max(10)
          .step(0.1);
        gui
          .add(content.scale as any, "z")
          .min(0.1)
          .max(10)
          .step(0.1);
        gui
          .add(content.position as any, "x")
          .min(-100)
          .max(100)
          .step(0.1);
        gui
          .add(content.position as any, "y")
          .min(-100)
          .max(100)
          .step(0.1);
        gui
          .add(content.position as any, "z")
          .min(-100)
          .max(100)
          .step(0.1);
        scene?.setPlayRate(3.5);
      });
      // scene.loadDicom("/copper3d_examples/mri_4ch/1.dcm");
      // scene.texture2d(url);

      // scene.updateBackground("#5454ad", "#18e5a7");
    }

    // Copper.setHDRFilePath("/copper3d_examples/footprint_court_2k.hdr");

    // appRenderer.updateEnvironment();
  }
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
</script>

<style>
#bg {
  width: 100vw;
  height: 100vh;
  /* border: 1px solid palevioletred; */
}
.btn {
  position: fixed;
  left: 500px;
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

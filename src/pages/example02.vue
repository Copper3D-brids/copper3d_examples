<template>
  <div id="bg" ref="base_container" @click="getPosition"></div>
</template>

<script setup lang="ts">
import * as Copper from "../ts/index";
// import * as Copper from "copper3d_visualisation";
import { getCurrentInstance, onMounted, ref } from "vue";
import { Scene } from "three";

let refs = null;
let bg: HTMLDivElement = ref<any>(null);
let appRenderer: Copper.copperRendererOnDemond;
let scene: Copper.copperSceneOnDemond;
onMounted(() => {
  let { $refs } = (getCurrentInstance() as any).proxy;
  refs = $refs;
  bg = refs.base_container;

  appRenderer = new Copper.copperRendererOnDemond(bg, {
    guiOpen: true,
    // camera: true,
    performance: true,
    // light: true,
  });

  // appRenderer.getCurrentScene().createDemoMesh();
  //   const scene = appRenderer.createScene("human") as Copper.copperSceneOnDemond;
  loadModel("/copper3d_examples/test.glb", "test");
  //   const scene = appRenderer.createScene("human") as Copper.copperSceneOnDemond;
  //   scene.initCopperSceneOnDemond();
  //   appRenderer.setCurrentScene(scene);
  appRenderer.animate();
});

function loadModel(url: string, name: string) {
  scene = appRenderer.getSceneByName(name) as Copper.copperSceneOnDemond;
  if (scene == undefined) {
    scene = appRenderer.createScene(name) as Copper.copperSceneOnDemond;
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
      appRenderer.setCurrentScene(scene);
      if (name === "test") {
        scene.loadGltf(url, (content) => {
          console.log(content);
          appRenderer.animate();
          scene &&
            scene.pickModel(
              content,
              (mesh) => {
                if (mesh && mesh.name === "whole-heart") {
                  document.addEventListener("click", funa);
                } else {
                  document.removeEventListener("click", funa);
                }
                appRenderer.animate();
              },
              opt
            );
        });
      }
      scene.loadViewUrl("/copper3d_examples/human_view.json");
      // -103.47044074808355, y: 20.52031455124488, z: 0.19999999999998863
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

      scene.updateBackground("#00467F", "#BA4482");
    }
    Copper.setHDRFilePath("/copper3d_examples/venice_sunset_1k.hdr");
    appRenderer.updateEnvironment();
  }
}
function getPosition(event: MouseEvent) {
  console.log(scene);
  const pos = Copper.convertScreenPosto3DPos(
    bg,
    scene?.camera as THREE.PerspectiveCamera,
    {
      x: event.clientX,
      y: event.clientY,
    }
  );
  console.log(pos);
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
  top: 150px;
  left: 2px;
}
</style>

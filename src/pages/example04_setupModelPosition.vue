<template>
  <div id="bg" ref="base_container" @click="getPosition">
    <!-- <div id="bg" ref="base_container"> -->
    <div ref="c_gui" id="gui"></div>
    <div class="btn">
      <button @click="loadModel('/copper3d_examples/Healthy.glb', 'health')">
        Health
      </button>
      <button @click="loadModel('/copper3d_examples/Minor.glb', 'minor')">
        Minor
      </button>
      <button @click="loadModel('/copper3d_examples/Normal.glb', 'normal')">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { GUI } from "dat.gui";
// import * as Copper from "../ts/index";
import * as Copper from "copper3d_visualisation";
import "copper3d_visualisation/dist/css/style.css";
import { getCurrentInstance, onMounted, ref } from "vue";

let refs = null;
let appRenderer: Copper.copperRenderer;
let oldScene = null;
let viewpoint: Copper.CameraViewPoint | undefined;
let scene: Copper.copperScene | undefined;
let allScenes: Array<Copper.copperScene> = [];
let bg: HTMLDivElement = ref<any>(null);
let c_gui: HTMLDivElement = ref<any>(null);
onMounted(() => {
  let { $refs } = (getCurrentInstance() as any).proxy;
  refs = $refs;

  bg = refs.base_container;
  c_gui = refs.c_gui;

  appRenderer = new Copper.copperRenderer(bg, {
    guiOpen: true,
    camera: true,
    performance: true,
    light: true,
  });
  // appRenderer.gui.closed = true;
  appRenderer.closeGui();
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
        scene.loadGltf(url, (content) => {
          scene?.setModelPosition(content, { y: 7 });
          if (viewpoint) {
            //    share camera
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
          scene.loadViewUrl("/copper3d_examples/noInfarct_view_p.json");
          Copper.addLabelToScene(
            scene,
            "left ventricle",
            -51.056679,
            12.82123313284426,
            5.421283,
            60.0
          );
          Copper.addLabelToScene(
            scene,
            "right ventricle",
            -44.323991175632,
            50.1417335930078,
            10.421283,
            60.0
          );
        }
      }
      scene.updateBackground("#5454ad", "#18e5a7");
    }
    Copper.setHDRFilePath("/copper3d_examples/venice_sunset_1k.hdr");
    appRenderer.updateEnvironment();
  } else {
    if (viewpoint) scene.updateCamera(viewpoint);
    appRenderer.setCurrentScene(scene);
  }
}

function sharePosition(scene: Copper.copperScene) {
  const target = [-0.9551143646240234, 2.91867446899414, 2.7563438415527344];
  viewpoint = scene.setViewPoint(
    scene.camera as THREE.PerspectiveCamera,
    target
  );
}

function reset() {
  viewpoint = undefined;
  allScenes.forEach((scene) => {
    scene.resetView();
    if (scene.isHalfed) {
      console.log(scene.isHalfed);
    }
  });
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
  }, 1000);
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
  top: 400px;
  left: 2px;
  z-index: 100;
}
</style>

<template>
  <div id="bg" ref="base_container">
    <div ref="c_gui" id="gui"></div>
    <div ref="c_gui_2" id="gui_2"></div>
    <button class="btn" ref="btn" @click="reset">reset</button>
    <NavBar
      @on-slice-change="getSliceChangedNum"
      :min="min"
      :max="max"
    ></NavBar>
  </div>
</template>

<script setup lang="ts">
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { GUI } from "dat.gui";
import * as Copper from "../ts/index";
// import * as Copper from "copper3d_visualisation";
// import "copper3d_visualisation/dist/css/style.css";
// import "../ts/css/style.css";
import { getCurrentInstance, onMounted, ref } from "vue";

import NavBar from "../components/NavBar.vue";

let refs = null;
// let bg: HTMLDivElement = ref<any>(null);

// let c_gui: HTMLDivElement = ref<any>(null);
let base_container = ref<HTMLDivElement>();

let c_gui = ref<HTMLDivElement>();
let appRenderer: Copper.copperMSceneRenderer;
let nrrdTools: Copper.nrrd_tools;
let loadBar1: Copper.loadingBarType;
let loadBar2: Copper.loadingBarType;
let loadBar3: Copper.loadingBarType;
let loadBar4: Copper.loadingBarType;
let loadBar5: Copper.loadingBarType;

let readyMain = ref(false);
let readyC1 = ref(false);
let readyC2 = ref(false);
let readyC3 = ref(false);
let readyC4 = ref(false);

let min = ref(0);
let max = ref(0);

onMounted(() => {
  let { $refs } = (getCurrentInstance() as any).proxy;
  refs = $refs;
  // bg = refs.base_container;
  // c_gui = refs.c_gui;

  appRenderer = new Copper.copperMSceneRenderer(
    base_container.value as HTMLDivElement,
    1
  );
  nrrdTools = new Copper.nrrd_tools(appRenderer.sceneInfos[0].container);
  // nrrdTools.addContrastDisplay();
  nrrdTools.setContrastDisplayInMainArea();
  loadBar1 = Copper.loading();
  nrrdTools.mainDisplayArea.appendChild(loadBar1.loadingContainer);

  // const gui = appRenderer.sceneInfos[0].gui;
  // const s = {
  //   size: 200,
  // };
  // gui
  //   .add(s, "size")
  //   .min(100)
  //   .max(400)
  //   .onChange((size) => {
  //     nrrdTools.setContrastSize(size, size);
  //     nrrdTools.updateContrastArea();
  //   });

  appRenderer.sceneInfos[0].addSubView();

  // appRenderer.sceneInfos[0].setControls(1);
  // ax dyn 1st pass
  // ax dyn 2nd pass
  // ax dyn 3rd pass
  // ax dyn 4th pass
  loadNrrd(
    "/copper3d_examples/nrrd/segmentation/ax dyn pre.nrrd",
    "nrrd0",
    appRenderer.sceneInfos[0],
    c_gui
  );

  appRenderer.animate();
});

const getSliceChangedNum = (sliceNum: number) => {
  if (readyMain && readyC1 && readyC2 && readyC3 && readyC4) {
    // nrrdTools.setSyncsliceNum();
    // nrrdTools.updateIndex(sliceNum);

    nrrdTools.setSliceMoving(sliceNum);
  }
};

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
  // const opts: Copper.optsType = {
  //   openGui: true,
  //   container: c_gui,
  // };

  const mainPreArea = (
    volume: any,
    nrrdMesh: Copper.nrrdMeshesType,
    nrrdSlices: Copper.nrrdSliceType
    // gui?: GUI
  ) => {
    /**
     * for test 1 view
     * */
    appRenderer.sceneInfos[0].loadViewUrl("/copper3d_examples/nrrd_view.json");
    // appRenderer.sceneInfos[0].scene.add(nrrdMesh.z);

    appRenderer.sceneInfos[0].subScene.add(nrrdMesh.z);
    nrrdTools.setVolumeAndSlice(volume, nrrdSlices.z);

    readyMain.value = true;

    max.value = nrrdTools.getMaxSliceNum();
    nrrdTools.dragImageWithMode(sceneIn.controls as TrackballControls, {
      mode: "mode1",
      showNumber: true,
    });
    nrrdTools.draw(sceneIn.controls as TrackballControls, sceneIn, sceneIn.gui);
    appRenderer.sceneInfos[0].addPreRenderCallbackFunction(nrrdTools.start);
  };
  const contrast1Area = (
    volume: any,
    nrrdMesh: Copper.nrrdMeshesType,
    nrrdSlices: Copper.nrrdSliceType
  ) => {
    nrrdTools.setContrast1OriginCanvas(nrrdSlices.z);
    readyC1.value = true;
  };
  const contrast2Area = (
    volume: any,
    nrrdMesh: Copper.nrrdMeshesType,
    nrrdSlices: Copper.nrrdSliceType
  ) => {
    nrrdTools.setContrast2OriginCanvas(nrrdSlices.z);
    readyC2.value = true;
  };
  const contrast3Area = (
    volume: any,
    nrrdMesh: Copper.nrrdMeshesType,
    nrrdSlices: Copper.nrrdSliceType
  ) => {
    nrrdTools.setContrast3OriginCanvas(nrrdSlices.z);
    readyC3.value = true;
  };
  const contrast4Area = (
    volume: any,
    nrrdMesh: Copper.nrrdMeshesType,
    nrrdSlices: Copper.nrrdSliceType
  ) => {
    nrrdTools.setContrast4OriginCanvas(nrrdSlices.z);
    readyC4.value = true;
  };
  if (sceneIn) {
    sceneIn?.loadNrrd(url, loadBar1, mainPreArea);
    sceneIn?.loadNrrd(
      "/copper3d_examples/nrrd/segmentation/ax dyn 1st pass.nrrd",
      loadBar1,
      contrast1Area
    );
    sceneIn?.loadNrrd(
      "/copper3d_examples/nrrd/segmentation/ax dyn 2nd pass.nrrd",
      loadBar1,
      contrast2Area
    );
    sceneIn?.loadNrrd(
      "/copper3d_examples/nrrd/segmentation/ax dyn 3rd pass.nrrd",
      loadBar1,
      contrast3Area
    );
    sceneIn?.loadNrrd(
      "/copper3d_examples/nrrd/segmentation/ax dyn 4th pass.nrrd",
      loadBar1,
      contrast4Area
    );

    sceneIn.loadViewUrl("/copper3d_examples/nrrd_view.json");
  }
  sceneIn.updateBackground("#18e5a7", "#ff00ff");
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
  width: 10vw;
  height: 10vh;

  z-index: 100;
}
.copper3d_sliceNumber {
  position: fixed !important;
  width: 300px;
  text-align: center;
  top: 5% !important;
  right: 1% !important;
  // top: 50px !important;
  left: 0px !important;
  margin: 0 auto;
  border: 1px solid salmon;
  border-radius: 10px;
  padding: 5px;
  color: crimson;
}
.copper3D_scene_div {
  display: flex;
  justify-content: center;
  align-items: center;
}
.copper3D_loading_progress {
  color: crimson !important;
}
// .copper3D_scene_div {
//   display: grid;
//   grid-template-areas:
//     "z z m m m"
//     "c1 c2 m m m"
//     "c1 c2 m m m"
//     "c1 c2 m m m"
//     "c3 c4 m m m"
//     "c3 c4 m m m"
//     "c3 c4 m m m"
//     "b b m m m";
//   gap: 10px;
// }
// .copper3D_mainDisplay {
//   position: relative;
//   grid-area: m;
//   z-index: 10;
// }
// .copper3D_contrast1 {
//   grid-area: c1;
//   background-color: rgba(130, 39, 39, 0.1);
// }
// .copper3D_contrast2 {
//   grid-area: c2;
//   background-color: rgba(102, 51, 153, 0.3);
// }
// .copper3D_contrast3 {
//   grid-area: c3;
//   background-color: rgba(126, 60, 60, 0.3);
// }
// .copper3D_contrast4 {
//   grid-area: c4;
//   background-color: rgba(45, 192, 19, 0.3);
// }
</style>

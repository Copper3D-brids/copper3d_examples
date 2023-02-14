<template>
  <!-- <div id="bg" ref="base_container" @click="getPosition"> -->
  <div id="bg" ref="base_container">
    <div ref="c_gui_ref" id="gui"></div>
    <div ref="nrrd_c_ref" class="nrrd_c"></div>
    <NavBar
      :file-num="fileNum"
      :max="max"
      :immediate-slice-num="immediateSliceNum"
      :contrast-index="contrastNum"
      :init-slice-index="initSliceIndex"
      @on-slice-change="getSliceChangedNum"
      @reset-main-area-size="resetMainAreaSize"
      @on-change-orientation="resetSlicesOrientation"
      @on-open-dialog="onOpenDialog"
    ></NavBar>
    <Upload
      :dialog="dialog"
      @on-close-dialog="onCloseDialog"
      @get-load-files-urls="readyToLoad"
    ></Upload>
  </div>
</template>

<script setup lang="ts">
import * as Copper from "../ts/index";
// import * as Copper from "copper3d_visualisation";
// import "copper3d_visualisation/dist/css/style.css";

import { GUI } from "dat.gui";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { getCurrentInstance, onMounted, ref, watchEffect, reactive } from "vue";
import NavBar from "../components/NavBar.vue";
import Upload from "../components/Upload.vue";
import axios from "axios";

// let refs = null;
let appRenderer: Copper.copperRenderer;
let max = ref(0);
let immediateSliceNum = ref(0);
let contrastNum = ref(0);
let dialog = ref(false);
let initSliceIndex = ref(0);

let scene: Copper.copperScene | undefined;
let base_container = ref<HTMLDivElement>();
let c_gui_ref = ref<HTMLDivElement>();
let nrrd_c_ref = ref<HTMLDivElement>();
let bg: HTMLDivElement;
let c_gui: HTMLDivElement;
let nrrd_c: HTMLDivElement;
let pre_slices = ref();

let gui = new GUI({ width: 300, autoPlace: false });
let selectedContrastFolder: GUI;
let nrrdTools: Copper.nrrd_tools;
let loadBarMain: Copper.loadingBarType;
let urls: Array<string> = [];

let filesCount = ref(0);

let firstLoad = true;

let allSlices: Array<any> = [];
let fileNum = ref(0);

type selecedType = {
  [key: string]: boolean;
};

onMounted(() => {
  // let { $refs } = (getCurrentInstance() as any).proxy;
  // refs = $refs;

  bg = base_container.value as HTMLDivElement;
  c_gui = c_gui_ref.value as HTMLDivElement;
  nrrd_c = nrrd_c_ref.value as HTMLDivElement;

  c_gui.appendChild(gui.domElement);
  appRenderer = new Copper.copperRenderer(bg);
  loadBarMain = Copper.loading();

  nrrdTools = new Copper.nrrd_tools(nrrd_c);
  nrrd_c.appendChild(loadBarMain.loadingContainer);

  // nrrdTools.setContrastDisplayInMainArea(5);
  // nrrdTools.setShowInMainArea(false);
  // nrrdTools.mainDisplayArea.appendChild(loadBarMain.loadingContainer);

  // const urls = [
  //   "/copper3d_examples/nrrd/segmentation/ax dyn pre.nrrd",
  //   "/copper3d_examples/nrrd/segmentation/ax dyn 1st pass.nrrd",
  //   "/copper3d_examples/nrrd/segmentation/ax dyn 2nd pass.nrrd",
  //   "/copper3d_examples/nrrd/segmentation/ax dyn 3rd pass.nrrd",
  //   "/copper3d_examples/nrrd/segmentation/ax dyn 4th pass.nrrd",
  // ];

  loadModel("nrrd_tools");
  document.addEventListener("keydown", (e) => {
    if (e.code === "KeyF") {
      Copper.fullScreenListenner(bg);
    }
  });

  const state = {
    showContrast: false,
  };

  // gui.add(state, "showContrast").onChange((flag) => {
  //   nrrdTools.setShowInMainArea(flag);
  //   isAxisClicked.value = false;
  //   isShowContrast.value = flag;
  //   if (flag) {
  //     max.value = nrrdTools.getMaxSliceNum()[1];
  //   } else {
  //     max.value = nrrdTools.getMaxSliceNum()[0];
  //   }
  // });
  selectedContrastFolder = gui.addFolder("select display contrast");
  appRenderer.animate();
});

const readyToLoad = (urlsArray: Array<string>) => {
  fileNum.value = urlsArray.length;
  urls = urlsArray;
  if (urls.length > 0) loadAllNrrds(urls);
};

const onOpenDialog = (flag: boolean) => {
  dialog.value = flag;
};
const onCloseDialog = (flag: boolean) => {
  dialog.value = flag;
};

const resetSlicesOrientation = (axis: "x" | "y" | "z") => {
  nrrdTools.setSliceOrientation(axis);
  max.value = nrrdTools.getMaxSliceNum()[1];
  const { currentIndex, contrastIndex } =
    nrrdTools.getCurrentSlicesNumAndContrastNum();
  immediateSliceNum.value = currentIndex;
  contrastNum.value = contrastIndex;
  // const status = nrrdTools.getIsShowContrastState();
  // isAxisClicked.value = true;
  // if (status) {
  //   max.value = nrrdTools.getMaxSliceNum()[1];
  // } else {
  //   max.value = nrrdTools.getMaxSliceNum()[0];
  // }
};
const getSliceChangedNum = (sliceNum: number) => {
  // if (
  //   readyMain.value &&
  //   readyC1.value &&
  //   readyC2.value &&
  //   readyC3.value &&
  //   readyC4.value
  // ) {

  // }

  nrrdTools.setSliceMoving(sliceNum);
};

// const loadTestJsonMasks = () => {
//   let { loadingContainer, progress } = loadBarMain;
//   loadingContainer.style.display = "flex";
//   progress.innerText = "Loading masks data......";

//   const xhr = new XMLHttpRequest();
//   xhr.open("GET", "/copper3d_examples/copper3D_export data_z.json", true);
//   xhr.responseType = "json";
//   xhr.onload = function () {
//     if (xhr.status === 200) {
//       const data = xhr.response;
//       loadingContainer.style.display = "none";
//       nrrdTools.setMasksData(data, loadBarMain);
//     }
//   };
//   xhr.send();
// };

// const getMaskData = (
//   masksa: Copper.paintImageType[],
//   len: number,
//   width: number,
//   height: number
// ) => {
//   const masks = nrrdTools.restructData(masksa, len, width, height);
//   // const masks = [12, 2, 2, 3];
//   axios.post("http://127.0.0.1:8000/save_mask", { masks, len, width, height });
// };

const restructData = async (
  originArr: Copper.paintImageType[],
  len: number,
  width: number,
  height: number
) => {
  const reformatData = [];
  // const convertCanvas = document.createElement("canvas");
  // const convertCtx = convertCanvas.getContext(
  //   "2d"
  // ) as CanvasRenderingContext2D;
  console.log("here");

  for (let i = 0; i < len; i++) {
    let exportTemp = {
      sliceIndex: 0,
      dataFormat:
        "RGBA - Each successive 4-digit number forms a pixel point in data array",
      width,
      height,
      voxelSpacing: 0,
      spaceOrigin: 0,
      data: [],
    };
    exportTemp.sliceIndex = originArr[i].index;

    const imageData = originArr[i].image;

    const temp = Array.from(imageData.data).map((x) => Number(x));
    // for (let j = 0; j < imageData.data.length; j++) {
    //   temp.push(imageData.data[j]);
    // }

    (exportTemp as any).data = temp;
    reformatData.push(exportTemp);
  }
  return reformatData;
};

const worker = new Worker(new URL("../utils/worker", import.meta.url), {
  type: "module",
});

worker.postMessage("a");
worker.onmessage = function (ev: MessageEvent) {
  const r = ev.data;
  console.log(r);
};
const sendMaskToBackend = () => {
  setInterval(async () => {
    const masksData = nrrdTools.paintImages.z;
    const dimensions = nrrdTools.getCurrentImageDimension();
    const len = masksData.length;
    const width = dimensions[0];
    const height = dimensions[1];
    if (len > 0) {
      const masks = await restructData(masksData, len, width, height);
      console.log("a");

      await axios.post("http://127.0.0.1:8000/save_mask", {
        masks,
        len,
        width,
        height,
      });
      console.log("send");
    }
  }, 20000);
};

watchEffect(() => {
  if (
    filesCount.value != 0 &&
    allSlices.length != 0 &&
    filesCount.value === urls.length
  ) {
    console.log("All files ready!");

    nrrdTools.clear();
    allSlices.sort((a: any, b: any) => {
      return a.order - b.order;
    });
    nrrdTools.setShowInMainArea(true);
    nrrdTools.setAllSlices(allSlices);
    initSliceIndex.value = nrrdTools.getCurrentSliceIndex();

    const getSliceNum = (index: number, contrastindex: number) => {
      immediateSliceNum.value = index;
      contrastNum.value = contrastindex;
    };
    // loadTestJsonMasks();
    if (firstLoad) {
      nrrdTools.drag({
        showNumber: true,
        getSliceNum,
      });
      nrrdTools.draw(scene as Copper.copperScene, gui);

      scene?.addPreRenderCallbackFunction(nrrdTools.start);
      sendMaskToBackend();
    } else {
      nrrdTools.redrawMianPreOnDisplayCanvas();
    }

    max.value = nrrdTools.getMaxSliceNum()[1];
    setTimeout(() => {
      initSliceIndex.value = 0;
      filesCount.value = 0;
    }, 1000);
    firstLoad = false;

    const selectedState: selecedType = {};

    for (let i = 0; i < allSlices.length; i++) {
      if (i == 0) {
        selectedState["pre"] = true;
      } else {
        const key = "contrast" + i;
        selectedState[key] = true;
      }
    }

    nrrdTools.removeGuiFolderChilden(selectedContrastFolder);
    for (let i = 0; i < allSlices.length; i++) {
      let name = "";
      i === 0 ? (name = "pre") : (name = "contrast" + i);
      selectedContrastFolder.add(selectedState, name).onChange((flag) => {
        if (flag) {
          fileNum.value += 1;
          nrrdTools.addSkip(i);
        } else {
          fileNum.value -= 1;
          nrrdTools.removeSkip(i);
        }
        const maxNum = nrrdTools.getMaxSliceNum()[1];
        if (maxNum) {
          max.value = maxNum;

          // update 1.12.19
          const { currentIndex, contrastIndex } =
            nrrdTools.getCurrentSlicesNumAndContrastNum();
          immediateSliceNum.value = currentIndex;
          contrastNum.value = contrastIndex + 1;
        }
      });
    }
  }
});

const resetMainAreaSize = (factor: number) => {
  nrrdTools.setMainAreaSize(factor);
};
function loadModel(name: string) {
  scene = appRenderer.getSceneByName(name) as Copper.copperScene;
  if (scene == undefined) {
    scene = appRenderer.createScene(name) as Copper.copperScene;

    if (scene) {
      // const sub = scene.addSubView();
      // nrrd_c.appendChild(sub);
      appRenderer.setCurrentScene(scene);

      if (scene) {
        // loadAllNrrds(urls);
        scene.loadViewUrl("/copper3d_examples/nrrd_view.json");
      }
      // scene.updateBackground("#18e5a7", "#ff00ff");
      Copper.setHDRFilePath("/copper3d_examples/venice_sunset_1k.hdr");

      scene.updateBackground("#5454ad", "#18e5a7");
    }

    // Copper.setHDRFilePath("/copper3d_examples/footprint_court_2k.hdr");

    appRenderer.updateEnvironment();
  }
}

const loadAllNrrds = (urls: Array<string>) => {
  allSlices = [];
  const mainPreArea = (
    volume: any,
    nrrdMesh: Copper.nrrdMeshesType,
    nrrdSlices: Copper.nrrdSliceType
    // gui?: GUI
  ) => {
    const newNrrdSlice = Object.assign(nrrdSlices, { order: 0 });
    allSlices.push(newNrrdSlice);
    // scene?.subScene.add(nrrdMesh.z);
    pre_slices.value = nrrdSlices;

    // readyMain.value = true;
    filesCount.value += 1;
  };
  scene?.loadNrrd(urls[0], loadBarMain, mainPreArea);

  for (let i = 1; i < urls.length; i++) {
    scene?.loadNrrd(
      urls[i],
      loadBarMain,
      (
        volume: any,
        nrrdMesh: Copper.nrrdMeshesType,
        nrrdSlices: Copper.nrrdSliceType
      ) => {
        const newNrrdSlice = Object.assign(nrrdSlices, { order: i });
        allSlices.push(newNrrdSlice);
        filesCount.value += 1;
      }
    );
  }
};
</script>

<style>
#bg {
  width: 100vw;
  height: 100vh;
  /* border: 1px solid palevioletred; */
  overflow: hidden;
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
  top: 1px;
  right: 0px;
  z-index: 100;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.nrrd_c {
  position: fixed;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.copper3d_sliceNumber {
  position: fixed !important;
  width: 300px;
  text-align: center;
  top: 5% !important;
  right: 1% !important;
  left: 0px !important;
  margin: 0 auto;
  border: 1px solid salmon;
  border-radius: 10px;
  padding: 5px;
  color: crimson;
}
.copper3D_loading_progress {
  color: crimson !important;
}
</style>

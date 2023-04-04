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
import JSZip from "jszip";
import { pruningData } from "../utils/worker";
import { url } from "inspector";

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
let timer: any;

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
};
const getSliceChangedNum = (sliceNum: number) => {
  nrrdTools.setSliceMoving(sliceNum);
};

const loadTestJsonMasks = () => {
  let { loadingContainer, progress } = loadBarMain;
  loadingContainer.style.display = "flex";
  progress.innerText = "Loading masks data......";

  const xhr = new XMLHttpRequest();
  xhr.open("GET", "/copper3d_examples/myjson.json", true);
  xhr.responseType = "json";
  xhr.onload = function () {
    if (xhr.status === 200) {
      const data = xhr.response;
      loadingContainer.style.display = "none";
      nrrdTools.setMasksData(data, loadBarMain);
    }
  };
  xhr.send();
};

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

const worker = new Worker(new URL("../utils/worker", import.meta.url), {
  type: "module",
});

worker.onmessage = function (ev: MessageEvent) {
  const result = ev.data;
  const body = {
    caseId: "case2",
    masks: result.masks,
  };
  let start_c: unknown = new Date();
  axios.post("http://127.0.0.1:8000/api/mask/init", body);
  let end_c: unknown = new Date();
  let timeDiff_c = (end_c as number) - (start_c as number);
  console.log(`axios send Time taken: ${timeDiff_c}ms`);
  console.log("send");
};

const sendMaskToBackend = () => {
  timer = setInterval(async () => {
    const masksData = nrrdTools.paintImages.z;
    const dimensions = nrrdTools.getCurrentImageDimension();
    const len = masksData.length;
    const width = dimensions[0];
    const height = dimensions[1];
    if (len > 0) {
      worker.postMessage({ masksData, len, width, height });
      // const masks = await restructData(masksData, len, width, height);
      // console.log("a");
    }
  }, 60000);
};

const getMaskData = (image: ImageData, sliceId: number) => {
  console.log(image);
  console.log(sliceId);
};

watchEffect(() => {
  if (
    filesCount.value != 0 &&
    allSlices.length != 0 &&
    filesCount.value === urls.length
  ) {
    console.log("All files ready!");
    if (!!timer) {
      clearInterval(timer);
    }
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
      nrrdTools.draw(scene as Copper.copperScene, gui, { getMaskData });

      scene?.addPreRenderCallbackFunction(nrrdTools.start);
      // sendMaskToBackend();
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
        let c = "a";
        const a = () => {
          console.log(c);
        };
        let index = scene.addPreRenderCallbackFunction(a);
        setTimeout(() => {
          scene?.removePreRenderCallbackFunction(index);
        }, 1000);
        setTimeout(() => {
          if ((a as any).id) {
            (a as any).id = undefined;
          }

          index = scene?.addPreRenderCallbackFunction(() => {
            console.log("dssadsa");
          }) as number;
        }, 2000);
        setTimeout(() => {
          scene?.removePreRenderCallbackFunction(index);
        }, 3000);
        axios
          .get("http://127.0.0.1:8000/api/case?name=case1", {
            responseType: "blob",
          })
          .then((res) => {
            // Use the blob object to extract the contents of the zip archive
            const zip = new JSZip();
            // Extract the contents of the zip archive
            zip.loadAsync(res.data).then((contents) => {
              for (let prop in contents.files) {
                console.log(typeof prop);
                // if (contents.files.hasOwnProperty(prop)) {
                //   console.log(prop);
                // }
              }

              const n1 = contents.files["import_nrrd/case1/new_0.nrrd"];
              const n2 = contents.files["import_nrrd/case1/new_1.nrrd"];
              const n3 = contents.files["import_nrrd/case1/new_2.nrrd"];
              const n4 = contents.files["import_nrrd/case1/new_3.nrrd"];
              const n5 = contents.files["import_nrrd/case1/new_4.nrrd"];
              //  Read the contents of each file as an array buffer
              const promises = [
                n1.async("arraybuffer"),
                n2.async("arraybuffer"),
                n3.async("arraybuffer"),
                n4.async("arraybuffer"),
                n5.async("arraybuffer"),
              ];
              Promise.all(promises).then((values) => {
                const urls: string[] = [];
                values.forEach((item) => {
                  urls.push(URL.createObjectURL(new Blob([item])));
                });
                readyToLoad(urls);
              });
            });
          });
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
  scene?.loadNrrd(urls[0], loadBarMain, true, mainPreArea);

  for (let i = 1; i < urls.length; i++) {
    scene?.loadNrrd(
      urls[i],
      loadBarMain,
      true,
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
  /* width: 100%;
  height: 100%; */
  /* border: 1px solid palevioletred; */
  z-index: 1001;
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
  /* width: 100vw;
  height: 100vh; */
  width: 100%;
  height: 100%;
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

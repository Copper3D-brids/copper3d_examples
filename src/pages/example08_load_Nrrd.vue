<template>
  <div class="container">
    <div class="left">left</div>
    <div id="bg" ref="base_container">
      <div ref="c_gui" id="gui"></div>
      <div ref="c_gui_2" id="gui_2"></div>
      <button class="btn" ref="btn" @click="reset">reset</button>
    </div>
  </div>
  <!-- <div id="bg" ref="base_container">
    <div ref="c_gui" id="gui"></div>
    <div ref="c_gui_2" id="gui_2"></div>
    <button class="btn" ref="btn" @click="reset">reset</button>
  </div> -->
</template>

<script setup lang="ts">
import { GUI } from "dat.gui";
import * as THREE from "three";
import * as Copper from "../ts/index";
// import * as Copper from "copper3d_visualisation";
import "copper3d_visualisation/dist/css/style.css";
import { getCurrentInstance, onMounted, ref } from "vue";

let refs = null;
let bg: HTMLDivElement = ref<any>(null);
let appRenderer: Copper.copperMSceneRenderer;
let c_gui: HTMLDivElement = ref<any>(null);
let nrrdTools: Copper.nrrd_tools;
let loadBar1: Copper.loadingBarType;
let loadBar2: Copper.loadingBarType;

onMounted(() => {
  let { $refs } = (getCurrentInstance() as any).proxy;
  refs = $refs;
  bg = refs.base_container;
  c_gui = refs.c_gui;

  appRenderer = new Copper.copperMSceneRenderer(bg, 2);
  nrrdTools = new Copper.nrrd_tools(appRenderer.sceneInfos[0].container);
  loadBar1 = Copper.loading();
  loadBar2 = Copper.loading();

  appRenderer.sceneInfos[0].container.appendChild(loadBar1.loadingContainer);

  loadNrrd(
    "/copper3d_examples/nrrd/breast-224.nrrd",
    "/copper3d_examples/nrrd/mesh_spacing.obj",
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
  url_1: string,
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
    console.log(volume);

    const geometry = new THREE.SphereGeometry(5, 32, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });

    const sphere1 = new THREE.Mesh(geometry, material);
    const sphere2 = new THREE.Mesh(geometry, material);
    const sphere3 = new THREE.Mesh(geometry, material);
    const sphere4 = new THREE.Mesh(geometry, material);
    const origin = volume.header.space_origin.map((num: any) => Number(num));
    const spacing = volume.spacing;
    const pixelTspacing = volume.dimensions;
    // sphere1.position.add(new THREE.Vector3(origin[0]+5,origin[1]-13,origin[2]+32))
    // sphere2.position.add(new THREE.Vector3(origin[0]+pixelTspacing[0]*spacing[0]+5, origin[1]-13, origin[2]+32))
    // sphere3.position.add(new THREE.Vector3(origin[0]+pixelTspacing[0]*spacing[0]+5, origin[1]+pixelTspacing[1]*spacing[1]-13, origin[2]+32))
    // sphere4.position.add(new THREE.Vector3(origin[0]+5, origin[1]+pixelTspacing[1]*spacing[1]-13, origin[2]+32))
    sphere1.position.add(
      new THREE.Vector3(origin[0] + 5, origin[1] - 13, origin[2] + 32)
    );
    sphere2.position.add(
      new THREE.Vector3(
        origin[0] + pixelTspacing[0] * spacing[0] + 5,
        origin[1] - 13,
        origin[2] + 32
      )
    );
    sphere3.position.add(
      new THREE.Vector3(
        origin[0] + pixelTspacing[0] * spacing[0] + 5,
        origin[1] + pixelTspacing[1] * spacing[1] - 13,
        origin[2] + 32
      )
    );
    sphere4.position.add(
      new THREE.Vector3(
        origin[0] + 5,
        origin[1] + pixelTspacing[1] * spacing[1] - 13,
        origin[2] + 32
      )
    );
    appRenderer.sceneInfos[0].addObject(sphere1);
    appRenderer.sceneInfos[0].addObject(sphere2);
    appRenderer.sceneInfos[0].addObject(sphere3);
    appRenderer.sceneInfos[0].addObject(sphere4);
    (gui as GUI)
      .add(sphere1.position as any, "x")
      .max(500)
      .min(-500)
      .step(1);
    (gui as GUI)
      .add(sphere1.position as any, "y")
      .max(500)
      .min(-500)
      .step(1);

    appRenderer.sceneInfos[0].scene.add(nrrdMesh.x, nrrdMesh.y, nrrdMesh.z);
    // appRenderer.sceneInfos[0].scene.add(nrrdMesh.y);
    // appRenderer.sceneInfos[0].scene.add(nrrdMesh.z);
    appRenderer.sceneInfos[1].loadViewUrl("/copper3d_examples/nrrd_view.json");
    // appRenderer.sceneInfos[0].setCameraPosition({ x: 300, z: 0 });

    // raycaster
    // sceneIn.container.onclick = (ev) => {
    //   const x = ev.offsetX;
    //   const y = ev.offsetY;
    //   const a = sceneIn.pickSpecifiedModel(nrrdMesh.x, { x, y });
    //   console.log(a);
    // };

    // appRenderer.sceneInfos[1].scene.add(nrrdMesh.z);

    // nrrdTools.setSlice(nrrdSlices.z);
    // nrrdTools.dragImageWithMode(sceneIn.controls as TrackballControls, {
    //   mode: "mode0",
    //   showNumber: true,
    // });
  };
  if (sceneIn) {
    sceneIn?.loadNrrd(url, loadBar1, true, funa, opts);
    sceneIn?.loadOBJ(url_1, (content) => {
      console.log(content);
      //  content.position.set(5, -43, 32);
      //  content.traverse((child)=>{
      //       if(child as THREE.Mesh){
      //         ((child as THREE.Mesh).material as THREE.MeshStandardMaterial).color = new THREE.Color("#4aede0")
      //       }
      //  })
      // ((content.children[2] as THREE.Mesh).material as THREE.MeshStandardMaterial).color = new THREE.Color("#4aede0")
    });
    sceneIn.loadViewUrl("/copper3d_examples/nrrd_view.json");
  }
  sceneIn.updateBackground("#18e5a7", "#000");
  Copper.setHDRFilePath("venice_sunset_1k.hdr");
  appRenderer.updateEnvironment(sceneIn);
}
</script>

<style lang="scss">
.container {
  display: grid;
  grid-template-columns: 20% 80%;
  height: 100vh;
}
#bg {
  width: 100%;
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

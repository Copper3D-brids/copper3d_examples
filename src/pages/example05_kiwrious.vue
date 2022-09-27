<template>
  <div id="bg" ref="base_container">
    <div id="kiwrious">
      <button
        class="grid-child"
        id="btn-kiwrious-connect"
        ref="btn_kiwrious_connect"
      >
        Connect Kiwrious
      </button>
      <button
        class="grid-child"
        id="btn-kiwrious-disconnect"
        ref="btn_kiwrious_disconnect"
      >
        Disconnect Kiwrious
      </button>
      <div
        class="rightChartDescription"
        id="kiwrious-value"
        ref="kiwriousValues"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as Copper from "../ts/index";
import { GUI } from "dat.gui";
// import * as Copper from "copper3d_visualisation";
// import "copper3d_visualisation/dist/css/style.css";
import { getCurrentInstance, onMounted, ref } from "vue";

// import * as kiwrious from "copper3d_plugin_heart_k";

let refs = null;
let appRenderer: Copper.copperRenderer;
let oldScene = null;
let viewpoint: Copper.CameraViewPoint | undefined;
let scene: Copper.copperScene | undefined;
let bg: HTMLDivElement = ref<any>(null);

let connect: HTMLButtonElement = ref<any>(null);
let disconnect: HTMLButtonElement = ref<any>(null);
let kiwriousValue: HTMLDivElement = ref<any>(null);

onMounted(() => {
  // console.log(Copper.kiwrious.serialService);
  console.log("update>>>>>>*success----->>*****||||*****>>>>--->");

  let { $refs } = (getCurrentInstance() as any).proxy;
  refs = $refs;

  bg = refs.base_container;
  connect = refs.btn_kiwrious_connect;
  disconnect = refs.btn_kiwrious_disconnect;
  kiwriousValue = refs.kiwriousValues;

  appRenderer = new Copper.copperRenderer(bg, {
    guiOpen: true,
    camera: true,
    performance: true,
    light: true,
  });

  startKiwrious();
  appRenderer.closeGui();
  appRenderer.animate();
});

// function startKiwrious() {
//   const connectionCallback = (isConnected: boolean) => {
//     console.log(isConnected);

//     connect.style.display = isConnected ? "none" : "block";
//     disconnect.style.display = isConnected ? "block" : "none";
//   };
//   const heartDataCallback = (heartData: any, status: string, hrVal: number) => {
//     const val = heartData;

//     console.log(val);

//     kiwriousValue.innerText = status;

//     if (status === "Ready") {
//       kiwriousValue.innerText = (hrVal / 2).toString();
//     }
//   };
//   Copper.configKiwriousHeart(
//     connect,
//     disconnect,
//     "/copper3d_examples/kiwrious-config/prog.bin",
//     "/copper3d_examples/kiwrious-config/libunicorn.out.wasm",
//     connectionCallback,
//     heartDataCallback
//   );
// }

function startKiwrious() {
  console.log(Copper.kiwrious);

  Copper.kiwrious.setBinUrl("/copper3d_examples/kiwrious-config/prog.bin");
  Copper.kiwrious.setWasm(
    "/copper3d_examples/kiwrious-config/libunicorn.out.wasm"
  );

  Copper.kiwrious.serialService.onSerialConnection = (isConnected: boolean) => {
    console.log(isConnected);
    connect.style.display = isConnected ? "none" : "block";
    disconnect.style.display = isConnected ? "block" : "none";
  };
  connect.onclick = async () => {
    connect.disabled = true;
    await Copper.kiwrious.serialService.connectAndReadAsync();
    connect.disabled = false;
  };
  disconnect.onclick = async () => {
    disconnect.disabled = true;
    await Copper.kiwrious.serialService.disconnectAsync();
    disconnect.disabled = false;
  };
  Copper.kiwrious.serialService.onSerialData = (
    decodedData: Copper.SensorReadResult_kiwrious
  ) => {
    const values =
      decodedData.decodedValues as Copper.SensorDecodedValue_kiwrious[];

    const val = values[0].value;
    const status = val.status;
    const hrVal = val.heartrate;

    kiwriousValue.innerText = status;

    if (status === "Ready") {
      kiwriousValue.innerText = (hrVal / 2).toString();
    }
  };
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
#kiwrious {
  position: fixed;
}
</style>

<template>
  <div id="bg">
    <button @click="goRouter(1)">example01</button>
    <button @click="goRouter(2)">example02</button>
    <button @click="goRouter(3)">example03_multiple_scene</button>
    <button @click="goRouter(4)">example04_setupModelPosition</button>
    <button @click="goRouter(5)">example05_kiwrious</button>
    <button @click="goRouter(6)">example06_drag_Nrrd</button>
    <button @click="goRouter(7)">example07_whole_nrrd</button>
    <button @click="goRouter(8)">example08_dragAnddraw_nrrd</button>
    <button @click="goRouter(9)">example09_2d_texture</button>
    <button @click="goRouter(10)">example10_segmentation_v1</button>
    <button @click="goRouter(11)">example10_segmentation_v2</button>
    <button @click="goRouter(12)">example12_2d_texture_heart</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const goRouter = (id: number) => {
  console.log(router);

  if (id >= 10) {
    router.push(`/example${id}`);
  } else {
    router.push(`/example0${id}`);
  }
};
</script>

<style scoped>
#bg {
  position: fixed;
  padding-top: 100px;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  /* padding: 100px; */
  background-color: rgba(33, 141, 199, 0.7);
}
button {
  margin: 5px;
  cursor: pointer;
}
</style>

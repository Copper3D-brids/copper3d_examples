<template>
  <div class="nav">
    <div class="content">
      <el-slider
        v-model="sliceNum"
        :max="p.max"
        @input="onChangeSlider"
        show-input
      />
      <div class="arrows">
        <span @click="onMagnificationClick(0.5)"
          ><ion-icon name="add-circle-outline"></ion-icon
        ></span>
        <span @click="onMagnificationClick(-0.5)"
          ><ion-icon name="remove-circle-outline"></ion-icon
        ></span>
        <span @click="onSwitchSliceOrientation('x')"
          ><ion-icon name="chevron-back-circle-outline"></ion-icon
        ></span>
        <span @click="onSwitchSliceOrientation('z')"
          ><ion-icon name="chevron-down-circle-outline"></ion-icon
        ></span>
        <span @click="onSwitchSliceOrientation('y')"
          ><ion-icon name="chevron-forward-circle-outline"></ion-icon
        ></span>
        <span @click="openDialog">
          <ion-icon name="cloud-upload-outline"></ion-icon>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, watchEffect } from "vue";
type Props = {
  fileNum: number;
  min?: number;
  max?: number;
  initSliceIndex?: number;
  immediateSliceNum?: number;
  contrastIndex?: number;
  isAxisClicked?: boolean;
};
let p = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 160,
  immediateSliceNum: 0,
  contrastIndex: 0,
  fileNum: 0,
  showContrast: false,
  isAxisClicked: false,
});
const state = reactive(p);
const { immediateSliceNum, contrastIndex, initSliceIndex, fileNum } =
  toRefs(state);
const sliceNum = ref(0);
let filesNum = 0;
let currentSliderNum = 0;
let isAxis = false;
let isFileChange = false;

const emit = defineEmits([
  "onSliceChange",
  "resetMainAreaSize",
  "onChangeOrientation",
  "onOpenDialog",
]);

const openDialog = () => {
  emit("onOpenDialog", true);
};

const onSwitchSliceOrientation = (axis: string) => {
  isAxis = true;
  emit("onChangeOrientation", axis);
  isAxis = false;
};

const onMagnificationClick = (factor: number) => {
  // magnification += factor;
  // if (magnification > 8) {
  //   magnification = 8;
  // }
  // if (magnification < 1) {
  //   magnification = 1;
  // }
  emit("resetMainAreaSize", factor);
};

const onChangeSlider = () => {
  // if (currentSliderNum > max.value) {
  //   currentSliderNum = 0;
  // }

  const step = sliceNum.value - currentSliderNum;

  currentSliderNum += step;
  if (!isAxis && !isFileChange) {
    emit("onSliceChange", step);
  }
  isAxis = false;
  isFileChange = false;
};

document.addEventListener("keydown", (ev: KeyboardEvent) => {
  if (ev.key === "ArrowUp") {
    if (currentSliderNum > 0) {
      currentSliderNum -= 1;
      updateSlider();
      emit("onSliceChange", -1);
    }
  }
  if (ev.key === "ArrowDown") {
    if (currentSliderNum < p.max) {
      currentSliderNum += 1;
      updateSlider();
      emit("onSliceChange", 1);
    }
  }
});

const updateSlider = () => {
  sliceNum.value = currentSliderNum;
};

watchEffect(() => {
  currentSliderNum =
    immediateSliceNum.value * fileNum.value + contrastIndex.value;
  updateSlider();
});

watchEffect(() => {
  initSliceIndex?.value &&
    (currentSliderNum = (initSliceIndex?.value as number) * fileNum.value);
  updateSlider();
});

// if (!isAxisClicked.value && showContrast.value) {
//   if (max.value > previousMax) {
//     sliceNum.value = sliceNum.value * filesNum;
//     if (count !== 0) isShowContrast = true;
//     count++;
//   }
//   if (max.value < previousMax) {
//     sliceNum.value = Math.floor(sliceNum.value / filesNum);
//     isShowContrast = false;
//   }
//   preViousSliceNum = sliceNum.value;
//   previousMax = max.value;
// }
</script>

<style lang="scss" scoped>
.el-slider {
  max-width: 35vw;
  // width: 50vw;
  margin-right: 10px;
  --el-slider__bar-bg-color: red !important;
}
.nav {
  position: fixed;
  bottom: 10px;
  height: 60px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.nav .content {
  position: relative;
  width: 70%;
  height: 100%;
  background-color: #edf1f4;
  padding: 0 20px;
  border-radius: 10px;
  box-shadow: 0 30px 30px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav .content .arrows {
  display: flex;
  align-items: center;
}
.nav .content .arrows span {
  position: relative;
  padding: 10px;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.1), -5px -5px 20px #fff;
  margin: 5px;
  cursor: pointer;
  user-select: none;
  min-width: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2em;
  color: #666;
  border: 2px solid #edf1f4;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.1), -5px -5px 10px #fff;
  border-radius: 10px;
  cursor: pointer;
}
.nav .content .arrows span:active {
  box-shadow: inset 5px 5px 10px rgba(0, 0, 0, 0.1), inset -5px -5px 10px #fff;
  color: #f44336;
}
</style>

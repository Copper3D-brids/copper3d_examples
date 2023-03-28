<template>
  <el-button @click="visible = true">
    Open Drawer with customized header
  </el-button>
  <el-drawer :direction="'ltr'" v-model="visible" :show-close="false">
    <slot></slot>
  </el-drawer>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { ElButton, ElDrawer } from "element-plus";
import { CircleCloseFilled } from "@element-plus/icons-vue";

const visible = ref(false);
</script>

<style>
.el-drawer {
  background-color: gray;
  width: 90% !important;
  padding: 0;
}
</style>

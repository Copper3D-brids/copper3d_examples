import Vue, { createApp } from "vue";

import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./style.scss";

import router from "./router";

createApp(App).use(ElementPlus).use(router).mount("#app");

console.log("v2.11.10");

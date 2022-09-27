import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

import router from "./router";

createApp(App).use(router).mount("#app");

console.log("v2.11.10");

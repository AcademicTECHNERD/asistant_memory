import { createApp } from "vue"; // 从 'vue' 中导入 createApp
import { createPinia } from 'pinia';
import App from "./App.vue";
import router from "./router";

const app = createApp(App); // 使用 createApp 创建应用
app.use(router); // 使用路由
app.mount("#app"); // 挂载应用到 DOM
app.use(createPinia()); // 使用 Pinia 状态管理库

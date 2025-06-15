// import { createRouter, createWebHistory } from "vue-router";
import { createRouter, createWebHashHistory } from "vue-router";
import TaskList from "@/components/TaskList.vue"; // 任务列表页面
import AllTasks from "@/components/AllTasks.vue"; // 所有任务页面

const routes = [
  { path: "/", component: TaskList },
  { path: "/all-tasks", component: AllTasks },
];

const router = createRouter({
  //   history: createWebHistory(),
  history: createWebHashHistory(),
  routes,
});

export default router;

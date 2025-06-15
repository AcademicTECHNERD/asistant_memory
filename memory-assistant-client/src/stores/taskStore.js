// // src/stores/taskStore.js
// import { defineStore } from "pinia";

// export const useTaskStore = defineStore("taskStore", {
//   state: () => ({
//     tasks: [],
//   }),
//   actions: {
//     async fetchTasks() {
//       const response = await fetch("http://localhost:5000/api/tasks");
//       const data = await response.json();
//       this.tasks = data;
//     },
//     addTask(newTask) {
//       this.tasks.push(newTask);
//     },
//   },
// });
// src/stores/taskStore.js
import { defineStore } from "pinia";
import {
  getTasks,
  createTask,
  deleteTask,
  restoreTask,
  markReviewDone,
} from "../api/tasks";

export const useTaskStore = defineStore("taskStore", {
  state: () => ({
    tasks: [],
  }),
  actions: {
    async fetchTasks() {
      const res = await getTasks();
      this.tasks = res.data;
    },
    async addTask(taskData) {
      await createTask(taskData);
      await this.fetchTasks(); // 添加后刷新任务列表
    },
    async deleteTask(taskId) {
      await deleteTask(taskId);
      await this.fetchTasks();
    },
    async restoreTask(taskId) {
      await restoreTask(taskId);
      await this.fetchTasks();
    },
    async markReviewDone(taskId, reviewIndex) {
      await markReviewDone(taskId, reviewIndex);
      await this.fetchTasks();
    },
  },
});

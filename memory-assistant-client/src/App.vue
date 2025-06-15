<template>
  <div class="container">
    <h1 class="title">🧠 记忆助手</h1>

    <!-- 添加任务 -->
    <div class="card">
      <TaskForm @refresh="loadTasks" />
    </div>

    <!-- 今日任务列表永远显示 -->
    <div class="card">
      <TaskList ref="list" />
    </div>

    <!-- 路由视图：附加内容，比如“所有任务” -->
    <div class="card" v-if="$route.path === '/all-tasks'">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import TaskForm from './components/TaskForm.vue'
import TaskList from './components/TaskList.vue'

export default {
  components: { TaskForm, TaskList },
  methods: {
    loadTasks() {
      const list = this.$refs?.list
      if (list && typeof list.fetchTasks === 'function') {
        list.fetchTasks()
      }
    }
  }
}
</script>


<style scoped>
.container {
  padding: 2rem;
  max-width: 800px;
  margin: auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.title {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #333;
}

.card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>

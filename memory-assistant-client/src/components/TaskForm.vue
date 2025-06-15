<template>
  <div>
    <input v-model="content" placeholder="输入要记住的内容" />
    <select v-model="type">
      <option value="ebbinghaus">艾宾浩斯复习</option>
      <option value="one_time">一次性任务</option>
    </select>
    <button @click="submit">添加</button>
    <button @click="goToAllTasks" style="background-color: pink; color: black;">查看所有任务</button>
  </div>
</template>

<script>
import { createTask } from '../api/tasks'

export default {
  data() {
    return {
      content: '',
      type: 'ebbinghaus' // 默认是复习任务
    }
  },
  methods: {
    async submit() {
      console.log('创建任务参数：', { content: this.content, type: this.type })
      if (!this.content.trim()) return
      await createTask({ content: this.content, type: this.type })
      this.content = ''
      this.$emit('refresh')
    },
    goToAllTasks() {
      this.$router.push('/all-tasks')
    }
  }
}
</script>

<style scoped>
input,
select {
  padding: 0.6rem;
  font-size: 1rem;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-right: 0.5rem;
}

select {
  width: 150px;
}

button {
  padding: 0.6rem 1rem;
  font-size: 1rem;
  border: none;
  background-color: #42b983;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #369870;
}
</style>

<template>
    <div>
        <h2>今天的任务</h2>
        <div v-for="task in todayTasks" :key="task._id + '-' + task.reviewIndex">
            <p>
                {{ task.content }} — 第 {{ task.reviewIndex + 1 }} 次复习（{{ new Date(task.review.date).toLocaleString() }}）
                <button @click="markDone(task)" :disabled="loading">完成</button>
            </p>
        </div>
    </div>
</template>

<script>
import { getTasks, markReviewDone } from '../api/tasks'


function isSameDayLocal(d1, d2) {
    const date1 = new Date(d1)
    const date2 = new Date(d2)
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    )
}

export default {
    data() {
        return {
            tasks: [],
            loading: false,
            error: ''
        }
    },
    computed: {
        todayTasks() {
            const today = new Date()
            return this.tasks.flatMap(task =>
                task.schedule.map((r, idx) => ({
                    _id: task._id,
                    content: task.content,
                    review: { ...r, date: new Date(r.date) },
                    reviewIndex: idx
                }))
            ).filter(t => isSameDayLocal(t.review.date, today) && t.review.status === 'pending')
        }
    },
    methods: {
        async fetchTasks() {
            try {
                const res = await getTasks()
                this.tasks = res.data
            } catch (err) {
                this.error = '获取任务失败'
                console.error(err)
            }
        },
        async markDone(task) {
            try {
                this.loading = true
                await markReviewDone(task._id, task.reviewIndex)
                await this.fetchTasks()
            } catch (err) {
                console.error('标记失败:', err)
                alert('标记失败，请检查网络或服务器')
            } finally {
                this.loading = false
            }
        }
    },
    mounted() {
        this.fetchTasks()
    }
}
</script>
<style scoped>
input {
    padding: 0.6rem;
    font-size: 1rem;
    border-radius: 5px;
    border: 1px solid #ccc;
    width: 70%;
    margin-right: 0.5rem;
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

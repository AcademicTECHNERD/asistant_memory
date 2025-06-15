<template>
    <div>
        <h2 class="section-title">📋 所有任务</h2>
        <div v-for="task in tasks" :key="task._id" class="task-card" :class="getTaskClass(task)">
            <p class="task-content">
                <span v-if="isBreakPoint(task)" class="breakpoint-tag">（断点任务）</span>{{ task.content }}
            </p>

            <!-- 复习列表 -->
            <ul>
                <li v-for="(review, idx) in task.schedule" :key="review._id">
                    <span class="date">📅 {{ new Date(review.date).toLocaleString() }}</span>
                    <span class="status">📝 状态：{{ review.status }}</span>
                </li>
            </ul>

            <!-- 操作按钮 -->
            <div class="actions">
                <!-- 显示“重置”按钮 -->
                <button v-if="shouldShowRestore(task)" @click="handleRestore(task._id)" class="btn-restore">
                    🔁 重置任务
                </button>
                <!-- 删除按钮 -->
                <button @click="handleDelete(task._id)" class="btn-delete">
                    🗑 删除任务
                </button>

            </div>
        </div>

    </div>
</template>

<script>
// import { getTasks } from '../api/tasks'
import { getTasks, restoreTask, deleteTask } from '../api/tasks'
import { useTaskStore } from '../stores/taskStore';

export default {
    data() {
        return {
            tasks: []
        }
    },
    methods: {
        async fetchTasks() {
            const res = await getTasks()
            this.tasks = res.data
        },
        async handleDelete(taskId) {
            if (!confirm("确定要删除这个任务吗？")) return;
            try {
                await deleteTask(taskId);
                alert("删除成功！");
                this.fetchTasks();
            } catch (err) {
                alert("删除失败：" + (err.response?.data?.error || err.message));
            }
        },
        isBreakPoint(task) {
            if (task.status !== 'active') return false;
            const pastPending = task.schedule.some(
                r => this.isBeforeToday(r.date) && r.status === 'pending'
            );
            const futurePending = task.schedule.some(
                r => !this.isBeforeToday(r.date) && r.status === 'pending'
            );
            return pastPending && futurePending;
        },
        isBeforeToday(dateStr) {
            const now = new Date()
            const date = new Date(dateStr)
            return date.getFullYear() < now.getFullYear()
                || (date.getFullYear() === now.getFullYear() && date.getMonth() < now.getMonth())
                || (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() < now.getDate())
        },
        isAllPast(task) {
            return task.schedule.every(r => this.isBeforeToday(r.date))
        },
        isAllDone(task) {
            return task.schedule.every(r => r.status === 'done')
        },
        hasDone(task) {
            return task.schedule.some(r => r.status === 'done')
        },
        isAllPending(task) {
            return task.schedule.every(r => r.status === 'pending')
        },
        shouldShowRestore(task) {
            if (task.schedule.length === 1) {
                return task.schedule[0].status === 'pending'
            }
            return this.isBreakPoint(task) || this.isAllPast(task) || this.isAllDone(task)
        },
        getTaskClass(task) {
            if (task.schedule.length === 1) {
                return task.schedule[0].status === 'done' ? 'orange' : 'pink'
            }
            if (this.isBreakPoint(task)) return 'yellow'
            if (this.isAllPast(task)) return 'gray'
            if (this.isAllDone(task)) return 'orange'
            if (this.hasDone(task)) return 'pink'
            return ''
        },
        async handleRestore(taskId) {
            try {
                const res = await restoreTask(taskId)
                alert("重置成功！")
                this.fetchTasks()
            } catch (err) {
                alert("重置失败：" + (err.response?.data?.error || err.message))
            }
        }
    },
    mounted() {
        this.fetchTasks()
    }
}
</script>

<style scoped>
.section-title {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #2c3e50;
}

.task-card {
    border: 1px solid #ddd;
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 8px;
    transition: background-color 0.3s;
    background: #f9f9f9;
}

/* 状态样式 */
.gray {
    background-color: #d3d3d3;
}

.pink {
    background-color: #ffc0cb;
}

.orange {
    background-color: #ffa500;
}

.yellow {
    background-color: #ffff99;
    /* 断点任务：黄色 */
}

.task-content {
    font-weight: bold;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
}

.breakpoint-tag {
    color: #a00000;
    font-weight: bold;
    margin-right: 0.3rem;
}

li {
    margin-left: 1rem;
    margin-top: 0.3rem;
}

.date {
    color: #555;
    font-size: 0.95rem;
}

.status {
    margin-left: 1rem;
    color: #888;
    font-style: italic;
}

.actions {
    margin-top: 0.5rem;
}

.btn-rollback,
.btn-restore {
    margin-right: 0.5rem;
    padding: 0.3rem 0.6rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
}

.btn-rollback {
    background-color: #f39c12;
    color: white;
}

.btn-restore {
    background-color: #3498db;
    color: white;
}

.btn-delete {
    background-color: #e74c3c;
    color: white;
}
</style>
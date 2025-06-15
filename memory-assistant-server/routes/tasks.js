const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// 生成艾宾浩斯复习计划
function generateSchedule(startDate) {
  const intervals = [0, 1, 2, 4, 7, 15];
  return intervals.map((days) => ({
    date: new Date(new Date(startDate).getTime() + days * 86400000),
    status: "pending",
  }));
}

// 创建任务（支持 ebbinghaus / one_time）
// router.post("/", async (req, res) => {
//   const { content, type = "ebbinghaus" } = req.body;
//   const createdAt = new Date();

//   let schedule = [];
//   if (type === "ebbinghaus") {
//     schedule = generateEbbinghausSchedule(createdAt);
//   } else if (type === "one_time") {
//     schedule = [
//       {
//         date: createdAt,
//         status: "pending",
//       },
//     ];
//   }
// });
router.get("/", async (req, res) => {
  const tasks = await Task.find();

  const now = new Date();

  for (const task of tasks) {
    if (task.type !== "ebbinghaus") continue;
    if (task.rollbackInfo?.restored) continue;

    const missed = task.schedule.filter(
      (s) => s.date < now && s.status === "pending"
    );
    const completed = task.schedule.filter((s) => s.status === "done");

    const missedCount = missed.length;
    const total = task.schedule.length;
    const completedRatio = completed.length / total;

    if (
      (missedCount >= 2 || completedRatio < 0.6) &&
      !task.rollbackInfo // 未回滚才生成
    ) {
      const previousState = {
        schedule: [...task.schedule],
        status: task.status,
        completedReviews: [...task.completedReviews],
        missedReviews: [...task.missedReviews],
      };

      task.status = "reset";
      task.rollbackInfo = {
        rollbackTriggeredAt: now,
        rollbackReason: "missed critical review",
        rollbackAllowedUntil: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        previousState,
        restored: false,
      };

      await task.save();
    }
  }

  res.json(tasks);
});

// 创建任务
// router.post('/', async (req, res) => {
//   const { content } = req.body
//   const createdAt = new Date()
//   const schedule = generateSchedule(createdAt)
//   const task = new Task({ content, createdAt, schedule })
//   await task.save()
//   res.status(201).json(task)
// })

// 删除任务
router.delete("/:taskId", async (req, res) => {
  const { taskId } = req.params;
  try {
    const task = await Task.findByIdAndDelete(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ message: "Task deleted successfully", task });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 创建任务
router.post("/", async (req, res) => {
  const { content, type = "ebbinghaus" } = req.body;
  const createdAt = new Date();

  let schedule = [];
  if (type === "ebbinghaus") {
    schedule = generateSchedule(createdAt);
  } else if (type === "one_time") {
    schedule = [
      {
        date: createdAt,
        status: "pending",
      },
    ];
  }

  const task = new Task({
    content,
    createdAt,
    type,
    schedule,
    status: "active",
    completedReviews: [],
    missedReviews: [],
  });
  await task.save();
  res.status(201).json(task);
});

// 获取所有任务
router.get("/", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// 标记某个复习点为“完成”
// router.patch('/:taskId/:reviewIndex', async (req, res) => {
//   const { taskId, reviewIndex } = req.params
//   const task = await Task.findById(taskId)
//   if (!task) return res.status(404).json({ error: 'Task not found' })

//   task.schedule[reviewIndex].status = 'done'
//   await task.save()
//   res.json(task)
// })

// 标记某个复习点为“完成”
router.patch("/:taskId/:reviewIndex", async (req, res) => {
  const { taskId, reviewIndex } = req.params;
  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const index = parseInt(reviewIndex);
  if (!task.schedule[index])
    return res.status(400).json({ error: "Invalid review index" });

  task.schedule[index].status = "done";
  task.completedReviews.push(new Date());

  // 如果是 one_time 且完成，则标记任务整体为 completed
  if (task.type === "one_time") {
    task.status = "completed";
  }

  await task.save();
  res.json(task);
});

router.post("/:taskId/auto-rollback", async (req, res) => {
  const { taskId } = req.params;
  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({ error: "Task not found" });

  if (task.type !== "ebbinghaus")
    return res.status(400).json({ error: "Not applicable for one_time tasks" });

  const now = new Date();
  const missed = task.schedule.filter(
    (s) => s.date < now && s.status === "pending"
  );
  const completed = task.schedule.filter((s) => s.status === "done");

  const missedCount = missed.length;
  const total = task.schedule.length;
  const completedRatio = completed.length / total;

  if (missedCount >= 2 || completedRatio < 0.6) {
    const previousState = {
      schedule: [...task.schedule],
      status: task.status,
      completedReviews: [...task.completedReviews],
      missedReviews: [...task.missedReviews],
    };

    task.status = "reset";
    task.rollbackInfo = {
      rollbackTriggeredAt: now,
      rollbackReason: "missed critical review",
      rollbackAllowedUntil: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      previousState,
      restored: false,
    };

    await task.save();
    return res.json({ message: "Task rolled back", task });
  } else {
    return res.json({ message: "No rollback needed", task });
  }
});

router.post("/:taskId/restore", async (req, res) => {
  const { taskId } = req.params;
  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const now = new Date();

  if (task.type === "ebbinghaus") {
    const rollback = task.rollbackInfo;
    if (!rollback || rollback.restored) {
      return res.status(400).json({ error: "No valid rollback to restore" });
    }

    const deadline = new Date(rollback.rollbackAllowedUntil);
    if (now > deadline) {
      return res.status(400).json({ error: "Rollback period expired" });
    }

    task.schedule = generateSchedule(now);
    task.status = "active";
    task.completedReviews = [];
    task.missedReviews = [];
    task.rollbackInfo.restored = true;

    await task.save();
    return res.json({ message: "Task restored successfully", task });
  } else if (task.type === "one_time") {
    task.schedule = [{ date: now, status: "pending" }];
    task.status = "active";
    task.completedReviews = [];
    task.missedReviews = [];
    await task.save();
    return res.json({ message: "One-time task restored", task });
  }

  return res.status(400).json({ error: "Unknown task type" });
});

module.exports = router;

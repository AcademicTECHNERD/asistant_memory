const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  date: Date,
  status: {
    type: String,
    enum: ["pending", "done", "missed"],
    default: "pending",
  },
});

const rollbackSchema = new mongoose.Schema({
  rollbackTriggeredAt: Date,
  rollbackReason: String,
  rollbackAllowedUntil: Date,
  previousState: Object,
  restored: { type: Boolean, default: false },
});

const taskSchema = new mongoose.Schema({
  content: { type: String, required: true },
  type: {
    type: String,
    enum: ["ebbinghaus", "one_time"],
    default: "ebbinghaus",
  },
  createdAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["active", "completed", "missed", "reset"],
    default: "active",
  },
  schedule: [reviewSchema],
  completedReviews: [Date],
  missedReviews: [Date],
  rollbackInfo: rollbackSchema,
});

module.exports = mongoose.model("Task", taskSchema);

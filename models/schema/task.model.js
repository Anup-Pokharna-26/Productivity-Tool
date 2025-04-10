const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["done", "inProgress", "toDo", "notDone", "pending"],
      default: "pending",
    },
    category: {
      type: String,
      trim: true, 
    },
    subCategory: {
      type: String,
      trim: true, // For storing AI plan title or null for user-added tasks
      default: null,
    },
    taskDate: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.taskDate = ret.taskDate.toISOString().split("T")[0];
        ret.createdAt = ret.createdAt.toISOString().split("T")[0];
        ret.updatedAt = ret.updatedAt.toISOString().split("T")[0];
        return ret;
      },
    },
  }
);

// Strip time from taskDate before saving
taskSchema.pre("save", function (next) {
  this.taskDate = new Date(this.taskDate.toISOString().split("T")[0]);
  next();
});

module.exports = mongoose.models.Task || mongoose.model("Task", taskSchema);

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
      type: String, // Store date as a string in YYYY-MM-DD format
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
        ret.createdAt = ret.createdAt.toISOString().split("T")[0];
        ret.updatedAt = ret.updatedAt.toISOString().split("T")[0];
        return ret;
      },
    },
  }
);

// Remove unnecessary pre-save middleware

module.exports = mongoose.models.Task || mongoose.model("Task", taskSchema);

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
        enum: ["done", "inProgress", "toDo", "notDone", "pending"], // Updated statuses
        default: "pending", // Default status
      },
      category: {
        type: String,
        trim: true,
      },
      taskDate: {
        type: Date,
        required: true,
      },
    },
    {
      timestamps: true, // Enable createdAt and updatedAt fields
      toJSON: {
        transform: (doc, ret) => {
          // Format taskDate, createdAt, and updatedAt to YYYY-MM-DD
          ret.taskDate = ret.taskDate.toISOString().split("T")[0];
          ret.createdAt = ret.createdAt.toISOString().split("T")[0];
          ret.updatedAt = ret.updatedAt.toISOString().split("T")[0];
          return ret;
        },
      },
    }
  );

  // Pre-save middleware to store only the date (strip time) for taskDate
  taskSchema.pre("save", function (next) {
    this.taskDate = new Date(this.taskDate.toISOString().split("T")[0]); // Keep only the date part
    next();
  });

  module.exports = mongoose.models.Task || mongoose.model("Task", taskSchema);

  
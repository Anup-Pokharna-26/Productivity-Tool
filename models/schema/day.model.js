const mongoose = require("mongoose");

const daySchema = new mongoose.Schema(
  {
    date: {
      type: String, // Store date as a string in YYYY-MM-DD format
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    statusOfDay: {
      type: Number, // Use numeric values for statusOfDay
      enum: [0, 1, 2, 3, 4], // 0: Idle, 1: Improving, 2: Moderate, 3: Efficient, 4: Peak
      required: true,
    },
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    comment: {
      type: String,
      lowercase: true,
      trim: true,
    },
    streak: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Enable createdAt and updatedAt fields
    toJSON: {
      transform: (doc, ret) => {
        ret.createdAt = ret.createdAt.toISOString().split("T")[0];
        ret.updatedAt = ret.updatedAt.toISOString().split("T")[0];
        return ret;
      },
    },
  }
);

// Add a compound unique index for date and userId
daySchema.index({ date: 1, userId: 1 }, { unique: true });

module.exports = mongoose.models.Day || mongoose.model("Day", daySchema);
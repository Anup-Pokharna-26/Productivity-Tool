const Task = require("../models/schema/task.model.js");
const Day = require("../models/schema/day.model.js");

// [GET] /api/tasks
const getTasks = async (req, res) => {
  try {
    const { date, userId } = req.query;

    if (!userId || !date) {
      return res.status(400).json({ success: false, message: "userId and date are required" });
    }

    const formattedDate = new Date(new Date(date).toISOString().split("T")[0]); // Standardize date format
    const tasks = await Task.find({ userId, taskDate: formattedDate });

    const completedStatuses = ["done"];
    const pendingStatuses = ["pending", "notDone", "toDo"];
    const inProgressStatuses = ["inProgress"];

    let statusOfDay = 0;

    if (tasks.length === 0) {
      statusOfDay = 0;
    } else if (tasks.every(task => completedStatuses.includes(task.status))) {
      statusOfDay = 2;
    } else if (tasks.every(task => pendingStatuses.includes(task.status))) {
      statusOfDay = 3;
    } else {
      statusOfDay = 1;
    }

    res.status(200).json({
      success: true,
      result: {
        tasks,
        statusOfDay,
      },
    });
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// [POST] /api/tasks/create
const createTask = async (req, res) => {
  try {
    const { userId, title, description, status, category, taskDate, createdBy } = req.body;

    if (!userId || !title || !description || !taskDate) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const formattedTaskDate = new Date(new Date(taskDate).toISOString().split("T")[0]); // Standardize date format
    const task = new Task({
      userId,
      title,
      description,
      status,
      category,
      taskDate: formattedTaskDate, // Use standardized date format
      createdBy: createdBy || userId,
    });
    await task.save();

    const day = await Day.findOneAndUpdate(
      { date: formattedTaskDate, userId }, // Use standardized date format
      {
        $addToSet: { tasks: task._id },
        $setOnInsert: { statusOfDay: "not productive" },
      },
      { new: true, upsert: true }
    );

    res.status(201).json({ success: true, task, day });
  } catch (error) {
    console.error("Error creating task:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// [PUT] /api/tasks/update
const updateTask = async (req, res) => {
  try {
    const { taskId, updateData } = req.body;

    if (!taskId) {
      return res.status(400).json({ success: false, message: "taskId is required" });
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, { $set: updateData }, { new: true });

    if (!updatedTask) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, result: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// [DELETE] /api/tasks/delete?taskId=...
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.query;

    if (!taskId) {
      return res.status(400).json({ success: false, message: "taskId is required" });
    }

    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, message: "Task deleted successfully", result: deletedTask });
  } catch (error) {
    console.error("Error deleting task:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
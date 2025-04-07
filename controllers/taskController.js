const Task = require("../models/schema/task.model.js");
const Day = require("../models/schema/day.model.js");

// [GET] /api/tasks
const getTasks = async (req, res) => {
  try {
    const { date, userId } = req.query;

    // Ensure both userId and date are provided
    if (!userId || !date) {
      return res.status(400).json({ success: false, message: "userId and date are required" });
    }

    // Strip time from the date
    const strippedDate = new Date(new Date(date).toISOString().split("T")[0]);

    // Query tasks based on userId and taskDate
    const tasks = await Task.find({ userId, taskDate: strippedDate });

    res.status(200).json({ success: true, result: tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// [POST] /api/tasks/create
const createTask = async (req, res) => {
  try {
    const { userId, title, description, status, category, taskDate } = req.body;

    if (!userId || !title || !description || !taskDate) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Strip time from the taskDate
    const strippedTaskDate = new Date(new Date(taskDate).toISOString().split("T")[0]);

    // Create the task
    const task = new Task({ userId, title, description, status, category, taskDate: strippedTaskDate });
    await task.save();

    // Add the task to the corresponding day
    const day = await Day.findOneAndUpdate(
      { date: strippedTaskDate, userId },
      { $addToSet: { tasks: task._id } }, // Add the task ID to the tasks array
      { new: true, upsert: true } // Create the day if it doesn't exist
    );

    res.status(201).json({ success: true, task, day });
  } catch (error) {
    console.error("Error creating task:", error.meschchrsage);
    res.status(500).json({ success: false, error: error.message });
  }
};

// [PUT] /api/tasks/update
const updateTask = async (req, res) => {
  try {
    const { taskId, updateData } = req.body; // Accept taskId as a query parameter
    

    if (!taskId) {
      return res.status(400).json({ success: false, message: "taskId is required" });
    }

    // Find and update the task by its unique ID
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

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.query; // Accept taskId as a query parameter

    if (!taskId) {
      return res.status(400).json({ success: false, message: "taskId is required" });
    }

    // Find and delete the task by its unique ID
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
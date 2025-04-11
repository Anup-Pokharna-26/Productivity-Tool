const Task = require("../models/schema/task.model.js");
const Day = require("../models/schema/day.model.js");
const mongoose = require("mongoose"); // Import mongoose for ObjectId validation

// [GET] /api/tasks
const getTasks = async (req, res) => {
  try {
    const { date, userId } = req.query;

    if (!userId || !date) {
      return res.status(400).json({ success: false, message: "userId and date are required" });
    }

    // Log the incoming query parameters
    console.log(`Fetching tasks for userId: ${userId}, date: ${date}`);

    // Standardize the date format to yyyy-mm-dd
    const formattedDate = new Date(date).toISOString().split("T")[0];
    console.log(`Formatted date: ${formattedDate}`);

    // Fetch tasks matching the userId and taskDate
    const tasks = await Task.find({ userId, taskDate: formattedDate });
    console.log(`Tasks found: ${JSON.stringify(tasks)}`);

    const completedStatuses = ["done"];
    const pendingStatuses = ["pending", "notDone", "toDo"];
    const inProgressStatuses = ["inProgress"];

    let statusOfDay = 0;

    if (tasks.length === 0) {
      statusOfDay = 0; // No tasks
    } else if (tasks.every(task => completedStatuses.includes(task.status))) {
      statusOfDay = 2; // All tasks completed
    } else if (tasks.every(task => pendingStatuses.includes(task.status))) {
      statusOfDay = 3; // All tasks pending
    } else {
      statusOfDay = 1; // Tasks in progress or mixed statuses
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

    console.log("Incoming request body for createTask:", req.body);

    if (!userId || !title || !description || !taskDate) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

     // Standardize the date format to yyyy-mm-dd
    const formattedTaskDate = new Date(taskDate).toISOString().split("T")[0];

    // Create the task
    const task = new Task({
      userId,
      title,
      description,
      status,
      category,
      taskDate: formattedTaskDate, // Use standardized date format
      createdBy: createdBy || userId,
    });
    const savedTask = await task.save();

    // Update or create the corresponding Day document
    const day = await Day.findOneAndUpdate(
      { date: formattedTaskDate, userId }, // Use standardized date format
      {
        $addToSet: { tasks: savedTask._id },
        $setOnInsert: { statusOfDay: "not productive" },
      },
      { new: true, upsert: true }
    );

    res.status(201).json({ success: true, task: savedTask, day });
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

    // Validate taskId format
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      console.error(`Invalid taskId format: ${taskId}`);
      return res.status(400).json({ success: false, message: "Invalid taskId format" });
    }

    console.log(`Attempting to update task with ID: ${taskId}`);

    // Check if the task exists
    const task = await Task.findById(taskId);
    if (!task) {
      console.error(`Task with ID ${taskId} not found`);
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    console.log(`Task found: ${JSON.stringify(task)}`);

    // Update the task
    const updatedTask = await Task.findByIdAndUpdate(taskId, { $set: updateData }, { new: true });

    console.log(`Task with ID ${taskId} updated successfully`);

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

    console.log(`Attempting to delete task with ID: ${taskId}`);

    // Find the task to get its date and userId
    const task = await Task.findById(taskId);
    if (!task) {
      console.error(`Task with ID ${taskId} not found`);
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const { taskDate, userId } = task;

    // Delete the task
    await Task.findByIdAndDelete(taskId);
    console.log(`Task with ID ${taskId} deleted successfully`);

    // Remove the task reference from the Day model
    const updatedDay = await Day.findOneAndUpdate(
      { date: taskDate, userId },
      { $pull: { tasks: taskId } },
      { new: true }
    );

    if (updatedDay) {
      console.log(`Task reference removed from Day document for date: ${taskDate}`);
      // Optionally, delete the Day document if it has no tasks left
      if (updatedDay.tasks.length === 0) {
        await Day.findByIdAndDelete(updatedDay._id);
        console.log(`Day document for date: ${taskDate} deleted as it has no tasks left`);
      }
    } else {
      console.warn(`No Day document found for date: ${taskDate} and userId: ${userId}`);
    }

    res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
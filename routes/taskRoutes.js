const express = require("express"); 
const router = express.Router();
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

// [GET] /api/tasks?date=""&day=""&statusOfDay=""&userId=""
router.get("/", getTasks); // Fetch tasks based on query parameters

// [POST] /api/tasks/create -> body (userId, taskDetails)
router.post("/create", createTask); // Create a new task

// [PUT] /api/tasks/update -> body (taskId, updateData)
router.put("/update", (req, res, next) => {
  console.log("Request to update task:", req.body);
  next();
}, updateTask); // Update an existing task

// [DELETE] /api/tasks/delete -> body (taskId)
router.delete("/delete", (req, res, next) => {
  console.log("Request to delete task:", req.body);
  next();
}, deleteTask); // Delete a task

module.exports = router;
const Day = require("../models/schema/day.model.js");

const getDay = async (req, res) => {
  try {
    const { date, userId } = req.query;

    if (!date || !userId) {
      return res.status(400).json({ success: false, message: "date and userId are required" });
    }

    const day = await Day.findOne({ date, userId }).populate("tasks"); // Use date directly

    if (!day) {
      return res.status(404).json({ success: false, message: "Day not found" });
    }

    res.status(200).json({ success: true, result: day });
  } catch (error) {
    console.error("Error fetching day details:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// [PUT] /api/day
const updateDayStatus = async (req, res) => {
  try {
    const { date, userId, statusOfDay } = req.body; // Accept date, userId, and statusOfDay in the request body

    if (!date || !userId || !statusOfDay) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const updatedDay = await Day.findOneAndUpdate(
      { date, userId },
      { $set: { statusOfDay } },
      { new: true }
    );

    if (!updatedDay) {
      return res.status(404).json({ success: false, message: "Day not found" });
    }

    res.status(200).json({ success: true, result: updatedDay });
  } catch (error) {
    console.error("Error updating day status:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// [GET] /api/day/streak
const getStreak = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    const streak = await Day.aggregate([
      { $match: { userId, statusOfDay: "productive" } },
      { $group: { _id: "$userId", streak: { $sum: 1 } } },
    ]);

    res.status(200).json({ success: true, result: streak });
  } catch (error) {
    console.error("Error fetching streak:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// [GET] /api/productivity/status/line-chart
// Helper function to generate an array of dates between startDate and endDate
const generateDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

// [GET] /api/productivity/status/line-chart
const getLineChartProductivityStatus = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    if (!startDate || !endDate || !userId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const data = await Day.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    // Generate the date range
    const dateRange = generateDateRange(startDate, endDate);

    // Map the data to the required format and fill missing dates
    const result = dateRange.map((date) => {
      const formattedDate = date.toISOString().split("T")[0];
      const dayData = data.find((day) => day.date.toISOString().split("T")[0] === formattedDate);

      return {
        date: formattedDate,
        day: date.toLocaleString("en-US", { weekday: "long" }),
        status: dayData
          ? dayData.statusOfDay.charAt(0).toUpperCase() + dayData.statusOfDay.slice(1)
          : "Unknown",
      };
    });

    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Error fetching line chart data:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// [GET] /api/productivity/status/pie-chart
const getPieChartProductivityStatus = async (req, res) => {
  try {
    const { startDate, endDate, userId, statusOfDay } = req.query;

    if (!startDate || !endDate || !userId || !statusOfDay) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const data = await Day.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
      statusOfDay,
    });

    // Generate the date range
    const dateRange = generateDateRange(startDate, endDate);

    // Group data by day of the week and count occurrences
    const dayCounts = data.reduce((acc, day) => {
      const weekday = new Date(day.date).toLocaleString("en-US", { weekday: "short" }).toLowerCase();
      acc[weekday] = acc[weekday] || { count: 0 };
      acc[weekday].count += 1;
      return acc;
    }, {});

    // Ensure all days of the week are present in the response
    const allDays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const result = allDays.reduce((acc, day) => {
      acc[day] = dayCounts[day] || { count: 0 };
      return acc;
    }, {});

    // Fill missing dates in the date range with count 0
    const filledData = dateRange.map((date) => {
      const formattedDate = date.toISOString().split("T")[0];
      const weekday = date.toLocaleString("en-US", { weekday: "short" }).toLowerCase();

      return {
        date: formattedDate,
        day: weekday,
        count: result[weekday]?.count || 0,
      };
    });

    res.status(200).json({
      success: true,
      result: {
        status: statusOfDay,
        data: filledData,
      },
    });
  } catch (error) {
    console.error("Error fetching pie chart data:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getDay,
  updateDayStatus,
  getStreak,
  getLineChartProductivityStatus,
  getPieChartProductivityStatus,
};
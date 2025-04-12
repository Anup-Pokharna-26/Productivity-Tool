const Day = require("../models/schema/day.model.js");

const getDay = async (req, res) => {
  try {
    const { date, userId } = req.query;

    if (!date || !userId) {
      return res.status(400).json({ success: false, message: "date and userId are required" });
    }

    const formattedDate = new Date(new Date(date).toISOString().split("T")[0]); // Standardize date format
    const day = await Day.findOne({ date: formattedDate, userId }).populate("tasks");

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
    const { date, userId, statusOfDay } = req.body;

    if (!date || !userId || !statusOfDay) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    console.log(`Updating day status for userId: ${userId}, date: ${date}, statusOfDay: ${statusOfDay}`);

    // Standardize the date format to yyyy-mm-dd
    const formattedDate = new Date(date).toISOString().split("T")[0];
    console.log(`Formatted date: ${formattedDate}`);

    // Update the day document
    const updatedDay = await Day.findOneAndUpdate(
      { date: formattedDate, userId },
      { $set: { statusOfDay } },
      { new: true }
    );

    if (!updatedDay) {
      console.error(`Day not found for userId: ${userId}, date: ${formattedDate}`);
      return res.status(404).json({ success: false, message: "Day not found" });
    }

    console.log(`Day status updated successfully: ${JSON.stringify(updatedDay)}`);
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

    // const streak = await Day.aggregate([
    //   { $match: { userId} },
    //   { $group: { _id: "$userId", streak: { $sum: 1 } } },
    // ]);
    const fmtDate = new Date().toISOString().split("T")[0]
    const today = await Day.find(
      {userId, date:fmtDate}
    );

    const streak = today[0].streak

    res.status(200).json({ success: true, result: {streak} });
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
    let { userId, startDate, endDate } = req.query;

    if (!userId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "userId, startDate, and endDate are required",
      });
    }

    console.log(`Fetching productivity status for userId: ${userId}, from ${startDate} to ${endDate}`);

    startDate = new Date(startDate).toISOString().split("T")[0]
    endDate = new Date(endDate).toISOString().split("T")[0]
    // Fetch days within the specified date range
    const days = await Day.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    // Generate a complete date range
    const dateRange = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      dateRange.push(new Date(currentDate).toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Map the results to a dictionary for quick lookup
    const dayMap = days.reduce((acc, day) => {
      acc[day.date] = {
        date: day.date,
        day: new Date(day.date).toLocaleDateString("en-US", { weekday: "long" }),
        status: day.statusOfDay,
      };
      return acc;
    }, {});

    console.log(`Days found: ${JSON.stringify(dayMap)}`);

    // Create the final result array, filling missing dates with default status 0
    const result = dateRange.map((date) => {
      if (dayMap[date]) {
        return dayMap[date];
      }
      return {
        date,
        day: new Date(date).toLocaleDateString("en-US", { weekday: "long" }),
        status: 0, // Default status for missing dates
      };
    });

    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error fetching line chart productivity status:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// [GET] /api/productivity/status/pie-chart
// const getPieChartProductivityStatus = async (req, res) => {
//   try {
//     const { startDate, endDate, userId, statusOfDay } = req.query;

//     if (!startDate || !endDate || !userId || !statusOfDay) {
//       return res.status(400).json({ success: false, message: "Missing required fields" });
//     }

//     // Standardize date formats
//     const formattedStartDate = new Date(new Date(startDate).toISOString().split("T")[0]);
//     const formattedEndDate = new Date(new Date(endDate).toISOString().split("T")[0]);

//     // Query the Day model for matching documents
//     const data = await Day.find({
//       userId,
//       date: { $gte: formattedStartDate, $lte: formattedEndDate },
//       statusOfDay,
//     });

//     // Generate the date range
//     const dateRange = generateDateRange(formattedStartDate, formattedEndDate);

//     // Group data by day of the week and count occurrences
//     const dayCounts = data.reduce((acc, day) => {
//       const weekday = new Date(day.date).toLocaleString("en-US", { weekday: "short" }).toLowerCase();
//       acc[weekday] = acc[weekday] || { count: 0 };
//       acc[weekday].count += 1;
//       return acc;
//     }, {});

//     // Ensure all days of the week are present in the response
//     const allDays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
//     const result = allDays.reduce((acc, day) => {
//       acc[day] = dayCounts[day] || { count: 0 };
//       return acc;
//     }, {});

//     // Fill missing dates in the date range with count 0
//     const filledData = dateRange.map((date) => {
//       const formattedDate = date.toISOString().split("T")[0];
//       const weekday = date.toLocaleString("en-US", { weekday: "short" }).toLowerCase();

//       return {
//         date: formattedDate,
//         day: weekday,
//         count: result[weekday]?.count || 0,
//       };
//     });
//     console.log("********************************************************8")
//     console.log(JSON.stringify(filledData))
//     console.log("********************************************************8")
//     const resultMain = transformData(filledData)

//     res.status(200).json({
//       success: true,
//       result: {
//         status: statusOfDay,
//         data: resultMain,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching pie chart data:", error.message);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };
const getPieChartProductivityStatus = async (req, res) => {
  try {
    const { startDate, endDate, userId, statusOfDay } = req.query;

    if (!startDate || !endDate || !userId || !statusOfDay) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const formatDateOnly = (d) => new Date(d).toISOString().split("T")[0];
    const formattedStartDate = formatDateOnly(startDate);
    const formattedEndDate = formatDateOnly(endDate);

    const data = await Day.find({
      userId,
      statusOfDay: Number(statusOfDay),
      date: { $gte: formattedStartDate, $lte: formattedEndDate },
    });

    // Normalize weekday short names
    const normalizeWeekday = (w) => (w === "thu" ? "thurs" : w);

    // Count days by weekday
    const dayCounts = data.reduce((acc, day) => {
      const weekday = normalizeWeekday(new Date(day.date).toLocaleString("en-US", { weekday: "short" }).toLowerCase());
      acc[weekday] = acc[weekday] || { count: 0 };
      acc[weekday].count += 1;
      return acc;
    }, {});

    // Ensure all days are present
    const allDays = ["sun", "mon", "tue", "wed", "thurs", "fri", "sat"];
    const result = allDays.reduce((acc, day) => {
      acc[day] = dayCounts[day] || { count: 0 };
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      result: {
        status: statusOfDay,
        data: result,
      },
    });
  } catch (error) {
    console.error("Error fetching pie chart data:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};


function transformData(input) {
	const dayMap = {
		sun: "sun",
		mon: "mon",
		tue: "tue",
		wed: "wed",
		thu: "thurs", // renaming to match output spec
		fri: "fri",
		sat: "sat",
	};

	const result = {
		data: {
			sun: { count: 0 },
			mon: { count: 0 },
			tue: { count: 0 },
			wed: { count: 0 },
			thurs: { count: 0 },
			fri: { count: 0 },
			sat: { count: 0 },
		},
	};

	for (const entry of input) {
		const dayKey = dayMap[entry.day];
		if (dayKey && result.data[dayKey]) {
			result.data[dayKey].count += entry.count;
		}
	}


	return result;
}

module.exports = {
  getDay,
  updateDayStatus,
  getStreak,
  getLineChartProductivityStatus,
  getPieChartProductivityStatus,
};
const Day = require("../models/schema/day.model");

// Update streak based on the provided date and statusOfDay
const updateStreak = async (req, res) => {
  const { date, statusOfDay } = req.body;

  if (!date || typeof statusOfDay !== "number") {
    return res.status(400).json({ error: "Date and numeric statusOfDay are required" });
  }

  try {
    const currentDate = new Date(date);
    currentDate.setUTCHours(0, 0, 0, 0); // Strip time part

    const isProductive = statusOfDay === 2;

    let dayRecord = await Day.findOne({ date: currentDate });

    if (!dayRecord) {
      const previousDay = await Day.findOne({ date: { $lt: currentDate } }).sort({ date: -1 });

      const isConsecutive =
        previousDay &&
        previousDay.statusOfDay === 2 &&
        (currentDate - new Date(previousDay.date)) / (1000 * 60 * 60 * 24) === 1;

      const newStreak = isProductive ? (isConsecutive ? previousDay.streak + 1 : 1) : 0;

      const newDay = await Day.create({
        date: currentDate,
        statusOfDay,
        streak: newStreak,
      });

      return res.status(201).json({ status: isProductive, streak: newDay.streak });
    }

    // If already productive, don't recalculate
    if (dayRecord.statusOfDay === 2) {
      return res.status(200).json({ status: true, streak: dayRecord.streak });
    }

    // Recalculate based on new update
    const previousDay = await Day.findOne({ date: { $lt: currentDate } }).sort({ date: -1 });

    const isConsecutive =
      previousDay &&
      previousDay.statusOfDay === 2 &&
      (currentDate - new Date(previousDay.date)) / (1000 * 60 * 60 * 24) === 1;

    const newStreak = isProductive ? (isConsecutive ? previousDay.streak + 1 : 1) : 0;

    dayRecord.statusOfDay = statusOfDay;
    dayRecord.streak = newStreak;
    await dayRecord.save();

    return res.status(200).json({ status: isProductive, streak: dayRecord.streak });
  } catch (error) {
    console.error("Error updating streak:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { updateStreak };
const express = require("express");
const {
  getDay,
  updateDayStatus,
  getStreak,
  getLineChartProductivityStatus,
  getPieChartProductivityStatus,
} = require("../controllers/dayController");

const router = express.Router();

// [GET] /api/day
router.get("/", getDay);
// [PUT] /api/day
router.put("/", updateDayStatus);

// [GET] /api/day/streak
router.get("/streak", getStreak);

// [GET] /api/productivity/status/line-chart
router.get("/productivity/status/line-chart", getLineChartProductivityStatus);

// [GET] /api/productivity/status/pie-chart
router.get("/productivity/status/pie-chart", getPieChartProductivityStatus);

module.exports = router;
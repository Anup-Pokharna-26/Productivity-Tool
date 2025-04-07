require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db/index.js");

const taskRoutes = require("./routes/taskRoutes.js");
const dayRoutes = require("./routes/dayRoutes.js");
const quoteRoutes = require("./routes/quoteRoutes.js");
const aiRoutes = require("./routes/aiRoutes.js");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
}));

// DB Connection
connectDB();

// Route registration
app.use("/api/tasks", taskRoutes);
app.use("/api/day", dayRoutes);
app.use("/api/quote", quoteRoutes);
app.use("/api/ai", aiRoutes);  // <-- Your AI endpoint is registered here

app.get("/", (req, res) => {
  res.send("<h1>Productivity Tool APIs Running</h1>");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

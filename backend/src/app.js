const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const legalRoutes = require("./routes/legalRoutes");


require("dotenv").config();

const app = express();


app.use(cors());
app.use(bodyParser.json());



const eventRoutes = require("./routes/events");
const authRoutes = require("./routes/auth");
const calendarRoutes = require("./routes/calendar");


app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/legal", legalRoutes);




app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});


app.use((err, req, res, next) => {
  console.error("[ERROR] Server Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});


if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}

module.exports = app;

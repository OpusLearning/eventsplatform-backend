// backend/server.js

const app = require("./src/app");
const { sequelize } = require("./src/models");
const dotenv = require("dotenv");
const calendarRoutes = require("./controllers/calendarController");
app.use("/api/calendar", calendarRoutes);


dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    // Optional: Sync without forcing (do not drop tables)
    // await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

startServer();

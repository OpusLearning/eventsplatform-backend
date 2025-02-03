// backend/server.js
const app = require("./src/app");
const { sequelize } = require("./src/models");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");


    await sequelize.sync({ force: true });
    console.log("Database synchronized with force: true");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

startServer();

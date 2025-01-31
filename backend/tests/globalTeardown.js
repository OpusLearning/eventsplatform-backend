// backend/tests/globalTeardown.js

const { sequelize } = require("../src/models");

module.exports = async () => {
  try {
    await sequelize.close();
    console.log("Global teardown completed: Database connection closed.");
  } catch (error) {
    console.error("Error during global teardown:", error);
    process.exit(1);
  }
};

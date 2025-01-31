// backend/tests/globalSetup.js

const { syncDatabase, Role } = require("../src/models");

module.exports = async () => {
  try {
    await syncDatabase();

    // Seed initial data: Roles
    await Role.bulkCreate([
      { name: "user" },
      { name: "admin" },
    ]);

    console.log("Global setup completed: Database synchronized and roles seeded.");
  } catch (error) {
    console.error("Error during global setup:", error);
    process.exit(1);
  }
};

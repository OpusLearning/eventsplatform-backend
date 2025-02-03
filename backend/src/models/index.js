const sequelize = require("../config/database");
const Event = require("./event");
const User = require("./user");
const SignUp = require("./signup");
const Role = require("./role");

Event.belongsToMany(User, { through: SignUp });
User.belongsToMany(Event, { through: SignUp });

SignUp.belongsTo(Event, {
  foreignKey: "EventId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
SignUp.belongsTo(User, {
  foreignKey: "UserId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.belongsToMany(Role, { through: "UserRoles" });
Role.belongsToMany(User, { through: "UserRoles" });

const syncDatabase = async () => {
  try {
    if (process.env.NODE_ENV === "test") {
 
      await sequelize.sync({ force: true });
      console.log("Database synced successfully for testing.");
    } else {
 
      await sequelize.sync();
      console.log("Database synced successfully for production.");
    }
  } catch (error) {
    console.error("Error syncing database:", error);
  }
};

syncDatabase();
module.exports = { sequelize, Event, User, SignUp, Role }; // Export Role model

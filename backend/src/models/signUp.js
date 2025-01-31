// backend/src/models/signUp.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SignUp = sequelize.define(
  "SignUp",
  {
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users",
        key: "id",
      },
      primaryKey: true,
    },
    eventId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Events",
        key: "id",
      },
      primaryKey: true,
    },
  },
  {
    tableName: "SignUps", // Explicit table name
    timestamps: false,    // Disable timestamps for join table
  }
);

module.exports = SignUp;

// backend/src/models/userRoles.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserRoles = sequelize.define(
  "UserRoles",
  {
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users",
        key: "id",
      },
      primaryKey: true,
    },
    roleId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Roles",
        key: "id",
      },
      primaryKey: true,
    },
  },
  {
    tableName: "UserRoles", // Explicit table name
    timestamps: false,      // Disable timestamps for join table
  }
);

module.exports = UserRoles;

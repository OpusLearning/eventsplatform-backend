const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const SignUp = sequelize.define(
  "SignUp",
  {
    EventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Events",
        key: "id",
      },
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = SignUp;

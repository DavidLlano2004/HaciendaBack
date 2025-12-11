import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import { User } from "./user.model.js";

export const Camp = sequelize.define(
  "Camp",
  {
    id_camp: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue("name", value.trim());
      },
    },
    id_employee: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id_user",
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    schema: "hr",
    tableName: "camps",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        name: "idx_camp_name",
        fields: ["name"],
      },
      {
        name: "idx_camp_employee",
        fields: ["id_employee"],
      },
      {
        name: "idx_camp_status",
        fields: ["status"],
      },
    ],
  }
);

// Relationship with User (Employee)
Camp.belongsTo(User, {
  foreignKey: "id_employee",
  as: "employee",
});

User.hasMany(Camp, {
  foreignKey: "id_employee",
  as: "camps",
});
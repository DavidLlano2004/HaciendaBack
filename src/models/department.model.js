import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const Department = sequelize.define(
  "Department",
  {
    id_department: {
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "deleted"),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    schema: "hr",
    tableName: "departments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    defaultScope: {
      where: {
        status: ["active", "inactive"],
      },
    },
    scopes: {
      withDeleted: {
        where: {},
      },
    },
    indexes: [
      {
        name: "idx_department_name",
        fields: ["name"],
      },
      {
        name: "idx_department_status",
        fields: ["status"],
      },
    ],
  }
);
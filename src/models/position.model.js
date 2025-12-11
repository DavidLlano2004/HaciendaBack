import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import { Department } from "./department.model.js";

export const Position = sequelize.define(
  "Position",
  {
    id_position: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      set(value) {
        this.setDataValue("name", value.trim());
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    id_department: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "departments",
        key: "id_department",
      },
    },
    base_salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "Base salary must be greater than or equal to 0",
        },
      },
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "deleted"),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    schema: "hr",
    tableName: "positions",
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
        name: "idx_position_name",
        fields: ["name"],
      },
      {
        name: "idx_position_department",
        fields: ["id_department"],
      },
      {
        name: "idx_position_status",
        fields: ["status"],
      },
      {
        name: "idx_position_department_status",
        fields: ["id_department", "status"],
      },
    ],
  }
);

// Relationships
Position.belongsTo(Department, {
  foreignKey: "id_department",
  as: "department",
});

Department.hasMany(Position, {
  foreignKey: "id_department",
  as: "positions",
});
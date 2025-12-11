import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import { User } from "./user.model.js";

export const Attendance = sequelize.define(
  "Attendance",
  {
    id_attendance: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id_employee: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id_user",
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    entry_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    exit_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("present", "absent", "late", "justified"),
      allowNull: false,
      defaultValue: "present",
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    record_status: {
      type: DataTypes.ENUM("active", "inactive", "deleted"),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    schema: "hr",
    tableName: "attendances",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        name: "idx_attendance_employee",
        fields: ["id_employee"],
      },
      {
        name: "idx_attendance_date",
        fields: ["date"],
      },
      {
        name: "idx_attendance_status",
        fields: ["status"],
      },
      {
        name: "idx_attendance_employee_date",
        fields: ["id_employee", "date"],
        unique: true,
        where: {
          record_status: ["active", "inactive"],
        },
      },
    ],
  }
);

// Relationship with User (Employee)
Attendance.belongsTo(User, {
  foreignKey: "id_employee",
  as: "employee",
});

User.hasMany(Attendance, {
  foreignKey: "id_employee",
  as: "attendances",
});
import { v4 as uuidv4 } from "uuid";
import { Attendance } from "../models/attendance.model.js";
import { User } from "../models/user.model.js";
import { Op } from "sequelize";
import { sequelize } from "../db.js";

// Create attendance
export const createAttendance = async (req, res) => {
  const { id_employee, date, entry_time, exit_time, status, observations } = req.body;
  const id_attendance = uuidv4();

  try {
    // Check if employee exists
    const employee = await User.findByPk(id_employee);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Check if attendance already exists for this employee on this date
    const existingAttendance = await Attendance.findOne({
      where: {
        id_employee,
        date,
        record_status: ["active", "inactive"],
      },
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: "Attendance record already exists for this employee on this date",
      });
    }

    // Create attendance
    const newAttendance = await Attendance.create({
      id_attendance,
      id_employee,
      date,
      entry_time: entry_time || null,
      exit_time: exit_time || null,
      status: status || "present",
      observations: observations || null,
      record_status: "active",
    });

    // Get attendance with employee info
    const attendanceWithEmployee = await Attendance.findByPk(id_attendance, {
      include: [
        {
          model: User,
          as: "employee",
          attributes: ["id_user", "name", "email", "role"],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Attendance created successfully",
      data: attendanceWithEmployee,
    });
  } catch (error) {
    console.error("Error creating attendance:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating attendance",
      error: error.message,
    });
  }
};

// Get all attendances
export const getAllAttendances = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await Attendance.findAndCountAll({
      where: {
        record_status: ["active", "inactive"],
      },
      include: [
        {
          model: User,
          as: "employee",
          attributes: ["id_user", "name", "email", "role"],
        },
      ],
      limit: Number(limit),
      offset: offset,
      order: [
        ["date", "DESC"],
        ["entry_time", "DESC"],
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Attendances retrieved successfully",
      data: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting attendances:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting attendances",
      error: error.message,
    });
  }
};

// Get attendance by ID
export const getAttendanceById = async (req, res) => {
  const { id } = req.params;

  try {
    const attendance = await Attendance.findOne({
      where: {
        id_attendance: id,
        record_status: ["active", "inactive"],
      },
      include: [
        {
          model: User,
          as: "employee",
          attributes: ["id_user", "name", "email", "role"],
        },
      ],
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    // Calculate worked hours if both times are present
    const attendanceData = attendance.toJSON();
    if (attendanceData.entry_time && attendanceData.exit_time) {
      attendanceData.worked_hours = calculateWorkedHours(
        attendanceData.entry_time,
        attendanceData.exit_time
      );
    }

    return res.status(200).json({
      success: true,
      message: "Attendance retrieved successfully",
      data: attendanceData,
    });
  } catch (error) {
    console.error("Error getting attendance:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting attendance",
      error: error.message,
    });
  }
};

// Get attendances by employee
export const getAttendancesByEmployee = async (req, res) => {
  const { id_employee } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  try {
    const { count, rows } = await Attendance.findAndCountAll({
      where: {
        id_employee,
        record_status: ["active", "inactive"],
      },
      include: [
        {
          model: User,
          as: "employee",
          attributes: ["id_user", "name", "email", "role"],
        },
      ],
      limit: Number(limit),
      offset: offset,
      order: [["date", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Attendances retrieved successfully",
      data: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting attendances by employee:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting attendances by employee",
      error: error.message,
    });
  }
};

// Get attendances by date
export const getAttendancesByDate = async (req, res) => {
  const { date } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  try {
    const { count, rows } = await Attendance.findAndCountAll({
      where: {
        date,
        record_status: ["active", "inactive"],
      },
      include: [
        {
          model: User,
          as: "employee",
          attributes: ["id_user", "name", "email", "role"],
        },
      ],
      limit: Number(limit),
      offset: offset,
      order: [[{ model: User, as: "employee" }, "name", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Attendances retrieved successfully",
      data: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting attendances by date:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting attendances by date",
      error: error.message,
    });
  }
};

// Get attendances by date range
export const getAttendancesByDateRange = async (req, res) => {
  const { start_date, end_date } = req.query;
  const { page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  try {
    const { count, rows } = await Attendance.findAndCountAll({
      where: {
        date: {
          [Op.between]: [start_date, end_date],
        },
        record_status: ["active", "inactive"],
      },
      include: [
        {
          model: User,
          as: "employee",
          attributes: ["id_user", "name", "email", "role"],
        },
      ],
      limit: Number(limit),
      offset: offset,
      order: [["date", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Attendances retrieved successfully",
      data: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting attendances by date range:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting attendances by date range",
      error: error.message,
    });
  }
};

// Get attendances by status
export const getAttendancesByStatus = async (req, res) => {
  const { status } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  try {
    const { count, rows } = await Attendance.findAndCountAll({
      where: {
        status,
        record_status: ["active", "inactive"],
      },
      include: [
        {
          model: User,
          as: "employee",
          attributes: ["id_user", "name", "email", "role"],
        },
      ],
      limit: Number(limit),
      offset: offset,
      order: [["date", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Attendances retrieved successfully",
      data: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting attendances by status:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting attendances by status",
      error: error.message,
    });
  }
};

// Register entry
export const registerEntry = async (req, res) => {
  const { id_employee, date, entry_time } = req.body;
  const id_attendance = uuidv4();

  try {
    // Check if employee exists
    const employee = await User.findByPk(id_employee);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Check if attendance already exists
    const existingAttendance = await Attendance.findOne({
      where: {
        id_employee,
        date,
        record_status: ["active", "inactive"],
      },
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: "Entry already registered for this employee on this date",
      });
    }

    // Create attendance with entry
    const newAttendance = await Attendance.create({
      id_attendance,
      id_employee,
      date,
      entry_time,
      status: "present",
      record_status: "active",
    });

    const attendanceWithEmployee = await Attendance.findByPk(id_attendance, {
      include: [
        {
          model: User,
          as: "employee",
          attributes: ["id_user", "name", "email", "role"],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Entry registered successfully",
      data: attendanceWithEmployee,
    });
  } catch (error) {
    console.error("Error registering entry:", error);
    return res.status(500).json({
      success: false,
      message: "Error registering entry",
      error: error.message,
    });
  }
};

// Register exit
export const registerExit = async (req, res) => {
  const { id } = req.params;
  const { exit_time } = req.body;

  try {
    const attendance = await Attendance.findOne({
      where: {
        id_attendance: id,
        record_status: ["active", "inactive"],
      },
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    if (attendance.exit_time) {
      return res.status(400).json({
        success: false,
        message: "Exit time already registered",
      });
    }

    await attendance.update({ exit_time });

    const updatedAttendance = await Attendance.findByPk(id, {
      include: [
        {
          model: User,
          as: "employee",
          attributes: ["id_user", "name", "email", "role"],
        },
      ],
    });

    const attendanceData = updatedAttendance.toJSON();
    attendanceData.worked_hours = calculateWorkedHours(
      attendanceData.entry_time,
      attendanceData.exit_time
    );

    return res.status(200).json({
      success: true,
      message: "Exit registered successfully",
      data: attendanceData,
    });
  } catch (error) {
    console.error("Error registering exit:", error);
    return res.status(500).json({
      success: false,
      message: "Error registering exit",
      error: error.message,
    });
  }
};

// Update attendance
export const updateAttendance = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const attendance = await Attendance.findOne({
      where: {
        id_attendance: id,
        record_status: ["active", "inactive"],
      },
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    await attendance.update(updateData);

    const updatedAttendance = await Attendance.findByPk(id, {
      include: [
        {
          model: User,
          as: "employee",
          attributes: ["id_user", "name", "email", "role"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: updatedAttendance,
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating attendance",
      error: error.message,
    });
  }
};

// Delete attendance (soft delete)
export const deleteAttendance = async (req, res) => {
  const { id } = req.params;

  try {
    const attendance = await Attendance.findOne({
      where: {
        id_attendance: id,
        record_status: ["active", "inactive"],
      },
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    await attendance.update({ record_status: "deleted" });

    return res.status(200).json({
      success: true,
      message: "Attendance deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting attendance",
      error: error.message,
    });
  }
};

// Search attendances
export const searchAttendances = async (req, res) => {
  const { q } = req.query;
  const { page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  try {
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search parameter required",
      });
    }

    const searchTerm = `%${q}%`;

    const { count, rows } = await Attendance.findAndCountAll({
      where: {
        record_status: ["active", "inactive"],
      },
      include: [
        {
          model: User,
          as: "employee",
          attributes: ["id_user", "name", "email", "role"],
          where: {
            name: {
              [Op.like]: searchTerm,
            },
          },
        },
      ],
      limit: Number(limit),
      offset: offset,
      order: [["date", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Search completed",
      data: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error searching attendances:", error);
    return res.status(500).json({
      success: false,
      message: "Error searching attendances",
      error: error.message,
    });
  }
};

// Get general statistics
export const getGeneralStatistics = async (req, res) => {
  try {
    const stats = await Attendance.findOne({
      where: {
        record_status: ["active", "inactive"],
      },
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("id_attendance")), "total_records"],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN status = 'present' THEN 1 ELSE 0 END")
          ),
          "present",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN status = 'absent' THEN 1 ELSE 0 END")
          ),
          "absent",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN status = 'late' THEN 1 ELSE 0 END")
          ),
          "late",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN status = 'justified' THEN 1 ELSE 0 END")
          ),
          "justified",
        ],
      ],
      raw: true,
    });

    return res.status(200).json({
      success: true,
      message: "Statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error getting statistics:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting statistics",
      error: error.message,
    });
  }
};

// Get statistics by employee
export const getStatisticsByEmployee = async (req, res) => {
  const { id_employee } = req.params;

  try {
    const stats = await Attendance.findOne({
      where: {
        id_employee,
        record_status: ["active", "inactive"],
      },
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("id_attendance")), "total_days"],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN status = 'present' THEN 1 ELSE 0 END")
          ),
          "days_present",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN status = 'absent' THEN 1 ELSE 0 END")
          ),
          "days_absent",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN status = 'late' THEN 1 ELSE 0 END")
          ),
          "days_late",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN status = 'justified' THEN 1 ELSE 0 END")
          ),
          "days_justified",
        ],
      ],
      raw: true,
    });

    // Calculate attendance percentage
    if (stats && stats.total_days > 0) {
      stats.attendance_percentage = (
        (stats.days_present / stats.total_days) *
        100
      ).toFixed(2);
    }

    return res.status(200).json({
      success: true,
      message: "Employee statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error getting employee statistics:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting employee statistics",
      error: error.message,
    });
  }
};

// Get statistics by date range
export const getStatisticsByDateRange = async (req, res) => {
  const { start_date, end_date } = req.query;

  try {
    const stats = await Attendance.findAll({
      where: {
        date: {
          [Op.between]: [start_date, end_date],
        },
        record_status: ["active", "inactive"],
      },
      attributes: [
        "date",
        [sequelize.fn("COUNT", sequelize.col("id_attendance")), "total_records"],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN status = 'present' THEN 1 ELSE 0 END")
          ),
          "present",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN status = 'absent' THEN 1 ELSE 0 END")
          ),
          "absent",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN status = 'late' THEN 1 ELSE 0 END")
          ),
          "late",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN status = 'justified' THEN 1 ELSE 0 END")
          ),
          "justified",
        ],
      ],
      group: ["date"],
      order: [["date", "DESC"]],
      raw: true,
    });

    return res.status(200).json({
      success: true,
      message: "Date range statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error getting date range statistics:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting date range statistics",
      error: error.message,
    });
  }
};

// Helper function to calculate worked hours
const calculateWorkedHours = (entryTime, exitTime) => {
  if (!entryTime || !exitTime) {
    return null;
  }

  const [entryHours, entryMinutes, entrySeconds = 0] = entryTime.split(":").map(Number);
  const [exitHours, exitMinutes, exitSeconds = 0] = exitTime.split(":").map(Number);

  const entryInMinutes = entryHours * 60 + entryMinutes;
  const exitInMinutes = exitHours * 60 + exitMinutes;

  const differenceMinutes = exitInMinutes - entryInMinutes;
  const hours = Math.floor(differenceMinutes / 60);
  const minutes = differenceMinutes % 60;

  return {
    hours,
    minutes,
    total_minutes: differenceMinutes,
    total_hours: (differenceMinutes / 60).toFixed(2),
  };
};
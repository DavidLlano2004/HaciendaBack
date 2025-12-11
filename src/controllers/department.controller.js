import { v4 as uuidv4 } from "uuid";
import { Department } from "../models/department.model.js";
import { Position } from "../models/position.model.js";
import { Op } from "sequelize";
import { sequelize } from "../db.js";

// Create department
export const createDepartment = async (req, res) => {
  const { name, description, status } = req.body;
  const id_department = uuidv4();

  try {
    // Check if department name already exists
    const existingDepartment = await Department.scope("withDeleted").findOne({
      where: { name },
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: "Department name already exists",
      });
    }

    // Create department
    const newDepartment = await Department.create({
      id_department,
      name,
      description: description || null,
      status: status || "active",
    });

    return res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: newDepartment,
    });
  } catch (error) {
    console.error("Error creating department:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating department",
      error: error.message,
    });
  }
};

// Get all departments
export const getAllDepartments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await Department.findAndCountAll({
      limit: Number(limit),
      offset: offset,
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Departments retrieved successfully",
      data: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting departments:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting departments",
      error: error.message,
    });
  }
};

// Get department by ID
export const getDepartmentById = async (req, res) => {
  const { id } = req.params;

  try {
    const department = await Department.findByPk(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Department retrieved successfully",
      data: department,
    });
  } catch (error) {
    console.error("Error getting department:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting department",
      error: error.message,
    });
  }
};

// Update department
export const updateDepartment = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const department = await Department.scope("withDeleted").findByPk(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // If updating name, check if new name already exists
    if (updateData.name && updateData.name !== department.name) {
      const existingDepartment = await Department.scope("withDeleted").findOne({
        where: { name: updateData.name },
      });

      if (existingDepartment) {
        return res.status(400).json({
          success: false,
          message: "Department name already exists",
        });
      }
    }

    await department.update(updateData);

    const updatedDepartment = await Department.findByPk(id);

    return res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: updatedDepartment,
    });
  } catch (error) {
    console.error("Error updating department:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating department",
      error: error.message,
    });
  }
};

// Delete department (soft delete)
export const deleteDepartment = async (req, res) => {
  const { id } = req.params;

  try {
    const department = await Department.findByPk(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Check if department has positions assigned
    const positionsCount = await Position.count({
      where: {
        id_department: id,
        status: ["active", "inactive"],
      },
    });

    if (positionsCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete department because it has positions assigned",
      });
    }

    await department.update({ status: "deleted" });

    return res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting department",
      error: error.message,
    });
  }
};

// Get positions by department
export const getPositionsByDepartment = async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  try {
    const department = await Department.findByPk(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const { count, rows } = await Position.findAndCountAll({
      where: {
        id_department: id,
      },
      limit: Number(limit),
      offset: offset,
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Positions retrieved successfully",
      data: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting positions:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting positions",
      error: error.message,
    });
  }
};

// Search departments
export const searchDepartments = async (req, res) => {
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

    const { count, rows } = await Department.findAndCountAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: searchTerm } },
          { description: { [Op.like]: searchTerm } },
        ],
      },
      limit: Number(limit),
      offset: offset,
      order: [["name", "ASC"]],
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
    console.error("Error searching departments:", error);
    return res.status(500).json({
      success: false,
      message: "Error searching departments",
      error: error.message,
    });
  }
};

// Get department statistics
export const getDepartmentStatistics = async (req, res) => {
  try {
    const stats = await Department.scope("withDeleted").findOne({
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("id_department")), "total_departments"],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN status = 'active' THEN 1 ELSE 0 END")
          ),
          "active",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN status = 'inactive' THEN 1 ELSE 0 END")
          ),
          "inactive",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN status = 'deleted' THEN 1 ELSE 0 END")
          ),
          "deleted",
        ],
      ],
      raw: true,
    });

    // Get positions count per department
    const positionsPerDepartment = await sequelize.query(`
      SELECT 
        d.id_department,
        d.name as department_name,
        COUNT(p.id_position) as positions_count
      FROM departments d
      LEFT JOIN positions p ON d.id_department = p.id_department AND p.status != 'deleted'
      WHERE d.status != 'deleted'
      GROUP BY d.id_department, d.name
      ORDER BY positions_count DESC
      LIMIT 10
    `, {
      type: sequelize.QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      message: "Statistics retrieved successfully",
      data: {
        general: stats,
        positions_per_department: positionsPerDepartment,
      },
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
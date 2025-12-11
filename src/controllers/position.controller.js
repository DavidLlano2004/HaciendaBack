import { v4 as uuidv4 } from "uuid";
import { Position } from "../models/position.model.js";
import { Department } from "../models/department.model.js";
import { User } from "../models/user.model.js";
import { Op } from "sequelize";

// Create position
export const createPosition = async (req, res) => {
  const { name, description, id_department, base_salary, status } = req.body;
  const id_position = uuidv4();

  try {
    // Verify department exists
    const department = await Department.findByPk(id_department);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Create position
    const newPosition = await Position.create({
      id_position,
      name,
      description: description || null,
      id_department,
      base_salary: base_salary || 0,
      status: status || "active",
    });

    // Get position with department info
    const positionWithDepartment = await Position.findByPk(id_position, {
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id_department", "name", "description", "status"],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Position created successfully",
      data: positionWithDepartment,
    });
  } catch (error) {
    console.error("Error creating position:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating position",
      error: error.message,
    });
  }
};

// Get all positions
export const getAllPositions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await Position.findAndCountAll({
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id_department", "name", "description", "status"],
        },
      ],
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

// Get position by ID
export const getPositionById = async (req, res) => {
  const { id } = req.params;

  try {
    const position = await Position.findByPk(id, {
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id_department", "name", "description", "status"],
        },
      ],
    });

    if (!position) {
      return res.status(404).json({
        success: false,
        message: "Position not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Position retrieved successfully",
      data: position,
    });
  } catch (error) {
    console.error("Error getting position:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting position",
      error: error.message,
    });
  }
};

// Get positions by department
export const getPositionsByDepartment = async (req, res) => {
  const { id_department } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  try {
    const { count, rows } = await Position.findAndCountAll({
      where: { id_department },
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id_department", "name", "description", "status"],
        },
      ],
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
    console.error("Error getting positions by department:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting positions by department",
      error: error.message,
    });
  }
};

// Update position
export const updatePosition = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const position = await Position.scope("withDeleted").findByPk(id);

    if (!position) {
      return res.status(404).json({
        success: false,
        message: "Position not found",
      });
    }

    // If updating department, verify it exists
    if (updateData.id_department) {
      const department = await Department.findByPk(updateData.id_department);
      if (!department) {
        return res.status(404).json({
          success: false,
          message: "Department not found",
        });
      }
    }

    await position.update(updateData);

    const updatedPosition = await Position.findByPk(id, {
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id_department", "name", "description", "status"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Position updated successfully",
      data: updatedPosition,
    });
  } catch (error) {
    console.error("Error updating position:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating position",
      error: error.message,
    });
  }
};

// Delete position (soft delete)
export const deletePosition = async (req, res) => {
  const { id } = req.params;

  try {
    const position = await Position.findByPk(id);

    if (!position) {
      return res.status(404).json({
        success: false,
        message: "Position not found",
      });
    }

    // Check if position has employees assigned
    const employeesCount = await User.count({
      where: {
        id_position: id,
        status: ["active", "inactive"],
      },
    });

    if (employeesCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete position because it has employees assigned",
      });
    }

    await position.update({ status: "deleted" });

    return res.status(200).json({
      success: true,
      message: "Position deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting position:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting position",
      error: error.message,
    });
  }
};

// Get employees by position
export const getEmployeesByPosition = async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  try {
    const position = await Position.findByPk(id);

    if (!position) {
      return res.status(404).json({
        success: false,
        message: "Position not found",
      });
    }

    const { count, rows } = await User.findAndCountAll({
      where: {
        id_position: id,
        status: ["active", "inactive"],
      },
      attributes: ["id_user", "name", "email", "role", "status"],
      limit: Number(limit),
      offset: offset,
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Employees retrieved successfully",
      data: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting employees:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting employees",
      error: error.message,
    });
  }
};

// Search positions
export const searchPositions = async (req, res) => {
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

    const { count, rows } = await Position.findAndCountAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: searchTerm } },
          { description: { [Op.like]: searchTerm } },
        ],
      },
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id_department", "name", "description", "status"],
        },
      ],
      limit: Number(limit),
      offset: offset,
      order: [["name", "ASC"]],
    });

    // Also search by department name
    const departmentSearch = await Position.findAndCountAll({
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id_department", "name", "description", "status"],
          where: {
            name: { [Op.like]: searchTerm },
          },
        },
      ],
      limit: Number(limit),
      offset: offset,
      order: [["name", "ASC"]],
    });

    // Combine results and remove duplicates
    const allRows = [...rows, ...departmentSearch.rows];
    const uniqueRows = allRows.filter(
      (position, index, self) =>
        index === self.findIndex((p) => p.id_position === position.id_position)
    );

    return res.status(200).json({
      success: true,
      message: "Search completed",
      data: uniqueRows.slice(0, Number(limit)),
      pagination: {
        total: uniqueRows.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(uniqueRows.length / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error searching positions:", error);
    return res.status(500).json({
      success: false,
      message: "Error searching positions",
      error: error.message,
    });
  }
};
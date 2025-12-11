import { v4 as uuidv4 } from "uuid";
import { Camp } from "../models/camp.model.js";
import { User } from "../models/user.model.js";
import { Op } from "sequelize";
import { sequelize } from "../db.js";

// Create camp
export const createCamp = async (req, res) => {
  const { name, id_employee, description, status } = req.body;
  const id_camp = uuidv4();

  try {
    // Check if camp name already exists
    const existingCamp = await Camp.findOne({ where: { name } });
    if (existingCamp) {
      return res.status(400).json({
        success: false,
        message: "Camp name already exists",
      });
    }

    // If employee is provided, verify it exists and is an employee
    if (id_employee) {
      const employee = await User.findOne({
        where: {
          id_user: id_employee,
          role: "employee",
          status: "active",
        },
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found or not active",
        });
      }
    }

    // Create camp
    const newCamp = await Camp.create({
      id_camp,
      name,
      id_employee: id_employee || null,
      description: description || null,
      status: status || "active",
    });

    // Get camp with employee info
    const campWithEmployee = await Camp.findByPk(id_camp, {
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
      message: "Camp created successfully",
      data: campWithEmployee,
    });
  } catch (error) {
    console.error("Error creating camp:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating camp",
      error: error.message,
    });
  }
};

// Get all camps
export const getAllCamps = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await Camp.findAndCountAll({
      include: [
        {
          model: User,
          as: "employee",
          attributes: ["id_user", "name", "email", "role"],
        },
      ],
      limit: Number(limit),
      offset: offset,
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Camps retrieved successfully",
      data: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting camps:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting camps",
      error: error.message,
    });
  }
};

// Get camp by ID
export const getCampById = async (req, res) => {
  const { id } = req.params;

  try {
    const camp = await Camp.findByPk(id, {
      include: [
        {
          model: User,
          as: "employee",
          attributes: ["id_user", "name", "email", "role"],
        },
      ],
    });

    if (!camp) {
      return res.status(404).json({
        success: false,
        message: "Camp not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Camp retrieved successfully",
      data: camp,
    });
  } catch (error) {
    console.error("Error getting camp:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting camp",
      error: error.message,
    });
  }
};

// Get camps by employee
export const getCampsByEmployee = async (req, res) => {
  const { id_employee } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  try {
    const { count, rows } = await Camp.findAndCountAll({
      where: { id_employee },
      include: [
        {
          model: User,
          as: "employee",
          attributes: ["id_user", "name", "email", "role"],
        },
      ],
      limit: Number(limit),
      offset: offset,
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Camps retrieved successfully",
      data: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting camps by employee:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting camps by employee",
      error: error.message,
    });
  }
};

// Get camps by status
export const getCampsByStatus = async (req, res) => {
  const { status } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  try {
    const { count, rows } = await Camp.findAndCountAll({
      where: { status },
      include: [
        {
          model: User,
          as: "employee",
          attributes: ["id_user", "name", "email", "role"],
        },
      ],
      limit: Number(limit),
      offset: offset,
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Camps retrieved successfully",
      data: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting camps by status:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting camps by status",
      error: error.message,
    });
  }
};

// Update camp
export const updateCamp = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const camp = await Camp.findByPk(id);

    if (!camp) {
      return res.status(404).json({
        success: false,
        message: "Camp not found",
      });
    }

    // If updating name, check if new name already exists
    if (updateData.name && updateData.name !== camp.name) {
      const existingCamp = await Camp.findOne({
        where: { name: updateData.name },
      });

      if (existingCamp) {
        return res.status(400).json({
          success: false,
          message: "Camp name already exists",
        });
      }
    }

    // If updating employee, verify it exists and is an employee
    if (updateData.id_employee) {
      const employee = await User.findOne({
        where: {
          id_user: updateData.id_employee,
          role: "employee",
          status: "active",
        },
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found or not active",
        });
      }
    }

    await camp.update(updateData);

    const updatedCamp = await Camp.findByPk(id, {
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
      message: "Camp updated successfully",
      data: updatedCamp,
    });
  } catch (error) {
    console.error("Error updating camp:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating camp",
      error: error.message,
    });
  }
};

// Delete camp (hard delete)
export const deleteCamp = async (req, res) => {
  const { id } = req.params;

  try {
    const camp = await Camp.findByPk(id);

    if (!camp) {
      return res.status(404).json({
        success: false,
        message: "Camp not found",
      });
    }

    await camp.destroy();

    return res.status(200).json({
      success: true,
      message: "Camp deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting camp:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting camp",
      error: error.message,
    });
  }
};

// Search camps
export const searchCamps = async (req, res) => {
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

    const { count, rows } = await Camp.findAndCountAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: searchTerm } },
          { description: { [Op.like]: searchTerm } },
        ],
      },
      include: [
        {
          model: User,
          as: "employee",
          attributes: ["id_user", "name", "email", "role"],
          required: false,
        },
      ],
      limit: Number(limit),
      offset: offset,
      order: [["name", "ASC"]],
    });

    // Also search by employee name
    const employeeSearch = await Camp.findAndCountAll({
      include: [
        {
          model: User,
          as: "employee",
          attributes: ["id_user", "name", "email", "role"],
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
    const allRows = [...rows, ...employeeSearch.rows];
    const uniqueRows = allRows.filter(
      (camp, index, self) =>
        index === self.findIndex((c) => c.id_camp === camp.id_camp)
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
    console.error("Error searching camps:", error);
    return res.status(500).json({
      success: false,
      message: "Error searching camps",
      error: error.message,
    });
  }
};

// Assign employee to camp
export const assignEmployee = async (req, res) => {
  const { id } = req.params;
  const { id_employee } = req.body;

  try {
    const camp = await Camp.findByPk(id);

    if (!camp) {
      return res.status(404).json({
        success: false,
        message: "Camp not found",
      });
    }

    // Verify employee exists and is active
    const employee = await User.findOne({
      where: {
        id_user: id_employee,
        role: "employee",
        status: "active",
      },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found or not active",
      });
    }

    await camp.update({ id_employee });

    const updatedCamp = await Camp.findByPk(id, {
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
      message: "Employee assigned successfully",
      data: updatedCamp,
    });
  } catch (error) {
    console.error("Error assigning employee:", error);
    return res.status(500).json({
      success: false,
      message: "Error assigning employee",
      error: error.message,
    });
  }
};

// Remove employee from camp
export const removeEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const camp = await Camp.findByPk(id);

    if (!camp) {
      return res.status(404).json({
        success: false,
        message: "Camp not found",
      });
    }

    if (!camp.id_employee) {
      return res.status(400).json({
        success: false,
        message: "Camp has no assigned employee",
      });
    }

    await camp.update({ id_employee: null });

    const updatedCamp = await Camp.findByPk(id, {
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
      message: "Employee removed successfully",
      data: updatedCamp,
    });
  } catch (error) {
    console.error("Error removing employee:", error);
    return res.status(500).json({
      success: false,
      message: "Error removing employee",
      error: error.message,
    });
  }
};

// Get camp statistics
export const getCampStatistics = async (req, res) => {
  try {
    const stats = await Camp.findOne({
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("id_camp")), "total_camps"],
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
            sequelize.literal("CASE WHEN id_employee IS NOT NULL THEN 1 ELSE 0 END")
          ),
          "with_employee",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN id_employee IS NULL THEN 1 ELSE 0 END")
          ),
          "without_employee",
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
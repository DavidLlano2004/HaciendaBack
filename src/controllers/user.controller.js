import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { User } from "../models/user.model.js";

// Create user
export const createUser = async (req, res) => {
  const { name, email, password, role, status } = req.body;
  const id_user = uuidv4();

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      id_user,
      name,
      email,
      password: passwordHash,
      role,
      status: status || "active",
    });

    const userData = newUser.toJSON();
    const { password: _, ...userResponse } = userData;

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userResponse,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await User.findAndCountAll({
      where: {
        status: ["active", "inactive"],
      },
      limit: Number(limit),
      offset: offset,
      order: [["created_at", "DESC"]],
    });

    const users = rows.map((user) => {
      const userData = user.toJSON();
      const { password: _, ...userResponse } = userData;
      return userResponse;
    });

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting users:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting users",
      error: error.message,
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = user.toJSON();
    const { password: _, ...userResponse } = userData;

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: userResponse,
    });
  } catch (error) {
    console.error("Error getting user:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting user",
      error: error.message,
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If updating email, check if it exists
    if (updateData.email) {
      const userData = user.toJSON();
      if (updateData.email !== userData.email) {
        const existingUser = await User.findOne({ where: { email: updateData.email } });
        if (existingUser) {
          const existingUserData = existingUser.toJSON();
          if (existingUserData.id_user !== id) {
            return res.status(400).json({
              success: false,
              message: "Email already registered by another user",
            });
          }
        }
      }
    }

    // If updating password, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await user.update(updateData);

    const updatedUser = await User.findByPk(id);
    const userData = updatedUser.toJSON();
    const { password: _, ...userResponse } = userData;

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: userResponse,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

// Delete user (soft delete)
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Soft delete: change status to "deleted"
    await user.update({ status: "deleted" });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

// Get users by role
export const getUsersByRole = async (req, res) => {
  const { role } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  try {
    const { count, rows } = await User.findAndCountAll({
      where: {
        role,
        status: ["active", "inactive"],
      },
      limit: Number(limit),
      offset: offset,
      order: [["created_at", "DESC"]],
    });

    const users = rows.map((user) => {
      const userData = user.toJSON();
      const { password: _, ...userResponse } = userData;
      return userResponse;
    });

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting users by role:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting users by role",
      error: error.message,
    });
  }
};

// Search users
export const searchUsers = async (req, res) => {
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

    const { count, rows } = await User.findAndCountAll({
      where: {
        status: ["active", "inactive"],
      },
      limit: Number(limit),
      offset: offset,
      order: [["created_at", "DESC"]],
    });

    // Filter by name or email
    const searchTerm = String(q).toLowerCase();
    const filteredRows = rows.filter((user) => {
      const userData = user.toJSON();
      return (
        userData.name.toLowerCase().includes(searchTerm) ||
        userData.email.toLowerCase().includes(searchTerm)
      );
    });

    const users = filteredRows.map((user) => {
      const userData = user.toJSON();
      const { password: _, ...userResponse } = userData;
      return userResponse;
    });

    return res.status(200).json({
      success: true,
      message: "Search completed",
      data: users,
      pagination: {
        total: filteredRows.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(filteredRows.length / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return res.status(500).json({
      success: false,
      message: "Error searching users",
      error: error.message,
    });
  }
};

// Update authenticated user profile
export const updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const updateData = req.body;

    // Don't allow changing role or status from profile
    delete updateData.role;
    delete updateData.status;
    delete updateData.password;

    const user = await User.findByPk(req.user.id_user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If updating email, check if it exists
    if (updateData.email) {
      const userData = user.toJSON();
      if (updateData.email !== userData.email) {
        const existingUser = await User.findOne({ where: { email: updateData.email } });
        if (existingUser) {
          const existingUserData = existingUser.toJSON();
          if (existingUserData.id_user !== req.user.id_user) {
            return res.status(400).json({
              success: false,
              message: "Email already registered by another user",
            });
          }
        }
      }
    }

    await user.update(updateData);

    const updatedUser = await User.findByPk(req.user.id_user);
    const userData = updatedUser.toJSON();
    const { password: _, ...userResponse } = userData;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: userResponse,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};
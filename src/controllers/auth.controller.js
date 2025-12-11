import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { User } from "../models/user.model.js";

const TOKEN_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// Function to create JWT token
const createAccessToken = (payload) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, TOKEN_SECRET, { expiresIn: JWT_EXPIRES_IN }, (err, token) => {
      if (err) reject(err);
      if (token) resolve(token);
    });
  });
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userFound = await User.findOne({ where: { email } });

    if (!userFound) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const userData = userFound.toJSON();

    // Check if user is active
    if (userData.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Inactive user. Contact administrator",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = await createAccessToken({
      id_user: userData.id_user,
      email: userData.email,
      role: userData.role,
    });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Remove password from response
    const { password: _, ...userResponse } = userData;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Register
export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const id_user = uuidv4();

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({
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
      role: role || "client",
      status: "active",
    });

    const userData = newUser.toJSON();
    const { password: _, ...userResponse } = userData;

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: userResponse,
    });
  } catch (error) {
    console.error("Error in register:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

// Logout
export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    expires: new Date(0),
  });

  return res.status(200).json({
    success: true,
    message: "Session closed successfully",
  });
};

// Verify token
export const verifyToken = async (req, res) => {
  try {
    const tokenBody = req.body?.token;
    const { token } = req.cookies;

    const tokenToVerify = tokenBody || token;

    if (!tokenToVerify) {
      return res.status(401).json({
        success: false,
        message: "Token not provided",
      });
    }

    jwt.verify(tokenToVerify, TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token",
        });
      }

      const userFound = await User.findByPk(decoded.id_user);

      if (!userFound) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      const userData = userFound.toJSON();

      if (userData.status !== "active") {
        return res.status(401).json({
          success: false,
          message: "Inactive user",
        });
      }

      const { password: _, ...userResponse } = userData;

      return res.status(200).json({
        success: true,
        message: "Valid token",
        data: userResponse,
      });
    });
  } catch (error) {
    console.error("Error in verifyToken:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying token",
      error: error.message,
    });
  }
};

// Get authenticated user profile
export const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const user = await User.findByPk(req.user.id_user);

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
      data: userResponse,
    });
  } catch (error) {
    console.error("Error getting profile:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting profile",
      error: error.message,
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id_user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = user.toJSON();

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, userData.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password incorrect",
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await user.update({ password: newPasswordHash });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message,
    });
  }
};
const Register = require("../Models/UserModel");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const addUsers = async (req, res, next) => {
    if (!req.body) {
        return res.status(400).json({ message: "Request body is missing" });
    }

    const { name, gmail, password, age, address, role } = req.body;

    if (!name || !gmail || !password || !age || !address || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const validRoles = [
        "customer",
        "admin",
        "staff",
        "product_manager",
        "order_manager",
        "promotion_manager",
        "financial_manager"
    ];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ 
            message: `Invalid role. Allowed values are: ${validRoles.join(", ")}`
        });
    }

    let user;
    try {
        const existingUser = await Register.findOne({ gmail });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new Register({ name, gmail, password: hashedPassword, age, address, role });
        await user.save();
        return res.status(201).json({ message: "ok", user }); // Changed to message: "ok"
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error while adding user" });
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const users = await Register.find().select("-password");
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }
        return res.status(200).json({ users });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error while fetching users" });
    }
};

const getById = async (req, res, next) => {
    const id = req.params.id;

    let user;
    try {
        user = await Register.findById(id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error while fetching user" });
    }
};

const updateUser = async (req, res, next) => {
    const id = req.params.id;
    
    if (!req.body) {
        return res.status(400).json({ message: "Request body is missing" });
    }

    const { name, gmail, age, address, password, role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    let user;
    try {
        if (gmail) {
            const existingUser = await Register.findOne({ gmail, _id: { $ne: id } });
            if (existingUser) {
                return res.status(400).json({ message: "Email already exists" });
            }
        }

        const updateFields = { name, gmail, age, address };
        if (password) {
            updateFields.password = await bcrypt.hash(password, 10);
        }

        // Only admins can change the role; validate role value
        if (typeof role !== 'undefined') {
            const requesterRole = req.user && req.user.role;
            const validRoles = [
                "customer",
                "admin",
                "staff",
                "product_manager",
                "order_manager",
                "promotion_manager",
                "financial_manager"
            ];
            if (!requesterRole || requesterRole !== 'admin') {
                return res.status(403).json({ message: "Only admins can change user roles" });
            }
            if (!validRoles.includes(role)) {
                return res.status(400).json({ message: `Invalid role. Allowed values are: ${validRoles.join(", ")}` });
            }
            updateFields.role = role;
        }

        user = await Register.findByIdAndUpdate(
            id,
            updateFields,
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error while updating user" });
    }
};

const deleteUser = async (req, res, next) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    let user;
    try {
        user = await Register.findByIdAndDelete(id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ message: "User deleted successfully", user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error while deleting user" });
    }
};

const jwt = require("jsonwebtoken");

// inside loginUser
const loginUser = async (req, res, next) => {
    if (!req.body) {
        return res.status(400).json({ status: "error", err: "Request body is missing" });
    }

    const { gmail, password } = req.body;

    if (!gmail || !password) {
        return res.status(400).json({ status: "error", err: "Email and password are required" });
    }

    try {
        const user = await Register.findOne({ gmail }).select("+password");
        if (!user) {
            return res.status(401).json({ status: "error", err: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ status: "error", err: "Invalid email or password" });
        }

        
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "yoursecretkey",
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            status: "ok",
            token,
            name: user.name,
            role: user.role
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "error", err: "Server error while logging in" });
    }
};

const forgotPassword = async (req, res) => {
  const { gmail } = req.body;
  const user = await Register.findOne({ gmail });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `http://localhost:3000/reset-password/${resetToken}`;


  try {
    await sendEmail({
      email: user.gmail,
      subject: "Password Reset",
      message: `You requested a password reset. Click here to reset: ${resetURL}`,
    });

    res.status(200).json({ message: "Password reset link sent to email" });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500).json({ message: "Error sending email" });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await Register.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Token invalid or expired" });
  }

  user.password = await bcrypt.hash(req.body.password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({ message: "Password reset successful" });
};

exports.addUsers = addUsers;
exports.getAllUsers = getAllUsers;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.loginUser = loginUser;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
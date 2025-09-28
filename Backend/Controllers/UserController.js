const Register = require("../Models/UserModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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

  // 🔹 Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(gmail)) {
    return res.status(400).json({ message: "Invalid email address" });
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

  try {
    const existingUser = await Register.findOne({ gmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 🔹 Create Stripe customer
    const customer = await stripe.customers.create({
      email: gmail,
      name,
    });

    // 🔹 Hash password and save user with stripeCustomerId
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new Register({
      name,
      gmail,
      password: hashedPassword,
      age,
      address,
      role,
      stripeCustomerId: customer.id, // save Stripe ID
    });

    await user.save();
    return res.status(201).json({ message: "ok", user });
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
  const userId = req.params.id;
  const { name, gmail, password, age, address, role } = req.body;

  try {
    const user = await Register.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // update local DB fields
    if (name) user.name = name;
    if (gmail) user.gmail = gmail;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (age) user.age = age;
    if (address) user.address = address;
    if (role) user.role = role;

    // 🔹 Update in Stripe if customer exists
    if (user.stripeCustomerId) {
      await stripe.customers.update(user.stripeCustomerId, {
        email: gmail || user.gmail,
        name: name || user.name,
      });
    }

    await user.save();

    return res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    console.error("Error updating user:", err);
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

// Admin: get user report/stats
const getUserReport = async (req, res, next) => {
    try {
        const totalUsersPromise = Register.countDocuments();
        const byRolePromise = Register.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } },
            { $project: { _id: 0, role: "$_id", count: 1 } }
        ]);
        const ageStatsPromise = Register.aggregate([
            { $group: { _id: null, avgAge: { $avg: "$age" }, minAge: { $min: "$age" }, maxAge: { $max: "$age" } } },
            { $project: { _id: 0, avgAge: { $round: ["$avgAge", 1] }, minAge: 1, maxAge: 1 } }
        ]);

        const [totalUsers, byRole, ageStatsArr] = await Promise.all([
            totalUsersPromise,
            byRolePromise,
            ageStatsPromise
        ]);

        const roleBreakdown = {};
        for (const r of byRole) {
            roleBreakdown[r.role] = r.count;
        }

        const ageStats = ageStatsArr && ageStatsArr[0] ? ageStatsArr[0] : { avgAge: 0, minAge: 0, maxAge: 0 };

        return res.status(200).json({
            totalUsers,
            roleBreakdown,
            age: ageStats
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error while generating user report" });
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
exports.getUserReport = getUserReport;



// Admin: export all users as PDF (exclude password)
const PDFDocument = require('pdfkit');
const exportUsersPdf = async (req, res, next) => {
    try {
        const users = await Register.find({}, { password: 0 }).lean();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="users.pdf"');

        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        doc.pipe(res);

        doc.fontSize(18).text('Users Report', { align: 'center' });
        doc.moveDown();

        const header = ['Name', 'Email', 'Age', 'Address', 'Role'];
        doc.fontSize(12).text(header.join(' | '));
        doc.moveDown(0.3);
        doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown(0.5);

        users.forEach((u) => {
            const line = [u.name || '', u.gmail || '', u.age ?? '', u.address || '', u.role || ''].join(' | ');
            doc.text(line, { continued: false });
        });

        doc.end();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error while exporting users PDF" });
    }
};


const Order = require("../Models/OrderModel");

// ...existing code...

// Utility: Update loyalty points for a user
const updateLoyaltyPoints = async (userId) => {
  const orderCount = await Order.countDocuments({ userId });
  await Register.findByIdAndUpdate(userId, { loyaltyPoints: orderCount });
};

exports.updateLoyaltyPoints = updateLoyaltyPoints;

// Get current logged in user
const getCurrentUser = async (req, res) => {
  try {
    const currentUser = await Register.findById(req.user.id).select("-password");
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user: currentUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error while fetching current user" });
  }
};

// Update user with authorization check
const updateUserWithAuth = async (req, res, next) => {
  try {
    const requesterId = req.user && req.user.id;
    const requesterRole = req.user && req.user.role;
    const targetId = req.params.id;

    if (requesterRole === 'admin' || requesterId === targetId) {
      return updateUser(req, res, next);
    }

    return res.status(403).json({ message: "You can only update your own account" });
  } catch (err) {
    return res.status(500).json({ message: "Server error while updating user" });
  }
};

// Delete user with authorization check
const deleteUserWithAuth = async (req, res, next) => {
  try {
    const requesterId = req.user && req.user.id;
    const requesterRole = req.user && req.user.role;
    const targetId = req.params.id;

    // Admins can delete any user
    if (requesterRole === 'admin') {
      return deleteUser(req, res, next);
    }

    // Customers can delete only themselves
    if (requesterRole === 'customer' && requesterId === targetId) {
      return deleteUser(req, res, next);
    }

    return res.status(403).json({ message: "Forbidden: you cannot delete this account" });
  } catch (err) {
    return res.status(500).json({ message: "Server error while deleting user" });
  }
};

exports.exportUsersPdf = exportUsersPdf;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.getCurrentUser = getCurrentUser;
exports.updateUserWithAuth = updateUserWithAuth;
exports.deleteUserWithAuth = deleteUserWithAuth;
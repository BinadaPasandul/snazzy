const Register = require("../Models/UserModel");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const addUsers = async (req, res, next) => {
    // Check if req.body exists
    if (!req.body) {
        return res.status(400).json({ message: "Request body is missing" });
    }

    const { name, gmail, password, age, role } = req.body;

    // Validate required fields
    if (!name || !gmail || !password || !age || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Validate role against allowed values
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
        // Check for duplicate email
        const existingUser = await Register.findOne({ gmail });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save user
        user = new Register({ name, gmail, password: hashedPassword, age, role });
        await user.save();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error while adding user" });
    }

    if (!user) {
        return res.status(400).json({ message: "Unable to add user" });
    }

    return res.status(201).json({ user });
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
    
    // Check if req.body exists
    if (!req.body) {
        return res.status(400).json({ message: "Request body is missing" });
    }

    const { name, gmail, age, password } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    let user;
    try {
        // Check for duplicate email (excluding the current user)
        if (gmail) {
            const existingUser = await Register.findOne({ gmail, _id: { $ne: id } });
            if (existingUser) {
                return res.status(400).json({ message: "Email already exists" });
            }
        }

        // Prepare update fields
        const updateFields = { name, gmail, age };
        if (password) {
            updateFields.password = await bcrypt.hash(password, 10);
        }

        // Update user
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

    // Validate ID
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

        return res.status(200).json({
            status: "ok",
            name: user.name,
            role: user.role
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "error", err: "Server error while logging in" });
    }
};

exports.addUsers = addUsers;
exports.getAllUsers = getAllUsers;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.loginUser = loginUser;


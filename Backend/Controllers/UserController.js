const Register = require("../Models/UserModel");
const bcrypt = require("bcrypt");

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
        const users = await Register.find(); // Use Register instead of User
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }
        return res.status(200).json({ users });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error while fetching users" });
    }
};

exports.addUsers = addUsers;
exports.getAllUsers = getAllUsers;
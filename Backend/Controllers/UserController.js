const Register = require("../Models/UserModel");

const addUsers = async (req, res, next) => {
    // Check if req.body exists
    if (!req.body) {
        return res.status(400).json({ message: "Request body is missing" });
    }

    const { name, gmail, password, age, role } = req.body;

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
        user = new Register({ name, gmail, password, age, role });
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

exports.addUsers = addUsers;
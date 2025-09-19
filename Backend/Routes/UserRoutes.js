const express = require("express");
const router = express.Router();

const User = require("../Models/UserModel");

const UserController = require("../Controllers/UserController");
const authMiddleware = require("../Middleware/authMiddleware");
router.post("/forgot-password", UserController.forgotPassword);
router.post("/reset-password/:token", UserController.resetPassword);


router.post("/",UserController.addUsers);
router.get("/", authMiddleware('admin'), UserController.getAllUsers);
// Current logged in user - must be defined BEFORE any dynamic ":id" routes
router.get("/me", authMiddleware(), async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select("-password");
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user: currentUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error while fetching current user" });
  }
});
router.get("/:id", UserController.getById);
// Allow admins to update any user; non-admins can only update themselves
router.put("/:id", authMiddleware(), async (req, res, next) => {
  try {
    const requesterId = req.user && req.user.id;
    const requesterRole = req.user && req.user.role;
    const targetId = req.params.id;

    if (requesterRole === 'admin' || requesterId === targetId) {
      return UserController.updateUser(req, res, next);
    }

    return res.status(403).json({ message: "You can only update your own account" });
  } catch (err) {
    return res.status(500).json({ message: "Server error while updating user" });
  }
});
// Delete policy: only customers can delete themselves; others cannot delete
router.delete("/:id", authMiddleware(), async (req, res, next) => {
  try {
    const requesterId = req.user && req.user.id;
    const requesterRole = req.user && req.user.role;
    const targetId = req.params.id;

    // Admins can delete any user
    if (requesterRole === 'admin') {
      return UserController.deleteUser(req, res, next);
    }

    // Customers can delete only themselves
    if (requesterRole === 'customer' && requesterId === targetId) {
      return UserController.deleteUser(req, res, next);
    }

    return res.status(403).json({ message: "Forbidden: you cannot delete this account" });
  } catch (err) {
    return res.status(500).json({ message: "Server error while deleting user" });
  }
});
router.post("/login", UserController.loginUser);

module.exports = router;